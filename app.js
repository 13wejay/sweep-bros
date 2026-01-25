/**
 * Photo Bro - Smart Media Sorter
 * Premium browser-based photo/video sorting application
 */

class PhotoBro {
  constructor() {
    // State
    this.files = [];
    this.currentIndex = 0;
    this.history = [];
    this.keptFiles = [];
    this.deletedFiles = [];
    this.skippedFiles = [];
    this.directoryHandle = null;
    this.keepFolderHandle = null;
    this.deleteFolderHandle = null;

    // Settings
    this.settings = {
      deleteKey: "ArrowLeft",
      keepKey: "ArrowRight",
      skipKey: "Space",
      undoKey: "KeyZ",
      keepFolderName: "keep",
      deleteFolderName: "delete",
      autoPlayVideo: true,
      confirmDelete: false,
      autoRename: false,
      sortingMode: "numeric", // 'numeric' or 'arrows'
      folderBindings: [
        { key: "1", folderName: "favorites" },
        { key: "2", folderName: "family" },
        { key: "3", folderName: "work" },
      ],
    };

    // Supported formats
    this.imageExtensions = [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "webp",
      "bmp",
      "svg",
      "ico",
      "avif",
    ];
    this.videoExtensions = ["mp4", "webm", "mov", "avi", "mkv", "ogg", "m4v"];

    // Key binding state
    this.waitingForKey = null;
    this.newKeyCode = null;
    this.activeBindingIndex = null; // Track which binding is being edited

    this.init();
  }

  init() {
    this.cacheElements();
    this.loadSettings();
    this.bindEvents();
    this.renderFolderBindings(); // Initial render
  }

  cacheElements() {
    // Pages & Modals
    this.landingPage = document.getElementById("landingPage");
    this.folderAccessModal = document.getElementById("folderAccessModal");
    this.sortingModal = document.getElementById("sortingModal");
    this.completionModal = document.getElementById("completionModal");
    this.settingsModal = document.getElementById("settingsModal");
    this.keyBindingModal = document.getElementById("keyBindingModal");

    // Landing buttons
    this.startBtn = document.getElementById("startBtn");
    this.navSettingsBtn = document.getElementById("navSettingsBtn");

    // Folder access modal
    this.cancelAccessBtn = document.getElementById("cancelAccessBtn");
    this.confirmAccessBtn = document.getElementById("confirmAccessBtn");

    // Sorting elements
    this.closeSortingBtn = document.getElementById("closeSortingBtn");
    this.sortingSettingsBtn = document.getElementById("sortingSettingsBtn");
    this.fileName = document.getElementById("fileName");
    this.fileCounter = document.getElementById("fileCounter");
    this.progressBarFill = document.getElementById("progressBarFill");
    this.progressPercent = document.getElementById("progressPercent");
    this.loadingState = document.getElementById("loadingState");
    this.previewImage = document.getElementById("previewImage");
    this.previewVideo = document.getElementById("previewVideo");

    // Optional buttons based on mode
    this.deleteBtn = document.getElementById("deleteBtn");
    this.keepBtn = document.getElementById("keepBtn");

    this.skipBtn = document.getElementById("skipBtn");
    this.undoBtn = document.getElementById("undoBtn");
    this.folderShortcuts = document.getElementById("folderShortcuts");

    // Completion elements
    this.keptCount = document.getElementById("keptCount");
    this.deletedCount = document.getElementById("deletedCount");
    this.skippedCount = document.getElementById("skippedCount");
    this.newSessionBtn = document.getElementById("newSessionBtn");
    this.confettiContainer = document.getElementById("confettiContainer");
    this.statsContainer = document.getElementById("statsContainer");

    // Settings elements
    this.closeSettingsBtn = document.getElementById("closeSettingsBtn");
    this.saveSettingsBtn = document.getElementById("saveSettingsBtn");
    // Legacy keys removed from UI

    this.folderBindingsContainer = document.getElementById(
      "folderBindingsContainer",
    );
    this.addFolderBtn = document.getElementById("addFolderBtn");
    this.autoPlayToggle = document.getElementById("autoPlayToggle");
    this.autoRenameToggle = document.getElementById("autoRenameToggle");

    // Key binding modal
    this.pressedKeyDisplay = document.getElementById("pressedKeyDisplay");
    this.cancelKeyBindBtn = document.getElementById("cancelKeyBindBtn");
    this.confirmKeyBindBtn = document.getElementById("confirmKeyBindBtn");

    // Sorting Mode Radios
    this.modeRadios = document.querySelectorAll('input[name="sortingMode"]');

    // Help Modal
    this.navHelpBtn = document.getElementById("navHelpBtn");
    this.helpModal = document.getElementById("helpModal");
    this.closeHelpBtn = document.getElementById("closeHelpBtn");

    // Toast
    this.toastContainer = document.getElementById("toastContainer");
  }

