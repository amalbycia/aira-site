"use client";

import { useEffect, useRef, useState } from "react";
import type Hls from "hls.js";
import type { ReelItem } from "./types";
import PlayPauseToggle from "./PlayPauseToggle";
import styles from "./ReelCard.module.css";

/**
 * Self-hosted reel player (Bunny Stream). Shows the poster with a play button;
 * clicking plays the reel FULL and UNMUTED from the start (click-to-play with
 * sound). Streams via HLS (hls.js) when an `hlsSrc` is present, falling back to
 * native HLS (Safari) or the progressive MP4. Never an Instagram embed.
 *
 * Only one reel plays at a time site-wide: starting one pauses any other
 * (tracked via a module-level ref) so audio never overlaps.
 *
 * The playback logic here is carried over unchanged from the pre-redesign
 * player — it's proven against Bunny's HLS. Only the visual shell changed, and
 * the play affordance is now the Osmo morphing toggle.
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
      className={styles.card}
      onClick={hasVideo ? toggle : undefined}
      role={hasVideo ? "button" : undefined}
      tabIndex={hasVideo ? 0 : undefined}
      aria-label={
        hasVideo
          ? `${playing ? "Pause" : "Play"} reel: ${reel.alt}`
          : reel.alt
      }
      data-has-video={hasVideo}
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
        <>
          <video
            ref={videoRef}
            className={styles.media}
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
            className={styles.poster}
            src={reel.poster}
            alt={reel.alt}
            loading="lazy"
            data-hidden={started}
          />
        </>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img className={styles.media} src={reel.poster} alt={reel.alt} loading="lazy" />
      )}

      {hasVideo ? (
        <span className={styles.control} data-playing={playing}>
          <PlayPauseToggle playing={playing} size={22} />
        </span>
      ) : null}

      {reel.caption ? (
        <span className={styles.caption}>{reel.caption}</span>
      ) : null}
    </div>
  );
}
