import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.config.js";
import globalErrorMiddleware from "./middlewares/error.middleware.js";
import apiRouter from "./routes/api.routes.js";
import { cloudinaryConfig } from "./config/cloudinary.config.js";

dotenv.config({ quiet: process.env.NODE_ENV === "production" });
cloudinaryConfig();

const port = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Welcome to My Blog API!");
});
app.use("/api/v1", apiRouter);
app.use(globalErrorMiddleware);

const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () =>
      console.log(
        `Server running in ${process.env.NODE_ENV} mode on port ${port}`,
      ),
    );
  } catch (error) {
    console.log("Error starting server!", error);
    process.exit(1);
  }
};

startServer();
