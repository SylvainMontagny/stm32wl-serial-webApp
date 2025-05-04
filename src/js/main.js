//=============================================================================
// IMPORTS AND INITIALIZATION
//=============================================================================
import SerialScaleController from "./SerialScaleController.js";

const serialScaleController = new SerialScaleController();
const connect = document.getElementById("connect-to-serial");
const baudrateSelect = document.getElementById("baudrate-select");
const commandInput = document.getElementById("command-input");
const sendCommand = document.getElementById("send-command");

//=============================================================================
// PAGE RELOAD FUNCTIONALITY
//=============================================================================
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

// Function to clear the console display area
function clearConsoleDisplay() {
  const messageContainer = document.querySelector(
    "#serial-messages-container .message"
  );
  if (messageContainer) {
    messageContainer.innerHTML = ""; // Clear the content
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const reloadButton = document.getElementById("reload-button");
  if (reloadButton) {
    reloadButton.addEventListener("click", window.reloadPageWithCacheClear);
  }

  // Add event listener for the new Clear button
  const clearButton = document.getElementById("clear-console-button");
  if (clearButton) {
    clearButton.addEventListener("click", clearConsoleDisplay);
  }

  // Initialize LoRa panel on page load
  initLoraPanel();
});

//=============================================================================
// SERIAL CONNECTION MANAGEMENT
//=============================================================================
connect.addEventListener("pointerdown", () => {
  const selectedBaudrate = baudrateSelect.value;
  serialScaleController.init(selectedBaudrate);
});

//=============================================================================
// COMMAND INPUT HANDLING
//=============================================================================
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

//=============================================================================
// LORA MODE CONTROLS
//=============================================================================
const buttonLoRa = document.getElementById("enter-lora-mode-container");
const buttonLoRaText = document.getElementById("enter-lora-mode-label");
const checkboxLoRa = document.getElementById("enter-lora-mode");

// Add click event listener to the entire container
buttonLoRa.addEventListener("click", async (event) => {
  // Prevent default behavior if clicking on the div
  if (event.target !== checkboxLoRa) {
    event.preventDefault();

    // Toggle checkbox state
    checkboxLoRa.checked = !checkboxLoRa.checked;

    // Apply corresponding logic
    if (checkboxLoRa.checked) {
      await serialScaleController.writeToPort("lora");
      buttonLoRaText.innerHTML = "Exit LoRa Mode";
      buttonLoRa.classList.add("active");
    } else {
      await serialScaleController.writeToPort("r");
      buttonLoRaText.innerHTML = "Enter LoRa Mode";
      buttonLoRa.classList.remove("active");
    }
  }
});

// Remove old event listener on checkbox to avoid duplicates
checkboxLoRa.removeEventListener("change", () => {});

//=============================================================================
// COMMON COMMAND BUTTONS
//=============================================================================
document.getElementById("reset-device").addEventListener("click", async () => {
  await serialScaleController.writeToPort("r");
});

document.getElementById("help").addEventListener("click", async () => {
  await serialScaleController.writeToPort("h");
});

document.getElementById("transmission").addEventListener("click", async () => {
  await serialScaleController.writeToPort("t");
});

//=============================================================================
// LORA COMMAND CONFIGURATION AND PREVIEW
//=============================================================================
document.getElementById("lora-power").addEventListener("input", (e) => {
  document.getElementById("lora-power-value").textContent = e.target.value;
});

/**
 * Updates the LoRa command preview based on current form values
 */
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

//=============================================================================
// LORA SLIDING PANEL INITIALIZATION
//=============================================================================
/**
 * Initializes the sliding LoRa panel and its toggle functionality
 */
