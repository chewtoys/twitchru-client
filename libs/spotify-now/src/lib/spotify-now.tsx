import React from 'react';
import { useSpotifyNowQuery } from '@dream/types';
import { TrackInfo } from './components/track-info';

export const SpotifyNow = () => {
  const spotifyNowQuery = useSpotifyNowQuery({
    variables: { token: 'test' },
    pollInterval: 3000,
  });
  const current = spotifyNowQuery?.data?.spotifyNow;

  return (
    <TrackInfo
      imageUrl={current?.imageUrl}
      artist={current?.artist}
      name={current?.name}
      progress={current?.progress}
    />
  );
};
