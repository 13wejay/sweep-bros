import SettingsManager from "../modules/SettingsManager.js";
import UIManager from "../modules/UIManager.js";
import FileManager from "../modules/FileManager.js";
import MediaViewer from "../modules/MediaViewer.js";
import MetadataManager from "../modules/MetadataManager.js";
import BatchManager from "../modules/BatchManager.js";

export default class SweepBros {
  constructor() {
    // Core State
    this.files = [];
    this.currentIndex = 0;
    this.history = [];
    this.keptFiles = [];
    this.deletedFiles = [];
    this.skippedFiles = [];
    this.directoryHandle = null;
    this.keepFolderHandle = null;
    this.deleteFolderHandle = null;
    this.folderStats = {};

    // Module Initialization
    this.settings = new SettingsManager(this);
    this.ui = new UIManager(this);
    this.fileManager = new FileManager(this);
    this.mediaViewer = new MediaViewer(this);
    this.metadata = new MetadataManager(this);
    this.batch = new BatchManager(this);

    this.init();
  }

  init() {
    this.ui.bindEvents();
    this.settings.loadSettings();
  }

  handleKeyDown(e) {
    if (document.querySelector(".modal:not(.hidden):not(#sortingModal)"))
      return;
    if (document.getElementById("sortingModal").classList.contains("hidden"))
      return;

    const key = e.code;
    const settings = this.settings.settings;

    // Batch Mode logic? Handled separately or here?
    // If batch mode active, might have different shortcuts.

    // Numeric Mode
    if (settings.sortingMode === "numeric") {
      // Check Bindings
      const bindingIndex = settings.folderBindings.findIndex((b) => {
        // Simple check: digit matches key char? or code matches stored key
        // Stored key is "1" or "Digit1"? Settings defaults use "1".
        // Normalize comparison
        return (
          b.key === e.key ||
          b.key === key.replace("Digit", "") ||
          b.key === key.replace("Numpad", "")
        );
      });

      if (bindingIndex !== -1) {
        this.fileManager.sortToFolder(bindingIndex);
        return;
      }
    }

    // Arrow Mode
    if (settings.sortingMode === "arrows") {
      if (key === settings.deleteKey) this.fileManager.deleteFile();
      if (key === settings.keepKey) this.fileManager.keepFile();
    }

    // Universal
    if (key === settings.skipKey) {
      e.preventDefault(); // prevent scroll
      this.fileManager.skipFile();
    }

    if (key === settings.undoKey && (e.ctrlKey || e.metaKey)) {
      this.fileManager.undo();
    }

    // Filters shortcuts
    if (key === "KeyM") this.mediaViewer.toggleImageFilter();
    if (key === "KeyV") this.mediaViewer.toggleVideoFilter();
    if (key === "KeyA") this.mediaViewer.showAllFilters();
    if (key === "KeyI") this.metadata.toggleMetadata();

    // Video controls shortcuts
    if (key === "Space" && !settings.skipKey === "Space") {
      // Play/Pause if skip is not Space (default skip IS Space though)
      // Use toggle via UI click simulation or direct
      document.getElementById("playPauseBtn")?.click();
    }
  }
}
