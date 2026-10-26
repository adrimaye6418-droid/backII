import sessionsService from "../services/sessions.service.js";
import { generateToken } from "../utils/jwt.js";

export const register = async (req, res) => { 
  res.status(201).json({
    status: "success",
    message: "Usuario registrado"
    });
  };

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await sessionsService.login(
      email, 
      password
    );
    const token = generateToken(user);

    res.cookie("currentUser", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60, // 1 hora
    });
    res.status(200).json({
      status: "success",
      message: "Login correcto"
    });
  } catch (error) {
    res.status(error.statusCode || 400).json({
      status: "error",
      message: error.message,
    });
  }

}

export const current = async (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Usuario autenticado",
    payload: { user: req.user,
              email: req.user.email,
              role: req.user.role,
    }
  });
}
  
export const logout = async (req, res) => {
  res.clearCookie("currentUser", {
    httpOnly: true,
    sameSite: "lax",
  });
  res.status(200).json({
    status: "success",
    message: "Logout correcto"
  });
};
  
