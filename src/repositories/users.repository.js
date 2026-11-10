import UserDAO from "../dao/user.dao.js";
import UserDTO from "../dto/user.dto.js";

class UsersRepository {
  constructor(dao) {
    this.dao = dao;
  }
  async findById(id) {
    const user =
      await this.dao.findById(id,
        {
          select: "-password",
        }
      );

    return UserDTO.from(user);
  }
  async findByIdWithCredentials(id) {
    return this.dao.findById(id);
  }
  async findByEmail(email) {
    const normalizedEmail = this.normalizeEmail(email);

    const user = await this.dao.findOne(
        {
          email: normalizedEmail,
        },
        {
          select: "-password",
        }
      );

    return UserDTO.from(user);
  }
  async getByEmail(email) {
    return this.findByEmail(email);
  }
  async findCredentialsByEmail(email) {
    const normalizedEmail = this.normalizeEmail(email);

    return this.dao.findOne(
      {
        email: normalizedEmail,
      },
      {
        select:
          "+password",
      }
    );
  }
  async create(userData) {
    const createdUser = await this.dao.create({
        ...userData,

        email:
          this.normalizeEmail(
            userData.email
          ),
      });

    return UserDTO.from(
      createdUser
    );
  }

  async createWithDocument(userData) {
    return this.dao.create({
      ...userData,

      email:
        this.normalizeEmail(
          userData.email
        ),
    });
  }

  async updateById(id, data) {
    const updateData = {
      ...data,
    };

    if (data.email !== undefined) {
      updateData.email =
        this.normalizeEmail(
          data.email
        );
    }

    delete updateData.password;
      const updatedUser = await this.dao.updateById(
        id,
       updateData,
        {
         select: "-password",
        }      );

    return UserDTO.from(updatedUser);
  }

  async emailExists(email) {
    const normalizedEmail = this.normalizeEmail(email);

    const result = await this.dao.exists({
      email: normalizedEmail,
    });

    return Boolean(result);
  }

  async findAll() {
    const users =
      await this.dao.find(
        {},
        {
        select: "-password",
        sort: {
          createdAt: -1,
        },
        lean: true,
        }
      );

    return UserDTO.fromList(users);
  }

  async countUsers(filter = {}) {
    return this.dao.count(filter);
  }

  normalizeEmail(email) {
   return String(email || "")
      .trim()
      .toLowerCase();
  }
}
  const userDAO = new UserDAO();

  const usersRepository =
  new UsersRepository(userDAO);

export {
  UsersRepository,
  usersRepository,
};

export default usersRepository;