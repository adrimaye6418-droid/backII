import bcrypt from "bcrypt";

export const hashPassword = async (password) => {
  const saltRounds = 6;
  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

export const comparePassword = async (
  password, 
  hashedPassword
) => {
  return await bcrypt.compare(password, hashedPassword);
}; 

