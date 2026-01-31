# TikTok News Audio Generator 🎤

Automated pipeline to convert Vietnamese news articles into audio content with AI voice-over and text summaries.

## Table of Contents
- [Features](#features)
- [System Requirements](#system-requirements)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Features

- 📰 **Auto-crawl** news from VnExpress, Tien Phong
- 🤖 **AI Summarization** using Qwen3:4B via Ollama (chunked processing for long articles)
- 🎤 **GPU-accelerated TTS** with VieNeu-TTS (multiple Vietnamese voices)

---

## System Requirements

- Python 3.10+
- NVIDIA GPU with CUDA support (RTX 5070 Ti or similar recommended)
- ~10GB disk space for models
- Ubuntu/Linux (tested on Ubuntu 22.04)

---

## Installation

### 1. Clone and Setup Environment

```bash
git clone <repo>
cd ai-content-tiktok

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

### 2. Install System Dependencies

```bash
# FFmpeg for audio processing
sudo apt install ffmpeg

# espeak-ng for Vietnamese phonemization (required by VieNeu-TTS)
sudo apt install espeak-ng
```

### 3. Install Ollama and Qwen3:4B (Summarization)

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Start Ollama service
ollama serve

# Pull Qwen3:4B model (~2.5GB)
ollama pull qwen3:4b
```

Verify installation:
```bash
ollama list
# Should show: qwen3:4b
```

### 4. Install VieNeu-TTS Model (Text-to-Speech)

```bash
# Install vieneu package
pip install vieneu

# The model will auto-download on first run, or manually download:
python -c "
from vieneu import Vieneu
tts = Vieneu(backbone_repo='pnnbao-ump/VieNeu-TTS-0.3B')
print('VieNeu-TTS downloaded successfully')
"
```

For local model (faster loading):
```bash
# Clone to models directory
git lfs install
git clone https://huggingface.co/pnnbao-ump/VieNeu-TTS models/VieNeu-TTS
```

### 5. Verify GPU Setup

```bash
python -c "
import torch
print(f'CUDA available: {torch.cuda.is_available()}')
print(f'GPU: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else \"None\"}')
"
```

---

## Quick Start

```bash
# Basic usage
python src/main.py --url "https://vnexpress.net/..."

# With custom voice
python src/main.py --url "https://vnexpress.net/..." --voice huong

# Skip summarization (use original article text)
python src/main.py --url "https://vnexpress.net/..." --summarization no
```

### CLI Arguments

| Argument | Description | Default |
|----------|-------------|---------|
| `--url` | News article URL | (prompted) |
| `--voice` | Voice name (see table below) | binh |
| `--summarization` | Enable/disable content summarization: `yes` or `no` | yes |
| `--audio` | Path to custom audio file (skips TTS generation) | - |
| `--output` | Output audio name (without extension) | auto-generated |
| `--dir` | Output directory for generated files | output |

### Available Voices

| Voice | Gender | Region |
|-------|--------|--------|
| binh, tuyen | Male | Northern |
| nguyen, son, vinh | Male | Southern |
| huong, ly, ngoc | Female | Northern |
| doan, dung | Female | Southern |

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    TikTokNewsGenerator                      │
│                   (Main Orchestrator)                       │
└────────────┬────────────────────────────────┬───────────────┘
             │                                │
             ▼                                ▼
    ┌────────────────┐              ┌────────────────┐
    │ NewsProcessor  │              │ MediaGenerator │
    │   (core.py)    │              │   (media.py)   │
    └────────────────┘              └────────────────┘
             │                                │
             ├─ Crawling                      └─ TTS (VieNeu)
             ├─ Summarization (Qwen3:4B)
             ├─ Text Correction
             └─ Text Refinement
```

### Processing Pipeline

```
1. Crawl Article → 2. Chunk & Summarize (Qwen3:4B) → 3. Refine Text →
4. Final Cleanup → 5. Generate TTS (GPU) → 6. Export Summaries
```

---

## Project Structure

```
ai-content-tiktok/
├── src/                          # Main source code (3 core modules)
│   ├── __init__.py               # Package marker
│   ├── core.py                   # NewsProcessor - Crawling, summarization, text processing
│   ├── media.py                  # MediaGenerator - TTS audio generation
│   └── main.py                   # TikTokNewsGenerator - Main orchestrator
│
├── assets/                       # Static assets
│   ├── logo*.png                 # Logo variants
│   └── icon/                     # Social media icons
│
├── models/                       # ML models (optional local storage)
│   ├── VieNeu-TTS/               # Vietnamese TTS model
│   ├── voice_model/              # ONNX voice models
│   └── ...                       # Other models
│
├── output/                       # Generated outputs
│   ├── audio/                    # Generated audio files
│   └── temp/                     # Temporary files (SRT, etc.)
│
├── requirements.txt              # Python dependencies
├── run.sh                        # Quick run script
└── README.md                     # This file
```

### Module Responsibilities

#### `src/core.py` - NewsProcessor
**Purpose:** News article processing and text manipulation

**Key Methods:**
- `crawl_article(url)` - Web scraping from VnExpress/TienPhong
- `summarize(article, target_words)` - LLM-based summarization with chunking
- `correct_text(text)` - Vietnamese spelling/diacritics correction
- `refine_text(text)` - Grammar and style refinement

#### `src/media.py` - MediaGenerator
**Purpose:** Audio generation

**Key Methods:**
- `generate_audio(text, output_path)` - TTS synthesis

#### `src/main.py` - TikTokNewsGenerator
**Purpose:** Pipeline orchestration and CLI

**Key Methods:**
- `generate_audio(news_url, output_name)` - Complete pipeline

---

## Configuration

### Model Summary

| Model | Purpose | Size | Location |
|-------|---------|------|----------|
| Qwen3:4B | News summarization | ~2.5GB | Ollama (~/.ollama/models) |
| VieNeu-TTS-0.3B | Vietnamese TTS | ~1.2GB | HuggingFace cache or models/VieNeu-TTS |

### Text Processing

The summarizer automatically handles:
- **Numbers**: `1.890` → `1890` (Vietnamese thousand separator)
- **Dates**: `8/1` → `mùng 8 tháng 1`
- **Stuck words**: `chứng khoánkhởi` → `chứng khoán khởi`
- **Incomplete sentences**: Ensures proper ending punctuation

---

## Troubleshooting

### Ollama connection failed
```bash
# Start Ollama service
ollama serve

# Check if running
curl http://localhost:11434/api/tags
```

### TTS too slow / No GPU
```bash
# Check CUDA
python -c "import torch; print(torch.cuda.is_available())"

# If False, reinstall PyTorch with CUDA
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

### espeak-ng not found
```bash
sudo apt install espeak-ng
```

### Summary too short or cut off
- The chunked summarizer splits long articles into parts
- Each chunk is summarized separately then combined
- Target is ~350 words (~60-90 seconds of speech)

---

## Performance

### Processing Time
- Crawling: ~2-5 seconds
- Summarization: ~10-30 seconds (depends on article length)
- TTS: ~5-10 seconds
- **Total:** ~20-45 seconds per audio

### GPU Usage
- **VieNeu-TTS:** Primary GPU user (CUDA required for best quality)
- **Text Correction:** GPU-accelerated (ProtonX model)

---

## Output Specifications

- **Format**: WAV/MP3 audio files
- **Duration**: ~60-90 seconds
- **Quality**: High-quality Vietnamese TTS

---

## License

Open source - Free for commercial use

## Credits

- **Summarization**: Qwen3:4B via Ollama
- **TTS**: VieNeu-TTS (GPU-accelerated Vietnamese)

---

Made with ❤️ for Vietnamese content creators
