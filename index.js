import express from "express";
import dotenv from "dotenv";
import dbConnect from "./Db/dbConnect.js";
import authRoutes from "./Routes/authroute.js";
dotenv.config();
const app = express()
 const PORT = process.env.PORT ;
app.use(express.json());
// Routes
app.use('/api/auth', authRoutes); 
 app.get("/",(req,res)=>{
    res.send("hello world")
 })
 app.listen(PORT,()=>{
      dbConnect();
       console.log(`http://localhost:${PORT}`)
 })  