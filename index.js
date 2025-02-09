import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import dbConnect from "./Db/dbConnect.js";
import authRoutes from "./Routes/authroute.js";
import newsRoutes from "./Route-contorller/NewsRouteController.js";
import categoriesRoutes from "./Route-contorller/Categories.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000; // Defaulting to port 3000 if PORT is not defined in .env

// Middleware
app.use(express.json());
app.use(cookieParser()); 
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/categories', categoriesRoutes); 
// app.use('/api/categories:id', categoriesRoutes);


app.get("/", (req, res) => {
    res.send("Hello World");
});

app.listen(PORT, () => {
    dbConnect();
    console.log(`Server is running at http://localhost:${PORT}`);
});