  bindEvents() {
    // Landing - show pre-dialog first
    this.startBtn.addEventListener("click", () => this.showFolderAccessModal());
    this.navSettingsBtn.addEventListener("click", () => this.openSettings());

    // Folder access modal
    this.cancelAccessBtn.addEventListener("click", () =>
      this.closeFolderAccessModal(),
    );
    this.confirmAccessBtn.addEventListener("click", () => this.selectFolder());
    this.folderAccessModal
      .querySelector(".modal-overlay")
      .addEventListener("click", () => this.closeFolderAccessModal());

    // Sorting
    this.closeSortingBtn.addEventListener("click", () => this.closeSorting());
    this.sortingSettingsBtn.addEventListener("click", () =>
      this.openSettings(),
    );
    if (this.deleteBtn)
      this.deleteBtn.addEventListener("click", () => this.deleteFile());
    if (this.keepBtn)
      this.keepBtn.addEventListener("click", () => this.keepFile());

    this.skipBtn.addEventListener("click", () => this.skipFile());
    this.undoBtn.addEventListener("click", () => this.undo());

    // Completion
    this.newSessionBtn.addEventListener("click", () => this.startNewSession());

    // Settings
    this.closeSettingsBtn.addEventListener("click", () => this.closeSettings());
    this.saveSettingsBtn.addEventListener("click", () => this.saveSettings());

    // Folder Bindings Settings
    this.addFolderBtn.addEventListener("click", () => this.addFolderBinding());
    this.autoRenameToggle.addEventListener("change", (e) => {
      this.settings.autoRename = e.target.checked;
      this.saveSettingsToStorage();
    });

    // Sorting Mode Change
    if (this.modeRadios) {
      this.modeRadios.forEach((radio) => {
        radio.addEventListener("change", (e) => {
          if (e.target.checked) {
            this.settings.sortingMode = e.target.value;
            this.saveSettingsToStorage();
            this.updateUIForMode();
          }
        });
      });
    }

    // Key binding modal
    this.cancelKeyBindBtn.addEventListener("click", () =>
      this.cancelKeyBinding(),
    );
    this.confirmKeyBindBtn.addEventListener("click", () =>
      this.confirmKeyBinding(),
    );

    // Modal overlays
    this.settingsModal
      .querySelector(".modal-overlay")
      .addEventListener("click", () => this.closeSettings());
    this.keyBindingModal
      .querySelector(".modal-overlay")
      .addEventListener("click", () => this.cancelKeyBinding());
    this.completionModal
      .querySelector(".modal-overlay")
      .addEventListener("click", () => this.startNewSession());

    // Help Modal
    if (this.navHelpBtn) {
      this.navHelpBtn.addEventListener("click", () =>
        this.helpModal.classList.remove("hidden"),
      );
    }
    if (this.closeHelpBtn) {
      this.closeHelpBtn.addEventListener("click", () =>
        this.helpModal.classList.add("hidden"),
      );
    }
    this.helpModal
      .querySelector(".modal-overlay")
      .addEventListener("click", () => {
        this.helpModal.classList.add("hidden");
      });

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => this.handleKeyDown(e));

