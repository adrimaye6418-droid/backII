import UserModel from "../models/user.js";

class UserDAO {
  async findById(id, options = {}) {
    const {
      select = null,
      lean = false,
    } = options;

    let query = UserModel.findById(id);

    if (select) {
      query = query.select(select);
    }

    if (lean) {
      query = query.lean();
    }

    return query;
  }

  async findOne(filter, options = {}) {
    const {
      select = null,
      lean = false,
    } = options;

    let query = UserModel.findOne(filter);

    if (select) {
      query = query.select(select);
    }

    if (lean) {
      query = query.lean();
    }

    return query;
  }

  async find(filter = {}, options = {}) {
    const {
      select = null,
      sort = null,
      skip = 0,
      limit = 0,
      lean = false,
    } = options;

    let query = UserModel.find(filter);

    if (select) {
      query = query.select(select);
    }

    if (sort) {
      query = query.sort(sort);
    }

    if (skip > 0) {
      query = query.skip(skip);
    }

    if (limit > 0) {
      query = query.limit(limit);
    }

    if (lean) {
      query = query.lean();
    }

    return query;
  }

  async create(data) {
    return UserModel.create(data);
  }

  async updateById(id, data, options = {}) {
    return UserModel.findByIdAndUpdate(
      id,
      data,
      {
        new: true,
        runValidators: true,
        ...options,
      }
    );
  }

  async updateOne(filter, data, options = {}) {
    return UserModel.findOneAndUpdate(
      filter,
      data,
      {
        new: true,
        runValidators: true,
        ...options,
      }
    );
  }

  async count(filter = {}) {
    return UserModel.countDocuments(filter);
  }

  async exists(filter) {
    return UserModel.exists(filter);
  }
}

export default UserDAO;