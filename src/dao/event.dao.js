import EventModel from "../models/event.js";

class EventDAO {
  async findById(id, options = {}) {
    const {
      populate = null,
      select = null,
      lean = false,
    } = options;

    let query = EventModel.findById(id);

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

    let query = EventModel.findOne(filter);

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

    let query = EventModel.find(filter);

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
    return EventModel.create(data);
  }

  async updateById(id, data, options = {}) {
    return EventModel.findByIdAndUpdate(
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
    return EventModel.findOneAndUpdate(
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
    return EventModel.countDocuments(filter);
  }

  async exists(filter) {
    return EventModel.exists(filter);
  }

  async deleteById(id) {
    return EventModel.findByIdAndDelete(id);
  }
}

export default EventDAO;