import "dotenv/config";
import passport from "passport";
import { Strategy as LocalStrategy,} from "passport-local";
import { Strategy as JWTStrategy,
            ExtractJwt,
} from "passport-jwt";
import sessionsService from "../services/sessions.service.js";

const cookieExtractor = (req) => {
  if (
    req &&
    req.cookies &&
    req.cookies.currentUser
  ) {
    return req.cookies.currentUser;
  }

  return null;
};

const getPassportErrorInfo = (
  error,
  defaultMessage
) => {
  return {
    message:
      error?.message ||
      defaultMessage,

    status:
      error?.statusCode ||
      500,
  };
};

const initializePassport = () => {
        passport.use(
            "register", new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true,
        session: false,
      },

      async (
        req,
        email,
        password,
        done
      ) => {
        try {
          const result = await sessionsService.register({
              first_name: req.body.first_name,
              last_name: req.body.last_name,
              email,
              password,
            });

          return done(
            null,
            result.userDocument
          );
        } catch (error) {
          if (
            error?.statusCode >= 400 &&
            error?.statusCode < 500
          ) {
            return done(
              null,
              false,
              getPassportErrorInfo(
                error,
                "No se pudo registrar el usuario"
              )
            );
          }
          return done(error);
        }
      }
    )
  );

  passport.use("login", new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        session: false,
      },

      async (
        email,
        password,
        done
      ) => {
        try {
          const user = await sessionsService.login(
              email,
              password
            );

          return done(
            null,
            user
          );
        } catch (error) {
          if (
            error.statusCode >= 400 &&
            error.statusCode < 500
          ) {
            return done(
              null,
              false,
              getPassportErrorInfo(
                error,
                "Credenciales invalidas"
              )
            );
          }
          return done(error);
        }
      }
    )
  );

  passport.use( "current",
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJwt.fromExtractors([
            cookieExtractor,
          ]),

        secretOrKey: process.env.JWT_SECRET,
      },

      async (
        jwtPayload,
        done
      ) => {
        try {
          const userId =
            jwtPayload?.id ||
            jwtPayload?._id;

          if (!userId) {
            return done(
              null,
              false,
              {
                message:
                  "Token invalido",
                status: 401,
              }
            );
          }

          const user =
            await sessionsService
              .getCurrentUser(
                userId
              );

          if (!user) {
            return done(
              null,
              false,
              {
                message:
                  "Usuario no encontrado",
                status: 401,
              }
            );
          }

          return done(
            null,
            user
          );
        } catch (error) {
          if (
            error.statusCode === 401 ||
            error.statusCode === 404
          ) {
            return done(
              null,
              false,
              {
                message:
                  error.message,
                status: 401,
              }
            );
          }
          return done(
            error,
            false
          );
        }
      }
    )
  );
};

export default initializePassport;