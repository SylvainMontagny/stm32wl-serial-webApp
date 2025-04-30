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
    // Nettoyage des codes non liés aux couleurs
    text = text.replace(/\x1b(?!\[)/g, "");
    text = text.replace(/\x1b\[\d+;\d+H/g, "");
    text = text.replace(/\x1b\[\d+J/g, "");

    let result = "";

    // Support des formats ESP32 [0;32m et des formats standard \x1b[32m
    const ansiRegex = /(?:\x1b\[|\[)(\d+)(?:;(\d+))?m/g;
    let lastIndex = 0;
    let match;

    // Si une couleur est déjà active au début du texte
    if (this.currentColorClass && !text.match(/^(?:\x1b\[|\[)\d+(?:;\d+)?m/)) {
      result += `<span class="${this.currentColorClass}">`;
    } else {
      this.currentColorClass = null;
    }

    // Traitement de chaque code couleur dans le texte
    while ((match = ansiRegex.exec(text)) !== null) {
      // Ajouter le texte entre les codes
      const textBefore = text.substring(lastIndex, match.index);
      if (textBefore) {
        if (this.currentColorClass) {
          result += textBefore;
        } else {
          result += textBefore;
        }
      }

      // Fermer la balise span précédente si une existe
      if (this.currentColorClass) {
        result += "</span>";
      }

      // Analyser le code
      const primaryCode = parseInt(match[1], 10);
      const secondaryCode = match[2] ? parseInt(match[2], 10) : null;

      // Déterminer la couleur
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

      // Appliquer la couleur
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

    // Ajouter le texte restant
    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex);
      result += remainingText;
    }

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
