import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { createRegistration } from "../controllers/registration.controllers.js";

const router = Router();

router.post(
  "/:eventId",
  authenticate,
  authorize("user"),
  createRegistration
);

export default router;