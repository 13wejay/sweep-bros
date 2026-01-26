/**
 * SweepBros - Smart Media Sorter
 * Premium browser-based photo/video sorting application
 */

class SweepBros {
  constructor() {
    // State
    this.files = [];
    this.currentIndex = 0;
    this.currentDisplayIndex = 0; // Tracks which file is being displayed (respects filters)
    this.history = [];
    this.keptFiles = [];
    this.deletedFiles = [];
    this.skippedFiles = [];
    this.directoryHandle = null;
    this.keepFolderHandle = null;
    this.deleteFolderHandle = null;
    this.batchMode = false;
    this.selectedFiles = new Set();
    this.currentZoom = 1;
    this.isPanning = false;
    this.panStart = { x: 0, y: 0 };
    this.panOffset = { x: 0, y: 0 };
    this.showImages = true;
    this.showVideos = true;
    this.fileHashes = new Map();
    this.theme = 'dark';
    this.autoSaveInterval = null;
    this.folderStats = {};

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
    this.batchModeBtn = document.getElementById("batchModeBtn");
    this.fileName = document.getElementById("fileName");
    this.fileCounter = document.getElementById("fileCounter");
    this.progressBarFill = document.getElementById("progressBarFill");
    this.progressPercent = document.getElementById("progressPercent");
    this.loadingState = document.getElementById("loadingState");
    this.previewImage = document.getElementById("previewImage");
    this.previewVideo = document.getElementById("previewVideo");
    this.singlePreviewContainer = document.getElementById("singlePreviewContainer");
    this.zoomContainer = document.getElementById("zoomContainer");
    this.zoomControls = document.getElementById("zoomControls");
    this.zoomInBtn = document.getElementById("zoomInBtn");
    this.zoomOutBtn = document.getElementById("zoomOutBtn");
    this.zoomResetBtn = document.getElementById("zoomResetBtn");
    this.zoomLevel = document.getElementById("zoomLevel");

    // File type filters
    this.filterImages = document.getElementById("filterImages");
    this.filterVideos = document.getElementById("filterVideos");
    this.filterAll = document.getElementById("filterAll");
    this.imageCount = document.getElementById("imageCount");
    this.videoCount = document.getElementById("videoCount");

    // Metadata panel
    this.metadataPanel = document.getElementById("metadataPanel");
    this.showMetadataBtn = document.getElementById("showMetadataBtn");
    this.closeMetadata = document.getElementById("closeMetadata");
    this.metaResolution = document.getElementById("metaResolution");
    this.metaFileSize = document.getElementById("metaFileSize");
    this.metaDate = document.getElementById("metaDate");
    this.metaCamera = document.getElementById("metaCamera");
    this.metaType = document.getElementById("metaType");

    // Video controls
    this.videoControlsPanel = document.getElementById("videoControlsPanel");
    this.videoLoopToggle = document.getElementById("videoLoopToggle");

    // Smart suggestions
    this.suggestionsPanel = document.getElementById("suggestionsPanel");
    this.suggestionsList = document.getElementById("suggestionsList");

    // Duplicate detection
    this.duplicateWarning = document.getElementById("duplicateWarning");
    this.duplicateMessage = document.getElementById("duplicateMessage");

    // Theme toggle
    this.themeToggle = document.getElementById("themeToggle");
    this.themeIconDark = document.getElementById("themeIconDark");
    this.themeIconLight = document.getElementById("themeIconLight");

    // Drag and drop
    this.heroContent = document.getElementById("heroContent");
    this.dropZoneOverlay = document.getElementById("dropZoneOverlay");

    // Batch mode elements
    this.batchGridContainer = document.getElementById("batchGridContainer");
    this.batchGrid = document.getElementById("batchGrid");
    this.selectedCount = document.getElementById("selectedCount");
    this.selectAllBtn = document.getElementById("selectAllBtn");
    this.deselectAllBtn = document.getElementById("deselectAllBtn");
    this.batchFolderList = document.getElementById("batchFolderList");

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
    if (this.themeToggle)
      this.themeToggle.addEventListener("click", () => this.toggleTheme());
    this.navSettingsBtn.addEventListener("click", () => this.openSettings());

    // Drag and drop for folder selection
    this.setupDragAndDrop();

    // Folder access modal
    this.cancelAccessBtn.addEventListener("click", () =>
      this.closeFolderAccessModal(),
    );
    this.batchModeBtn.addEventListener("click", () => this.toggleBatchMode());
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

    // Batch mode
    if (this.selectAllBtn)
      this.selectAllBtn.addEventListener("click", () => this.selectAll());
    if (this.deselectAllBtn)
      this.deselectAllBtn.addEventListener("click", () => this.deselectAll());

    // Zoom controls
    if (this.zoomInBtn)
      this.zoomInBtn.addEventListener("click", () => this.zoomIn());
    if (this.zoomOutBtn)
      this.zoomOutBtn.addEventListener("click", () => this.zoomOut());
    if (this.zoomResetBtn)
      this.zoomResetBtn.addEventListener("click", () => this.resetZoom());
    
    // Zoom container interactions
    if (this.zoomContainer) {
      this.zoomContainer.addEventListener("wheel", (e) => this.handleZoomWheel(e));
      this.zoomContainer.addEventListener("mousedown", (e) => this.startPan(e));
      this.zoomContainer.addEventListener("mousemove", (e) => this.handlePan(e));
      this.zoomContainer.addEventListener("mouseup", () => this.endPan());
      this.zoomContainer.addEventListener("mouseleave", () => this.endPan());
    }

    // File type filters
    if (this.filterImages)
      this.filterImages.addEventListener("click", () => this.toggleImageFilter());
    if (this.filterVideos)
      this.filterVideos.addEventListener("click", () => this.toggleVideoFilter());
    if (this.filterAll)
      this.filterAll.addEventListener("click", () => this.showAllFilters());

    // Metadata
    if (this.showMetadataBtn)
      this.showMetadataBtn.addEventListener("click", () => this.toggleMetadata());
    if (this.closeMetadata)
      this.closeMetadata.addEventListener("click", () => this.hideMetadata());

    // Video controls
    if (this.videoLoopToggle) {
      this.videoLoopToggle.addEventListener("change", (e) => {
        if (this.previewVideo) {
          this.previewVideo.loop = e.target.checked;
        }
      });
    }

    // Speed buttons
    document.querySelectorAll('.speed-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const speed = parseFloat(e.target.dataset.speed);
        this.setVideoSpeed(speed);
        document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
      });
    });

    // Video progress bar thumbnail preview
    if (this.previewVideo) {
      this.setupVideoThumbnailPreview();
    }

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
    const saved = localStorage.getItem("sweepBrosSettings");
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

    // Load theme
    const savedTheme = localStorage.getItem("sweepBrosTheme") || 'dark';
    this.setTheme(savedTheme, false);

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
    localStorage.setItem("sweepBrosSettings", JSON.stringify(this.settings));
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
      
      // Offer to resume if there's saved progress
      await this.offerResumeSession();
      
      this.openSorting();
      this.loadCurrentFile();

      this.showToast(`Found ${this.files.length} media files`, "success");

      // Start auto-save
      this.startAutoSave();
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
    this.updateFilterCounts();
  }

  closeSorting() {
    if (confirm("Are you sure you want to exit? Your progress will be lost.")) {
      this.resetState();
      this.sortingModal.classList.add("hidden");
      this.stopAutoSave();
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

    // Find next file that matches active filters (starting from currentIndex)
    this.currentDisplayIndex = this.currentIndex;
    while (this.currentDisplayIndex < this.files.length) {
      const file = this.files[this.currentDisplayIndex];
      const isValid = (file.type === 'image' && this.showImages) ||
                     (file.type === 'video' && this.showVideos);
      if (isValid) break;
      this.currentDisplayIndex++;
    }

    if (this.currentDisplayIndex >= this.files.length) {
      this.showCompletion();
      return;
    }

    const file = this.files[this.currentDisplayIndex];
    this.showLoading(true);
    this.updateProgress();

    try {
      const fileHandle = file.handle;
      const fileData = await fileHandle.getFile();
      const url = URL.createObjectURL(fileData);

      // Update file info
      this.fileName.textContent = file.name;
      this.fileCounter.textContent = `${this.currentDisplayIndex + 1} / ${this.files.length}`;

      // Show appropriate preview
      if (file.type === "image") {
        this.previewVideo.classList.add("hidden");
        this.previewVideo.pause();
        this.previewVideo.src = "";
        this.zoomControls.classList.remove("hidden");
        this.videoControlsPanel.classList.add("hidden");
        this.resetZoom();

        this.previewImage.onload = () => {
          this.showLoading(false);
          this.previewImage.classList.remove("hidden");
        };
        this.previewImage.src = url;
      } else {
        this.previewImage.classList.add("hidden");
        this.previewImage.src = "";
        this.zoomControls.classList.add("hidden");
        this.videoControlsPanel.classList.remove("hidden");

        this.previewVideo.onloadeddata = () => {
          this.showLoading(false);
          this.previewVideo.classList.remove("hidden");
        };
        this.previewVideo.src = url;

        if (this.settings.autoPlayVideo) {
          this.previewVideo.play().catch(() => {});
        }
      }

      // Show smart suggestions
      this.showSuggestions();

      // Check for duplicates
      this.checkForDuplicates();
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
    
    // Update filter counts
    this.updateFilterCounts();
  }

  // ===== File Actions =====
  async deleteFile() {
    if (this.currentIndex >= this.files.length) return;

    const file = this.files[this.currentDisplayIndex];

    if (this.settings.confirmDelete) {
      if (!confirm(`Move "${file.name}" to delete folder?`)) return;
    }

    try {
      await this.moveFile(file.handle, this.deleteFolderHandle);

      this.history.push({
        action: "delete",
        file: file,
        index: this.currentDisplayIndex,
      });

      this.deletedFiles.push(file);
      this.undoBtn.disabled = false;
      if (this.deleteBtn) this.animateButton(this.deleteBtn);

      // Advance to next unprocessed file
      this.currentIndex = this.currentDisplayIndex + 1;
      this.loadCurrentFile();
    } catch (e) {
      console.error("Failed to delete file:", e);
      this.showToast("Failed to move file to delete folder.", "error");
    }
  }

  async keepFile() {
    if (this.currentIndex >= this.files.length) return;

    const file = this.files[this.currentDisplayIndex];

    try {
      await this.moveFile(file.handle, this.keepFolderHandle);

      this.history.push({
        action: "keep",
        file: file,
        index: this.currentDisplayIndex,
      });

      this.keptFiles.push(file);
      this.undoBtn.disabled = false;
      if (this.keepBtn) this.animateButton(this.keepBtn);

      // Advance to next unprocessed file
      this.currentIndex = this.currentDisplayIndex + 1;
      this.loadCurrentFile();
    } catch (e) {
      console.error("Failed to keep file:", e);
      this.showToast("Failed to move file to keep folder.", "error");
    }
  }

  skipFile() {
    if (this.currentIndex >= this.files.length) return;

    const file = this.files[this.currentDisplayIndex];

    this.history.push({
      action: "skip",
      file: file,
      index: this.currentDisplayIndex,
    });

    this.skippedFiles.push(file);
    this.undoBtn.disabled = false;

    // Advance to next unprocessed file
    this.currentIndex = this.currentDisplayIndex + 1;
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
      
      // Refresh appropriate view
      if (this.batchMode) {
        await this.renderBatchGrid();
      } else {
        this.loadCurrentFile();
      }
      
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
    
    // Stop auto-save and clear progress
    this.stopAutoSave();
    localStorage.removeItem('sweepBrosProgress');

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
    this.batchMode = false;
    this.selectedFiles.clear();

    this.previewImage.src = "";
    this.previewVideo.src = "";
    this.previewVideo.pause();
  }

  // ===== Batch Mode Operations =====
  toggleBatchMode() {
    this.batchMode = !this.batchMode;
    
    if (this.batchMode) {
      this.enterBatchMode();
    } else {
      this.exitBatchMode();
    }
  }

  async enterBatchMode() {
    this.singlePreviewContainer.classList.add('hidden');
    this.batchGridContainer.classList.remove('hidden');
    this.batchModeBtn.classList.add('active');
    
    await this.renderBatchGrid();
    this.renderBatchFolders();
  }

  exitBatchMode() {
    this.singlePreviewContainer.classList.remove('hidden');
    this.batchGridContainer.classList.add('hidden');
    this.batchModeBtn.classList.remove('active');
    this.selectedFiles.clear();
    
    // Cleanup observer
    if (this.batchObserver) {
      this.batchObserver.disconnect();
      this.batchObserver = null;
    }
    
    // Cleanup object URLs to free memory
    document.querySelectorAll('.batch-grid-item').forEach(item => {
      const url = item.dataset.objectUrl;
      if (url) {
        URL.revokeObjectURL(url);
        delete item.dataset.objectUrl;
      }
    });
  }

  async renderBatchGrid() {
    this.batchGrid.innerHTML = '';
    
    // Get remaining files (not yet sorted) and filter by active file types
    const remainingFiles = this.files.slice(this.currentIndex).filter(file => {
      return (file.type === 'image' && this.showImages) ||
             (file.type === 'video' && this.showVideos);
    });
    
    // Create intersection observer for lazy loading
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const gridItem = entry.target;
          const fileName = gridItem.dataset.fileName;
          const file = remainingFiles.find(f => f.name === fileName);
          
          if (file && !gridItem.dataset.loaded) {
            gridItem.dataset.loaded = 'true';
            const preview = gridItem.querySelector('.batch-item-preview');
            const skeleton = gridItem.querySelector('.batch-item-skeleton');
            this.loadBatchThumbnail(file, preview, skeleton, gridItem);
            observer.unobserve(gridItem);
          }
        }
      });
    }, {
      root: this.batchGrid,
      rootMargin: '200px',
      threshold: 0.01
    });
    
    // Create grid items with placeholders
    for (const file of remainingFiles) {
      const gridItem = document.createElement('div');
      gridItem.className = 'batch-grid-item';
      gridItem.dataset.fileName = file.name;
      
      // Add skeleton loader
      const skeleton = document.createElement('div');
      skeleton.className = 'batch-item-skeleton';
      gridItem.appendChild(skeleton);
      
      // Checkbox
      const checkbox = document.createElement('div');
      checkbox.className = 'batch-checkbox';
      checkbox.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>';
      gridItem.appendChild(checkbox);
      
      // Preview container (empty initially)
      const preview = document.createElement('div');
      preview.className = 'batch-item-preview';
      gridItem.appendChild(preview);
      
      // Filename
      const filename = document.createElement('div');
      filename.className = 'batch-item-name';
      filename.textContent = file.name;
      filename.title = file.name;
      gridItem.appendChild(filename);
      
      gridItem.addEventListener('click', () => this.toggleFileSelection(file.name, gridItem));
      
      this.batchGrid.appendChild(gridItem);
      
      // Observe for lazy loading
      observer.observe(gridItem);
    }
    
    // Store observer for cleanup
    this.batchObserver = observer;
  }

  async loadBatchThumbnail(file, previewContainer, skeleton, gridItem) {
    try {
      const fileHandle = file.handle;
      const fileData = await fileHandle.getFile();
      const url = URL.createObjectURL(fileData);
      
      if (file.type === 'image') {
        const img = document.createElement('img');
        img.loading = 'lazy';
        img.onload = () => {
          if (skeleton && skeleton.parentNode) {
            skeleton.remove();
          }
          previewContainer.appendChild(img);
        };
        img.onerror = () => {
          if (skeleton && skeleton.parentNode) {
            skeleton.remove();
          }
          previewContainer.innerHTML = '<div class="batch-error">⚠️</div>';
        };
        img.src = url;
      } else {
        const video = document.createElement('video');
        video.onloadeddata = () => {
          if (skeleton && skeleton.parentNode) {
            skeleton.remove();
          }
          previewContainer.appendChild(video);
        };
        video.onerror = () => {
          if (skeleton && skeleton.parentNode) {
            skeleton.remove();
          }
          previewContainer.innerHTML = '<div class="batch-error">⚠️</div>';
        };
        video.src = url;
        video.preload = 'metadata';
      }
      
      // Store URL for cleanup
      if (!gridItem.dataset.objectUrl) {
        gridItem.dataset.objectUrl = url;
      }
    } catch (e) {
      if (skeleton && skeleton.parentNode) {
        skeleton.remove();
      }
      previewContainer.innerHTML = '<div class="batch-error">⚠️</div>';
    }
  }

  toggleFileSelection(fileName, gridItem) {
    if (this.selectedFiles.has(fileName)) {
      this.selectedFiles.delete(fileName);
      gridItem.classList.remove('selected');
    } else {
      this.selectedFiles.add(fileName);
      gridItem.classList.add('selected');
    }
    
    this.updateSelectedCount();
  }

  selectAll() {
    const remainingFiles = this.files.slice(this.currentIndex);
    remainingFiles.forEach(file => {
      this.selectedFiles.add(file.name);
    });
    
    document.querySelectorAll('.batch-grid-item').forEach(item => {
      item.classList.add('selected');
    });
    
    this.updateSelectedCount();
  }

  deselectAll() {
    this.selectedFiles.clear();
    
    document.querySelectorAll('.batch-grid-item').forEach(item => {
      item.classList.remove('selected');
    });
    
    this.updateSelectedCount();
  }

  updateSelectedCount() {
    this.selectedCount.textContent = `${this.selectedFiles.size} selected`;
  }

  renderBatchFolders() {
    this.batchFolderList.innerHTML = '';
    
    this.settings.folderBindings.forEach(binding => {
      if (!binding.folderName) return;
      
      const btn = document.createElement('button');
      btn.className = 'batch-folder-btn';
      btn.innerHTML = `
        <span>${binding.folderName}</span>
        <kbd>${binding.key}</kbd>
      `;
      btn.addEventListener('click', () => this.moveBatchToFolder(binding.folderName));
      
      this.batchFolderList.appendChild(btn);
    });
  }

  async moveBatchToFolder(folderName) {
    if (this.selectedFiles.size === 0) {
      this.showToast('No files selected', 'warning');
      return;
    }

    try {
      const folderHandle = await this.directoryHandle.getDirectoryHandle(folderName, { create: true });
      const selectedArray = Array.from(this.selectedFiles);
      
      this.showToast(`Moving ${selectedArray.length} files to ${folderName}...`, 'info');
      
      for (const fileName of selectedArray) {
        const fileIndex = this.files.findIndex(f => f.name === fileName);
        if (fileIndex < this.currentIndex) continue; // Already processed
        
        const file = this.files[fileIndex];
        
        let targetName = null;
        if (this.settings.autoRename) {
          const ext = file.name.split('.').pop();
          const baseName = file.name.slice(0, -(ext.length + 1));
          targetName = `${baseName}_${folderName}.${ext}`;
        }
        
        await this.moveFile(file.handle, folderHandle, targetName);
        
        // Update stats
        this.updateFolderStats(folderName, 1);
        
        // Remove from UI
        const gridItem = this.batchGrid.querySelector(`[data-file-name="${fileName}"]`);
        if (gridItem) gridItem.remove();
      }
      
      // Clear selection
      this.selectedFiles.clear();
      this.updateSelectedCount();
      
      // Update current index (skip moved files)
      while (this.currentIndex < this.files.length && 
             selectedArray.includes(this.files[this.currentIndex].name)) {
        this.currentIndex++;
      }
      
      this.updateProgress();
      this.showToast(`Moved ${selectedArray.length} files successfully`, 'success');
      
      // Check if all files processed
      if (this.currentIndex >= this.files.length) {
        this.showCompletion();
      }
    } catch (e) {
      console.error('Batch move failed:', e);
      this.showToast('Failed to move files', 'error');
    }
  }

  // ===== Auto-Save Progress =====
  startAutoSave() {
    this.stopAutoSave(); // Clear any existing interval
    
    // Save every 30 seconds
    this.autoSaveInterval = setInterval(() => {
      this.saveProgress();
    }, 30000);
    
    // Also save on page unload
    window.addEventListener('beforeunload', () => this.saveProgress());
  }

  stopAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  saveProgress() {
    try {
      const progress = {
        currentIndex: this.currentIndex,
        timestamp: Date.now(),
        totalFiles: this.files.length,
        keptCount: this.keptFiles.length,
        deletedCount: this.deletedFiles.length,
        skippedCount: this.skippedFiles.length,
        folderStats: this.folderStats || {}
      };
      
      localStorage.setItem('sweepBrosProgress', JSON.stringify(progress));
      console.log('Progress saved:', progress);
    } catch (e) {
      console.error('Failed to save progress:', e);
    }
  }

  loadProgress() {
    try {
      const saved = localStorage.getItem('sweepBrosProgress');
      if (!saved) return null;
      
      const progress = JSON.parse(saved);
      
      // Check if progress is recent (within 24 hours)
      const age = Date.now() - progress.timestamp;
      if (age > 24 * 60 * 60 * 1000) {
        localStorage.removeItem('sweepBrosProgress');
        return null;
      }
      
      return progress;
    } catch (e) {
      console.error('Failed to load progress:', e);
      return null;
    }
  }

  async offerResumeSession() {
    const progress = this.loadProgress();
    
    if (progress && progress.currentIndex > 0) {
      const resume = confirm(
        `Resume previous session?\n\n` +
        `Progress: ${progress.currentIndex} of ${progress.totalFiles} files processed\n` +
        `Kept: ${progress.keptCount}, Deleted: ${progress.deletedCount}, Skipped: ${progress.skippedCount}`
      );
      
      if (resume) {
        this.currentIndex = progress.currentIndex;
        this.folderStats = progress.folderStats || {};
        this.showToast('Session resumed', 'success');
        return true;
      } else {
        localStorage.removeItem('sweepBrosProgress');
      }
    }
    
    return false;
  }

  // ===== Drag and Drop =====
  setupDragAndDrop() {
    if (!this.heroContent) return;

    let dragCounter = 0;

    this.heroContent.addEventListener('dragenter', (e) => {
      e.preventDefault();
      dragCounter++;
      if (dragCounter === 1) {
        this.dropZoneOverlay.classList.remove('hidden');
      }
    });

    this.heroContent.addEventListener('dragleave', (e) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter === 0) {
        this.dropZoneOverlay.classList.add('hidden');
      }
    });

    this.heroContent.addEventListener('dragover', (e) => {
      e.preventDefault();
    });

    this.heroContent.addEventListener('drop', async (e) => {
      e.preventDefault();
      dragCounter = 0;
      this.dropZoneOverlay.classList.add('hidden');

      const items = e.dataTransfer.items;
      
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        if (item.kind === 'file') {
          const entry = item.webkitGetAsEntry?.() || item.getAsEntry?.();
          
          if (entry && entry.isDirectory) {
            try {
              // Use the File System Access API to get directory handle
              const handle = await this.getDirectoryHandleFromDrop(entry);
              if (handle) {
                this.directoryHandle = handle;
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
              } else {
                this.showToast("Please use the button to select a folder.", "warning");
              }
            } catch (err) {
              console.error('Drag and drop failed:', err);
              this.showToast("Drag and drop not supported. Please use the select folder button.", "warning");
            }
            break;
          }
        }
      }
    });
  }

  async getDirectoryHandleFromDrop(entry) {
    // This is a workaround since we can't directly get a FileSystemDirectoryHandle from drag and drop
    // We'll prompt the user to select the folder they just dropped
    try {
      this.showToast("Please confirm the folder selection in the dialog...", "info");
      return await window.showDirectoryPicker();
    } catch (e) {
      return null;
    }
  }

  // ===== Theme Management =====
  toggleTheme() {
    const newTheme = this.theme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme, true);
  }

  setTheme(theme, save = true) {
    this.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    
    if (this.themeIconDark && this.themeIconLight) {
      if (theme === 'light') {
        this.themeIconDark.classList.add('hidden');
        this.themeIconLight.classList.remove('hidden');
      } else {
        this.themeIconDark.classList.remove('hidden');
        this.themeIconLight.classList.add('hidden');
      }
    }
    
    if (save) {
      localStorage.setItem('sweepBrosTheme', theme);
      this.showToast(`Switched to ${theme} theme`, 'success');
    }
  }

  // ===== Metadata Display =====
  toggleMetadata() {
    if (this.metadataPanel.classList.contains('hidden')) {
      this.showMetadata();
    } else {
      this.hideMetadata();
    }
  }

  async showMetadata() {
    this.metadataPanel.classList.remove('hidden');
    await this.loadMetadata();
  }

  hideMetadata() {
    this.metadataPanel.classList.add('hidden');
  }

  async loadMetadata() {
    if (this.currentIndex >= this.files.length) return;
    
    const file = this.files[this.currentIndex];
    
    try {
      const fileData = await file.handle.getFile();
      
      // Basic metadata
      this.metaFileSize.textContent = this.formatFileSize(fileData.size);
      this.metaType.textContent = file.type.charAt(0).toUpperCase() + file.type.slice(1);
      this.metaDate.textContent = new Date(fileData.lastModified).toLocaleString();
      
      // Resolution and EXIF data for images
      if (file.type === 'image') {
        await this.loadImageMetadata(fileData);
      } else if (file.type === 'video') {
        await this.loadVideoMetadata(fileData);
      }
    } catch (e) {
      console.error('Failed to load metadata:', e);
      this.metaResolution.textContent = 'Error loading';
      this.metaCamera.textContent = '-';
    }
  }

  async loadImageMetadata(fileData) {
    const img = new Image();
    const url = URL.createObjectURL(fileData);
    
    img.onload = async () => {
      this.metaResolution.textContent = `${img.width} × ${img.height}`;
      URL.revokeObjectURL(url);
      
      // Try to extract EXIF data
      try {
        const exifData = await this.extractEXIF(fileData);
        if (exifData) {
          if (exifData.Make && exifData.Model) {
            this.metaCamera.textContent = `${exifData.Make} ${exifData.Model}`;
          } else {
            this.metaCamera.textContent = '-';
          }
          
          if (exifData.DateTimeOriginal) {
            this.metaDate.textContent = exifData.DateTimeOriginal;
          }
        } else {
          this.metaCamera.textContent = '-';
        }
      } catch (e) {
        this.metaCamera.textContent = '-';
      }
    };
    
    img.src = url;
  }

  async loadVideoMetadata(fileData) {
    const video = document.createElement('video');
    const url = URL.createObjectURL(fileData);
    
    video.onloadedmetadata = () => {
      this.metaResolution.textContent = `${video.videoWidth} × ${video.videoHeight}`;
      this.metaCamera.textContent = '-';
      URL.revokeObjectURL(url);
    };
    
    video.src = url;
  }

  async extractEXIF(file) {
    // Basic EXIF extraction (simplified version)
    // In a real app, you'd use a library like exif-js or piexifjs
    try {
      const arrayBuffer = await file.arrayBuffer();
      const view = new DataView(arrayBuffer);
      
      // Check for JPEG marker
      if (view.getUint16(0, false) !== 0xFFD8) {
        return null;
      }
      
      // This is a simplified EXIF parser
      // For production, use a proper EXIF library
      return null; // Placeholder
    } catch (e) {
      return null;
    }
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  // ===== Video Enhancements =====
  setVideoSpeed(speed) {
    if (this.previewVideo && !this.previewVideo.classList.contains('hidden')) {
      this.previewVideo.playbackRate = speed;
    }
  }

  setupVideoThumbnailPreview() {
    // This creates a canvas-based thumbnail preview on hover
    // For simplicity, we'll show current time on hover
    const video = this.previewVideo;
    
    video.addEventListener('mousemove', (e) => {
      if (!video.duration) return;
      
      const rect = video.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = x / rect.width;
      const time = percent * video.duration;
      
      // Show time tooltip
      this.showVideoTimeTooltip(e.clientX, e.clientY, time);
    });
    
    video.addEventListener('mouseleave', () => {
      this.hideVideoTimeTooltip();
    });
  }

  showVideoTimeTooltip(x, y, time) {
    let tooltip = document.getElementById('videoTimeTooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = 'videoTimeTooltip';
      tooltip.className = 'video-time-tooltip';
      document.body.appendChild(tooltip);
    }
    
    tooltip.textContent = this.formatTime(time);
    tooltip.style.left = x + 'px';
    tooltip.style.top = (y - 40) + 'px';
    tooltip.style.display = 'block';
  }

  hideVideoTimeTooltip() {
    const tooltip = document.getElementById('videoTimeTooltip');
    if (tooltip) {
      tooltip.style.display = 'none';
    }
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // ===== Smart Sorting Suggestions =====
  async showSuggestions() {
    if (this.currentIndex >= this.files.length) return;
    
    const file = this.files[this.currentIndex];
    const suggestions = await this.generateSuggestions(file);
    
    if (suggestions.length > 0) {
      this.suggestionsPanel.classList.remove('hidden');
      this.renderSuggestions(suggestions);
    } else {
      this.suggestionsPanel.classList.add('hidden');
    }
  }

  async generateSuggestions(file) {
    const suggestions = [];
    
    try {
      const fileData = await file.handle.getFile();
      const fileName = file.name.toLowerCase();
      const fileDate = new Date(fileData.lastModified);
      
      // Date-based suggestions
      const year = fileDate.getFullYear();
      const month = fileDate.toLocaleString('default', { month: 'long' });
      
      // Check for year folder in bindings
      const yearBinding = this.settings.folderBindings.find(b => 
        b.folderName && b.folderName.includes(year.toString())
      );
      if (yearBinding) {
        suggestions.push({
          folder: yearBinding.folderName,
          key: yearBinding.key,
          reason: `File from ${year}`,
          confidence: 'high'
        });
      }
      
      // Pattern-based suggestions
      const patterns = {
        screenshot: /screenshot|screen|capture/i,
        photo: /img|photo|pic|dsc|dcim/i,
        video: /vid|movie|clip|rec/i,
        download: /download|dl/i,
        work: /work|doc|project/i,
        personal: /personal|private|family/i
      };
      
      for (const [pattern, regex] of Object.entries(patterns)) {
        if (regex.test(fileName)) {
          const binding = this.settings.folderBindings.find(b => 
            b.folderName && b.folderName.toLowerCase().includes(pattern)
          );
          if (binding) {
            suggestions.push({
              folder: binding.folderName,
              key: binding.key,
              reason: `Filename pattern: ${pattern}`,
              confidence: 'medium'
            });
          }
        }
      }
      
      // File type suggestions
      if (file.type === 'video') {
        const videoBinding = this.settings.folderBindings.find(b => 
          b.folderName && /video|movie|clip/i.test(b.folderName)
        );
        if (videoBinding) {
          suggestions.push({
            folder: videoBinding.folderName,
            key: videoBinding.key,
            reason: 'Video file',
            confidence: 'low'
          });
        }
      } else {
        const photoBinding = this.settings.folderBindings.find(b => 
          b.folderName && /photo|image|pic/i.test(b.folderName)
        );
        if (photoBinding) {
          suggestions.push({
            folder: photoBinding.folderName,
            key: photoBinding.key,
            reason: 'Image file',
            confidence: 'low'
          });
        }
      }
      
      // Remove duplicates and limit to top 3
      const uniqueSuggestions = suggestions.filter((s, i, arr) => 
        arr.findIndex(x => x.folder === s.folder) === i
      );
      
      return uniqueSuggestions.slice(0, 3);
    } catch (e) {
      console.error('Failed to generate suggestions:', e);
      return [];
    }
  }

  renderSuggestions(suggestions) {
    this.suggestionsList.innerHTML = '';
    
    suggestions.forEach(suggestion => {
      const item = document.createElement('div');
      item.className = `suggestion-item confidence-${suggestion.confidence}`;
      item.innerHTML = `
        <div class="suggestion-info">
          <div class="suggestion-folder">${suggestion.folder}</div>
          <div class="suggestion-reason">${suggestion.reason}</div>
        </div>
        <kbd class="suggestion-key">${suggestion.key}</kbd>
      `;
      
      item.addEventListener('click', () => {
        const bindingIndex = this.settings.folderBindings.findIndex(
          b => b.folderName === suggestion.folder
        );
        if (bindingIndex !== -1) {
          this.processFolderBinding(bindingIndex);
        }
      });
      
      this.suggestionsList.appendChild(item);
    });
  }

  // ===== Duplicate Detection =====
  async checkForDuplicates() {
    if (this.currentIndex >= this.files.length) return;
    
    const file = this.files[this.currentIndex];
    
    try {
      const fileData = await file.handle.getFile();
      const duplicates = [];
      
      // Check by name
      const sameNameFiles = this.files.filter((f, idx) => 
        idx !== this.currentIndex && f.name === file.name
      );
      if (sameNameFiles.length > 0) {
        duplicates.push(`Same filename found (${sameNameFiles.length} match${sameNameFiles.length > 1 ? 'es' : ''})`);
      }
      
      // Check by size
      const sameSizeFiles = await this.findFilesBySize(fileData.size, this.currentIndex);
      if (sameSizeFiles.length > 0) {
        duplicates.push(`Same file size: ${this.formatFileSize(fileData.size)}`);
      }
      
      // Simple hash check (using size + first/last bytes as quick hash)
      const hash = await this.quickHash(fileData);
      if (this.fileHashes.has(hash)) {
        const existingFile = this.fileHashes.get(hash);
        if (existingFile !== file.name) {
          duplicates.push(`Similar content detected`);
        }
      } else {
        this.fileHashes.set(hash, file.name);
      }
      
      if (duplicates.length > 0) {
        this.showDuplicateWarning(duplicates);
      } else {
        this.hideDuplicateWarning();
      }
    } catch (e) {
      console.error('Duplicate check failed:', e);
      this.hideDuplicateWarning();
    }
  }

  async findFilesBySize(targetSize, excludeIndex) {
    const matches = [];
    for (let i = 0; i < this.files.length; i++) {
      if (i === excludeIndex) continue;
      try {
        const fileData = await this.files[i].handle.getFile();
        if (fileData.size === targetSize) {
          matches.push(this.files[i].name);
        }
      } catch (e) {
        // Skip files we can't read
      }
    }
    return matches;
  }

  async quickHash(file) {
    // Quick hash using file size + first and last 1KB
    try {
      const size = file.size;
      const chunkSize = Math.min(1024, size);
      
      const start = await file.slice(0, chunkSize).arrayBuffer();
      const end = size > chunkSize ? 
        await file.slice(size - chunkSize, size).arrayBuffer() : 
        start;
      
      // Simple hash combination
      const hash = `${size}-${this.arrayBufferToHex(start, 8)}-${this.arrayBufferToHex(end, 8)}`;
      return hash;
    } catch (e) {
      return `${file.size}-${file.name}`;
    }
  }

  arrayBufferToHex(buffer, maxBytes = 8) {
    const bytes = new Uint8Array(buffer);
    const limit = Math.min(maxBytes, bytes.length);
    let hex = '';
    for (let i = 0; i < limit; i++) {
      hex += bytes[i].toString(16).padStart(2, '0');
    }
    return hex;
  }

  showDuplicateWarning(duplicates) {
    this.duplicateWarning.classList.remove('hidden');
    this.duplicateMessage.innerHTML = duplicates.map(d => 
      `<div>• ${d}</div>`
    ).join('');
  }

  hideDuplicateWarning() {
    this.duplicateWarning.classList.add('hidden');
  }

  // ===== File Type Filtering =====
  toggleImageFilter() {
    this.showImages = !this.showImages;
    this.filterImages.classList.toggle('active');
    this.filterImages.classList.add('changed');
    setTimeout(() => this.filterImages.classList.remove('changed'), 300);
    
    if (!this.showImages && !this.showVideos) {
      // At least one must be active
      this.showImages = true;
      this.filterImages.classList.add('active');
      this.showToast('At least one file type must be visible', 'warning');
      return;
    }
    
    this.updateFilterCounts();
    this.skipToNextValidFile();
    this.showToast(`Images ${this.showImages ? 'shown' : 'hidden'}`, 'info');
  }

  toggleVideoFilter() {
    this.showVideos = !this.showVideos;
    this.filterVideos.classList.toggle('active');
    this.filterVideos.classList.add('changed');
    setTimeout(() => this.filterVideos.classList.remove('changed'), 300);
    
    if (!this.showImages && !this.showVideos) {
      // At least one must be active
      this.showVideos = true;
      this.filterVideos.classList.add('active');
      this.showToast('At least one file type must be visible', 'warning');
      return;
    }
    
    this.updateFilterCounts();
    this.skipToNextValidFile();
    this.showToast(`Videos ${this.showVideos ? 'shown' : 'hidden'}`, 'info');
  }

  showAllFilters() {
    const wasChanged = !this.showImages || !this.showVideos;
    
    this.showImages = true;
    this.showVideos = true;
    
    this.filterImages.classList.add('active', 'changed');
    this.filterVideos.classList.add('active', 'changed');
    
    setTimeout(() => {
      this.filterImages.classList.remove('changed');
      this.filterVideos.classList.remove('changed');
    }, 300);
    
    if (wasChanged) {
      this.updateFilterCounts();
      this.loadCurrentFile();
      this.showToast('Showing all file types', 'success');
    }
  }

  updateFilterCounts() {
    if (!this.files || this.files.length === 0) {
      if (this.imageCount) this.imageCount.textContent = '0';
      if (this.videoCount) this.videoCount.textContent = '0';
      return;
    }
    
    const remaining = this.files.slice(this.currentIndex);
    const imageCount = remaining.filter(f => f.type === 'image').length;
    const videoCount = remaining.filter(f => f.type === 'video').length;
    
    if (this.imageCount) {
      this.imageCount.textContent = imageCount.toString();
      this.imageCount.style.transform = 'scale(1.2)';
      setTimeout(() => this.imageCount.style.transform = 'scale(1)', 200);
    }
    
    if (this.videoCount) {
      this.videoCount.textContent = videoCount.toString();
      this.videoCount.style.transform = 'scale(1.2)';
      setTimeout(() => this.videoCount.style.transform = 'scale(1)', 200);
    }
  }

  skipToNextValidFile() {
    // Just reload the current file, which will skip filtered files during loadCurrentFile
    if (this.batchMode) {
      // In batch mode, re-render the grid to show only valid file types
      this.renderBatchGrid();
    } else {
      // In single mode, loadCurrentFile already handles filtering
      this.loadCurrentFile();
    }
  }

  // ===== Zoom & Pan Functionality =====
  zoomIn() {
    this.currentZoom = Math.min(this.currentZoom + 0.25, 5);
    this.updateZoom();
  }

  zoomOut() {
    this.currentZoom = Math.max(this.currentZoom - 0.25, 0.5);
    this.updateZoom();
  }

  resetZoom() {
    this.currentZoom = 1;
    this.panOffset = { x: 0, y: 0 };
    this.updateZoom();
  }

  handleZoomWheel(e) {
    if (!this.previewImage.classList.contains('hidden')) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      this.currentZoom = Math.max(0.5, Math.min(5, this.currentZoom + delta));
      this.updateZoom();
    }
  }

  updateZoom() {
    this.previewImage.style.transform = 
      `scale(${this.currentZoom}) translate(${this.panOffset.x}px, ${this.panOffset.y}px)`;
    this.zoomLevel.textContent = `${Math.round(this.currentZoom * 100)}%`;
    
    if (this.currentZoom > 1) {
      this.zoomContainer.style.cursor = 'move';
    } else {
      this.zoomContainer.style.cursor = 'default';
      this.panOffset = { x: 0, y: 0 };
    }
  }

  startPan(e) {
    if (this.currentZoom > 1 && !this.previewImage.classList.contains('hidden')) {
      this.isPanning = true;
      this.panStart = { x: e.clientX - this.panOffset.x, y: e.clientY - this.panOffset.y };
      this.zoomContainer.style.cursor = 'grabbing';
    }
  }

  handlePan(e) {
    if (this.isPanning) {
      this.panOffset = {
        x: e.clientX - this.panStart.x,
        y: e.clientY - this.panStart.y
      };
      this.updateZoom();
    }
  }

  endPan() {
    this.isPanning = false;
    if (this.currentZoom > 1) {
      this.zoomContainer.style.cursor = 'move';
    }
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

    // Zoom controls for images
    if (!this.previewImage.classList.contains('hidden')) {
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        this.zoomIn();
        return;
      }
      if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        this.zoomOut();
        return;
      }
    }

    // Toggle metadata with 'I' key
    if (e.key === 'i' || e.key === 'I') {
      e.preventDefault();
      this.toggleMetadata();
      return;
    }

    // Toggle image filter with 'M' key
    if (e.key === 'm' || e.key === 'M') {
      e.preventDefault();
      this.toggleImageFilter();
      return;
    }

    // Toggle video filter with 'V' key
    if (e.key === 'v' || e.key === 'V') {
      e.preventDefault();
      this.toggleVideoFilter();
      return;
    }

    // Show all filters with 'A' key
    if (e.key === 'a' || e.key === 'A') {
      e.preventDefault();
      this.showAllFilters();
      return;
    }

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

      const file = this.files[this.currentDisplayIndex];
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
        index: this.currentDisplayIndex,
      });

      // Update stats
      this.updateFolderStats(binding.folderName, 1);

      // Update UI temporarily to show action
      this.animateFolderAction(index);

      // Advance to next unprocessed file
      this.currentIndex = this.currentDisplayIndex + 1;
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
  window.sweepBros = new SweepBros();
});
