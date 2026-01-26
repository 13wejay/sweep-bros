# Sweep Bros

Sweep Bros is a modern, privacy-first media organization tool that runs directly in your browser. It streamlines the process of sorting thousands of photos and videos using efficient keyboard shortcuts, helping you declutter your gallery in minutes.

![Sweep Bros Banner](favicon.svg)

## ✨ Features

- **🔒 Privacy First**: All processing happens locally on your device. No files are ever uploaded to any server.
- **⚡ Lightning Fast Sorting**:
  - **Numeric Mode**: Instantly move files to up to 10 custom folders using keys `0-9`.
  - **Arrow Mode**: Classic "Keeper" workflow—Left to Delete, Right to Keep.
  - **Batch Mode**: Select multiple files to move or delete them in bulk.
- **🎥 Advanced Media Player**:
  - Auto-play videos.
  - Variable playback speed (0.5x, 1x, 2x).
  - Loop toggle and seek controls.
- **🔍 Smart Design**:
  - **Filters**: Quickly toggle between Images, Videos, or All files.
  - **Metadata Panel**: View resolution, file size, date taken, and camera info.
  - **Zoom & Pan**: Inspect image details closer.
- **🎨 Customizable**:
  - Dark/Light mode support.
  - Configurable folder bindings.
  - Auto-rename options.
- **↩️ Unlimited Undo**: Made a mistake? Press `Ctrl+Z` to reverse it instantly.

## 🚀 Getting Started

1. **Open the App**: simply open `index.html` in a supported web browser.
2. **Select Folder**: Click "Start Organizing" and select a folder from your computer.
3. **Grant Access**: The browser will ask for permission to read/write to the folder—this is required to move your files.
4. **Start Sorting**: Use the keyboard shortcuts below to organize your media.

### ⚠️ Browser Requirements

Sweep Bros uses the modern **File System Access API** to manage files directly on your disk.

- **Supported**: Google Chrome, Microsoft Edge, Brave, Opera.
- **Not Supported**: Firefox, Safari (as of 2024).

## ⌨️ Keyboard Shortcuts

| Key          | Action                       |
| :----------- | :--------------------------- |
| **0 - 9**    | Move file to assigned folder |
| **← / →**    | Delete / Keep (Arrow Mode)   |
| **Space**    | Skip file / Play/Pause video |
| **Ctrl + Z** | Undo last action             |
| **M**        | Toggle Images filter         |
| **V**        | Toggle Videos filter         |
| **A**        | Show All files               |
| **I**        | Toggle Info/Metadata panel   |
| **+ / -**    | Zoom In / Out                |

## 🛠️ Technology Stack

- **Core**: Vanilla JavaScript (ES Modules)
- **Styling**: Modern CSS (Variables, Flexbox, Grid, Glassmorphism)
- **Icons**: SVG / Material Symbols
- **API**: File System Access API

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on how to get started.

## License

This project is open source and available under the [MIT License](LICENSE).
