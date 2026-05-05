import express from "express";
import cors from "cors";
import helmet from "helmet";
import { joinRouter } from "./routes/join.js";
import { UserRouter } from "./routes/users.js";
import { MessageRouter } from "./routes/messages.js";
import {adminRouter} from "./routes/adminRouter.js";
import { globalErrorHandler } from "./error-handler/globalErrorHandler.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(cookieParser());
app.use(helmet());
app.use(
  cors({
    origin:process.env.WHITELISTED_CLIENT_URL ,
    methods: ["GET", "POST"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// REST routes
app.use("/api/join", joinRouter);
app.use("/api/users", UserRouter);
app.use("/api/messages", MessageRouter);
app.use("/api/admin",adminRouter);

// home route
app.get("/", (req, res) => {
  return res.status(200).json({ message: "Welcome to anonymous chat !" });
});

// health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use(globalErrorHandler);

export { app };
