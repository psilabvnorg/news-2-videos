# News to Videos Pipeline 🎬

Automated pipeline to convert Vietnamese news articles into TikTok-style videos with AI voice-over, auto-generated subtitles, and professional video rendering.

## Overview

This project combines two systems:
- **news-2-content**: AI-powered news summarization and Vietnamese TTS audio generation
- **content-2-videos**: Remotion-based video rendering with auto-captioning

```
News URL → Summarize → TTS Audio → Subtitles → Video Render → TikTok Video
```

---

## System Requirements

- **OS**: Ubuntu/Linux (tested on Ubuntu 22.04)
- **Python**: 3.10+
- **Node.js**: 18+ (LTS recommended)
- **GPU**: NVIDIA GPU with CUDA support (RTX series recommended)
- **RAM**: 16GB+ recommended
- **Disk**: ~15GB for models and dependencies

---

## Installation

### Step 1: Clone Repository

```bash
git clone <repo-url>
cd news-to-videos
```

### Step 2: Install System Dependencies

```bash
# FFmpeg for audio/video processing
sudo apt update
sudo apt install -y ffmpeg

# espeak-ng for Vietnamese phonemization (required by VieNeu-TTS)
sudo apt install -y espeak-ng

# Build tools for Whisper.cpp
sudo apt install -y build-essential
```

### Step 3: Setup news-2-content (Python)

```bash
cd news-2-content

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Copy environment config
cp .env.example .env
```

### Step 4: Install Ollama + Qwen3:4B (Summarization)

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Start Ollama service (run in background or separate terminal)
ollama serve &

# Pull Qwen3:4B model (~2.5GB)
ollama pull qwen3:4b

# Verify
ollama list
```

### Step 5: Setup VieNeu-TTS Model

The model auto-downloads on first run, or manually:

```bash
# Option A: Auto-download (slower first run)
pip install vieneu

# Option B: Pre-download to local (faster)
cd news-2-content
git lfs install
git clone https://huggingface.co/pnnbao-ump/VieNeu-TTS models/VieNeu-TTS
```

### Step 6: Setup content-2-videos (Node.js)

```bash
cd content-2-videos

# Install Node dependencies
npm install

# Build Whisper.cpp for subtitle generation
node sub.mjs --setup
```

Whisper.cpp will auto-download and compile on first subtitle generation. The default model is `large-v3` (~2.9GB) configured for Vietnamese.

### Step 7: Verify GPU Setup

```bash
# Check CUDA for Python
python -c "import torch; print(f'CUDA: {torch.cuda.is_available()}, GPU: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else \"None\"}')"
```

If CUDA is not available, reinstall PyTorch with CUDA:
```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

---

## Quick Start

### Generate Audio from News

```bash
cd news-2-content
source venv/bin/activate

# Basic usage
python src/main.py --url "https://vnexpress.net/your-article"

# With custom voice and output directory
python src/main.py --url "https://vnexpress.net/..." --voice huong --dir ../content-2-videos/public/main/my_video/audio
```

### Generate Subtitles

```bash
cd content-2-videos

# Generate subtitles for audio file
node sub.mjs public/main/my_video/audio/output.mp3
```

### Render Video

```bash
cd content-2-videos

# Preview in browser
npm run dev

# Render final video
./render.sh my_video template_1 output.mp4
```

---

## Project Structure

```
news-to-videos/
├── news-2-content/              # Audio generation pipeline
│   ├── src/
│   │   ├── core.py              # News crawling & summarization
│   │   ├── media.py             # TTS audio generation
│   │   └── main.py              # CLI entry point
│   ├── models/                  # ML models (VieNeu-TTS, voice models)
│   ├── output/                  # Generated audio files
│   └── requirements.txt
│
├── content-2-videos/            # Video rendering pipeline
│   ├── src/
│   │   ├── Root.tsx             # Remotion composition
│   │   ├── MainVideo/           # Main video component
│   │   ├── Intro/               # Intro animation
│   │   └── CaptionedVideo/      # Subtitle overlay
│   ├── public/
│   │   ├── main/                # Video content (audio, images, b-roll)
│   │   └── templates/           # Video templates
│   ├── whisper.cpp/             # Whisper for subtitle generation
│   ├── sub.mjs                  # Subtitle generation script
│   ├── render.sh                # Video render script
│   └── package.json
│
└── n8n-workflow/                # Automation workflow (optional)
    └── workflow-news-2-videos.json
```

---

## Configuration

### Whisper Model (Subtitles)

Edit `content-2-videos/whisper-config.mjs`:

```javascript
export const WHISPER_MODEL = "large-v3";  // Options: tiny, base, small, medium, large-v3
export const WHISPER_LANG = "vi";         // Language code
```

### Available TTS Voices

| Voice | Gender | Region |
|-------|--------|--------|
| binh, tuyen | Male | Northern |
| nguyen, son, vinh | Male | Southern |
| huong, ly, ngoc | Female | Northern |
| doan, dung | Female | Southern |

### Video Templates

Templates are in `content-2-videos/public/templates/`:
- `template_1`: Default TikTok style
- `template_2`: Alternative style

---

## n8n Workflow (Optional)

For automated batch processing, import `n8n-workflow/workflow-news-2-videos.json` into n8n.

The workflow:
1. Reads tasks from Google Sheets
2. Generates audio with summarization
3. Creates subtitles
4. Renders final video
5. Updates status in sheet

---

## CLI Reference

### news-2-content

```bash
python src/main.py [OPTIONS]

Options:
  --url TEXT          News article URL (VnExpress, TienPhong)
  --voice TEXT        Voice name (default: binh)
  --summarization     Enable summarization: yes/no (default: yes)
  --audio PATH        Use existing audio file (skip TTS)
  --output TEXT       Output filename (without extension)
  --dir PATH          Output directory (default: output)
```

### content-2-videos

```bash
# Generate subtitles
node sub.mjs <audio-file-or-folder>

# Render video
./render.sh <video_folder> <template_id> <output_file>

# Preview
npm run dev
```

---

## Troubleshooting

### Ollama connection failed
```bash
# Start Ollama service
ollama serve

# Check status
curl http://localhost:11434/api/tags
```

### Whisper.cpp build fails
```bash
# Install build dependencies
sudo apt install -y build-essential cmake

# Rebuild
cd content-2-videos
rm -rf whisper.cpp
node sub.mjs --setup
```

### TTS slow / No GPU
```bash
# Reinstall PyTorch with CUDA
pip uninstall torch
pip install torch --index-url https://download.pytorch.org/whl/cu118
```

### espeak-ng not found
```bash
sudo apt install espeak-ng
```

---

## Performance

| Step | Time |
|------|------|
| News crawling | ~2-5s |
| Summarization (Qwen3:4B) | ~10-30s |
| TTS generation | ~5-10s |
| Subtitle generation | ~30-60s |
| Video render | ~1-3min |
| **Total** | ~2-5min per video |

---

## License

- **news-2-content**: Open source - Free for commercial use
- **content-2-videos**: Remotion license applies - [Read terms](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md)

---

## Credits

- Summarization: Qwen3:4B via Ollama
- TTS: VieNeu-TTS
- Subtitles: Whisper.cpp
- Video: Remotion

Made with ❤️ for Vietnamese content creators
