import {
  beforeAll,
  beforeEach,
  describe,
  expect,
  jest,
  test,
} from "@jest/globals";

import express from "express";
import cookieParser from "cookie-parser";
import request from "supertest";
import jwt from "jsonwebtoken";

/*
 * Estas variables deben existir antes
 * de importar passport.config.js.
 */
process.env.NODE_ENV = "test";
process.env.JWT_SECRET =
  "clave-secreta-para-pruebas";

/*
 * Simulamos sessionsService para que
 * estas pruebas no utilicen MongoDB.
 */
const registerMock = jest.fn();
const loginMock = jest.fn();
const getCurrentUserMock = jest.fn();

jest.unstable_mockModule(
  "../src/services/sessions.service.js",
  () => ({
    default: {
      register: registerMock,
      login: loginMock,
      getCurrentUser:
        getCurrentUserMock,
    },
  })
);

/*
 * Los módulos se importan después de
 * registrar el mock porque el proyecto
 * utiliza ESM.
 */
const passportModule =
  await import("passport");

const passport =
  passportModule.default;

const {
  default: initializePassport,
} = await import(
  "../src/config/passport.config.js"
);

let app;

beforeAll(() => {
  initializePassport();

  app = express();

  app.use(express.json());
  app.use(cookieParser());
  app.use(passport.initialize());

  /*
   * Ruta temporal de registro.
   */
  app.post(
    "/test/register",

    passport.authenticate(
      "register",
      {
        session: false,
      }
    ),

    (req, res) => {
      const user = {
        _id:
          req.user._id?.toString() ||
          req.user.id,

        first_name:
          req.user.first_name,

        last_name:
          req.user.last_name,

        email:
          req.user.email,

        role:
          req.user.role,
      };

      return res.status(201).json({
        status: "success",
        payload: user,
      });
    }
  );

  /*
   * Ruta temporal de login.
   */
  app.post(
    "/test/login",

    passport.authenticate(
      "login",
      {
        session: false,
      }
    ),

    (req, res) => {
      const user = {
        _id:
          req.user._id?.toString() ||
          req.user.id,

        first_name:
          req.user.first_name,

        last_name:
          req.user.last_name,

        email:
          req.user.email,

        role:
          req.user.role,
      };

      return res.status(200).json({
        status: "success",
        payload: user,
      });
    }
  );

  /*
   * Ruta temporal protegida con current.
   */
  app.get(
    "/test/current",

    passport.authenticate(
      "current",
      {
        session: false,
      }
    ),

    (req, res) => {
      return res.status(200).json({
        status: "success",
        payload: req.user,
      });
    }
  );
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe(
  "Estrategia register",
  () => {
    test(
      "registra un usuario correctamente",
      async () => {
        const userDocument = {
          _id:
            "507f1f77bcf86cd799439011",

          first_name:
            "Mayela",

          last_name:
            "Prueba",

          email:
            "mayela@example.com",

          role:
            "user",

          password:
            "hash-que-no-debe-salir",
        };

        registerMock.mockResolvedValue({
          userDocument,

          user: {
            _id:
              userDocument._id,

            first_name:
              userDocument.first_name,

            last_name:
              userDocument.last_name,

            email:
              userDocument.email,

            role:
              userDocument.role,
          },
        });

        const response =
          await request(app)
            .post("/test/register")
            .send({
              first_name:
                "Mayela",

              last_name:
                "Prueba",

              email:
                "MAYELA@EXAMPLE.COM",

              password:
                "Password123!",
            });

        expect(
          response.status
        ).toBe(201);

        expect(
          response.body.status
        ).toBe("success");

        expect(
          response.body.payload.email
        ).toBe(
          "mayela@example.com"
        );

        expect(
          response.body.payload
        ).not.toHaveProperty(
          "password"
        );

        expect(
          registerMock
        ).toHaveBeenCalledTimes(1);

        expect(
          registerMock
        ).toHaveBeenCalledWith({
          first_name:
            "Mayela",

          last_name:
            "Prueba",

          email:
            "MAYELA@EXAMPLE.COM",

          password:
            "Password123!",
        });
      }
    );

    test(
      "rechaza un correo duplicado",
      async () => {
        const error =
          new Error(
            "El correo electrónico ya está en uso"
          );

        error.statusCode = 409;

        registerMock.mockRejectedValue(
          error
        );

        const response =
          await request(app)
            .post("/test/register")
            .send({
              first_name:
                "Mayela",

              last_name:
                "Prueba",

              email:
                "mayela@example.com",

              password:
                "Password123!",
            });

        /*
         * passport.authenticate devuelve
         * 401 por defecto cuando la
         * estrategia finaliza sin usuario.
         */
        expect(
          response.status
        ).toBe(401);

        expect(
          registerMock
        ).toHaveBeenCalledTimes(1);
      }
    );
  }
);

describe(
  "Estrategia login",
  () => {
    test(
      "inicia sesión con credenciales válidas",
      async () => {
        const userDocument = {
          _id:
            "507f1f77bcf86cd799439011",

          first_name:
            "Mayela",

          last_name:
            "Prueba",

          email:
            "mayela@example.com",

          role:
            "user",

          password:
            "hash-interno",
        };

        loginMock.mockResolvedValue(
          userDocument
        );

        const response =
          await request(app)
            .post("/test/login")
            .send({
              email:
                "mayela@example.com",

              password:
                "Password123!",
            });

        expect(
          response.status
        ).toBe(200);

        expect(
          response.body.status
        ).toBe("success");

        expect(
          response.body.payload.email
        ).toBe(
          "mayela@example.com"
        );

        expect(
          response.body.payload
        ).not.toHaveProperty(
          "password"
        );

        expect(
          loginMock
        ).toHaveBeenCalledWith(
          "mayela@example.com",
          "Password123!"
        );
      }
    );

    test(
      "rechaza credenciales inválidas",
      async () => {
        const error =
          new Error(
            "Credenciales inválidas"
          );

        error.statusCode = 401;

        loginMock.mockRejectedValue(
          error
        );

        const response =
          await request(app)
            .post("/test/login")
            .send({
              email:
                "mayela@example.com",

              password:
                "incorrecta",
            });

        expect(
          response.status
        ).toBe(401);

        expect(
          loginMock
        ).toHaveBeenCalledWith(
          "mayela@example.com",
          "incorrecta"
        );
      }
    );
  }
);

describe(
  "Estrategia current",
  () => {
    test(
      "devuelve el usuario autenticado sin password",
      async () => {
        const userDTO = {
          _id:
            "507f1f77bcf86cd799439011",

          first_name:
            "Mayela",

          last_name:
            "Prueba",

          email:
            "mayela@example.com",

          role:
            "user",
        };

        getCurrentUserMock
          .mockResolvedValue(
            userDTO
          );

        const token =
          jwt.sign(
            {
              id:
                "507f1f77bcf86cd799439011",

              role:
                "user",
            },

            process.env.JWT_SECRET,

            {
              expiresIn: "1h",
            }
          );

        const response =
          await request(app)
            .get("/test/current")
            .set(
              "Cookie",
              `currentUser=${token}`
            );

        expect(
          response.status
        ).toBe(200);

        expect(
          response.body.payload
        ).toEqual(userDTO);

        expect(
          response.body.payload
        ).not.toHaveProperty(
          "password"
        );

        expect(
          getCurrentUserMock
        ).toHaveBeenCalledWith(
          "507f1f77bcf86cd799439011"
        );
      }
    );

    test(
      "responde 401 sin cookie",
      async () => {
        const response =
          await request(app)
            .get("/test/current");

        expect(
          response.status
        ).toBe(401);

        expect(
          getCurrentUserMock
        ).not.toHaveBeenCalled();
      }
    );

    test(
      "responde 401 con un token inválido",
      async () => {
        const response =
          await request(app)
            .get("/test/current")
            .set(
              "Cookie",
              "currentUser=token-invalido"
            );

        expect(
          response.status
        ).toBe(401);

        expect(
          getCurrentUserMock
        ).not.toHaveBeenCalled();
      }
    );

    test(
      "responde 401 si el usuario del token no existe",
      async () => {
        const error =
          new Error(
            "Usuario no encontrado"
          );

        error.statusCode = 404;

        getCurrentUserMock
          .mockRejectedValue(
            error
          );

        const token =
          jwt.sign(
            {
              id:
                "507f1f77bcf86cd799439011",
            },

            process.env.JWT_SECRET,

            {
              expiresIn: "1h",
            }
          );

        const response =
          await request(app)
            .get("/test/current")
            .set(
              "Cookie",
              `currentUser=${token}`
            );

        expect(
          response.status
        ).toBe(401);

        expect(
          getCurrentUserMock
        ).toHaveBeenCalledTimes(1);
      }
    );
  }
);