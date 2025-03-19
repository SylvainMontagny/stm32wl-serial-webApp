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
          messages.forEach((message) => this.displayMessage(message));
        }
      }
    }
  }

  displayMessage(message) {
    const messageContainer = document.querySelector(
      "#serial-messages-container .message"
    );

    // Traitement des codes ANSI
    message = this.parseAnsiCodes(message);

    // Ajouter le message au conteneur
    if (message.includes("<span")) {
      // Si le message contient déjà des balises HTML (après parsing ANSI)
      messageContainer.innerHTML += message + "\n";
    } else {
      // Sinon, utiliser innerText pour éviter les injections
      const textNode = document.createTextNode(message + "\n");
      messageContainer.appendChild(textNode);
    }

    const autoScrollEnabled = document.getElementById("auto-scroll").checked;
    if (autoScrollEnabled) {
      const scrollContainer = document.getElementById(
        "serial-messages-container"
      );
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }

  parseAnsiCodes(text) {
    // Codes de contrôle du terminal
    text = text.replace(/\x1b\[\d+;\d+H/g, ""); // Positionnement du curseur
    text = text.replace(/\x1b\[\d+J/g, ""); // Effacement de l'écran

    // Traitement des séquences de couleur ANSI
    return text.replace(/\x1b\[(\d+)m/g, (match, code) => {
      code = parseInt(code, 10);

      // Codes de couleur de texte standard (30-37)
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
        return `<span class="ansi-${colors[code - 30]}">`;
      }

      // Codes de couleur de texte brillants (90-97)
      if (code >= 90 && code <= 97) {
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
        return `<span class="ansi-bright-${colors[code - 90]}">`;
      }

      // Si le code n'est pas géré, retourner une chaîne vide
      return "";
    });
  }
}
