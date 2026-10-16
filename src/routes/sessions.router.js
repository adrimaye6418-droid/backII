import { Router } from "express";
import { register, 
         login,
         current,
         logout
        } from "../controllers/sessions.controller.js";
import { auth } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/current", auth, current);
router.get("/logout", auth, logout);

export default router;
