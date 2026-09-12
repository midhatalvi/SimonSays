// /ui — live camera preview (MIDHAT)
// Owns the <video> element and the getUserMedia stream. Mirrors the feed so it
// feels like a mirror. Calls onReady(videoEl) once the stream is playing — the
// /vision detector can later read frames from that same element at integration.
import React, { useEffect, useRef, useState } from "react";

export default function CameraView({ onReady, mirrored = true }) {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let stream;
    let cancelled = false;

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play().catch(() => {});
        if (onReady) onReady(video);
      } catch (err) {
        if (!cancelled) setError(err);
      }
    })();

    return () => {
      cancelled = true;
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [onReady]);

  if (error) {
    return (
      <div className="camera-error">
        <p className="subtitle">
          We need your camera to play. Please allow camera access, then reload.
        </p>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      className={"camera-feed" + (mirrored ? " mirrored" : "")}
      playsInline
      muted
    />
  );
}
