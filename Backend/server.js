import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import chatRoutes from "./routes/chat.js";
import authRoutes from "./routes/auth.js";

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(cors());

// Auth routes
app.use("/api/auth", authRoutes);

// Chat routes — no auth required (guest access allowed)
app.use("/api", chatRoutes);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("Connected with database!");
  } catch (err) {
    console.log("Failed to connect with db:", err.message);
    console.log("Server will continue without database.");
  }
};

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});