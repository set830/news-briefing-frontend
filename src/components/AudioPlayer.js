import React, { useEffect, useRef, useState } from 'react';
import './AudioPlayer.css';

function AudioPlayer({ audio, audioType, articleBreaks }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [objectUrl, setObjectUrl] = useState(null);
  const [decodeError, setDecodeError] = useState(false);
  const [speed, setSpeed] = useState(1.2);

  // Convert base64 to blob URL whenever audio prop changes
  useEffect(() => {
    setDecodeError(false);
    let url;
    try {
      const binary = atob(audio);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: audioType });
      url = URL.createObjectURL(blob);
    } catch {
      setDecodeError(true);
      return;
    }
    setObjectUrl(url);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    return () => URL.revokeObjectURL(url);
  }, [audio, audioType]);

  // When objectUrl is ready, load and autoplay
  useEffect(() => {
    if (!objectUrl || !audioRef.current) return;
    const el = audioRef.current;
    el.src = objectUrl;
    el.playbackRate = speed;
    el.load();
    el.play().then(() => setIsPlaying(true)).catch(() => {});
  }, [objectUrl]);

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el) return;
    if (isPlaying) {
      el.pause();
      setIsPlaying(false);
    } else {
      el.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const handleSpeedChange = (newSpeed) => {
    setSpeed(newSpeed);
    if (audioRef.current) audioRef.current.playbackRate = newSpeed;
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) audioRef.current.currentTime = 0;
  };

  const handleSeek = (e) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audioRef.current.currentTime = pct * duration;
    setCurrentTime(pct * duration);
  };

  const handleMarkerClick = (e, frac) => {
    e.stopPropagation();
    if (!audioRef.current || !duration) return;
    audioRef.current.currentTime = frac * duration;
    setCurrentTime(frac * duration);
  };

  const fmt = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (decodeError) {
    return (
      <div className="audio-player audio-player--error">
        Audio could not be decoded. Please try generating again.
      </div>
    );
  }

  return (
    <div className="audio-player">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      <div className="player-inner">
        <button className="play-pause" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
          {isPlaying ? (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
              <rect x="3" y="2" width="4" height="14" rx="1.5" />
              <rect x="11" y="2" width="4" height="14" rx="1.5" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
              <path d="M4 2.5L15 9L4 15.5V2.5Z" />
            </svg>
          )}
        </button>

        <span className="time-current">{fmt(currentTime)}</span>

        <div className="progress-wrapper">
          {articleBreaks && articleBreaks.map(({ n, frac }) => (
            <button
              key={n}
              className="article-marker"
              style={{ left: `${frac * 100}%` }}
              onClick={(e) => handleMarkerClick(e, frac)}
              title={`Article ${n}`}
            >
              {n}
            </button>
          ))}
          <div className="progress-track" onClick={handleSeek}>
            <div className="progress-fill" style={{ width: `${pct}%` }} />
            <div className="progress-thumb" style={{ left: `${pct}%` }} />
          </div>
        </div>

        <span className="time-total">{fmt(duration)}</span>

        <div className="speed-toggle">
          {[1, 1.2, 1.5].map(s => (
            <button
              key={s}
              className={`speed-btn ${speed === s ? 'active' : ''}`}
              onClick={() => handleSpeedChange(s)}
            >
              {s}×
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AudioPlayer;
