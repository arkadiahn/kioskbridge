"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export default function WebBridge() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const interactedRef = useRef(false);
  const [url, setUrl] = useState<string | null>(null);
  const [refreshSeconds, setRefreshSeconds] = useState<number>(0);

  const enableOverlay = useCallback(() => {
    if (overlayRef.current) {
      overlayRef.current.style.pointerEvents = "auto";
    }
  }, []);

  const disableOverlay = useCallback(() => {
    if (overlayRef.current) {
      overlayRef.current.style.pointerEvents = "none";
    }
  }, []);

  const resetIframe = useCallback(() => {
    if (iframeRef.current && url) {
      interactedRef.current = false;
      iframeRef.current.src = url;
      enableOverlay();
    }
  }, [url, enableOverlay]);

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

  // Detect user interaction via a transparent overlay + document-level events.
  // The overlay captures the start of each gesture (click, touch, scroll),
  // then disables itself so subsequent events reach the iframe directly.
  useEffect(() => {
    if (!url || refreshSeconds <= 0) return;
    const iframe = iframeRef.current;
    const overlay = overlayRef.current;

    const markActive = () => {
      interactedRef.current = true;
      startTimer();
      // Let subsequent events in this gesture pass through to the iframe
      disableOverlay();
    };

    // Overlay captures the start of any interaction gesture over the iframe
    if (overlay) {
      overlay.addEventListener("pointerdown", markActive);
      overlay.addEventListener("wheel", markActive, { passive: true });
      overlay.addEventListener("touchstart", markActive, { passive: true });
    }

    // Also detect activity on the parent document (keyboard, mouse outside iframe)
    document.addEventListener("keydown", markActive);

    // iframe navigation after the user has interacted
    const handleLoad = () => {
      if (interactedRef.current) {
        startTimer();
      }
      // Re-enable overlay to detect the next interaction gesture
      enableOverlay();
    };
    if (iframe) iframe.addEventListener("load", handleLoad);

    return () => {
      if (overlay) {
        overlay.removeEventListener("pointerdown", markActive);
        overlay.removeEventListener("wheel", markActive);
        overlay.removeEventListener("touchstart", markActive);
      }
      document.removeEventListener("keydown", markActive);
      if (iframe) iframe.removeEventListener("load", handleLoad);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [url, refreshSeconds, startTimer, disableOverlay, enableOverlay]);

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
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      <iframe
        ref={iframeRef}
        src={url}
        style={{
          width: "100%",
          height: "100%",
          border: "none",
        }}
        allow="fullscreen"
        title="KioskBridge"
      />
      {refreshSeconds > 0 && (
        <div
          ref={overlayRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
      )}
    </div>
  );
}
