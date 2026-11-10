class UserDTO {
  constructor(user) {
    const data =
      UserDTO.toPlainObject(user);

    this._id = data._id?.toString() || data.id;
    this.first_name = data.first_name;
    this.last_name = data.last_name;
    this.email = data.email;
    this.role = data.role;

    if (data.createdAt) {
      this.createdAt = data.createdAt;
    }

    if (data.updatedAt) {
      this.updatedAt = data.updatedAt;
    }
  }

  static toPlainObject(user) {
    if (!user) {
      return {};
    }

    if (
      typeof user.toObject ===
      "function"
    ) {
      return user.toObject();
    }

    return user;
  }

  static from(user) {
    if (!user) {
      return null;
    }

    return new UserDTO(user);
  }

  static fromList(users = []) {
    return users.map(
      (user) =>
        new UserDTO(user)
    );
  }
}

export default UserDTO;