import { AbsoluteFill, Audio, Sequence, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { IntroOverlay, introSchema } from '../Intro';
import { ImageSlide } from '../components/ImageSlide';
import { VideoSlide } from '../components/VideoSlide';
import { CaptionDisplay } from '../components/CaptionDisplay';
import type { Caption } from '@remotion/captions';
import { getFirstAudioFromDirectory } from '../utils/getStaticAssets';

export const mainVideoSchema = z.object({
  // Intro props
  introProps: introSchema,

  // Content directory for dynamic asset loading (e.g., 'main/video_1')
  contentDirectory: z.string().describe('Directory path for content assets (e.g., main/video_1)'),

  // Image paths (auto-loaded from contentDirectory if empty)
  images: z.array(z.string()).default([]).describe('Array of image paths'),

  // Video paths and durations (auto-loaded from contentDirectory if empty)
  videos: z.array(z.string()).default([]).describe('Array of video paths (MP4)'),
  videoDurations: z.array(z.number()).default([]).describe('Array of video durations in frames'),

  // Audio path (auto-loaded from contentDirectory/audio if empty)
  audioSrc: z.string().optional().describe('Audio file path'),

  // Captions
  captions: z.array(z.any()).optional().describe('Optional captions array'),

  // Timing
  // When introDurationInFrames is 0, intro overlay plays for entire video (background mode)
  introDurationInFrames: z.number().describe('Intro duration in frames (0 = intro plays entire video as overlay)'),
  imageDurationInFrames: z.number().describe('Duration per image in frames'),
});

export type MainVideoProps = z.infer<typeof mainVideoSchema>;

export const MainVideo: React.FC<MainVideoProps> = ({
  introProps,
  images,
  videos,
  videoDurations,
  audioSrc,
  captions,
  introDurationInFrames,
  imageDurationInFrames,
}) => {
  const { durationInFrames: totalDuration } = useVideoConfig();

  // Determine if intro should play for entire video (background mode)
  const isBackgroundMode = introDurationInFrames === 0;
  const effectiveIntroDuration = isBackgroundMode ? totalDuration : introDurationInFrames;

  // Calculate frame positions for media content
  let currentFrame = 0;

  // In background mode, media starts from frame 0
  // In normal mode, media starts after intro
  const mediaStartFrame = isBackgroundMode ? 0 : introDurationInFrames;
  currentFrame = mediaStartFrame;

  // Image sequences
  const imageSequences = images.map((src) => {
    const from = currentFrame;
    currentFrame += imageDurationInFrames;
    return { src, from, durationInFrames: imageDurationInFrames };
  });

  // Video sequences
  const videoSequences = videos.map((src, index) => {
    const from = currentFrame;
    const durationInFrames = videoDurations[index];
    currentFrame += durationInFrames;
    return { src, from, durationInFrames };
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* ========== LAYER 3 (BOTTOM): Images and Videos ========== */}
      <AbsoluteFill style={{ zIndex: 1 }}>
        {/* Image Sequences with Pan and Zoom */}
        {imageSequences.map((seq, index) => (
          <Sequence
            key={`image-${index}`}
            from={seq.from}
            durationInFrames={seq.durationInFrames}
          >
            <ImageSlide src={seq.src} durationInFrames={seq.durationInFrames} isBackgroundMode={isBackgroundMode} />
          </Sequence>
        ))}

        {/* Video Sequences */}
        {videoSequences.map((seq, index) => (
          <Sequence
            key={`video-${index}`}
            from={seq.from}
            durationInFrames={seq.durationInFrames}
          >
            <VideoSlide src={seq.src} durationInFrames={seq.durationInFrames} isBackgroundMode={isBackgroundMode} />
          </Sequence>
        ))}
      </AbsoluteFill>

      {/* ========== LAYER 2 (MIDDLE): Background Overlay from Intro ========== */}
      {/* ========== LAYER 1 (TOP): Text, Icons, Logo from Intro ========== */}
      <Sequence
        from={0}
        durationInFrames={effectiveIntroDuration}
        layout="none"
      >
        <IntroOverlay {...introProps} isBackgroundMode={isBackgroundMode} />
      </Sequence>

      {/* ========== AUDIO LAYERS ========== */}
      {/* Voice/Narration Audio - Loops to play for entire video */}
      {audioSrc && <Audio src={audioSrc} loop />}

      {/* Background Music - Loops to play for entire video */}
      {(() => {
        const templateId = introProps.templateId || 'template_1';
        const bgMusic = getFirstAudioFromDirectory(`templates/${templateId}/sound`);
        if (bgMusic) {
          return <Audio src={bgMusic} loop volume={() => 0.3} />;
        }
        return null;
      })()}

      {/* ========== CAPTIONS OVERLAY (TOP-MOST) ========== */}
      {captions && captions.length > 0 && (
        <AbsoluteFill style={{ zIndex: 100 }}>
          <CaptionDisplay
            captions={captions as Caption[]}
            introDurationInFrames={isBackgroundMode ? 0 : introDurationInFrames}
          />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
