// main.js

import SerialScaleController from "./SerialScaleController.js";

const serialScaleController = new SerialScaleController();
const connect = document.getElementById("connect-to-serial");
const commandInput = document.getElementById("command-input");
const sendCommand = document.getElementById("send-command");

connect.addEventListener("pointerdown", () => {
  serialScaleController.init();
});

sendCommand.addEventListener("click", async () => {
  const command = commandInput.value.trim();
  if (command) {
    await serialScaleController.writeToPort(command);
    commandInput.value = "";
  }
});

commandInput.addEventListener("keypress", async (e) => {
  if (e.key === "Enter") {
    const command = commandInput.value.trim();
    if (command) {
      await serialScaleController.writeToPort(command);
      commandInput.value = "";
    }
  }
});

document.getElementById("reset-device").addEventListener("click", async () => {
  await serialScaleController.writeToPort("r");
});

document.getElementById("help").addEventListener("click", async () => {
  await serialScaleController.writeToPort("h");
});

document.getElementById("transmission").addEventListener("click", async () => {
  await serialScaleController.writeToPort("t");
});

document.getElementById("lora-power").addEventListener("input", (e) => {
  document.getElementById("lora-power-value").textContent = e.target.value;
});

function updateLoraCommandPreview() {
  const channel = document.getElementById("lora-channel").value;
  const power = document.getElementById("lora-power").value;
  const sf = document.getElementById("lora-sf").value;
  const payload = document.getElementById("lora-payload").value.trim();

  const loraCommand = `LORA=${channel}:${power}:${sf}:${payload}`;
  const previewInput = document.getElementById("lora-command-preview");

  // Update the preview only if the user hasn't manually modified it
  if (document.activeElement !== previewInput) {
    previewInput.value = loraCommand;
  }
}

// Attach event listeners to update the preview in real-time
document
  .getElementById("lora-channel")
  .addEventListener("change", updateLoraCommandPreview);
document
  .getElementById("lora-power")
  .addEventListener("input", updateLoraCommandPreview);
document
  .getElementById("lora-sf")
  .addEventListener("change", updateLoraCommandPreview);
document
  .getElementById("lora-payload")
  .addEventListener("input", updateLoraCommandPreview);

document
  .getElementById("send-lora-command")
  .addEventListener("click", async () => {
    const loraCommand = document
      .getElementById("lora-command-preview")
      .value.trim();
    if (loraCommand) {
      await serialScaleController.writeToPort(loraCommand);
    } else {
      alert("Please enter a valid LoRa command.");
    }
  });

// Toggle visibility of panels
const inputContainer = document.querySelector(".input-container-cmd");
const loraTransmissionPanel = document.querySelector(".commands-section");

document.getElementById("enter-send-command").addEventListener("click", (e) => {
  const buttonContainer = e.target.closest(".toggle-container-cmd");
  const isActive = buttonContainer.classList.toggle("active");
  inputContainer.classList.toggle("hidden", !isActive);
});

document
  .getElementById("enter-lora-mode")
  .addEventListener("click", async (e) => {
    const buttonContainer = e.target.closest(".toggle-container-cmd");
    const isActive = buttonContainer.classList.toggle("active");
    const loraModeLabel = document.getElementById("enter-lora-mode-label");

    if (!isActive) {
      await serialScaleController.writeToPort("r");
      loraModeLabel.textContent = "Enter LoRa Mode";
    } else {
      await serialScaleController.writeToPort("lora");
      loraModeLabel.textContent = "Exit LoRa Mode";
    }
    loraTransmissionPanel.classList.toggle("hidden", !isActive);
  });
