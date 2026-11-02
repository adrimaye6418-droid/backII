import express from "express";
import cookieParser from "cookie-parser";
import eventsRouter from "./routes/events.router.js";
import usersRouter from "./routes/users.router.js";
import sessionsRouter from "./routes/sessions.router.js";
import passport from "passport";
import initializePassport  from "./config/passport.config.js";



const app = express();

app.use(express.json());
app.use(cookieParser());

initializePassport();
app.use(passport.initialize());


app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        message: "Servidor activo"
    });
});

app.use("/api/sessions", sessionsRouter);
app.use("/api/events", eventsRouter);
app.use("/api/users", usersRouter);

app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({
        status: "error",
        message: "Error interno del servidor",
    });
});

export default app;