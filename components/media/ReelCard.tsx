"use client";

import { useRef, useState } from "react";
import type { ReelItem } from "./types";

/**
 * A self-hosted reel slot. Shows the poster frame with a play affordance.
 * When a `videoSrc` is present (Bunny later), the muted video plays on hover
 * (desktop) or on tap (touch) and pauses when it loses focus/hover. Never an
 * Instagram embed — this is a real <video> element pointed at our own CDN.
 */
export default function ReelCard({ reel }: { reel: ReelItem }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const start = () => {
    const v = videoRef.current;
    if (!v) return;
    v.play().then(() => setPlaying(true)).catch(() => {});
  };
  const stop = () => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    setPlaying(false);
  };

  const toggle = () => {
    if (playing) stop();
    else start();
  };

  const hasVideo = Boolean(reel.videoSrc);

  return (
    <div
      className="reel-card"
      onMouseEnter={hasVideo ? start : undefined}
      onMouseLeave={hasVideo ? stop : undefined}
      onClick={hasVideo ? toggle : undefined}
      role={hasVideo ? "button" : undefined}
      tabIndex={hasVideo ? 0 : undefined}
      aria-label={hasVideo ? `Play reel: ${reel.alt}` : reel.alt}
      onKeyDown={
        hasVideo
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggle();
              }
            }
          : undefined
      }
    >
      {hasVideo ? (
        <video
          ref={videoRef}
          className="reel-card__media"
          poster={reel.poster}
          src={reel.videoSrc}
          muted
          loop
          playsInline
          preload="none"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="reel-card__media" src={reel.poster} alt={reel.alt} loading="lazy" />
      )}

      {/* Play affordance — hidden once playing */}
      <span className="reel-card__play" data-playing={playing} aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 2.5L15 9L4 15.5V2.5Z" fill="currentColor" />
        </svg>
      </span>

      <span className="reel-card__tag" aria-hidden="true">Reel</span>

      {reel.caption ? <span className="reel-card__caption">{reel.caption}</span> : null}
    </div>
  );
}
