# KioskBridge

A simple iframe wrapper that auto-resets to your chosen URL after a period of inactivity. Built for kiosks, lobby screens, trade show demos, and anywhere you need a browser to "come home" on its own.

## Quick Start

| Param | Description |
|---|---|
| `url` or `website` | The page to embed (`https://` added automatically if missing) |
| `refresh` or `reload` | Seconds of inactivity before resetting to the original URL |

```
https://your-kioskbridge.example.com/?url=https://example.com&refresh=30
```

## Docker

```bash
docker build -t kioskbridge .
docker run -p 3000:3000 kioskbridge
```

### Docker Compose

```yaml
services:
  kioskbridge:
    build: .
    ports:
      - "3000:3000"
    restart: unless-stopped
```

## Local Dev

```bash
npm install
npm run dev
```

## Notes

Iframes are subject to the target site's `X-Frame-Options` and `Content-Security-Policy` headers. If a site doesn't allow being embedded, there's nothing KioskBridge can do about it.

## License

MIT
