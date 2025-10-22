# Point3 Learning Tool ✨

An accessible English‑learning desktop application designed for visually impaired learners. The app bundles an Electron shell, a React front end, and a Flask backend to deliver guided listening, self‑recording, and pronunciation comparison in a single package.

## Features 🎯

- **🖥️ Integrated desktop experience** – Electron launches the React interface together with the Flask API; no browser window is required.
- **🧭 Guided learning workflow** – Browse curated materials, listen to reference audio, read large‑print transcripts, and control playback with keyboard‑friendly buttons.
- **🎙️ Pronunciation practice** – Record user attempts directly in the app; uploads are stored server‑side for evaluation.
- **📊 Waveform comparison & similarity** – Visualise reference vs. learner recordings and review an automatically calculated similarity score.
- **🛠️ Admin console** – Replace reference audio, review transcripts, and manage content without touching the filesystem.

## Tech Stack 🧰

- **Front end**: React 18, Material UI, React Router, echarts-for-react.
- **Desktop shell**: Electron 18 with wait-on / concurrently for orchestration.
- **Backend**: Flask 2.3 + Flask-CORS, Librosa/Numpy for signal analysis.
- **Tooling**: Python 3.10+, Node.js 18+, npm.

## Repository Layout 📂

```
.
├── app
│   ├── backend/          # Flask API, data stores, sample generation script
│   ├── client/           # React source code and assets
│   ├── main.js           # Electron main process (lanches Flask + React)
│   └── package.json      # Electron + orchestration scripts
├── scripts/              # Cross-platform start scripts
├── README.md             # English README
└── README-zh.md          # 中文说明
```

Key data directories (created on first run or via `create_sample_data.py`):

- `app/backend/databaseOrigin/` – JSON metadata & transcript `.txt` files.
- `app/backend/audioOrigin/` – Reference audio clips (WAV).
- `app/backend/audioSelf/` – User recordings (auto-created).

## Getting Started 🚀

### Prerequisites 📋

- Python 3.10 or later (`python`, `pip` in PATH).
- Node.js 18 or later (`node`, `npm` in PATH).
- Recommended: Git Bash or PowerShell on Windows for the provided scripts.

### Install dependencies 📦

```bash
# Python dependencies
cd app/backend
pip install -r requirements.txt

# JavaScript dependencies (client + Electron)
cd ../../app/client
npm install
cd ..
npm install
```

### Launch in development ▶️

```bash
# From repository root (Bash)
./scripts/start.sh

# Or on Windows (PowerShell)
pwsh scripts/start.ps1
```

The script frees ports 3000/5000 if needed, starts the Flask API, boots the React dev server, and opens the Electron window automatically. React stays inside the Electron shell—no browser tab will appear.

### Sample data 📚

If you need fresh demo content, regenerate it:

```bash
cd app/backend
python create_sample_data.py
```

This populates `databaseOrigin/` with transcripts and `audioOrigin/` with synthesised placeholder audio.

## Usage Notes 💡

- **Learning view (`/`)**: select a lesson on the left, read the large transcript, play audio, record attempts, and review similarity scores on the right panel. Waveforms auto-scale vertically to fit both signals.
- **Admin view (`/admin`)**: filter materials, record new reference audio, preview recordings, and upload replacements. Transcripts are preserved whenever admin audio is updated.
- **Recordings**: Uploaded user audio lives in `app/backend/audioSelf`, and metadata is stored in `databaseSelf`.

## Building for distribution 📦

```bash
cd app
npm run build        # Builds the React bundle into client/build
```

For packaging the Electron app you can integrate `electron-packager` or a similar tool (not yet scripted in this repo).

## Troubleshooting 🧪

- **Ports already in use**: rerun the start script; it automatically calls `npx kill-port 3000 5000`.
- **Python audio libs failing**: ensure the required build tools (e.g., `pip install wheel`) are available and reinstall `librosa` dependencies.
- **Similarity not appearing**: record a new attempt after the reference audio finishes loading; similarity displays when both waveforms are available.

## License 📝

Apache License 2.0 – see `LICENSE` for details.

![](image/xingchen.png)
