import type { CalculateMetadataFunction } from 'remotion';
import { getAudioDuration } from '../utils/getAudioDuration';
import {
  getSliderImagesForContentDirectory,
  getFirstAudioFromDirectory,
  getCaptionFileForAudio,
} from '../utils/getStaticAssets';
import { normalizeCaptions } from '../utils/normalizeCaptions';
import type { MainVideoProps } from './index';

export const calculateMainVideoMetadata: CalculateMetadataFunction<
  MainVideoProps
> = async ({ props }) => {
  const fps = 30;
  const slideDurationInFrames = fps * 5;

  console.log(`\n========== METADATA CALCULATION ==========`);
  console.log(`Content Directory: ${props.contentDirectory}`);

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

  // Determine if background mode (intro plays entire video)
  const isBackgroundMode = props.introDurationInFrames === 0;

  // Calculate total duration in seconds
  const introDurationInSeconds = props.introDurationInFrames / fps;
  const slideshowDurationSec = audioDuration > 0 ? audioDuration : images.length * 5;
  const contentDurationSec = isBackgroundMode
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
      images,
      videos: [],
      audioSrc: audioSrc || undefined,
      videoDurations: [],
      captions,
      imageDurationInFrames: slideDurationInFrames,
    },
  };
};
