"""
Main Orchestrator - TikTok News Audio Generator.

This is the entry point that coordinates the audio generation pipeline.
"""
import os
import sys
import argparse
from datetime import datetime
from core import NewsProcessor
from media import MediaGenerator


class TikTokNewsGenerator:
    '''
    Main orchestrator for TikTok news audio generation.
    
    Coordinates the pipeline:
    1. Crawl article from news site
    2. Summarize and refine content
    3. Generate voice-over audio
    4. Export metadata and summaries
    '''
    
    def __init__(self, voice: str = "binh", summarization: bool = True, custom_audio: str = None, output_dir: str = "output"):
        '''
        Initialize the audio generator.
        
        Args:
            voice: Voice name for TTS
            summarization: Whether to summarize content
            custom_audio: Path to custom audio file (skips TTS generation)
            output_dir: Base directory for all outputs
        '''
        self.summarization = summarization
        self.custom_audio = custom_audio
        self.output_dir = output_dir
        
        print("\n" + "="*60)
        print("Initializing TikTok News Audio Generator...")
        print("="*60)
        
        self.processor = NewsProcessor()
        self.media = MediaGenerator(voice=voice)
        
        if custom_audio:
            if os.path.exists(custom_audio):
                print(f"✓ Using custom audio: {custom_audio}")
            else:
                print(f"⚠ Warning: Custom audio file not found: {custom_audio}")
        
        print("✓ All modules initialized!\n")
    
    def generate_audio(self, news_url: str, output_name: str = None) -> str:
        '''
        Complete pipeline: URL → Audio file.
        
        Args:
            news_url: URL of news article
            output_name: Output filename (without extension)
            
        Returns:
            Path to generated audio file
        '''
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        if not output_name:
            output_name = f"tiktok_news_{timestamp}"
        
        print(f"\n{'='*60}")
        print(f"GENERATING AUDIO")
        print(f"{'='*60}\n")
        
        # Step 1: Crawl article
        print("📰 Step 1: Crawling article...")
        article = self.processor.crawl_article(news_url)
        print(f"   ✓ Title: {article['title'][:60]}...")
        
        # Step 2: Summarize content (or use original)
        print("\n📝 Step 2: Processing content...")
        if self.summarization:
            body = self.processor.summarize(article)
            print(f"   ✓ Summarized: {len(body.split())} words")
        else:
            body = f"{article.get('description', '')} {article.get('content', '')}".strip()
            print(f"   ✓ Using original: {len(body.split())} words")
        
        # Step 3: Correct and refine text
        print("\n🔧 Step 3: Correcting and refining text...")
        body = self.processor.correct_text(body)
        body = self.processor.refine_text(body)
        body = self._final_cleanup(body)
        print(f"   ✓ Final body: {len(body.split())} words")
        
        # Step 4: Add intro and outro
        print("\n📌 Step 4: Adding intro and outro...")
        intro = f"Tin nóng: {article['title'][:50]}..."
        outro = "Theo dõi và follow kênh Tiktok của PSI để cập nhật thêm tin tức!"
        full_script = f"{intro}... {body} ... {outro}"
        print(f"   ✓ Full script: {len(full_script.split())} words")
        
        # Step 5: Generate voice-over or use custom audio
        print("\n🎤 Step 5: Processing audio...")
        audio_path = os.path.join(self.output_dir, f"{output_name}.mp3")
        os.makedirs(self.output_dir, exist_ok=True)
        
        if self.custom_audio and os.path.exists(self.custom_audio):
            # Use custom audio file
            import shutil
            shutil.copy2(self.custom_audio, audio_path)
            print(f"   ✓ Using custom audio: {self.custom_audio}")
        else:
            # Generate TTS audio
            self.media.generate_audio(full_script, audio_path)
            print(f"   ✓ Generated TTS audio")
        
        audio_duration = self.media.get_audio_duration(audio_path)
        print(f"   ✓ Audio duration: {audio_duration:.1f}s")
        
        print(f"\n{'='*60}")
        print(f"✅ AUDIO GENERATION COMPLETE!")
        print(f"{'='*60}")
        print(f"Audio:    {audio_path}")
        print(f"Duration: {audio_duration:.1f}s")
        print(f"{'='*60}\n")
        
        return audio_path
    
    def _final_cleanup(self, text: str) -> str:
        '''Final text cleanup - always runs.'''
        import re
        while re.search(r'(\d+)\.\s*(\d{3})', text):
            text = re.sub(r'(\d+)\.\s*(\d{3})', r'\1\2', text)
        text = re.sub(r',([^\s])', r', \1', text)
        text = re.sub(r'([nN])([kK]hởi)', r'\1 \2', text)
        text = re.sub(r'(án|ến|ông|ình|ất|ệt|ực)([a-zàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]{2,})', r'\1 \2', text)
        text = re.sub(r'([a-zàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ])([A-ZÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴĐ])', r'\1 \2', text)
        text = re.sub(r'\b(\d{1,2})/(\d{1,2})/(\d{4})\b', lambda m: f"{'mùng' if int(m.group(1))<=10 else 'ngày'} {m.group(1)} tháng {m.group(2)} năm {m.group(3)}", text)
        text = re.sub(r'\b(\d{1,2})/(\d{1,2})\b', lambda m: f"{'mùng' if int(m.group(1))<=10 else 'ngày'} {m.group(1)} tháng {m.group(2)}", text)
        text = re.sub(r'\s+', ' ', text).strip()
        if text and text[-1] not in '.!?':
            last = max(text.rfind('.'), text.rfind('!'), text.rfind('?'))
            text = text[:last+1] if last > len(text)*0.7 else text + '.'
        return text


def main():
    '''CLI entry point.'''
    print("\n" + "="*60)
    print("TikTok News Audio Generator")
    print("="*60 + "\n")
    
    parser = argparse.ArgumentParser(description='TikTok News Audio Generator')
    parser.add_argument('--url', type=str, help='News article URL')
    parser.add_argument('--output', type=str, help='Output name (without extension)')
    parser.add_argument('--dir', type=str, default='output', help='Output directory for generated files')
    parser.add_argument('--voice', type=str, default='binh', help='Voice (binh, tuyen, nguyen, son, vinh, huong, ly, ngoc, doan, dung)')
    parser.add_argument('--summarization', type=str, default='yes', choices=['yes', 'no'],
                       help='Enable/disable content summarization')
    parser.add_argument('--audio', type=str, help='Path to custom audio file (skips TTS generation)')
    args = parser.parse_args()
    
    print("Available voices:")
    print("  Male Northern:   binh, tuyen")
    print("  Male Southern:   nguyen, son, vinh")
    print("  Female Northern: huong, ly, ngoc")
    print("  Female Southern: doan, dung\n")
    
    news_url = args.url or input("Enter news article URL: ").strip()
    if not news_url:
        print("Error: No URL provided")
        return
    
    generator = TikTokNewsGenerator(
        voice=args.voice,
        summarization=(args.summarization.lower() == 'yes'),
        custom_audio=args.audio,
        output_dir=args.dir
    )
    
    try:
        audio_path = generator.generate_audio(news_url, output_name=args.output)
        print(f"\n🎉 Success! Audio: {audio_path}")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
