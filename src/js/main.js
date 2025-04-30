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
  let isPanelOpen = false;

  // Vérifier que tous les éléments sont présents
  if (!pageContainer || !commandsSectionPanel || !toggleLoraPanel) {
    console.error("Éléments manquants pour le panneau LoRa");
    return;
  }

  // Fermer le panneau par défaut
  commandsSectionPanel.style.right = "-35%";
  pageContainer.style.width = "100%";

  // Fonction pour basculer le panneau
  function togglePanel() {
    // Animation plus fluide pour le panneau et le bouton
    if (!isPanelOpen) {
      // Ouvrir le panneau
      commandsSectionPanel.style.right = "0";
      pageContainer.style.width = "65%";
      pageContainer.style.paddingLeft = "5%";
      pageContainer.style.paddingRight = "5%";
      toggleLoraPanel.style.right = "35%";
      toggleLoraPanel.innerHTML = '<i class="fas fa-chevron-right"></i>';
      // Activer le mode LoRa
      serialScaleController.writeToPort("lora");
    } else {
      // Fermer le panneau
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

  // Initialiser le sélecteur de panel
  initPanelSelector();
}

// Fonction pour gérer le sélecteur de panels
function initPanelSelector() {
  const selectedPanel = document.getElementById("selected-panel");
  const panelDropdown = document.getElementById("panel-dropdown");
  const panelSelector = document.querySelector(".panel-selector");
  const panelOptions = document.querySelectorAll(".panel-option");

  // Fonction pour mettre à jour la visibilité des options
  function updatePanelOptions() {
    // Récupérer le texte actuellement sélectionné
    const currentText = selectedPanel.textContent.trim();

    // Afficher toutes les options puis cacher celle qui correspond à la sélection actuelle
    panelOptions.forEach((opt) => {
      opt.classList.remove("hidden");
      if (opt.textContent.trim() === currentText) {
        opt.classList.add("hidden");
      }
    });
  }

  // Appliquer au chargement pour cacher l'option actuellement sélectionnée
  updatePanelOptions();

  // Ouvrir/fermer le dropdown au clic
  selectedPanel.addEventListener("click", () => {
    panelSelector.classList.toggle("open");

    // Si le panel est ouvert, on s'assure que les bonnes options sont visibles
    if (panelSelector.classList.contains("open")) {
      updatePanelOptions();
    }
  });

  // Fermer le dropdown si on clique ailleurs
  document.addEventListener("click", (event) => {
    if (!panelSelector.contains(event.target)) {
      panelSelector.classList.remove("open");
    }
  });

  // Gestion de la sélection d'un panel
  panelOptions.forEach((option) => {
    option.addEventListener("click", () => {
      // Mettre à jour le texte sélectionné
      selectedPanel.textContent = option.textContent;

      // Fermer le dropdown
      panelSelector.classList.remove("open");

      // Masquer tous les panels
      document.querySelectorAll(".panel-content").forEach((panel) => {
        panel.classList.add("hidden");
      });

      // Afficher le panel sélectionné
      const panelId = option.getAttribute("data-panel") + "-panel";
      document.getElementById(panelId).classList.remove("hidden");

      // Mettre à jour les options visibles
      updatePanelOptions();
    });
  });
}
