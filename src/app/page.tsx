"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export default function WebBridge() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasNavigated = useRef(false);
  const [url, setUrl] = useState<string | null>(null);
  const [refreshSeconds, setRefreshSeconds] = useState<number>(0);

  const resetIframe = useCallback(() => {
    if (iframeRef.current && url) {
      hasNavigated.current = false;
      iframeRef.current.src = url;
    }
  }, [url]);

  const resetTimer = useCallback(() => {
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

    // Ensure the URL has a protocol
    const normalizedUrl = website.startsWith("http") ? website : `https://${website}`;
    setUrl(normalizedUrl);

    if (refresh) {
      const seconds = parseInt(refresh, 10);
      if (!isNaN(seconds) && seconds > 0) {
        setRefreshSeconds(seconds);
      }
    }
  }, []);

  // Start/reset the auto-refresh timer whenever the iframe loads a page
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !url || refreshSeconds <= 0) return;

    const handleLoad = () => {
      if (!hasNavigated.current) {
        // Skip the initial load — no interaction has happened yet
        hasNavigated.current = true;
        return;
      }
      // User navigated within the iframe — start the inactivity timer.
      // When it fires, the iframe resets back to the original URL.
      resetTimer();
    };

    iframe.addEventListener("load", handleLoad);
    return () => {
      iframe.removeEventListener("load", handleLoad);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [url, refreshSeconds, resetTimer]);

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
