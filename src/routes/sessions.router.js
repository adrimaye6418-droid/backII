import { Router } from "express";
import { register, 
         login,
         current,
         logout
        } from "../controllers/sessions.controller.js";
import { auth } from "../middlewares/auth.middleware.js";
import passport from "passport";

const router = Router();

router.post("/register", (req, res, next) => { 
        passport.authenticate (
                "register",
                { session: false },
                (error, user, info) => {
                        if (error) {
                                return next(error);
                        }

                        if (!user) {
                                return res.status(info?.status || 400).json({
                                        status: "error",
                                        message: info?.message || "No se pudo registrar el usuario"
                                });
                        }

                        req.user = user;
                        return register (req, res);
                }
        )(req, res, next); 

} );

router.post("/login", (req, res, next) => {passport.authenticate("login", { session: false }, (err, user) => {
                if (err) return next(err);

                if (!user) {
                        return res.status(401).json({
                                status: "error",
                                message: "Credenciales inválidas"
                        });
                }
                req.user = user;
                next();
        }
)(req, res, next);
},
 login);

router.get("/current", (req, res, next) => {
        passport.authenticate("current", { session: false }, (error, user) => {
                if (error) {
                        return next(error);
                }                        

                if (!user) {
                        return res.status(401).json({
                                status: "error",
                                message: "No se pudo autenticar el usuario"
                        });
                }
                req.user = user;
                return current(req, res);
        })(req, res, next);
});

router.post("/logout", logout);

export default router;
