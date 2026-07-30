import express from "express";
import dotenv from "dotenv";
import v1Router from "./routes/v1";
import errHandlingMiddleware from "./middlewares/error.middleware";
// import { rateLimit } from "express-rate-limit";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import chatRouter from "./routes/chat.route";

dotenv.config();

const WEBAPP_URL = process.env.WEBAPP_URL;
const TEMP_WEBAPP_URL = process.env.TEMP_WEBAPP_URL;
const PROD_WEBAPP_URL = process.env.PROD_WEBAPP_URL;
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  WEBAPP_URL,
  TEMP_WEBAPP_URL,
  PROD_WEBAPP_URL,
].filter((origin): origin is string => Boolean(origin));

// const limiter = rateLimit({
//   windowMs: 1 * 60 * 1000, // 1 minute
//   limit: 120,
//   standardHeaders: "draft-7",
//   legacyHeaders: false,

//   handler: (req, res) => {
//     console.log({ req, res, message: "Too many requests, please try again later." });
//     res.status(429).json({ message: "Too many requests, please try again later." });
//   },
// });

const PORT = process.env.PORT || 6543;

const app = express();

app.disable("x-powered-by");
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: "16kb" }));

app.use(
  cors({
    origin(origin, callback) {
      // Requests without an Origin header include server-to-server calls and Postman.
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS blocked origin: ${origin}`));
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    optionsSuccessStatus: 204,
  })
);


app.use(express.urlencoded({ extended: true }));
app.use("/chat-widget", express.static(path.join(__dirname, "../public"), { index: false, maxAge: "1h" }));

app.get("/", (req, res) => {
  res.send("Hello from WhaleServer");
});

app.use("/v1", v1Router);
app.use("/api/chat", chatRouter);

app.use(errHandlingMiddleware);

async function startServer() {
  try {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start server", error);
    process.exit(1);
  }
}

startServer();
