import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
     import dotenv from "dotenv";
     dotenv.config();
const app = express() ;

const allowedOrigins = [
  'http://localhost:5173',                    
  'https://frontend-trozen-zz91.vercel.app',  
];


app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); 
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


import userRouter from "./Routes/routes.js"

   app.use("/api/v1/user" ,userRouter)


      export {app}