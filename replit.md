# EconoBeer on Replit

## Run the app

Use the **Start application** workflow or run:

```sh
npm run dev
```

This starts the Vite frontend on port `5000` (shown in the Replit Preview) and
the Express API on port `3001`. Vite proxies `/api` requests to the API.

## Health check

The backend responds at `/api/health` with `{"ok":true}`.

The project uses Node.js 20 and the dependencies declared in `package.json`.