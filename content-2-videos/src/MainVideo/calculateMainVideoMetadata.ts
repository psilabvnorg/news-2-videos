import type { CalculateMetadataFunction } from 'remotion';
import { staticFile } from 'remotion';
import { getAudioDuration } from '../utils/getAudioDuration';
import {
  getSliderImagesForContentDirectory,
  getFirstAudioFromDirectory,
  getCaptionFileForAudio,
} from '../utils/getStaticAssets';
import { normalizeCaptions } from '../utils/normalizeCaptions';
import type { MainVideoProps } from './index';

/**
 * Load a JSON config file from {contentDirectory}/config/{filename}
 * Returns the parsed config or null if not found
 */
const loadJsonConfig = async (contentDirectory: string, filename: string): Promise<Record<string, unknown> | null> => {
  try {
    const configPath = staticFile(`${contentDirectory}/config/${filename}`);
    const response = await fetch(configPath + `?t=${Date.now()}`);
    if (response.ok) {
      const config = await response.json();
      console.log(`Loaded config from: ${configPath}`);
      return config;
    }
  } catch (error) {
    console.warn(`No ${filename} found, using defaults`);
  }
  return null;
};

export const calculateMainVideoMetadata: CalculateMetadataFunction<
  MainVideoProps
> = async ({ props }) => {
  const fps = 30;

  console.log(`\n========== METADATA CALCULATION ==========`);
  console.log(`Content Directory: ${props.contentDirectory}`);

  // Load video config (backgroundMode, introDurationInFrames, imageDurationInFrames)
  const videoConfig = await loadJsonConfig(props.contentDirectory, 'video-config.json');
  const backgroundMode = (videoConfig?.backgroundMode as boolean) ?? props.backgroundMode ?? false;
  const introDurationInFrames = (videoConfig?.introDurationInFrames as number) ?? props.introDurationInFrames;
  const imageDurationInFrames = (videoConfig?.imageDurationInFrames as number) ?? props.imageDurationInFrames;

  // Load intro config from JSON file (overrides introProps defaults)
  const introConfig = await loadJsonConfig(props.contentDirectory, 'intro-config.json');
  if (introConfig?.backgroundImage && !(introConfig.backgroundImage as string).startsWith('http') && !(introConfig.backgroundImage as string).startsWith('/')) {
    introConfig.backgroundImage = staticFile(introConfig.backgroundImage as string);
  }
  const introProps = introConfig
    ? { ...props.introProps, ...introConfig }
    : props.introProps;

  // Dynamically load assets from contentDirectory if not provided
  const images = (!props.images || props.images.length === 0)
    ? getSliderImagesForContentDirectory(props.contentDirectory)
    : props.images;

  // Load audio from contentDirectory/audio subfolder if not provided
  const audioSrc =
    props.audioSrc || getFirstAudioFromDirectory(`${props.contentDirectory}/audio`);

  console.log(`Audio Source: ${audioSrc}`);

  // Load captions - use the helper to find matching JSON file
  let captionsSource: unknown = props.captions;
  
  if ((!Array.isArray(captionsSource) || captionsSource.length === 0) && audioSrc) {
    try {
      const audioDir = `${props.contentDirectory}/audio`;
      const captionPath = getCaptionFileForAudio(audioSrc, audioDir);
      
      if (captionPath) {
        const response = await fetch(captionPath + `?t=${Date.now()}`);
        if (response.ok) {
          captionsSource = await response.json();
          console.log(`Loaded captions from: ${captionPath}`);
        }
      }
    } catch (error) {
      console.warn(`Could not load captions:`, error);
      captionsSource = [];
    }
  }

  const captions = normalizeCaptions(captionsSource);
  console.log(`==========================================\n`);

  // Get audio duration (default to 0 if no audio)
  const audioDuration = audioSrc ? await getAudioDuration(audioSrc) : 0;

  // Calculate total duration in seconds
  const introDurationInSeconds = introDurationInFrames / fps;
  const slideshowDurationSec = audioDuration > 0 ? audioDuration : images.length * 5;
  const contentDurationSec = backgroundMode
    ? slideshowDurationSec
    : introDurationInSeconds + slideshowDurationSec;

  // Use the longer of audio duration or content duration
  const totalDuration = Math.max(audioDuration, contentDurationSec);

  return {
    fps,
    durationInFrames: Math.ceil(totalDuration * fps),
    width: 1080,
    height: 1920,
    props: {
      ...props,
      introProps,
      backgroundMode,
      introDurationInFrames,
      images,
      videos: [],
      audioSrc: audioSrc || undefined,
      videoDurations: [],
      captions,
      imageDurationInFrames,
    },
  };
};
