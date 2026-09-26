import React from 'react';
import { SpotifySettings } from '../components/settings/SpotifySettings';

export function Settings({ onOpenCookieSettings }) {
  return (
    <div className="pt-2 sm:pt-4 px-1 sm:px-2">
      <SpotifySettings onOpenCookieSettings={onOpenCookieSettings} />
    </div>
  );
}

export default Settings;
