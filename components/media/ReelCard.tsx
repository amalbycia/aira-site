"use client";

import { useEffect, useRef, useState } from "react";
import type Hls from "hls.js";
import type { ReelItem } from "./types";

/**
 * Self-hosted reel player (Bunny Stream). Shows the poster with a play button;
 * clicking plays the reel FULL and UNMUTED from the start (click-to-play with
 * sound). Streams via HLS (hls.js) when an `hlsSrc` is present, falling back to
 * native HLS (Safari) or the progressive MP4. Never an Instagram embed.
 *
 * Only one reel plays at a time site-wide: starting one pauses any other
 * (tracked via a module-level ref) so audio never overlaps.
 */

// The reel currently playing — used to pause the previous one when a new one
// starts, so two reels never play sound at once.
let currentlyPlaying: HTMLVideoElement | null = null;

export default function ReelCard({ reel }: { reel: ReelItem }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);

  const hasVideo = Boolean(reel.hlsSrc || reel.videoSrc);

  // Tear down hls.js on unmount.
  useEffect(() => {
    return () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
      if (currentlyPlaying === videoRef.current) currentlyPlaying = null;
    };
  }, []);

  // Attach the stream (HLS via hls.js, or native/MP4) once, on first play.
  const attachSource = async (video: HTMLVideoElement) => {
    if (video.src || hlsRef.current) return; // already attached

    const canNativeHls = video.canPlayType("application/vnd.apple.mpegurl");

    if (reel.hlsSrc && canNativeHls) {
      // Safari / iOS play HLS natively — no hls.js needed.
      video.src = reel.hlsSrc;
      return;
    }

    if (reel.hlsSrc) {
      // Dynamically import hls.js so it's only loaded when a reel is actually
      // played (keeps it out of the initial bundle).
      const { default: HlsCtor } = await import("hls.js");
      if (HlsCtor.isSupported()) {
        const hls = new HlsCtor({ enableWorker: true });
        hlsRef.current = hls;
        hls.loadSource(reel.hlsSrc);
        hls.attachMedia(video);
        // On fatal error, fall back to the MP4 rendition if we have one.
        hls.on(HlsCtor.Events.ERROR, (_e, data) => {
          if (data.fatal && reel.videoSrc) {
            hls.destroy();
            hlsRef.current = null;
            video.src = reel.videoSrc;
          }
        });
        return;
      }
    }

    // Last resort: progressive MP4.
    if (reel.videoSrc) video.src = reel.videoSrc;
  };

  const play = async () => {
    const video = videoRef.current;
    if (!video) return;

    // Pause any other reel that's playing (no overlapping audio).
    if (currentlyPlaying && currentlyPlaying !== video) {
      currentlyPlaying.pause();
    }

    await attachSource(video);
    setStarted(true);
    video.muted = false; // click-to-play WITH sound
    video.volume = 1;
    try {
      await video.play();
      currentlyPlaying = video;
      setPlaying(true);
    } catch {
      // Autoplay policies can still reject with-sound playback if there was no
      // real user gesture; retry muted so at least the video runs.
      video.muted = true;
      try {
        await video.play();
        currentlyPlaying = video;
        setPlaying(true);
      } catch {
        /* give up silently — poster stays */
      }
    }
  };

  const pause = () => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    setPlaying(false);
    if (currentlyPlaying === video) currentlyPlaying = null;
  };

  const toggle = () => (playing ? pause() : play());

  return (
    <div
      className="reel-card"
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
      <style>{`
        .reel-card {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: inherit;
          overflow: hidden;
          background: var(--color-primary-dark, #2a1414);
          cursor: ${hasVideo ? "pointer" : "default"};
        }
        .reel-card__media {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .reel-card__poster {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: opacity 0.35s ease;
        }
        .reel-card__poster[data-hidden="true"] { opacity: 0; pointer-events: none; }
        .reel-card__play {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 3.4em;
          height: 3.4em;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(20, 8, 8, 0.55);
          backdrop-filter: blur(4px);
          border: 1px solid rgba(201, 169, 110, 0.7);
          color: var(--color-cream, #f5eddf);
          transition: opacity 0.3s ease, transform 0.3s ease, background 0.3s ease;
          pointer-events: none;
        }
        .reel-card:hover .reel-card__play { transform: translate(-50%, -50%) scale(1.08); }
        .reel-card__play[data-playing="true"] { opacity: 0; }
        .reel-card__play svg { width: 1.4em; height: 1.4em; margin-left: 0.15em; }
        .reel-card__sound {
          position: absolute;
          right: 0.7em;
          bottom: 0.7em;
          width: 2.2em;
          height: 2.2em;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(20, 8, 8, 0.6);
          border: 1px solid rgba(201, 169, 110, 0.55);
          color: var(--color-cream, #f5eddf);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .reel-card__sound[data-visible="true"] { opacity: 1; }
        .reel-card__sound svg { width: 1.1em; height: 1.1em; }
      `}</style>

      {hasVideo ? (
        <>
          <video
            ref={videoRef}
            className="reel-card__media"
            poster={reel.poster}
            playsInline
            preload="none"
            onEnded={pause}
            onPause={() => setPlaying(false)}
            onPlay={() => setPlaying(true)}
          />
          {/* Poster overlay — hidden once playback has started */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="reel-card__poster"
            src={reel.poster}
            alt={reel.alt}
            loading="lazy"
            data-hidden={started}
          />
        </>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="reel-card__media" src={reel.poster} alt={reel.alt} loading="lazy" />
      )}

      {/* Play affordance — hidden while playing */}
      <span className="reel-card__play" data-playing={playing} aria-hidden="true">
        <svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 2.5L15 9L4 15.5V2.5Z" fill="currentColor" />
        </svg>
      </span>

      {/* Sound-on indicator once playing (reassures audio is live; click card to pause) */}
      <span className="reel-card__sound" data-visible={playing} aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor" stroke="none" />
          <path d="M15.5 8.5a5 5 0 010 7M18.5 6a8 8 0 010 12" />
        </svg>
      </span>

      {reel.caption ? <span className="reel-card__caption">{reel.caption}</span> : null}
    </div>
  );
}
