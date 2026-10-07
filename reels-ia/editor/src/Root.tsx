import React from 'react';
import {Composition} from 'remotion';
import {Reel, ReelProps, defaultProps} from './Reel';

export const Root: React.FC = () => (
  <Composition
    id="Reel"
    component={Reel}
    width={1080}
    height={1920}
    fps={30}
    durationInFrames={450}
    defaultProps={defaultProps}
    calculateMetadata={({props}) => ({
      durationInFrames: Math.max(30, Math.round((props as ReelProps).duracion * 30)),
    })}
  />
);
