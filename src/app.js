import express from "express";
import cookieParser from "cookie-parser";
import eventsRouter from "./routes/events.router.js";
import usersRouter from "./routes/users.router.js";
import sessionsRouter from "./routes/sessions.router.js";
import passport from "passport";
import initializePassport  from "./config/passport.config.js";
import ticketsRouter from "./routes/tickets.router.js";



const app = express();

// Middlewares generales
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Passport
initializePassport();
app.use(passport.initialize());

// Comprobar que el servidor funciona
app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        message: "Servidor activo"
    });
});

// Rutas
app.use("/api/sessions", sessionsRouter);
app.use("/api/events", eventsRouter);
app.use("/api/users", usersRouter);
app.use("/api/tickets", ticketsRouter);

// Ruta no encontrada
app.use((req, res) => {
  return res.status(404).json({
    status: "error",
    message: "Ruta no encontrada",
  });
});

// Middleware global de errores
app.use((error, req, res, next) => {
    console.error(error);

    if (error.name === "ValidationError") {
        const messages = Object.values(error.errors).map((item) => item.message);
        return res.status(400).json({
            status: "error",
            message: "Error de validación",
            errors: messages,
        });
    }
    if (error.name === "CastError") {
        return res.status(400).json({
            status: "error",
            message: "El identificador proporcionado no es válido",
        });
    }
    if (error.code === 11000) {
        return res.status(409).json({
            status: "error",
            message: "Ya existe un registro con estos datos",
        });
    }
        return res.status(error.statusCode || 500).json({
        status: "error",
        message: error.message || "Error interno del servidor",
 
    });
});

export default app;