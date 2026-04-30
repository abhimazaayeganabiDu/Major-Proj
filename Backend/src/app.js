import express from "express";
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import path from 'path'
import { v2 as cloudinary } from "cloudinary";
import cookieParser from "cookie-parser";
import dotenv, { config } from "dotenv";
import helmet from 'helmet'
import cors from 'cors'
import responseMessage from './constant/responseMessage.js'

dotenv.config();
const app = express();
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
app.use(helmet())
app.use(
  cors({
    methods:['GET', "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
    origin: [process.env.CLIENT_URL],
    credentials: true
  })
)

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUDNAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// routes import here
import authRoutes from "./routes/auth.route.js";
import problemRoutes from "./routes/problem.route.js";
import executeCodeRoutes from "./routes/executeCode.route.js";
import subissionRoutes from "./routes/submission.route.js"
import playlistRoutes from "./routes/playlist.route.js"

// routes add here

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/problem", problemRoutes);
app.use("/api/v1/executeCode", executeCodeRoutes);
app.use("/api/v1/submission", subissionRoutes);
app.use("/api/v1/playlist", playlistRoutes);

// 404 Handler
app.use((req, _, next) => {
  try {
    throw new Error (responseMessage.NOT_FOUND('route'))
  } catch (error) {
    // httpError(next, error, req, 404)
    // next()
    console.log("err not found", error);
  }
})

export default app;
