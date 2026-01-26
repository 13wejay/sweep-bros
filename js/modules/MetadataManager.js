export default class MetadataManager {
  constructor(core) {
    this.core = core;
  }

  async loadMetadata(fileEntry) {
    const panel = document.getElementById("metadataContent");
    // Reset
    document.getElementById("metaResolution").textContent = "Loading...";
    document.getElementById("metaFileSize").textContent = "Loading...";
    document.getElementById("metaDate").textContent = "Loading...";
    document.getElementById("metaType").textContent =
      fileEntry.type.toUpperCase();

    try {
      const file = await fileEntry.handle.getFile();
      document.getElementById("metaFileSize").textContent = this.formatFileSize(
        file.size,
      );
      document.getElementById("metaDate").textContent = new Date(
        file.lastModified,
      ).toLocaleString();

      if (fileEntry.type === "image") {
        this.loadImageMetadata(file);
      } else {
        this.loadVideoMetadata(file);
      }
    } catch (e) {
      console.error("Meta load error", e);
    }
  }

  loadImageMetadata(file) {
    const img = new Image();
    img.onload = () => {
      document.getElementById("metaResolution").textContent =
        `${img.naturalWidth} x ${img.naturalHeight}`;
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  }

  loadVideoMetadata(file) {
    const video = document.createElement("video");
    video.onloadedmetadata = () => {
      document.getElementById("metaResolution").textContent =
        `${video.videoWidth} x ${video.videoHeight}`;
      URL.revokeObjectURL(video.src);
    };
    video.src = URL.createObjectURL(file);
  }

  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  toggleMetadata() {
    document.getElementById("metadataPanel").classList.toggle("hidden");
  }

  hideMetadata() {
    document.getElementById("metadataPanel").classList.add("hidden");
  }
}
