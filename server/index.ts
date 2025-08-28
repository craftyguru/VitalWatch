import express from "express";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { registerRoutes } from "./routes";
import { createServer } from "http";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProd = process.env.NODE_ENV === "production";
const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;

// IMPORTANT: point Vite to the client directory
const clientRoot = path.resolve(__dirname, "../client");

function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

async function start() {
  const app = express();
  const server = createServer(app);

  // Trust proxy for Cloudflare/Replit
  app.set("trust proxy", 1);

  // Health/liveness - public endpoint
  app.get("/health", (_req, res) => res.status(200).send("OK"));

  app.use(express.json({ limit: "100mb" }));
  app.use(express.urlencoded({ extended: false, limit: "100mb" }));

  // Lightweight API request logging
  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let captured: unknown;

    const origJson = res.json.bind(res);
    res.json = ((body: unknown, ...args: any[]) => {
      captured = body;
      // @ts-expect-error express types
      return origJson(body, ...args);
    }) as any;

    res.on("finish", () => {
      if (path.startsWith("/api")) {
        const duration = Date.now() - start;
        let line = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (captured !== undefined) {
          const s = JSON.stringify(captured);
          line += ` :: ${s.length > 200 ? s.slice(0, 200) + "…" : s}`;
        }
        log(line);
      }
    });

    next();
  });

  // Initialize database and routes
  await registerRoutes(app, server);

  // Error middleware (do NOT rethrow)
  app.use((err: any, _req: any, res: any, _next: any) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    log(`ERROR ${status}: ${message}`);
    if (!res.headersSent) res.status(status).json({ message });
  });

  if (!isProd) {
    // DEV: Use configFile to load vite.config.ts with proper server settings
    const vite = await createViteServer({
      configFile: path.resolve(__dirname, "../vite.config.ts"),
      server: { 
        middlewareMode: true,
      },
      appType: "spa",
    });

    app.use(vite.middlewares);

    app.use("*", async (req, res, next) => {
      try {
        const url = req.originalUrl;
        const htmlPath = path.resolve(clientRoot, "index.html");
        let html = await fs.readFile(htmlPath, "utf-8");
        html = await vite.transformIndexHtml(url, html);
        res.status(200).set({ "Content-Type": "text/html" }).end(html);
      } catch (e) {
        next(e);
      }
    });
  } else {
    // PROD: serve built assets
    const distClient = path.resolve(__dirname, "../client");
    app.use(express.static(distClient, { index: false }));
    app.get("*", async (_req, res) => {
      const html = await fs.readFile(path.join(distClient, "index.html"), "utf-8");
      res.setHeader("Content-Type", "text/html");
      res.end(html);
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Server listening on http://0.0.0.0:${PORT}`);
    log(`serving on 0.0.0.0:${PORT}`);
  });

  // Graceful shutdown
  process.on("SIGINT", () => {
    log("Gracefully shutting down server…");
    server.close(() => process.exit(0));
  });
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});