    // Demo key hover effects
    document.querySelectorAll(".demo-key").forEach((key) => {
      key.addEventListener("click", () => this.showFolderAccessModal());
    });
  }

  loadSettings() {
    const saved = localStorage.getItem("photoBroSettings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.settings = { ...this.settings, ...parsed };

        // Ensure folderBindings exists
        if (!this.settings.folderBindings) {
          this.settings.folderBindings = [
            { key: "1", folderName: "favorites" },
            { key: "2", folderName: "family" },
            { key: "3", folderName: "work" },
          ];
        }
      } catch (e) {
        console.error("Failed to load settings:", e);
      }
    }

    // Update UI from settings
    if (this.autoPlayToggle)
      this.autoPlayToggle.checked = this.settings.autoPlayVideo;
    if (this.autoRenameToggle)
      this.autoRenameToggle.checked = this.settings.autoRename;

    // Mode UI
    this.updateUIForMode();

    this.renderFolderBindings();
  }

  saveSettingsToStorage() {
    localStorage.setItem("photoBroSettings", JSON.stringify(this.settings));
  }

  // ===== Folder Binding UI Logic =====
  renderFolderBindings() {
    if (!this.folderBindingsContainer) return;

    this.folderBindingsContainer.innerHTML = "";

    this.settings.folderBindings.forEach((binding, index) => {
      const row = document.createElement("div");
      row.className = "folder-binding-row";

      // Key Button
      const keyBtn = document.createElement("button");
      keyBtn.className = "binding-key-btn";
      keyBtn.textContent = binding.key;
      keyBtn.title = "Change Key";
      keyBtn.onclick = () => this.startFolderKeyBinding(index);

      // Folder Name Input
      const nameInput = document.createElement("input");
      nameInput.type = "text";
      nameInput.className = "binding-name-input";
      nameInput.value = binding.folderName;
      nameInput.placeholder = "Folder Name";
      nameInput.onchange = (e) =>
        this.updateFolderBindingName(index, e.target.value);

      // Remove Button
      const removeBtn = document.createElement("button");
      removeBtn.className = "binding-remove-btn";
      removeBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>`;
      removeBtn.onclick = () => this.removeFolderBinding(index);

      row.appendChild(keyBtn);
      row.appendChild(nameInput);
      row.appendChild(removeBtn);

      this.folderBindingsContainer.appendChild(row);
    });

    // Update the shortcuts bar in sorting modal too
    this.updateFolderShortcuts();
  }

  addFolderBinding() {
    if (this.settings.folderBindings.length >= 10) {
      this.showToast("Maximum of 10 folder bindings allowed", "warning");
      return;
    }

    this.settings.folderBindings.push({
      key: "?",
      folderName: "",
    });
    this.saveSettingsToStorage();
    this.renderFolderBindings();
  }

  removeFolderBinding(index) {
    this.settings.folderBindings.splice(index, 1);
    this.saveSettingsToStorage();
    this.renderFolderBindings();
  }

  updateFolderBindingName(index, name) {
    this.settings.folderBindings[index].folderName = name.trim();
    this.saveSettingsToStorage();
    this.updateFolderShortcuts();
  }

  startFolderKeyBinding(index) {
    this.activeBindingIndex = index;
    this.startKeyBinding("folderBinding");
  }

  updateFolderShortcuts() {
    if (!this.folderShortcuts) return;

    this.folderShortcuts.innerHTML = "";

    this.settings.folderBindings.forEach((binding) => {
      if (!binding.folderName) return; // Skip empty names

      const item = document.createElement("div");
      item.className = "shortcut-item";

      const nameSpan = document.createElement("span");
      nameSpan.textContent = binding.folderName;

      const keyKbd = document.createElement("kbd");
      keyKbd.textContent = binding.key;

      item.appendChild(nameSpan);
      item.appendChild(keyKbd);

      this.folderShortcuts.appendChild(item);
    });
  }

  // updateKeyDisplays removed as legacy elements are gone

  formatKeyName(code) {
    const keyMap = {
      ArrowLeft: "← Arrow Left",
      ArrowRight: "→ Arrow Right",
      ArrowUp: "↑ Arrow Up",
      ArrowDown: "↓ Arrow Down",
      Space: "Space",
      Enter: "Enter",
      Backspace: "Backspace",
      Delete: "Delete",
      Escape: "Escape",
      Tab: "Tab",
    };

    if (keyMap[code]) return keyMap[code];
    if (code.startsWith("Key")) return code.slice(3);
    if (code.startsWith("Digit")) return code.slice(5);
    if (code.startsWith("Numpad")) return "Numpad " + code.slice(6);
    return code;
  }

  // ===== Folder Access Modal =====
  showFolderAccessModal() {
    this.folderAccessModal.classList.remove("hidden");
  }

  closeFolderAccessModal() {
    this.folderAccessModal.classList.add("hidden");
  }

  // ===== Folder Selection =====
  async selectFolder() {
    try {
      if (!("showDirectoryPicker" in window)) {
        this.closeFolderAccessModal();
        this.showToast(
          "Your browser does not support folder selection. Please use Chrome or Edge.",
          "error",
        );
        return;
      }

      // Close the pre-dialog before the native browser dialog opens
      this.closeFolderAccessModal();

      this.directoryHandle = await window.showDirectoryPicker();
      await this.loadFiles();

      if (this.files.length === 0) {
        this.showToast(
          "No supported media files found in this folder.",
          "warning",
        );
        return;
      }

      await this.createOutputFolders();
      this.openSorting();
      this.loadCurrentFile();

      this.showToast(`Found ${this.files.length} media files`, "success");
    } catch (e) {
      if (e.name !== "AbortError") {
        console.error("Folder selection failed:", e);
        this.showToast("Failed to access folder. Please try again.", "error");
      }
    }
  }

  async loadFiles() {
    this.files = [];

    for await (const entry of this.directoryHandle.values()) {
      if (entry.kind === "file") {
        const ext = entry.name.split(".").pop().toLowerCase();
        if (
          this.imageExtensions.includes(ext) ||
          this.videoExtensions.includes(ext)
        ) {
          this.files.push({
            name: entry.name,
            handle: entry,
            type: this.imageExtensions.includes(ext) ? "image" : "video",
          });
        }
      }
    }

    // Sort alphabetically
    this.files.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true }),
    );
  }

  async createOutputFolders() {
    try {
      this.keepFolderHandle = await this.directoryHandle.getDirectoryHandle(
        this.settings.keepFolderName,
        { create: true },
      );
      this.deleteFolderHandle = await this.directoryHandle.getDirectoryHandle(
        this.settings.deleteFolderName,
        { create: true },
      );
    } catch (e) {
      console.error("Failed to create output folders:", e);
      this.showToast("Failed to create output folders.", "error");
    }
  }

  // ===== Modal Management =====
  openSorting() {
    this.sortingModal.classList.remove("hidden");
  }

  closeSorting() {
    if (confirm("Are you sure you want to exit? Your progress will be lost.")) {
      this.resetState();
      this.sortingModal.classList.add("hidden");
    }
  }

  openSettings() {
    if (this.autoPlayToggle)
      this.autoPlayToggle.checked = this.settings.autoPlayVideo;
    if (this.autoRenameToggle)
      this.autoRenameToggle.checked = this.settings.autoRename;

    // Re-render bindings to ensure fresh state
    this.renderFolderBindings();

    // Set Sorting Mode Radio state
    if (this.modeRadios) {
      this.modeRadios.forEach((radio) => {
        radio.checked =
          radio.value === (this.settings.sortingMode || "numeric");
      });
    }

    this.settingsModal.classList.remove("hidden");
  }

  closeSettings() {
    this.settingsModal.classList.add("hidden");
  }

  saveSettings() {
    // Legacy support for keep/delete folders if we want to keep them in settings object but not UI
    // this.settings.keepFolderName = "keep";
    // this.settings.deleteFolderName = "delete";

    if (this.autoPlayToggle)
      this.settings.autoPlayVideo = this.autoPlayToggle.checked;
    if (this.autoRenameToggle)
      this.settings.autoRename = this.autoRenameToggle.checked;
    // confirmDeleteToggle removed from UI (this.settings.confirmDelete = false;)

    this.saveSettingsToStorage();
    this.closeSettings();
    this.showToast("Settings saved successfully", "success");
  }

  // ===== File Loading & Preview =====
  async loadCurrentFile() {
    if (this.currentIndex >= this.files.length) {
      this.showCompletion();
      return;
    }

    const file = this.files[this.currentIndex];
    this.showLoading(true);
    this.updateProgress();

    try {
      const fileHandle = file.handle;
      const fileData = await fileHandle.getFile();
      const url = URL.createObjectURL(fileData);

      // Update file info
      this.fileName.textContent = file.name;
      this.fileCounter.textContent = `${this.currentIndex + 1} / ${this.files.length}`;

      // Show appropriate preview
      if (file.type === "image") {
        this.previewVideo.classList.add("hidden");
        this.previewVideo.pause();
        this.previewVideo.src = "";

        this.previewImage.onload = () => {
          this.showLoading(false);
          this.previewImage.classList.remove("hidden");
        };
        this.previewImage.src = url;
      } else {
        this.previewImage.classList.add("hidden");
        this.previewImage.src = "";

        this.previewVideo.onloadeddata = () => {
          this.showLoading(false);
          this.previewVideo.classList.remove("hidden");
        };
        this.previewVideo.src = url;

        if (this.settings.autoPlayVideo) {
          this.previewVideo.play().catch(() => {});
        }
      }
    } catch (e) {
      console.error("Failed to load file:", e);
      this.showLoading(false);
      this.showToast(`Failed to load ${file.name}`, "error");
      this.currentIndex++;
      this.loadCurrentFile();
    }
  }

  showLoading(show) {
    if (show) {
      this.loadingState.classList.remove("hidden");
      this.previewImage.classList.add("hidden");
      this.previewVideo.classList.add("hidden");
    } else {
      this.loadingState.classList.add("hidden");
    }
  }

  updateProgress() {
    const progress =
      this.files.length > 0 ? (this.currentIndex / this.files.length) * 100 : 0;

    // Update linear progress bar
    this.progressBarFill.style.width = `${progress}%`;
    this.progressPercent.textContent = `${Math.round(progress)}%`;
  }

  // ===== File Actions =====
  async deleteFile() {
    if (this.currentIndex >= this.files.length) return;

    const file = this.files[this.currentIndex];

    if (this.settings.confirmDelete) {
      if (!confirm(`Move "${file.name}" to delete folder?`)) return;
    }

    try {
      await this.moveFile(file.handle, this.deleteFolderHandle);

      this.history.push({
        action: "delete",
        file: file,
        index: this.currentIndex,
      });

      this.deletedFiles.push(file);
      this.undoBtn.disabled = false;
      this.deletedFiles.push(file);
      this.undoBtn.disabled = false;
      if (this.deleteBtn) this.animateButton(this.deleteBtn);

      this.currentIndex++;
      this.loadCurrentFile();
    } catch (e) {
      console.error("Failed to delete file:", e);
      this.showToast("Failed to move file to delete folder.", "error");
    }
  }

  async keepFile() {
    if (this.currentIndex >= this.files.length) return;

    const file = this.files[this.currentIndex];

    try {
      await this.moveFile(file.handle, this.keepFolderHandle);

      this.history.push({
        action: "keep",
        file: file,
        index: this.currentIndex,
      });

      this.keptFiles.push(file);
      this.undoBtn.disabled = false;
      this.keptFiles.push(file);
      this.undoBtn.disabled = false;
      if (this.keepBtn) this.animateButton(this.keepBtn);

      this.currentIndex++;
      this.loadCurrentFile();
    } catch (e) {
      console.error("Failed to keep file:", e);
      this.showToast("Failed to move file to keep folder.", "error");
    }
  }

  skipFile() {
    if (this.currentIndex >= this.files.length) return;

    const file = this.files[this.currentIndex];

    this.history.push({
      action: "skip",
      file: file,
      index: this.currentIndex,
    });

    this.skippedFiles.push(file);
    this.undoBtn.disabled = false;

    this.currentIndex++;
    this.loadCurrentFile();
  }

  async moveFile(fileHandle, targetFolder, targetName = null) {
    const file = await fileHandle.getFile();
    const fileName = targetName || file.name;

    // Create new file in target folder
    const newFileHandle = await targetFolder.getFileHandle(fileName, {
      create: true,
    });
    const writable = await newFileHandle.createWritable();
    await writable.write(file);
    await writable.close();

    // Delete original
    await this.directoryHandle.removeEntry(file.name);

    return newFileHandle;
  }

  async undo() {
    if (this.history.length === 0) return;

    const lastAction = this.history.pop();
    const file = lastAction.file;

    try {
      if (lastAction.action === "skip") {
        // Just go back for skips
        this.skippedFiles.pop();
      } else {
        let sourceFolder;

        if (lastAction.action === "delete") {
          sourceFolder = this.deleteFolderHandle;
        } else if (lastAction.action === "keep") {
          sourceFolder = this.keepFolderHandle;
        } else if (lastAction.action === "folder") {
          sourceFolder = lastAction.folderHandle;
        }

        // Handle renamed files in undo
        const fileName = lastAction.renamedTo || file.name;

        // Move file back
        const fileData = await (
          await sourceFolder.getFileHandle(fileName)
        ).getFile();
        const newFileHandle = await this.directoryHandle.getFileHandle(
          file.name,
          { create: true },
        );
        const writable = await newFileHandle.createWritable();
        await writable.write(fileData);
        await writable.close();

        // Delete from source folder
        await sourceFolder.removeEntry(fileName);

        // Update handle reference
        file.handle = newFileHandle;

        // Remove from appropriate list
        if (lastAction.action === "delete") {
          this.deletedFiles.pop();
        } else if (lastAction.action === "keep") {
          this.keptFiles.pop();
        } else if (lastAction.action === "folder") {
          // Provide visual feedback for undoing folder sort?
          // Currently no specific list for custom folders to pop from
          // but we might want to track stats per folder later.
          this.updateFolderStats(lastAction.folderName, -1);
        }
      }

      this.currentIndex = lastAction.index;
      this.loadCurrentFile();
      this.showToast("Undo successful", "success");
    } catch (e) {
      console.error("Undo failed:", e);
      this.showToast("Failed to undo. File may have been modified.", "error");
    }

    this.undoBtn.disabled = this.history.length === 0;
  }

  animateButton(button) {
    button.style.transform = "scale(0.95)";
    setTimeout(() => {
      button.style.transform = "";
    }, 100);
  }

  // ===== Completion =====
  // ===== Completion =====
  showCompletion() {
    this.sortingModal.classList.add("hidden");
    this.completionModal.classList.remove("hidden");

    // Populate stats container
    if (this.statsContainer) {
      this.statsContainer.innerHTML = "";

      const createStatItem = (label, count, icon) => {
        const item = document.createElement("div");
        item.className = "stat-item";
        item.innerHTML = `
                <div class="stat-icon">${icon}</div>
                <div class="stat-info">
                    <span class="stat-value">${count}</span>
                    <span class="stat-label">${label}</span>
                </div>
            `;
        return item;
      };

      // Standard stats
      this.statsContainer.appendChild(
        createStatItem("Kept", this.keptFiles.length, "✓"),
      );
      this.statsContainer.appendChild(
        createStatItem("Deleted", this.deletedFiles.length, "🗑️"),
      );
      this.statsContainer.appendChild(
        createStatItem("Skipped", this.skippedFiles.length, "↷"),
      );

      // Custom folder stats
      if (this.folderStats) {
        Object.entries(this.folderStats).forEach(([name, count]) => {
          if (count > 0) {
            this.statsContainer.appendChild(createStatItem(name, count, "📁"));
          }
        });
      }
    }

    this.createConfetti();
  }

  createConfetti() {
    const colors = ["#6366f1", "#a855f7", "#ec4899", "#10b981", "#f59e0b"];
    const container = this.confettiContainer;
    container.innerHTML = "";

    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement("div");
      confetti.className = "confetti";
      confetti.style.left = Math.random() * 100 + "%";
      confetti.style.background =
        colors[Math.floor(Math.random() * colors.length)];
      confetti.style.width = Math.random() * 10 + 5 + "px";
      confetti.style.height = confetti.style.width;
      confetti.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
      confetti.style.animation = `confettiFall ${Math.random() * 2 + 1}s ease-out ${Math.random() * 0.5}s forwards`;
      container.appendChild(confetti);
    }
  }

  startNewSession() {
    this.resetState();
    this.completionModal.classList.add("hidden");
    // Landing page is already visible behind modals
  }

  resetState() {
    this.files = [];
    this.currentIndex = 0;
    this.history = [];
    this.keptFiles = [];
    this.deletedFiles = [];
    this.skippedFiles = [];
    this.directoryHandle = null;
    this.keepFolderHandle = null;
    this.deleteFolderHandle = null;
    this.undoBtn.disabled = true;
    this.folderStats = {};

    this.previewImage.src = "";
    this.previewVideo.src = "";
    this.previewVideo.pause();
  }

  // ===== Key Bindings =====
  startKeyBinding(keyType) {
    this.waitingForKey = keyType;
    this.newKeyCode = null;
    this.pressedKeyDisplay.textContent = "-";
    this.confirmKeyBindBtn.disabled = true;
    this.keyBindingModal.classList.remove("hidden");
  }

  cancelKeyBinding() {
    this.waitingForKey = null;
    this.newKeyCode = null;
    this.keyBindingModal.classList.add("hidden");
  }

  confirmKeyBinding() {
    if (!this.waitingForKey || !this.newKeyCode) return;

    const otherKeys = Object.entries(this.settings)
      .filter(([key]) => key.endsWith("Key") && key !== this.waitingForKey)
      .map(([, value]) => value);

    // Check against folder bindings too
    const folderKeys = this.settings.folderBindings.map((b) => b.key); // These are formatted, not codes.
    // Wait, folder keys are stored as "1", "2". e.code is "Digit1". Use formatted comparison.
    const newKeyFormatted = this.formatKeyName(this.newKeyCode);

    if (
      otherKeys.includes(this.newKeyCode) ||
      (this.waitingForKey !== "folderBinding" &&
        folderKeys.includes(newKeyFormatted))
    ) {
      // logic: if setting a main key, check if it conflicts with other main keys OR any folder key.
      // Note: checking folderKeys vs newKeyFormatted (e.g. "1")
      this.showToast("This key is already assigned.", "error");
      return;
    }

    if (this.waitingForKey === "folderBinding") {
      // Check if assigned to another folder (excluding self)
      const isAssigned = this.settings.folderBindings.some(
        (b, i) => i !== this.activeBindingIndex && b.key === newKeyFormatted,
      );
      if (isAssigned) {
        this.showToast(
          "This key is already assigned to another folder.",
          "error",
        );
        return;
      }

      if (otherKeys.includes(this.newKeyCode)) {
        this.showToast("This key is assigned to a main action.", "error");
        return;
      }

      this.settings.folderBindings[this.activeBindingIndex].key =
        newKeyFormatted;
      this.renderFolderBindings();
    } else {
      this.settings[this.waitingForKey] = this.newKeyCode;
      // this.updateKeyDisplays(); // Legacy UI removed
    }

    this.saveSettingsToStorage();
    this.cancelKeyBinding();
    this.showToast("Key binding updated", "success");
  }

  // ===== Keyboard Handler =====
  async handleKeyDown(e) {
    // Key binding capture
    if (
      this.waitingForKey &&
      !this.keyBindingModal.classList.contains("hidden")
    ) {
      e.preventDefault();
      this.newKeyCode = e.code;
      this.pressedKeyDisplay.textContent = this.formatKeyName(e.code);
      this.confirmKeyBindBtn.disabled = false;
      return;
    }

    // Don't handle if modals are open (except sorting)
    if (!this.settingsModal.classList.contains("hidden")) return;
    if (!this.keyBindingModal.classList.contains("hidden")) return;
    if (!this.completionModal.classList.contains("hidden")) return;
    if (!this.folderAccessModal.classList.contains("hidden")) return;

    // Only handle on sorting screen
    if (this.sortingModal.classList.contains("hidden")) return;

    // Always allow skip
    if (e.code === this.settings.skipKey) {
      e.preventDefault();
      this.skipFile();
      return;
    }

    // Always allow undo
    if (e.code === this.settings.undoKey && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      this.undo();
      return;
    }

    if (this.settings.sortingMode === "arrows") {
      if (e.code === this.settings.deleteKey) {
        e.preventDefault();
        this.deleteFile();
      } else if (e.code === this.settings.keepKey) {
        e.preventDefault();
        this.keepFile();
      }
    } else {
      // Numeric
      const keyName = this.formatKeyName(e.code);
      const bindingIndex = this.settings.folderBindings.findIndex(
        (b) => b.key === keyName,
      );
      if (bindingIndex !== -1) {
        e.preventDefault();
        this.processFolderBinding(bindingIndex);
      }
    }
  }

  // New method for UI updates
  updateUIForMode() {
    // Toggle visibility of Folder Bar vs Keep/Delete Actions
    const numericElements = document.querySelectorAll(".mode-numeric-only");
    const arrowElements = document.querySelectorAll(".mode-arrows-only");

    if (this.settings.sortingMode === "numeric") {
      numericElements.forEach((el) => el.classList.remove("hidden"));
      arrowElements.forEach((el) => el.classList.add("hidden"));
    } else {
      numericElements.forEach((el) => el.classList.add("hidden"));
      arrowElements.forEach((el) => el.classList.remove("hidden"));
    }
  }

  async processFolderBinding(index) {
    const binding = this.settings.folderBindings[index];
    if (!binding || !binding.folderName) {
      this.showToast("No folder name set for this key", "warning");
      return;
    }

    try {
      // Get/Create folder handle
      const folderHandle = await this.directoryHandle.getDirectoryHandle(
        binding.folderName,
        { create: true },
      );

      const file = this.files[this.currentIndex];
      let targetName = null;

      if (this.settings.autoRename) {
        const ext = file.name.split(".").pop();
        const baseName = file.name.slice(0, -(ext.length + 1));
        targetName = `${baseName}_${binding.folderName}.${ext}`;
      }

      const newHandle = await this.moveFile(
        file.handle,
        folderHandle,
        targetName,
      );

      // Add to history
      this.history.push({
        file: file,
        action: "folder",
        folderHandle: folderHandle,
        folderName: binding.folderName,
        renamedTo: targetName,
        index: this.currentIndex,
      });

      // Update stats
      this.updateFolderStats(binding.folderName, 1);

      // Update UI temporarily to show action
      this.animateFolderAction(index);

      this.currentIndex++;
      this.loadCurrentFile();
    } catch (e) {
      console.error("Folder sort failed:", e);
      this.showToast("Failed to move file to folder", "error");
    }
  }

  updateFolderStats(folderName, change) {
    // We can maintain a map of stats if we want to show them in completion
    if (!this.folderStats) this.folderStats = {};
    if (!this.folderStats[folderName]) this.folderStats[folderName] = 0;
    this.folderStats[folderName] += change;
  }

  animateFolderAction(index) {
    // Find the corresponding shortcut item key
    // This is a bit loose coupling, assuming order matches.
    if (this.folderShortcuts && this.folderShortcuts.children[index]) {
      const item = this.folderShortcuts.children[index];
      item.classList.add("active-action");
      setTimeout(() => item.classList.remove("active-action"), 200);
    }
  }

  // ===== Toast Notifications =====
  showToast(message, type = "info") {
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

    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(100%)";
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  window.photoBro = new PhotoBro();
});
