import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";
import { fileURLToPath } from "url";
const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // ESM-safe __dirname
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  
  // If server is built to dist/server/index.js, this points to dist/client
  const coLocated = path.resolve(__dirname, "../client");
  
  // Fallback for single-file server build (dist/index.js)
  const cwdDist = path.resolve(process.cwd(), "dist", "client");
  
  // Choose whichever actually exists
  const clientRoot = fs.existsSync(path.join(coLocated, "index.html"))
    ? coLocated
    : cwdDist;

  if (!fs.existsSync(path.join(clientRoot, "index.html"))) {
    throw new Error(
      `Client build not found. Expected index.html in ${clientRoot}. Run "npm run build".`
    );
  }

  app.use(express.static(clientRoot));

  // SPA fallback (don't swallow /api)
  app.get(/^\/(?!api\b).*/, (_req, res) => {
    res.sendFile(path.join(clientRoot, "index.html"));
  });
}