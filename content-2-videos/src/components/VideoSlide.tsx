import { AbsoluteFill, interpolate, useCurrentFrame, OffthreadVideo } from 'remotion';

interface VideoSlideProps {
  src: string;
  durationInFrames: number;
  isBackgroundMode?: boolean; // When true, render in top half only
}

export const VideoSlide: React.FC<VideoSlideProps> = ({ src, durationInFrames, isBackgroundMode = false }) => {
  const frame = useCurrentFrame();

  // Linear pan animation - constant speed from left to right
  const panX = interpolate(
    frame,
    [0, durationInFrames],
    [-23, 0.5],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  // Background mode: render in top half only
  if (isBackgroundMode) {
    return (
      <AbsoluteFill style={{ backgroundColor: '#000' }}>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '50%',
            overflow: 'hidden',
          }}
        >
          {/* Blurred background */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              overflow: 'hidden',
            }}
          >
            <OffthreadVideo
              src={src}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'blur(20px)',
                transform: 'scale(1.1)',
              }}
              muted
            />
          </div>

          {/* Foreground with pan */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '150%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden',
            }}
          >
            <OffthreadVideo
              src={src}
              style={{
                width: '130%',
                height: 'auto',
                objectFit: 'contain',
                transform: `translateX(${panX}%)`,
                transformOrigin: 'center center',
              }}
              muted
            />
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  // Normal mode: full screen
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* Blurred background layer */}
      <AbsoluteFill>
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
          }}
        >
          <OffthreadVideo
            src={src}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'blur(20px)',
              transform: 'scale(1.1)',
            }}
            muted
          />
        </div>
      </AbsoluteFill>

      {/* Foreground layer with pan effect */}
      <AbsoluteFill>
        <div
          style={{
            width: '150%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
          }}
        >
          <OffthreadVideo
            src={src}
            style={{
              width: '130%',
              height: 'auto',
              objectFit: 'contain',
              transform: `translateX(${panX}%)`,
              transformOrigin: 'center center',
            }}
            muted
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
