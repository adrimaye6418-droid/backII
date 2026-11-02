import { Router } from "express";
import { createEvent,
        getPublishedEvents,
        updateEvent,
 } from "../controllers/events.controller.js";
 import { authenticate } from "../middlewares/auth.middleware.js";
 import { authorize } from "../middlewares/authorize.middleware.js";

const router = Router();

router.get("/", getPublishedEvents);

router.post(
    "/", 
    authenticate,
    authorize("organizer" , "admin"),
    createEvent
);

router.put(
    "/:eventId", 
    authenticate, 
    authorize("organizer" , "admin"), 
    updateEvent
);

export default router;