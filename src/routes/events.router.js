import { Router } from "express";
import { createEvent,
        getEvents,
        getEventById,
        updateEvent,
        changeEventStatus
 } from "../controllers/events.controller.js";
 import {
  createTicket,
  getEventTickets,
} from "../controllers/tickets.controller.js";
 import { authenticate } from "../middlewares/auth.middleware.js";
 import { authorize } from "../middlewares/authorize.middleware.js";

const router = Router();

// Consultar todos los eventos
router.get("/", getEvents);

// Consultar un evento por ID
router.get("/:id", getEventById);

// Crear un evento
router.post(
    "/", 
    authenticate,
    authorize("organizer" , "admin"),
    createEvent
);

// Crear una inscripción para un evento
router.post(
  "/:eid/tickets",
  authenticate,
  createTicket
);

// Consultar tickets de un evento
// El servicio valida que sea el organizador propietario o admin.
router.get(
  "/:eid/tickets",
  authenticate,
  authorize("organizer", "admin"),
  getEventTickets
);


// Modificar un evento
router.put(
    "/:id", 
    authenticate, 
    authorize("organizer" , "admin"), 
    updateEvent
);

// Cambiar el estado de un evento
router.patch(
    "/:id/status",
    authenticate,
    authorize("organizer" , "admin"),
    changeEventStatus
);

export default router;