"use strict";

export default class SerialScaleController {
  constructor() {
    this.encoder = new TextEncoder();
    this.decoder = new TextDecoder();
    this.firstLine = true;
    this.buffer = "";
    this.port = null;
  }

  async init() {
    if ("serial" in navigator) {
      try {
        const port = await navigator.serial.requestPort();
        await port.open({ baudRate: 115200 });
        this.port = port;
        this.reader = port.readable.getReader();
        let signals = await port.getSignals();
        console.log(signals);
        this.readLoop();
      } catch (err) {
        console.error("There was an error opening the serial port:", err);
      }
    } else {
      console.error(
        "Web serial doesn't seem to be enabled in your browser. Try enabling it by visiting:"
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
          messages.forEach((message) =>
            this.displayMessage(this.cleanMessage(message))
          );
        }
      }
    }
  }

  cleanMessage(message) {
    let cleanedMessage = message
      .replace(/\x1B\[[0-9;]*[A-Za-z]/g, "")
      .replace(/\x1B/g, "")
      .trim();

    const lines = cleanedMessage.split("\n");
    if (this.firstLine && lines.length > 0) {
      lines.shift();
      this.firstLine = false;
    }

    return lines.join("\n");
  }

  displayMessage(message) {
    const messageContainer = document.querySelector(
      "#serial-messages-container .message"
    );
    messageContainer.innerText += message + "\n";
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }
}