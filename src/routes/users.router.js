import {Router} from "express";
import { getUsers } from "../controllers/user.controller.js";
import {authenticate} from "../middlewares/auth.middleware.js";
import {authorize} from "../middlewares/authorize.middleware.js";

const router = Router();

router.get("/", authenticate, authorize("admin"), getUsers);

export default router;