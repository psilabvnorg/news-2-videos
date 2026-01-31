import type { CalculateMetadataFunction } from 'remotion';
import { staticFile } from 'remotion';
import { getAudioDuration } from '../utils/getAudioDuration';
import { getVideoDuration } from '../utils/getVideoDuration';
import {
  getImagesFromDirectory,
  getVideosFromDirectory,
  getFirstAudioFromDirectory,
  getCaptionFileForAudio,
} from '../utils/getStaticAssets';
import type { MainVideoProps } from './index';

export const calculateMainVideoMetadata: CalculateMetadataFunction<
  MainVideoProps
> = async ({ props }) => {
  const fps = 30;

  console.log(`\n========== METADATA CALCULATION ==========`);
  console.log(`Content Directory: ${props.contentDirectory}`);

  // Dynamically load assets from contentDirectory if not provided
  const images = (!props.images || props.images.length === 0)
    ? getImagesFromDirectory(props.contentDirectory)
    : props.images;

  const videos = (!props.videos || props.videos.length === 0)
    ? getVideosFromDirectory(props.contentDirectory)
    : props.videos;

  // Load audio from contentDirectory/audio subfolder if not provided
  const audioSrc =
    props.audioSrc || getFirstAudioFromDirectory(`${props.contentDirectory}/audio`);

  console.log(`Audio Source: ${audioSrc}`);

  // Load captions - use the helper to find matching JSON file
  let captions = props.captions;
  
  if ((!captions || captions.length === 0) && audioSrc) {
    try {
      const audioDir = `${props.contentDirectory}/audio`;
      const captionPath = getCaptionFileForAudio(audioSrc, audioDir);
      
      if (captionPath) {
        const response = await fetch(captionPath + `?t=${Date.now()}`);
        if (response.ok) {
          captions = await response.json();
          console.log(`Loaded ${captions?.length || 0} captions from: ${captionPath}`);
        }
      }
    } catch (error) {
      console.warn(`Could not load captions:`, error);
      captions = [];
    }
  }
  console.log(`==========================================\n`);

  // Get audio duration (default to 0 if no audio)
  const audioDuration = audioSrc ? await getAudioDuration(audioSrc) : 0;

  // Get individual video durations
  const hasValidDurations = props.videoDurations && props.videoDurations.some(d => d > 0);
  const videoDurations: number[] = hasValidDurations ? props.videoDurations : [];
  let totalVideoDuration = 0;

  if (hasValidDurations) {
    totalVideoDuration = videoDurations.reduce((sum, frames) => sum + (frames / fps), 0);
  } else {
    for (const videoSrc of videos) {
      const duration = await getVideoDuration(videoSrc);
      videoDurations.push(Math.ceil(duration * fps));
      totalVideoDuration += duration;
    }
  }

  // Determine if background mode (intro plays entire video)
  const isBackgroundMode = props.introDurationInFrames === 0;

  // Calculate total duration in seconds
  const introDurationInSeconds = props.introDurationInFrames / fps;
  const imagesTotalDurationInSeconds = (props.imageDurationInFrames * images.length) / fps;

  let contentDuration: number;

  if (isBackgroundMode) {
    // In background mode, media plays from start
    // Total duration = images + videos (or audio length if longer)
    contentDuration = imagesTotalDurationInSeconds + totalVideoDuration;
  } else {
    // Normal mode: intro + images + videos
    contentDuration = introDurationInSeconds + imagesTotalDurationInSeconds + totalVideoDuration;
  }

  // Use the longer of audio duration or content duration
  const totalDuration = Math.max(audioDuration, contentDuration);

  return {
    fps,
    durationInFrames: Math.ceil(totalDuration * fps),
    width: 1080,
    height: 1920,
    props: {
      ...props,
      images,
      videos,
      audioSrc: audioSrc || undefined,
      videoDurations,
      captions,
    },
  };
};
