"use client";

import { useEffect, useRef, useState } from "react";

export default function WebBridge() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [refreshSeconds, setRefreshSeconds] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const website = params.get("url") || params.get("website");
    const refresh = params.get("refresh") || params.get("reload");
    if (!website) return;
    setUrl(website.startsWith("http") ? website : `https://${website}`);
    if (refresh) {
      const s = parseInt(refresh, 10);
      if (s > 0) setRefreshSeconds(s);
    }
  }, []);

  useEffect(() => {
    if (!url || refreshSeconds <= 0) return;
    const iframe = iframeRef.current;
    let timer: ReturnType<typeof setTimeout>;
    let hoverInterval: ReturnType<typeof setInterval>;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (iframeRef.current) iframeRef.current.src = url;
      }, refreshSeconds * 1000);
    };

    const events = ["mousemove", "pointerdown", "touchstart", "keydown"] as const;
    events.forEach((e) => document.addEventListener(e, resetTimer));

    const handleBlur = () => {
      if (document.activeElement === iframe) resetTimer();
    };
    window.addEventListener("blur", handleBlur);

    // Cross-origin iframes swallow scroll/wheel events.
    // While the mouse is over the iframe, poll to keep the timer reset.
    const onEnter = () => {
      resetTimer();
      hoverInterval = setInterval(resetTimer, 1000);
    };
    const onLeave = () => clearInterval(hoverInterval);
    iframe?.addEventListener("mouseenter", onEnter);
    iframe?.addEventListener("mouseleave", onLeave);

    return () => {
      clearTimeout(timer);
      clearInterval(hoverInterval);
      events.forEach((e) => document.removeEventListener(e, resetTimer));
      window.removeEventListener("blur", handleBlur);
      iframe?.removeEventListener("mouseenter", onEnter);
      iframe?.removeEventListener("mouseleave", onLeave);
    };
  }, [url, refreshSeconds]);

  if (!url) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          fontFamily: "system-ui, sans-serif",
          color: "#555",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 500 }}>
          <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
            KioskBridge
          </h1>
          <p>
            Add query parameters to display a website in an iframe with
            auto-refresh.
          </p>
          <p style={{ marginTop: "1rem", fontSize: "0.9rem", color: "#888" }}>
            <strong>Parameters:</strong>
          </p>
          <ul style={{ textAlign: "left", fontSize: "0.85rem", color: "#888" }}>
            <li>
              <code>url</code> or <code>website</code> &mdash; The URL to
              display
            </li>
            <li>
              <code>refresh</code> or <code>reload</code> &mdash; Seconds of
              inactivity before resetting to the original URL
            </li>
          </ul>
          <p style={{ marginTop: "1rem", fontSize: "0.85rem", color: "#aaa" }}>
            Example: <code>?url=https://example.com&amp;refresh=30</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <iframe
      ref={iframeRef}
      src={url}
      style={{ width: "100vw", height: "100vh", border: "none" }}
      allow="fullscreen"
      title="KioskBridge"
    />
  );
}
