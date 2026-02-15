export default class SettingsManager {
  constructor(core) {
    this.core = core;
    this.defaults = {
      deleteKey: "ArrowLeft",
      keepKey: "ArrowRight",
      undoKey: "KeyZ",
      skipKey: "Space",
      theme: "dark",
      sortingMode: "numeric", // "numeric" or "arrows"
      folderBindings: [
        { key: "1", folderName: "Screenshots" },
        { key: "2", folderName: "Personal" },
        { key: "3", folderName: "Work" },
        { key: "4", folderName: "Memes" },
        { key: "0", folderName: "Misc" },
      ],
      namingMode: "original", // "original", "appendFolder", "numeric"
      autoPlayVideo: true,
      confirmDelete: false,
    };

    // Load settings immediately
    this.settings = this.loadSettingsFromStorage();
  }

  loadSettingsFromStorage() {
    const saved = localStorage.getItem("sweepBrosSettings");
    let settings = { ...this.defaults };
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration: autoRename (bool) -> namingMode (string)
        if (parsed.autoRename !== undefined && !parsed.namingMode) {
          parsed.namingMode = parsed.autoRename ? "appendFolder" : "original";
          delete parsed.autoRename;
        }
        settings = { ...this.defaults, ...parsed };
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
    return settings;
  }

  loadSettings() {
    // Apply theme
    this.setTheme(this.settings.theme, false);

    // Apply UI state based on settings
    if (this.core.ui) {
      this.core.ui.renderFolderBindings();
      this.core.ui.updateUIForMode();

      // Set toggle states
      // Auto-rename toggle removed in favor of Naming Mode options

      const autoPlayToggle = document.getElementById("autoPlayToggle");
      if (autoPlayToggle) autoPlayToggle.checked = this.settings.autoPlayVideo;

      // Set radio for sorting mode
      const modeRadios = document.querySelectorAll('input[name="sortingMode"]');
      modeRadios.forEach((radio) => {
        if (radio.value === this.settings.sortingMode) radio.checked = true;
      });

      // Set radio for naming mode
      const namingRadios = document.querySelectorAll(
        'input[name="namingMode"]',
      );
      namingRadios.forEach((radio) => {
        if (radio.value === this.settings.namingMode) radio.checked = true;
      });
    }
  }

  saveSettings() {
    localStorage.setItem("sweepBrosSettings", JSON.stringify(this.settings));
    // core.ui.showToast("Settings saved", "success");
  }

  setTheme(theme, save = true) {
    this.settings.theme = theme;
    document.documentElement.setAttribute("data-theme", theme);

    const themeIconDark = document.getElementById("themeIconDark");
    const themeIconLight = document.getElementById("themeIconLight");

    if (themeIconDark && themeIconLight) {
      if (theme === "light") {
        themeIconDark.classList.add("hidden");
        themeIconLight.classList.remove("hidden");
      } else {
        themeIconDark.classList.remove("hidden");
        themeIconLight.classList.add("hidden");
      }
    }

    if (save) {
      localStorage.setItem("sweepBrosTheme", theme); // Legacy support or just save main settings
      this.saveSettings();
      if (this.core.ui)
        this.core.ui.showToast(`Switched to ${theme} theme`, "success");
    }
  }

  toggleTheme() {
    const newTheme = this.settings.theme === "dark" ? "light" : "dark";
    this.setTheme(newTheme, true);
  }

  updateSetting(key, value) {
    this.settings[key] = value;
    this.saveSettings();
  }
}
