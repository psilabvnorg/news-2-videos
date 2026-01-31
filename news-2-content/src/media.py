"""
Media Module - TTS audio generation.

This module handles voice synthesis for Vietnamese text-to-speech.
"""
import os
import subprocess
import torch
import soundfile as sf


class MediaGenerator:
    '''
    Media generation class for TTS audio.
    
    Responsibilities:
    - Generate Vietnamese voice-over using VieNeu-TTS
    '''
    
    def __init__(self, voice: str = "binh"):
        '''
        Initialize media generator with voice settings.
        
        Args:
            voice: Voice name for TTS (binh, tuyen, nguyen, etc.)
        '''
        self.voice_name = voice
        self.tts = None
        self.current_voice = None
        self._init_tts()
        print(f"✓ MediaGenerator initialized (Voice: {voice})")
    
    def _init_tts(self):
        '''Initialize VieNeu-TTS for Vietnamese speech synthesis.'''
        try:
            from vieneu import Vieneu
            has_cuda = torch.cuda.is_available()
            device = "cuda" if has_cuda else "cpu"
            local_path = "models/VieNeu-TTS"
            
            if has_cuda and os.path.exists(local_path):
                self.tts = Vieneu(backbone_repo=local_path, backbone_device=device, codec_device=device)
            elif has_cuda:
                self.tts = Vieneu(backbone_repo="pnnbao-ump/VieNeu-TTS-0.3B", backbone_device=device, codec_device=device)
            else:
                self.tts = Vieneu(backbone_repo="pnnbao-ump/VieNeu-TTS-0.3B-q8-gguf")
            
            voices = self.tts.list_preset_voices()
            available = [v[1] if isinstance(v, tuple) else v for v in voices]
            voice_map = {"binh": "Binh", "tuyen": "Tuyen", "nguyen": "Nguyen", "son": "Son", 
                        "vinh": "Vinh", "huong": "Huong", "ly": "Ly", "ngoc": "Ngoc", 
                        "doan": "Doan", "dung": "Dung"}
            target = voice_map.get(self.voice_name.lower(), self.voice_name.capitalize())
            
            if target in available:
                self.current_voice = self.tts.get_preset_voice(target)
            else:
                for v in ["Binh", "Tuyen"]:
                    if v in available:
                        self.current_voice = self.tts.get_preset_voice(v)
                        break
            
            print(f"   ✓ VieNeu-TTS ready ({device.upper()} mode)")
        except Exception as e:
            print(f"   ✗ VieNeu-TTS init failed: {e}")
            self.tts = None
    
    def generate_audio(self, text: str, output_path: str) -> str:
        '''
        Generate speech audio from text.
        
        Args:
            text: Text to synthesize
            output_path: Path to save audio file
            
        Returns:
            Path to generated audio file
        '''
        if not self.tts:
            raise RuntimeError("VieNeu-TTS not initialized")
        
        clean_text = text.replace("... ", ". ").replace(" ... ", ". ")
        audio = self.tts.infer(text=clean_text, voice=self.current_voice, temperature=0.8, top_k=50)
        
        if output_path.endswith('.mp3'):
            temp_wav = output_path.replace('.mp3', '_temp.wav')
            sf.write(temp_wav, audio, 24000)
            try:
                subprocess.run(['ffmpeg', '-i', temp_wav, '-codec:a', 'libmp3lame', '-qscale:a', '2', '-y', output_path],
                             capture_output=True, check=True)
                os.remove(temp_wav)
            except:
                os.rename(temp_wav, output_path)
        else:
            sf.write(output_path, audio, 24000)
        
        print(f"✓ Audio generated: {output_path}")
        return output_path
    
    def get_audio_duration(self, audio_path: str) -> float:
        '''Get audio duration in seconds.'''
        try:
            data, rate = sf.read(audio_path)
            return len(data) / rate
        except:
            result = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
                                   '-of', 'default=noprint_wrappers=1:nokey=1', audio_path],
                                  capture_output=True, text=True)
            return float(result.stdout.strip())
