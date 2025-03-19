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

document.getElementById("lora").addEventListener("click", async () => {
  await serialScaleController.writeToPort("lora");
});
