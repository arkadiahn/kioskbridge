# 📺 KioskBridge

A dead-simple iframe wrapper that auto-resets to your chosen URL after a period of inactivity. Built for kiosks, lobby screens, trade show demos, and anywhere you need a browser to "come home" on its own.

## 🤔 Why?

You stick a tablet on a wall running a website. Someone taps around and ends up three pages deep, then walks away. Now the next person sees some random subpage instead of your landing screen. KioskBridge fixes that — it watches for navigation inside the iframe and snaps back to the original URL after your configured timeout.

## 🚀 Quick Start

### Query Parameters

| Param | Description |
|---|---|
| `url` or `website` | The page to embed (prefix `https://` is added automatically if missing) |
| `refresh` or `reload` | Seconds before resetting back to the original URL after navigation |

### Example

```
https://your-kioskbridge.example.com/?url=https://example.com&refresh=30
```

This loads `example.com` full-screen. If someone clicks around inside the iframe, the page resets back to `example.com` after 30 seconds.

## 🐳 Docker

```bash
docker build -t kioskbridge .
docker run -p 3000:3000 kioskbridge
```

That's it. Hit `http://localhost:3000/?url=https://example.com&refresh=60` and you're in business.

### Docker Compose

```yaml
services:
  kioskbridge:
    build: .
    ports:
      - "3000:3000"
    restart: unless-stopped
```

## 🛠️ Local Dev

```bash
npm install
npm run dev
```

Opens on `http://localhost:3000`.

## ⚠️ Heads Up

Iframes are subject to the target site's `X-Frame-Options` and `Content-Security-Policy` headers. If a site doesn't allow being embedded in an iframe, there's nothing KioskBridge (or any iframe-based tool) can do about it — that's a server-side decision by the target site.

## 📄 License

MIT
