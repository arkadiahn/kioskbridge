"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export default function WebBridge() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const interactedRef = useRef(false);
  const [url, setUrl] = useState<string | null>(null);
  const [refreshSeconds, setRefreshSeconds] = useState<number>(0);

  const resetIframe = useCallback(() => {
    if (iframeRef.current && url) {
      interactedRef.current = false;
      iframeRef.current.src = url;
    }
  }, [url]);

  const startTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (refreshSeconds > 0) {
      timerRef.current = setTimeout(() => {
        resetIframe();
      }, refreshSeconds * 1000);
    }
  }, [refreshSeconds, resetIframe]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const website = params.get("url") || params.get("website");
    const refresh = params.get("refresh") || params.get("reload");

    if (!website) return;

    const normalizedUrl = website.startsWith("http") ? website : `https://${website}`;
    setUrl(normalizedUrl);

    if (refresh) {
      const seconds = parseInt(refresh, 10);
      if (!isNaN(seconds) && seconds > 0) {
        setRefreshSeconds(seconds);
      }
    }
  }, []);

  // Detect user interaction: clicking inside the iframe causes the parent window to blur.
  // Also reset the timer on any iframe navigation after the user has interacted.
  useEffect(() => {
    if (!url || refreshSeconds <= 0) return;
    const iframe = iframeRef.current;

    const handleBlur = () => {
      // Window lost focus — user clicked inside the iframe
      if (document.activeElement === iframe) {
        interactedRef.current = true;
        startTimer();
      }
    };

    const handleLoad = () => {
      // Only reset timer on iframe navigations after the user has interacted
      if (interactedRef.current) {
        startTimer();
      }
    };

    window.addEventListener("blur", handleBlur);
    if (iframe) iframe.addEventListener("load", handleLoad);

    return () => {
      window.removeEventListener("blur", handleBlur);
      if (iframe) iframe.removeEventListener("load", handleLoad);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [url, refreshSeconds, startTimer]);

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
          <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>KioskBridge</h1>
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
      style={{
        width: "100vw",
        height: "100vh",
        border: "none",
      }}
      allow="fullscreen"
      title="KioskBridge"
    />
  );
}
