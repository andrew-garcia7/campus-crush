import { createServer } from "http";
import { app } from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";
import { initSocket } from "./socket";

const start = async () => {
  try {
    // connect mongo first
    await connectDB();

    const server = createServer(app);

    initSocket(server);

    server.listen(env.PORT, () => {
      console.log(
        `Campus Crush API running on port ${env.PORT}`
      );
    });
  } catch (err) {
    console.error(
      "Server startup failed:",
      err
    );
    process.exit(1);
  }
};

start();