function initLoraPanel() {
  const pageContainer = document.getElementById("page-container");
  const commandsSectionPanel = document.getElementById(
    "commands-section-panel"
  );
  const toggleLoraPanel = document.getElementById("toggle-lora-panel");
  let isPanelOpen = true; // Initialize as true to open panel by default

  // Check that all elements exist
  if (!pageContainer || !commandsSectionPanel || !toggleLoraPanel) {
    console.error("Missing elements for LoRa panel");
    return;
  }

  // Temporarily disable transitions for initialization
  pageContainer.style.transition = "none";
  commandsSectionPanel.style.transition = "none";
  toggleLoraPanel.style.transition = "none";

  // Open panel by default without animation
  commandsSectionPanel.style.right = "0";
  pageContainer.style.width = "65%";
  pageContainer.style.paddingLeft = "5%";
  pageContainer.style.paddingRight = "5%";
  toggleLoraPanel.style.right = "35%";
  toggleLoraPanel.innerHTML = '<i class="fas fa-chevron-right"></i>';

  // Re-enable transitions after initial render
  setTimeout(() => {
    pageContainer.style.transition = "";
    commandsSectionPanel.style.transition = "";
    toggleLoraPanel.style.transition = "";
  }, 50);

  /**
   * Toggles the panel open/closed state
   */
  function togglePanel() {
    // Smoother animation for panel and button
    if (!isPanelOpen) {
      // Open panel
      commandsSectionPanel.style.right = "0";
      pageContainer.style.width = "65%";
      pageContainer.style.paddingLeft = "5%";
      pageContainer.style.paddingRight = "5%";
      toggleLoraPanel.style.right = "35%";
      toggleLoraPanel.innerHTML = '<i class="fas fa-chevron-right"></i>';
    } else {
      // Close panel
      commandsSectionPanel.style.right = "-35%";
      pageContainer.style.width = "100%";
      pageContainer.style.paddingLeft = "10%";
      pageContainer.style.paddingRight = "10%";
      toggleLoraPanel.style.right = "0";
      toggleLoraPanel.innerHTML = '<i class="fas fa-chevron-left"></i>';
    }
    isPanelOpen = !isPanelOpen;
  }

  // Event listeners for panel toggle
  toggleLoraPanel.addEventListener("click", togglePanel);

  // Responsive adaptation
  window.addEventListener("resize", function () {
    if (window.innerWidth <= 768 && isPanelOpen) {
      toggleLoraPanel.classList.add("panel-open");
    } else {
      toggleLoraPanel.classList.remove("panel-open");
    }
  });

  // Initialize LoRa command preview
  updateLoraCommandPreview();

  // Initialize panel selector
  initPanelSelector();
}

//=============================================================================
// PANEL SELECTOR FUNCTIONALITY
//=============================================================================
/**
 * Initializes and manages the panel selector dropdown
 */
function initPanelSelector() {
  const selectedPanel = document.getElementById("selected-panel");
  const panelDropdown = document.getElementById("panel-dropdown");
  const panelSelector = document.querySelector(".panel-selector");
  const panelOptions = document.querySelectorAll(".panel-option");

  /**
   * Updates visibility of panel options based on current selection
   */
  function updatePanelOptions() {
    // Get currently selected text
    const currentText = selectedPanel.textContent.trim();

    // Show all options then hide the one matching current selection
    panelOptions.forEach((opt) => {
      opt.classList.remove("hidden");
      if (opt.textContent.trim() === currentText) {
        opt.classList.add("hidden");
      }
    });
  }

  // Apply on load to hide currently selected option
  updatePanelOptions();

  // Toggle dropdown on click
  selectedPanel.addEventListener("click", () => {
    panelSelector.classList.toggle("open");

    // If panel is open, ensure correct options are visible
    if (panelSelector.classList.contains("open")) {
      updatePanelOptions();
    }
  });

  // Close dropdown when clicking elsewhere
  document.addEventListener("click", (event) => {
    if (!panelSelector.contains(event.target)) {
      panelSelector.classList.remove("open");
    }
  });

  // Handle panel selection
  panelOptions.forEach((option) => {
    option.addEventListener("click", () => {
      // Update selected text
      selectedPanel.textContent = option.textContent;

      // Close dropdown
      panelSelector.classList.remove("open");

      // Hide all panels
      document.querySelectorAll(".panel-content").forEach((panel) => {
        panel.classList.add("hidden");
      });

      // Show selected panel
      const panelId = option.getAttribute("data-panel") + "-panel";
      document.getElementById(panelId).classList.remove("hidden");

      // Update visible options
      updatePanelOptions();
    });
  });
}
