"use strict";

import { showSnackBar } from "./snackBar.js";

export default class SerialScaleController {
  constructor() {
    this.encoder = new TextEncoder();
    this.decoder = new TextDecoder();
    this.firstLine = true;
    this.buffer = "";
    this.port = null;
    this.currentColorClass = null;
  }

  async init(baudRate = 115200) {
    if ("serial" in navigator) {
      try {
        const port = await navigator.serial.requestPort();
        await port.open({ baudRate: parseInt(baudRate) });
        this.port = port;
        this.reader = port.readable.getReader();
        let signals = await port.getSignals();
        console.log(signals);
        this.readLoop();
      } catch (err) {
        if (err.message.includes("open")) {
          showSnackBar(
            "Le périphérique est déjà connecté à une autre application ou fenêtre du navigateur.",
            null,
            true
          );
        } else {
          console.error("Erreur lors de l'ouverture du port série:", err);
        }
      }
    } else {
      console.error(
        "Le Web Serial ne semble pas être activé dans votre navigateur. Essayez de l'activer en visitant:"
      );
      console.error(
        "chrome://flags/#enable-experimental-web-platform-features"
      );
    }
  }

  async writeToPort(command) {
    try {
      const writer = this.port.writable.getWriter();
      const data = this.encoder.encode(command + "\r");
      await writer.write(data);
      writer.releaseLock();
    } catch (error) {
      console.error("Error writing to serial port:", error);
    }
  }

  async read() {
    try {
      const { value, done } = await this.reader.read();
      if (done) {
        console.log("[readLoop] DONE", done);
        this.reader.releaseLock();
        return;
      }
      return this.decoder.decode(value, { stream: true });
    } catch (err) {
      const errorMessage = `error reading data: ${err}`;
      console.error(errorMessage);
      return errorMessage;
    }
  }

  async readLoop() {
    while (true) {
      const data = await this.read();
      if (data) {
        this.buffer += data;
        if (this.buffer.includes("\n")) {
          const messages = this.buffer.split("\n");
          this.buffer = messages.pop();
          messages.forEach((message) => this.displayMessage(message));
        }
      }
    }
  }

  parseAnsiCodes(text) {
    text = text.replace(/\x1b(?!\[)/g, "");
    text = text.replace(/\x1b\[\d+;\d+H/g, "");
    text = text.replace(/\x1b\[\d+J/g, "");

    let result = "";
    let segments = text.split(/(\x1b\[\d+m)/);
    let currentSpanOpen = false;

    if (this.currentColorClass && !text.startsWith("\x1b[")) {
      result += `<span class="${this.currentColorClass}">`;
      currentSpanOpen = true;
    }

    segments.forEach((segment) => {
      if (segment.match(/\x1b\[\d+m/)) {
        const code = parseInt(segment.match(/\x1b\[(\d+)m/)[1], 10);

        if (currentSpanOpen) {
          result += "</span>";
          currentSpanOpen = false;
        }

        if (code === 0) {
          this.currentColorClass = null;
          return;
        }

        if (code >= 30 && code <= 37) {
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
          const colorClass = `ansi-${colors[code - 30]}`;
          this.currentColorClass = colorClass;
          result += `<span class="${colorClass}">`;
          currentSpanOpen = true;
        } else if (code >= 90 && code <= 97) {
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
          const colorClass = `ansi-bright-${colors[code - 90]}`;
          this.currentColorClass = colorClass;
          result += `<span class="${colorClass}">`;
          currentSpanOpen = true;
        }
      } else {
        result += segment;
      }
    });
    return result;
  }

  displayMessage(message) {
    const messageContainer = document.querySelector(
      "#serial-messages-container .message"
    );

    message = this.parseAnsiCodes(message);

    if (message.includes("<span")) {
      messageContainer.innerHTML += message + "\n";
    } else {
      if (this.currentColorClass) {
        messageContainer.innerHTML += `<span class="${this.currentColorClass}">${message}</span>\n`;
      } else {
        const textNode = document.createTextNode(message + "\n");
        messageContainer.appendChild(textNode);
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
