import TicketModel from "../models/ticket.js";

class TicketDAO {
  async findById(id, options = {}) {
    const {
      populate = null,
      select = null,
      lean = false,
    } = options;

    let query = TicketModel.findById(id);

    if (select) {
      query = query.select(select);
    }

    if (populate) {
      query = query.populate(populate);
    }

    if (lean) {
      query = query.lean();
    }

    return query;
  }

  async findOne(filter, options = {}) {
    const {
      populate = null,
      select = null,
      lean = false,
    } = options;

    let query = TicketModel.findOne(filter);

    if (select) {
      query = query.select(select);
    }

    if (populate) {
      query = query.populate(populate);
    }

    if (lean) {
      query = query.lean();
    }

    return query;
  }

  async find(filter = {}, options = {}) {
    const {
      populate = null,
      select = null,
      sort = null,
      skip = 0,
      limit = 0,
      lean = false,
    } = options;

    let query = TicketModel.find(filter);

    if (select) {
      query = query.select(select);
    }

    if (populate) {
      query = query.populate(populate);
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
    return TicketModel.create(data);
  }

  async updateById(id, data, options = {}) {
    return TicketModel.findByIdAndUpdate(
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
    return TicketModel.findOneAndUpdate(
      filter,
      data,
      {
        new: true,
        runValidators: true,
        ...options,
      }
    );
  }

  async save(document) {
    return document.save();
  }

  async count(filter = {}) {
    return TicketModel.countDocuments(filter);
  }

  async aggregate(pipeline = []) {
    return TicketModel.aggregate(pipeline);
  }

  async exists(filter) {
    return TicketModel.exists(filter);
  }

  async deleteById(id) {
    return TicketModel.findByIdAndDelete(id);
  }
}

export default TicketDAO;