import sessionsService from "../services/sessions.service.js";

export const register = async (req, res) => { 
  try {
    const user = await sessionsService.register(req.body);
    res.status(201).json({
      status: "success",
      message: "Usuario registrado con exito",
    });
  } catch (error) {
    res.status(error.statusCode || 400).json({
      status: "error",
      message: error.message,
    });
  }
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
    payload: req.user
  });
}
  
export const logout = async (req, res) => {
  try{
  res.clearCookie("currentUser");

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