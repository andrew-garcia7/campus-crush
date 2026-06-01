import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import routes from "./routes";
import { errorHandler } from "./middleware/error.middleware";
import { env } from "./config/env";
import { uploadsRoot } from "./utils/uploads-path";

export const app = express();

// Static allow-list: localhost variants + the CLIENT_URL env var
const allowedOriginSet = new Set([
	env.CLIENT_URL,
	"http://localhost:3000",
	"http://localhost:3001",
	"http://localhost:3002",
	"http://127.0.0.1:3000",
	"http://127.0.0.1:3001",
	"http://127.0.0.1:3002",
].filter(Boolean));

// Regex patterns for dynamic origins (Vercel preview + production deployments)
const allowedOriginPatterns = [
	/^https:\/\/[a-z0-9-]+-[a-z0-9]+-[a-z0-9-]+\.vercel\.app$/,  // preview: project-hash-team.vercel.app
	/^https:\/\/[a-z0-9-]+\.vercel\.app$/,                         // production: project.vercel.app
];

function isOriginAllowed(origin: string): boolean {
	if (allowedOriginSet.has(origin)) return true;
	return allowedOriginPatterns.some(re => re.test(origin));
}

app.use(
	cors({
		credentials: true,
		origin(origin, callback) {
			// Allow server-to-server or same-origin requests
			if (!origin) return callback(null, true);
			if (isOriginAllowed(origin)) return callback(null, true);
			return callback(new Error(`CORS blocked for origin: ${origin}`));
		},
	})
);
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use("/uploads", express.static(uploadsRoot));

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/v1", routes);
app.use(errorHandler);
