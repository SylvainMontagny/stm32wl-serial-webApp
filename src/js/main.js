import SerialScaleController from "./SerialScaleController.js";

const serialScaleController = new SerialScaleController();
const connect = document.getElementById("connect-to-serial");
const baudrateSelect = document.getElementById("baudrate-select");
const commandInput = document.getElementById("command-input");
const sendCommand = document.getElementById("send-command");

window.reloadPageWithCacheClear = function () {
  if (window.caches) {
    caches.keys().then(function (names) {
      for (let name of names) {
        caches.delete(name);
      }
    });
  }
  window.location.reload(true);
};

document.addEventListener("DOMContentLoaded", () => {
  const reloadButton = document.getElementById("reload-button");
  if (reloadButton) {
    reloadButton.addEventListener("click", window.reloadPageWithCacheClear);
  }

  // Initialisation du panneau LoRa
  initLoraPanel();
});

connect.addEventListener("pointerdown", () => {
  const selectedBaudrate = baudrateSelect.value;
  serialScaleController.init(selectedBaudrate);
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

// Fonction pour initialiser le panneau LoRa coulissant
function initLoraPanel() {
  const pageContainer = document.getElementById("page-container");
  const commandsSectionPanel = document.getElementById(
    "commands-section-panel"
  );
  const toggleLoraPanel = document.getElementById("toggle-lora-panel");
  const closePanel = document.getElementById("close-panel");
  let isPanelOpen = false;

  // Vérifier que tous les éléments sont présents
  if (
    !pageContainer ||
    !commandsSectionPanel ||
    !toggleLoraPanel ||
    !closePanel
  ) {
    console.error("Éléments manquants pour le panneau LoRa");
    return;
  }

  // Fermer le panneau par défaut
  commandsSectionPanel.style.right = "-35%";
  pageContainer.style.width = "100%";

  // Fonction pour basculer le panneau
  function togglePanel() {
    if (!isPanelOpen) {
      // Afficher le panneau
      commandsSectionPanel.style.right = "0";
      pageContainer.style.width = "65%";
      pageContainer.style.paddingLeft = "5%";
      pageContainer.style.paddingRight = "5%";
      toggleLoraPanel.style.right = "35%";
      toggleLoraPanel.innerHTML = '<i class="fas fa-chevron-right"></i>';
      // Activer le mode LoRa
      serialScaleController.writeToPort("lora");
    } else {
      // Masquer le panneau
      commandsSectionPanel.style.right = "-35%";
      pageContainer.style.width = "100%";
      pageContainer.style.paddingLeft = "10%";
      pageContainer.style.paddingRight = "10%";
      toggleLoraPanel.style.right = "0";
      toggleLoraPanel.innerHTML = '<i class="fas fa-chevron-left"></i>';
      // Désactiver le mode LoRa (reset)
      serialScaleController.writeToPort("r");
    }
    isPanelOpen = !isPanelOpen;
  }

  // Écouteurs d'événements pour l'ouverture/fermeture du panneau
  toggleLoraPanel.addEventListener("click", togglePanel);
  closePanel.addEventListener("click", togglePanel);

  // Adaptation pour le responsive
  window.addEventListener("resize", function () {
    if (window.innerWidth <= 768 && isPanelOpen) {
      toggleLoraPanel.classList.add("panel-open");
    } else {
      toggleLoraPanel.classList.remove("panel-open");
    }
  });

  // Initialiser la prévisualisation de commande LoRa
  updateLoraCommandPreview();
}

// Suppression du code précédent pour le toggle des panels
// Le code suivant est maintenant remplacé par la fonction initLoraPanel()
/*
// Toggle visibility of panels
const inputContainer = document.querySelector(".input-container-cmd");
const loraTransmissionPanel = document.querySelector(".commands-section");

document.querySelectorAll(".toggle-container-cmd").forEach((container) => {
  container.addEventListener("click", async (e) => {
    // Empêche le comportement par défaut si le clic vient du label
    if (e.target.tagName === "LABEL") {
      e.preventDefault();
    }

    const isLoraMode = container.id === "enter-lora-mode-container";
    const checkbox = container.querySelector("input[type='checkbox']");
    const isActive = container.classList.toggle("active");

    // Met à jour l'état de la checkbox
    checkbox.checked = isActive;

    if (isLoraMode) {
      const loraModeLabel = document.getElementById("enter-lora-mode-label");
      if (!isActive) {
        await serialScaleController.writeToPort("r");
        loraModeLabel.textContent = "Enter LoRa Mode";
      } else {
        await serialScaleController.writeToPort("lora");
        loraModeLabel.textContent = "Exit LoRa Mode";
      }
      loraTransmissionPanel.classList.toggle("hidden", !isActive);
    } else {
      inputContainer.classList.toggle("hidden", !isActive);
    }
  });
});
*/
