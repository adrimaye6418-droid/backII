import usersRepository from "../repositories/users.repository.js";

class UsersService {
  async getUsers() {
    return usersRepository.findAll();
  }
}

export default new UsersService();