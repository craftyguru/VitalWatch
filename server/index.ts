import express, { type Request, Response, NextFunction } from "express";
import http from "http";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

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

(async () => {
  // Attach all routes to the express app
  await registerRoutes(app);

  // Create ONE http server that everything shares
  const server = http.createServer(app);

  // Error middleware (do NOT rethrow)
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    log(`ERROR ${status}: ${message}`);
    if (!res.headersSent) res.status(status).json({ message });
  });

  // Dev uses Vite middleware; prod serves static
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Replit/Cloudflare: use platform port and 0.0.0.0
  const PORT = Number(process.env.PORT) || 3000;
  const HOST = "0.0.0.0";

  server.listen(PORT, HOST, () => {
    console.log(`✅ Server listening on http://${HOST}:${PORT}`);
    log(`serving on ${HOST}:${PORT}`);
  });

  // Graceful shutdown
  process.on("SIGINT", () => {
    log("Gracefully shutting down server…");
    server.close(() => process.exit(0));
  });
})();
