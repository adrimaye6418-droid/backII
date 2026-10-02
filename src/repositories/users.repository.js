import usersDAO from '../dao/users.dao.js';

class UsersRepository {
  async getByEmail(email) {
    return usersDAO.findByEmail(email);
  }

    async create(userData) {
    return usersDAO.create(userData);
  }
}
export default new UsersRepository();