export default class BatchManager {
  constructor(core) {
    this.core = core;
    this.active = false;
    this.selectedFiles = new Set();
  }

  toggleBatchMode() {
    this.active = !this.active;
    const container = document.getElementById("batchGridContainer");
    const singleView = document.getElementById("singlePreviewContainer");
    const btn = document.getElementById("batchModeBtn");

    if (this.active) {
      container.classList.remove("hidden");
      singleView.classList.add("hidden");
      btn.classList.add("active");
      this.renderBatchGrid();
    } else {
      container.classList.add("hidden");
      singleView.classList.remove("hidden");
      btn.classList.remove("active");
    }
  }

  renderBatchGrid() {
    const grid = document.getElementById("batchGrid");
    grid.innerHTML = ""; // Clear

    // Render subset or virtualize? For now render all, assuming reasonable count (<1000).
    // If large, need pagination or virtualization.
    this.core.files.forEach((file, index) => {
      const div = document.createElement("div");
      div.className = "batch-grid-item";
      if (this.selectedFiles.has(index)) div.classList.add("selected");

      div.innerHTML = `
                <div class="batch-checkbox">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div class="batch-item-preview">
                     <!-- Lazy load image here -->
                     <span class="batch-error">?</span>
                </div>
                <div class="batch-item-name">${file.name}</div>
             `;

      div.onclick = () => this.toggleSelection(index, div);

      // Lazy load logic (simple intersection observer)
      this.lazyLoadThumbnail(div, file);

      grid.appendChild(div);
    });

    this.updateBatchFolderBar();
  }

  selectAll() {
    this.core.files.forEach((_, index) => this.selectedFiles.add(index));
    // Re-render to show selection
    this.renderBatchGrid();
    this.updateSelectedCount();
  }

  deselectAll() {
    this.selectedFiles.clear();
    this.renderBatchGrid();
    this.updateSelectedCount();
  }

  toggleSelection(index, element) {
    if (this.selectedFiles.has(index)) {
      this.selectedFiles.delete(index);
      element.classList.remove("selected");
    } else {
      this.selectedFiles.add(index);
      element.classList.add("selected");
    }
    this.updateSelectedCount();
  }

  updateSelectedCount() {
    const el = document.getElementById("selectedCount");
    if (el) el.textContent = `${this.selectedFiles.size} selected`;
  }

  lazyLoadThumbnail(element, file) {
    // Implementation of intersection observer or direct load
    // Simple direct load for prototype
    /* Real impl would use intersection observer */
    setTimeout(async () => {
      try {
        const fileData = await file.handle.getFile();
        const url = URL.createObjectURL(fileData);
        const previewContainer = element.querySelector(".batch-item-preview");
        previewContainer.innerHTML = "";

        if (file.type === "image") {
          const img = document.createElement("img");
          img.src = url;
          previewContainer.appendChild(img);
        } else {
          const vid = document.createElement("video");
          vid.src = url;
          previewContainer.appendChild(vid);
        }
      } catch (e) {}
    }, 100);
  }

  updateBatchFolderBar() {
    const bar = document.getElementById("batchFolderList");
    bar.innerHTML = "";

    this.core.settings.settings.folderBindings.forEach((binding) => {
      const btn = document.createElement("button");
      btn.className = "batch-folder-btn";
      btn.innerHTML = `<kbd>${binding.key}</kbd> <span>${binding.folderName}</span>`;
      btn.onclick = () => this.moveBatch(binding.folderName);
      bar.appendChild(btn);
    });
  }

  async moveBatch(folderName) {
    if (this.selectedFiles.size === 0) return;

    if (!confirm(`Move ${this.selectedFiles.size} files to "${folderName}"?`))
      return;

    // Execute moves
    // Logic similar to FileManager.moveFile but in loop
    // Need to refactor FileManager to accept file argument or expose move logic purely
    /* For speed, we just loop and call internal move logic */

    // This is tricky because FileManager relies on currentIndex.
    // We might need to abstract "move specific file" in FileManager.
    // For now, placeholder or TODO.
    this.core.ui.showToast(
      `Batch moved ${this.selectedFiles.size} files (Simulated)`,
      "success",
    );
    this.selectedFiles.clear();
    this.toggleBatchMode(); // Exit
    this.core.fileManager.scanFolder(); // Re-scan
  }
}
