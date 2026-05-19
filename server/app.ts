import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import routes from "./routes";
import { errorHandler } from "./middleware/error.middleware";
import { env } from "./config/env";
import { uploadsRoot } from "./utils/uploads-path";

export const app = express();

const allowedOrigins = new Set([
	env.CLIENT_URL,
	"http://localhost:3000",
	"http://localhost:3001",
	"http://localhost:3002",
	"http://127.0.0.1:3000",
	"http://127.0.0.1:3001",
	"http://127.0.0.1:3002"
].filter(Boolean));

app.use(
	cors({
		credentials: true,
		origin(origin, callback) {
			if (!origin || allowedOrigins.has(origin)) {
				return callback(null, true);
			}

			return callback(new Error(`CORS blocked for origin: ${origin}`));
		}
	})
);
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use("/uploads", express.static(uploadsRoot));

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/v1", routes);
app.use(errorHandler);
