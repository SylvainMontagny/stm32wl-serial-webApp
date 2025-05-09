"use strict";

import { showSnackBar } from "./snackBar.js";

export default class SerialScaleController {
  constructor() {
    this.encoder = new TextEncoder();
    this.decoder = new TextDecoder();
    this.buffer = "";
    this.port = null;
    this.currentColorClass = null;
    this.isReading = false;
    this.disconnectHandler = null;
  }

  async init(baudRate = 115200) {
    if ("serial" in navigator) {
      try {
        const port = await navigator.serial.requestPort();
        await port.open({ baudRate: parseInt(baudRate) });
        this.port = port;

        this.disconnectHandler = this.handleDisconnect.bind(this);
        this.port.addEventListener("disconnect", this.disconnectHandler);

        this.reader = port.readable.getReader();
        let signals = await port.getSignals();
        console.log(signals);

        const connectButton = document.getElementById("connect-to-serial");
        connectButton.textContent = "Connected";
        connectButton.classList.add("connected");
        connectButton.disabled = true;
        showSnackBar("Connected to serial device", null, true);

        this.isReading = true;
        this.readLoop();
      } catch (err) {
        if (err.message.includes("open")) {
          showSnackBar(
            "The serial port is already open. Please close it first.",
            null,
            true
          );
        } else {
          console.error("Error opening serial port:", err);
          showSnackBar("Error opening serial port", null, true);
        }
      }
    } else {
      console.error(
        "Serial API not supported in this browser. Please use Chrome or Edge."
      );
      console.error(
        "chrome://flags/#enable-experimental-web-platform-features"
      );
    }
  }

  async writeToPort(command) {
    try {
      if (!this.port || !this.isReading) {
        showSnackBar("Device not connected", null, true);
        return;
      }

      const writer = this.port.writable.getWriter();
      const data = this.encoder.encode(command + "\r");
      await writer.write(data);
      writer.releaseLock();
    } catch (error) {
      console.error("Error writing to serial port:", error);
      this.handleDisconnect();
    }
  }

  async read() {
    try {
      const { value, done } = await this.reader.read();
      if (done) {
        console.log("[readLoop] DONE", done);
        this.handleDisconnect();
        return null;
      }
      return this.decoder.decode(value, { stream: true });
    } catch (err) {
      console.error(`Error reading data: ${err}`);
      this.handleDisconnect();
      return null;
    }
  }

  async readLoop() {
    const clearScreenSequence = "\x1b[0;0H\x1b[2J"; // Define CLEAR_SCREEN sequence

    while (this.isReading) {
      const data = await this.read();
      if (!this.isReading) break;

      if (data) {
        this.buffer += data;

        // Check for CLEAR_SCREEN sequence anywhere in the buffer
        const clearIndex = this.buffer.indexOf(clearScreenSequence);
        if (clearIndex !== -1) {
          // Clear the console display
          this.clearConsoleDisplay();
          // Remove the sequence and everything before it from the buffer
          this.buffer = this.buffer.substring(
            clearIndex + clearScreenSequence.length
          );
          // Reset current color state after clearing
          this.currentColorClass = null;
        }

        // Process remaining buffer line by line
        if (this.buffer.includes("\n")) {
          const messages = this.buffer.split("\n");
          this.buffer = messages.pop(); // Keep the potentially incomplete last part
          messages.forEach((message) => {
            this.displayMessage(message);
          });
        }
      }
    }
    console.log("[readLoop] Exiting read loop");
  }

  handleDisconnect() {
    if (!this.isReading) return;

    console.log("[handleDisconnect] Disconnecting from serial port");
    this.isReading = false;

    if (this.reader) {
      try {
        this.reader.releaseLock();
      } catch (err) {
        console.error("Error releasing reader lock:", err);
      }
      this.reader = null;
    }

    if (this.port) {
      if (this.disconnectHandler) {
        try {
          this.port.removeEventListener("disconnect", this.disconnectHandler);
        } catch (err) {
          console.error("Error removing disconnect event listener:", err);
        }
      }

      try {
        this.port
          .close()
          .catch((e) => console.error("Error closing port:", e.message));
      } catch (err) {
        console.error("Error closing port:", err);
      }
      this.port = null;
    }

    const connectButton = document.getElementById("connect-to-serial");
    connectButton.textContent = "Connect Serial Device";
    connectButton.classList.remove("connected");
    connectButton.disabled = false;
    showSnackBar("Disconnected from serial device", null, true);

    this.buffer = "";
    this.currentColorClass = null;
  }

  parseAnsiCodes(text) {
    text = text.replace(/\x1b(?!\[)/g, "");
    text = text.replace(/\x1b\[\d+;\d+H/g, "");
    text = text.replace(/\x1b\[\d+J/g, "");

    let result = "";

    const ansiRegex = /(?:\x1b\[|\[)(\d+)(?:;(\d+))?m/g;
    let lastIndex = 0;
    let match;

    if (this.currentColorClass && !text.match(/^(?:\x1b\[|\[)\d+(?:;\d+)?m/)) {
      result += `<span class="${this.currentColorClass}">`;
    } else {
      this.currentColorClass = null;
    }

    while ((match = ansiRegex.exec(text)) !== null) {
      const textBefore = text.substring(lastIndex, match.index);
      if (textBefore) {
        if (this.currentColorClass) {
          result += textBefore;
        } else {
          result += textBefore;
        }
      }

      if (this.currentColorClass) {
        result += "</span>";
      }

      const primaryCode = parseInt(match[1], 10);
      const secondaryCode = match[2] ? parseInt(match[2], 10) : null;

      const getColorClass = (code) => {
        const colors = [
          "black",
          "red",
          "green",
          "yellow",
          "blue",
          "magenta",
          "cyan",
          "white",
        ];
        if (code >= 30 && code <= 37) {
          return `ansi-${colors[code - 30]}`;
        } else if (code >= 90 && code <= 97) {
          return `ansi-bright-${colors[code - 90]}`;
        }
        return null;
      };

      let colorClass = getColorClass(primaryCode);
      if (!colorClass && secondaryCode) {
        colorClass = getColorClass(secondaryCode);
      }

      if (colorClass) {
        this.currentColorClass = colorClass;
        result += `<span class="${colorClass}">`;
      }

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex);
      result += remainingText;
    }

    return result;
  }

  clearConsoleDisplay() {
    const messageContainer = document.querySelector(
      "#serial-messages-container .message"
    );
    if (messageContainer) {
      messageContainer.innerHTML = ""; // Clear the content
    }
  }

  displayMessage(message) {
    const messageContainer = document.querySelector(
      "#serial-messages-container .message"
    );

    if (!messageContainer) return; // Safety check

    message = this.parseAnsiCodes(message.trimEnd()); // Trim trailing whitespace

    // Append the parsed message
    if (message.includes("<span")) {
      messageContainer.innerHTML += message + "\n";
    } else {
      if (this.currentColorClass) {
        messageContainer.innerHTML += `<span class="${this.currentColorClass}">${message}</span>\n`;
      } else {
        // Use innerHTML to ensure correct rendering even without spans
        messageContainer.innerHTML += message + "\n";
      }
    }

    const autoScrollEnabled = document.getElementById("auto-scroll").checked;
    if (autoScrollEnabled) {
      const scrollContainer = document.getElementById(
        "serial-messages-container"
      );
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }
}
