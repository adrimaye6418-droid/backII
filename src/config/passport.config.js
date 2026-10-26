import "dotenv/config";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JWTStrategy, ExtractJwt } from "passport-jwt";
import UserModel from "../models/user.js";
import bcrypt from "bcrypt";

const cookieExtractor = (req) => {
    if (req && req.cookies) {
        return req.cookies.currentUser;
    }
    return null;
};

// Configuración de la estrategia local

const initializePassport = () => {

    // Estrategia de registro
    passport.use(
        "register",
        new LocalStrategy(
            {   usernameField: "email", 
                passwordField: "password",
                passReqToCallback: true,
            },
            async (req, email, password, done) => {
                try { 
                    const normalizedEmail = email.trim().toLowerCase();
                    const existingUser = await UserModel.findOne({ email: normalizedEmail });

                    if (existingUser) {
                        return done(null, false, 
                            { message: "Usuario ya existente",
                              status: 409,
                             });
                    }

                    const hashedPassword =  bcrypt.hashSync(password, 10);

                    const newUser = await UserModel.create({
                        ...req.body,
                        email: normalizedEmail,
                        password: hashedPassword,
                        role: req.body.role || "user",
                    });

                    return done(null, newUser);
                } catch (error) {
                    if (error.code === 11000) {
                        return done(null, false, {
                            message: "El correo electrónico ya está en uso",
                            status: 409,
                        });
                    }
                    return done(error);
                }
            }
        )
    );

    // Estrategia de login
    passport.use(
        "login",
        new LocalStrategy(
            {   usernameField: "email",
                passwordField: "password",
             },
            async (email, password, done) => {
                try {
                    const normalizedEmail = email.trim().toLowerCase();
                    const user = await UserModel.findOne({ email: normalizedEmail });

                    if (!user) {
                        return done(null, false, {
                            message: "Usuario no encontrado",
                            status: 404,
                        });
                    }

                    const isValid = bcrypt.compareSync(password, user.password);
                
                if (!isValid) {
                        return done(null, false, {
                            message: "Credenciales inválidas",
                            status: 401,
                        });
                    }

                    return done(null, user);

                } catch (error) {

                    return done(error);
                }
            }
        )
    );

    // CURRENT

    passport.use(
        "current",
        new JWTStrategy(
            {
                jwtFromRequest: ExtractJwt.fromExtractors([
                    (req) => req?.cookies?.currentUser || null,
                ]),
                secretOrKey: process.env.JWT_SECRET,
            },
            async (jwtPayload, done) => {
                try {
                    return done(null, jwtPayload);
                } catch (error) {
                    return done(error, false);
                }
            }
        )
    );
};

export default initializePassport;
