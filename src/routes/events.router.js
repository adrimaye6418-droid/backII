import { Router } from "express";
import { createEvent,
        getEvents,
        getEventById,
        updateEvent,
        changeEventStatus
 } from "../controllers/events.controller.js";
 import { authenticate } from "../middlewares/auth.middleware.js";
 import { authorize } from "../middlewares/authorize.middleware.js";

const router = Router();

router.get("/", getEvents);

router.get("/:id", getEventById);

router.post(
    "/", 
    authenticate,
    authorize("organizer" , "admin"),
    createEvent
);

router.put(
    "/:id", 
    authenticate, 
    authorize("organizer" , "admin"), 
    updateEvent
);

router.patch(
    "/:id/status",
    authenticate,
    authorize("organizer" , "admin"),
    changeEventStatus
);

export default router;