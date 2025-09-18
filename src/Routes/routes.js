import { Router } from "express";
import { registeruser , loginuser} from "../Controllers/user.controller.js";
import {upload} from "../Middlewares/Multer.middleware.js"
import { Chatbot } from "../Controllers/Chatbot.controller.js";
import { Chat } from "../Controllers/Personalchatbot.js";


const router = Router()

 router.route("/register").post
 (
  upload.single("image"),
     registeruser
 )
 router.route('/login').post(loginuser)
 router.route("/chat").post(Chatbot)
 router.route("/bot").post(Chat)

export default router 