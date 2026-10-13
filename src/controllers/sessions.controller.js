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
   
    res.status(200).json({
      status: "success",
      message: "Login correcto",
      payload: user
    });

  } catch (error) {
    res.status(error.statusCode || 401).json({
      status: "error",
      message: "Credenciales inválidas",
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
  try {
    await sessionsService.logout(req, res);
  } catch (error) {
    res.status(error.statusCode || 400).json({
      status: "error",
      message: error.message,
    });
  } 
  
}