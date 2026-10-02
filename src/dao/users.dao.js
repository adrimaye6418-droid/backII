import User from "../models/user.js";

class UsersDAO {
  async findByEmail(email) {
    return User.findOne({ email });
  }

  async create(userData) {
    return User.create(userData);
  }
}

export default new UsersDAO();