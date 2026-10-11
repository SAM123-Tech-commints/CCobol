"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { LessonVideo } from "@/content/videos";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let ytApiPromise: Promise<any> | null = null;

/** Load the YouTube IFrame API once per page. */
function loadYouTubeApi(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject(new Error("SSR"));
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (!ytApiPromise) {
    ytApiPromise = new Promise((resolve) => {
      window.onYouTubeIframeAPIReady = () => resolve(window.YT);
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(s);
    });
  }
  return ytApiPromise;
}

function fmt(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
    : `${m}:${String(sec).padStart(2, "0")}`;
}

/** Chaptered video player: YouTube embed or direct MP4, with a clickable
 *  timeline, chapter markers and a jump-to-chapter list. */
export default function VideoPlayer({ source }: { source: LessonVideo }) {
  const rawId = useId();
  const containerId = `yt-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const ytRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  const isYouTube = source.provider === "youtube" && source.youtubeId;

  // Create the YouTube player.
  useEffect(() => {
    if (!isYouTube) return;
    let destroyed = false;
    void loadYouTubeApi()
      .then((YT) => {
        if (destroyed || !source.youtubeId) return;
        ytRef.current = new YT.Player(containerId, {
          videoId: source.youtubeId,
          playerVars: { rel: 0, modestbranding: 1, playsinline: 1 },
          events: {
            onReady: (e: any) => setDuration(e.target.getDuration?.() ?? 0),
          },
        });
      })
      .catch(() => undefined);
    return () => {
      destroyed = true;
      try {
        ytRef.current?.destroy?.();
      } catch {
        // ignore
      }
      ytRef.current = null;
    };
  }, [isYouTube, containerId, source.youtubeId]);

  // Track playback position for the timeline.
  useEffect(() => {
    const timer = setInterval(() => {
      if (isYouTube && ytRef.current?.getCurrentTime) {
        setCurrent(ytRef.current.getCurrentTime() ?? 0);
        const d = ytRef.current.getDuration?.() ?? 0;
        if (d) setDuration(d);
      } else if (!isYouTube && videoRef.current) {
        setCurrent(videoRef.current.currentTime);
        if (videoRef.current.duration && Number.isFinite(videoRef.current.duration)) {
          setDuration(videoRef.current.duration);
        }
      }
    }, 500);
    return () => clearInterval(timer);
  }, [isYouTube]);

  const seekTo = (seconds: number) => {
    if (isYouTube && ytRef.current?.seekTo) {
      ytRef.current.seekTo(seconds, true);
      ytRef.current.playVideo?.();
    } else if (!isYouTube && videoRef.current) {
      videoRef.current.currentTime = seconds;
      void videoRef.current.play();
    }
  };

  const onBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    seekTo(ratio * duration);
  };

  // The chapter the viewer is inside right now.
  let activeChapter = -1;
  source.chapters.forEach((c, i) => {
    if (current >= c.time) activeChapter = i;
  });

  const pct = duration ? (current / duration) * 100 : 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-lg dark:border-[#3c3c3c]">
      {/* player */}
      <div className="relative aspect-video w-full bg-black">
        {isYouTube ? (
          <div id={containerId} className="absolute inset-0 h-full w-full" />
        ) : source.src ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video
            ref={videoRef}
            src={source.src}
            controls
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-4 text-center font-mono text-xs text-rose-300">
            No video source configured. See src/content/videos.ts for instructions.
          </div>
        )}
      </div>

      {/* title + time */}
      {source.title ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-700 px-4 pt-3">
          <p className="text-sm font-semibold text-white">{source.title}</p>
          <p className="font-mono text-xs text-slate-400">
            {fmt(current)} {duration ? `/ ${fmt(duration)}` : ""}
          </p>
        </div>
      ) : null}

      {/* timeline with chapter markers */}
      {duration ? (
        <div
          className="group relative mt-3 h-3 cursor-pointer px-4"
          onClick={onBarClick}
          role="slider"
          aria-label="Video timeline"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-valuenow={Math.round(current)}
        >
          <div className="absolute inset-x-4 top-0 h-3 overflow-hidden rounded-full bg-slate-700">
            <div className="h-full rounded-full bg-indigo-500 transition-[width] duration-300" style={{ width: `${pct}%` }} />
          </div>
          {/* chapter markers: left = f*100% + (1 - 2f)*1rem keeps them inside the 1rem-padded bar */}
          {source.chapters.map((c) => {
            const f = duration ? c.time / duration : 0;
            return (
              <span
                key={`${c.time}-${c.label}`}
                className="absolute top-0 h-3 w-[3px] rounded-full bg-white/90"
                style={{ left: `calc(${f * 100}% + ${(1 - 2 * f) * 1}rem)` }}
                title={c.label}
              />
            );
          })}
          {/* playhead */}
          {(() => {
            const f = duration ? current / duration : 0;
            return (
              <span
                className="absolute top-[-2px] h-4 w-4 -translate-x-1/2 rounded-full bg-white opacity-0 shadow transition group-hover:opacity-100"
                style={{ left: `calc(${f * 100}% + ${(1 - 2 * f) * 1}rem)` }}
              />
            );
          })()}
        </div>
      ) : null}

      {/* chapter list */}
      {source.chapters.length ? (
        <div className="px-4 pb-4 pt-3">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Chapters - click to jump</p>
          <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
            {source.chapters.map((c, i) => (
              <button
                key={`${c.time}-${c.label}`}
                type="button"
                onClick={() => seekTo(c.time)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition ${
                  i === activeChapter
                    ? "border-indigo-400 bg-indigo-500/20 font-semibold text-white"
                    : "border-slate-700 bg-slate-800/60 text-slate-300 hover:border-indigo-400/50 hover:text-white"
                }`}
              >
                <span className="shrink-0 rounded bg-slate-700 px-1.5 py-0.5 font-mono text-[10px] text-indigo-300">{fmt(c.time)}</span>
                <span className="min-w-0 truncate">{c.label}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
