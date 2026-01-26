export default class UIManager {
  constructor(core) {
    this.core = core;

    // Cache DOM Elements on demand or init
    this.elements = {};
  }

  bindEvents() {
    // Theme
    document
      .getElementById("themeToggle")
      ?.addEventListener("click", () => this.core.settings.toggleTheme());

    // Navigation
    document
      .getElementById("startBtn")
      ?.addEventListener("click", () => this.core.fileManager.selectFolder());

    // Modals
    document
      .getElementById("navSettingsBtn")
      ?.addEventListener("click", () => this.openModal("settingsModal"));
    document
      .getElementById("sortingSettingsBtn")
      ?.addEventListener("click", () => this.openModal("settingsModal"));
    document
      .getElementById("closeSettingsBtn")
      ?.addEventListener("click", () => this.closeModal("settingsModal"));
    document
      .getElementById("saveSettingsBtn")
      ?.addEventListener("click", () => {
        this.closeModal("settingsModal");
        this.core.settings.saveSettings(); // Actually settings are live updated in this implementation or should be saved here
        this.showToast("Settings saved", "success");
      });

    document
      .getElementById("navHelpBtn")
      ?.addEventListener("click", () => this.openModal("helpModal"));
    document
      .getElementById("closeHelpBtn")
      ?.addEventListener("click", () => this.closeModal("helpModal"));

    document
      .getElementById("closeSortingBtn")
      ?.addEventListener("click", () => {
        // Confirm exit?
        if (confirm("Exit sorting session?")) {
          this.closeModal("sortingModal");
          // Cleanup
          this.core.fileManager.resetState();
        }
      });

    // Folder Access Modal
    document
      .getElementById("confirmAccessBtn")
      ?.addEventListener("click", () => {
        this.closeModal("folderAccessModal");
        this.core.fileManager.selectFolder();
      });
    document
      .getElementById("cancelAccessBtn")
      ?.addEventListener("click", () => this.closeModal("folderAccessModal"));

    // Settings Inputs
    document.querySelectorAll('input[name="sortingMode"]').forEach((radio) => {
      radio.addEventListener("change", (e) => {
        this.core.settings.updateSetting("sortingMode", e.target.value);
        this.updateUIForMode();
      });
    });

    document
      .getElementById("autoRenameToggle")
      ?.addEventListener("change", (e) => {
        this.core.settings.updateSetting("autoRename", e.target.checked);
      });

    document
      .getElementById("autoPlayToggle")
      ?.addEventListener("change", (e) => {
        this.core.settings.updateSetting("autoPlayVideo", e.target.checked);
      });

    // Add Folder Binding
    document
      .getElementById("addFolderBtn")
      ?.addEventListener("click", () => this.addFolderBindingUI());

    // Keyboard Actions
    window.addEventListener("keydown", (e) => this.handleKeyDown(e));

    // Sorting Actions (Mouse)
    document
      .getElementById("skipBtn")
      ?.addEventListener("click", () => this.core.fileManager.skipFile());
    document
      .getElementById("deleteBtn")
      ?.addEventListener("click", () => this.core.fileManager.deleteFile());
    document
      .getElementById("keepBtn")
      ?.addEventListener("click", () => this.core.fileManager.keepFile());
    document
      .getElementById("undoBtn")
      ?.addEventListener("click", () => this.core.fileManager.undo());

    // Filter Toggles
    document
      .getElementById("filterImages")
      ?.addEventListener("click", () =>
        this.core.mediaViewer.toggleImageFilter(),
      );
    document
      .getElementById("filterVideos")
      ?.addEventListener("click", () =>
        this.core.mediaViewer.toggleVideoFilter(),
      );
    document
      .getElementById("filterAll")
      ?.addEventListener("click", () => this.core.mediaViewer.showAllFilters());

    // Metadata
    document
      .getElementById("showMetadataBtn")
      ?.addEventListener("click", () => this.core.metadata.toggleMetadata());
    document
      .getElementById("closeMetadata")
      ?.addEventListener("click", () => this.core.metadata.hideMetadata());

    // Batch Mode
    document
      .getElementById("batchModeBtn")
      ?.addEventListener("click", () => this.core.batch.toggleBatchMode());

    document
      .getElementById("selectAllBtn")
      ?.addEventListener("click", () => this.core.batch.selectAll());

    document
      .getElementById("deselectAllBtn")
      ?.addEventListener("click", () => this.core.batch.deselectAll());

    document
      .getElementById("selectAllBtn")
      ?.addEventListener("click", () => this.core.batch.selectAll());
    document
      .getElementById("deselectAllBtn")
      ?.addEventListener("click", () => this.core.batch.deselectAll());

    // Completion
    document
      .getElementById("newSessionBtn")
      ?.addEventListener("click", () =>
        this.core.fileManager.startNewSession(),
      );
  }

  handleKeyDown(e) {
    // Check Key Binding Modal FIRST (it sits on top of settings)
    if (
      !document.getElementById("keyBindingModal").classList.contains("hidden")
    ) {
      // Let UI manager handle key binding capture if active
      this.handleKeyBindingInput(e);
      return;
    }

    // Modal logic bypass for other modals
    if (!document.getElementById("settingsModal").classList.contains("hidden"))
      return;

    // Route to main handler in Core or handle here
    this.core.handleKeyDown(e);
  }

  handleKeyBindingInput(e) {
    e.preventDefault();
    e.stopPropagation(); // Stop bubbling

    // Logic for capturing key in binding modal
    if (this.waitingForBindingKey) {
      const code = e.code;
      // Prefer simple key char for display if available and short
      let displayKey = this.formatKeyName(code);
      if (!displayKey && e.key && e.key.length === 1)
        displayKey = e.key.toUpperCase();
      if (!displayKey) displayKey = code; // Fallback to code

      const displayEl = document.getElementById("pressedKeyDisplay");
      if (displayEl) displayEl.textContent = displayKey;

      this.pendingBindingKey = code;

      const confirmBtn = document.getElementById("confirmKeyBindBtn");
      if (confirmBtn) confirmBtn.disabled = false;
    }
  }

  startKeyBinding(index) {
    this.bindingIndex = index;
    this.waitingForBindingKey = true;
    this.pendingBindingKey = null;
    document.getElementById("pressedKeyDisplay").textContent = "-";
    document.getElementById("confirmKeyBindBtn").disabled = true;
    this.openModal("keyBindingModal");

    const confirmBtn = document.getElementById("confirmKeyBindBtn");
    // Clone to remove old listeners
    const newBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);

    newBtn.addEventListener("click", () => {
      if (this.pendingBindingKey) {
        // Update settings
        const formattedKey = this.formatKeyName(this.pendingBindingKey);
        // Check conflicts... logic moved to SettingsManager ideally or kept simple
        this.core.settings.settings.folderBindings[index].key = formattedKey;
        this.core.settings.saveSettings();
        this.renderFolderBindings();
        this.closeModal("keyBindingModal");
      }
    });

    document.getElementById("cancelKeyBindBtn").onclick = () =>
      this.closeModal("keyBindingModal");
  }

  openModal(id) {
    document.getElementById(id)?.classList.remove("hidden");
  }

  closeModal(id) {
    document.getElementById(id)?.classList.add("hidden");
  }

  showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    const icons = {
      success: "✓",
      error: "✕",
      warning: "⚠",
      info: "ℹ",
    };

    toast.innerHTML = `
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <span class="toast-message">${message}</span>
        `;

    container.appendChild(toast);

    // Animation handled by CSS (toastEnter)
    // Cleanup
    setTimeout(() => {
      toast.style.transition = "all 0.3s";
      toast.style.opacity = "0";
      toast.style.transform = "translateX(100%)";
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  updateProgress(current, total) {
    const percent = total > 0 ? (current / total) * 100 : 0;
    const fill = document.getElementById("progressBarFill");
    const text = document.getElementById("progressPercent");
    const counter = document.getElementById("fileCounter");
    const name = document.getElementById("fileName");

    if (fill) fill.style.width = `${percent}%`;
    if (text) text.textContent = `${Math.round(percent)}%`;
    if (counter) counter.textContent = `${current + 1} / ${total}`;

    // File name update is handled by MediaViewer load
  }

  updateTypeCounts(imageCount, videoCount) {
    const imgEl = document.getElementById("imageCount");
    const vidEl = document.getElementById("videoCount");
    if (imgEl) imgEl.textContent = imageCount;
    if (vidEl) vidEl.textContent = videoCount;
  }

  updateFileName(name) {
    const el = document.getElementById("fileName");
    if (el) {
      el.textContent = name;
      el.title = name;
    }
  }

  renderFolderBindings() {
    const container = document.getElementById("folderBindingsContainer");
    const shortcuts = document.getElementById("folderShortcuts");
    if (!container || !shortcuts) return;

    container.innerHTML = "";
    shortcuts.innerHTML = "";

    this.core.settings.settings.folderBindings.forEach((binding, index) => {
      // Settings Render
      const row = document.createElement("div");
      row.className = "folder-binding-row";
      row.innerHTML = `
                <button class="binding-key-btn" title="Change Key">${binding.key}</button>
                <input type="text" class="binding-name-input" value="${binding.folderName}" placeholder="Folder Name">
                <button class="binding-remove-btn" title="Remove">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            `;

      // Events
      const nameInput = row.querySelector(".binding-name-input");
      nameInput.addEventListener("change", (e) => {
        this.core.settings.settings.folderBindings[index].folderName =
          e.target.value;
        this.core.settings.saveSettings();
        this.renderFolderBindings(); // Re-render shortcuts
      });

      const keyBtn = row.querySelector(".binding-key-btn");
      keyBtn.addEventListener("click", () => this.startKeyBinding(index));

      const removeBtn = row.querySelector(".binding-remove-btn");
      removeBtn.addEventListener("click", () => {
        this.core.settings.settings.folderBindings.splice(index, 1);
        this.core.settings.saveSettings();
        this.renderFolderBindings();
      });

      container.appendChild(row);

      // Shortcuts Bar Render (Only if name exists)
      if (binding.folderName) {
        const shortcut = document.createElement("div");
        shortcut.className = "folder-shortcut";
        shortcut.dataset.index = index; // For animation reference
        shortcut.innerHTML = `
                    <div class="key-badge">${binding.key}</div>
                    <span class="folder-name">${binding.folderName}</span>
                `;
        shortcut.addEventListener("click", () =>
          this.core.fileManager.sortToFolder(index),
        );
        shortcuts.appendChild(shortcut);
      }
    });
  }

  addFolderBindingUI() {
    this.core.settings.settings.folderBindings.push({
      key: "?",
      folderName: "New Folder",
    });
    this.core.settings.saveSettings();
    this.renderFolderBindings();
  }

  updateUIForMode() {
    const mode = this.core.settings.settings.sortingMode;
    const numericElements = document.querySelectorAll(".mode-numeric-only");
    const arrowElements = document.querySelectorAll(".mode-arrows-only");

    if (mode === "numeric") {
      numericElements.forEach((el) => el.classList.remove("hidden"));
      arrowElements.forEach((el) => el.classList.add("hidden"));
    } else {
      numericElements.forEach((el) => el.classList.add("hidden"));
      arrowElements.forEach((el) => el.classList.remove("hidden"));
    }
  }

  animateFolderAction(index) {
    const shortcuts = document.getElementById("folderShortcuts");
    if (shortcuts && shortcuts.children[index]) {
      const item = shortcuts.children[index];
      item.classList.add("active"); // active style
      setTimeout(() => item.classList.remove("active"), 200);
    }
  }

  showCompletion(stats) {
    this.closeModal("sortingModal");
    this.openModal("completionModal");

    const container = document.getElementById("statsContainer");
    if (container) {
      container.innerHTML = "";
      const createStat = (label, value, icon) => {
        const div = document.createElement("div");
        div.className = "stat-item";
        div.innerHTML = `<div class="stat-icon">${icon}</div><div class="stat-value">${value}</div><div class="stat-label">${label}</div>`;
        return div;
      };

      container.appendChild(createStat("Kept", stats.kept, "✓"));
      container.appendChild(createStat("Deleted", stats.deleted, "🗑️"));
      container.appendChild(createStat("Skipped", stats.skipped, "↷"));

      // Custom stats
      if (stats.folderStats) {
        Object.entries(stats.folderStats).forEach(([name, count]) => {
          if (count > 0) container.appendChild(createStat(name, count, "📁"));
        });
      }
    }

    // Confetti logic could be here or split
  }

  formatKeyName(code) {
    if (code.startsWith("Digit")) return code.replace("Digit", "");
    if (code.startsWith("Key")) return code.replace("Key", "");
    if (code === "Space") return "Space";
    if (code.startsWith("Arrow")) return code.replace("Arrow", "");
    return code;
  }

  // Duplicate warning
  showDuplicateWarning(message) {
    const warning = document.getElementById("duplicateWarning");
    const msg = document.getElementById("duplicateMessage");
    if (warning && msg) {
      msg.innerHTML = message; // Use HTML for list
      warning.classList.remove("hidden");
    }
  }

  hideDuplicateWarning() {
    document.getElementById("duplicateWarning")?.classList.add("hidden");
  }
}
