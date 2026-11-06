import React from 'react';
import { Monitor, Tv, Eye, ArrowRight, Shield } from 'lucide-react';

/**
 * ProxiSpeak Week 4 — Active Screen Share Presenter Banner
 * Author: Harshitha Rao <harshithar978@gmail.com>
 *
 * Renders an unobtrusive status notification at the top of the office canvas
 * when a colleague begins presenting in a meeting room or boardroom.
 */
export function ScreenSharePresenterBanner({
  presenterName = 'Lead Architect',
  roomName = 'Executive Glass Boardroom',
  resolution = '1080p',
  onWatchPresentation,
}) {
  return (
    <div className="screenshare-banner">
      <div className="banner-left">
        <div className="banner-icon-pulse">
          <Monitor size={16} className="text-cyan-400" />
        </div>
        <div className="banner-text">
          <span className="presenter-badge">{presenterName}</span>
          <span className="banner-action-text">
            is presenting live in <strong>{roomName}</strong> ({resolution})
          </span>
        </div>
      </div>

      <div className="banner-right">
        <button className="btn-watch-stream" onClick={onWatchPresentation}>
          <Eye size={14} />
          <span>Watch Presentation</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
