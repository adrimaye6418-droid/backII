import EventDAO from "../dao/event.dao.js";
import EventDTO from "../dto/event.dto.js";

class EventsRepository {
  constructor(dao) {
    this.dao = dao;
  }

  async create(data) {
    const event =
      await this.dao.create(data);

    return EventDTO.from(event);
  }

  async findById(id) {
    const event =
      await this.dao.findById(
        id,
        {
          populate: {
            path: "organizer",
            select:
              "first_name last_name email role",
          },
        }
      );

    return EventDTO.from(event);
  }

  async findByIdWithoutPopulate(id) {
 
    return this.dao.findById(id);
  }

  async findPublishedEvents(
    options = {}
  ) {
    const events =
      await this.dao.find(
        {
          status: "published",
        },
        {
          populate: {
            path: "organizer",
            select:
              "first_name last_name email role",
          },

          sort:
            options.sort || {
              date: 1,
            },

          skip:
            options.skip || 0,

          limit:
            options.limit || 0,

          lean: true,
        }
      );

    return EventDTO.fromList(events);
  }

  async findPaginated({
    filter,
    skip,
    limit,
    sort,
  }) {
    const events =
      await this.dao.find(
        filter,
        {
          populate: {
            path: "organizer",
            select:
              "first_name last_name email role",
          },
          skip,
          limit,
          sort,
          lean: true,
        }
      );

    return EventDTO.fromList(events);
  }

  async count(filter = {}) {
    return this.dao.count(filter);
  }

  async save(event) {
    const savedEvent =
      await this.dao.save(event);

    const populatedEvent =
      await this.dao.findById(
        savedEvent._id,
        {
          populate: {
            path: "organizer",
            select:
              "first_name last_name email role",
          },
        }
      );

    return EventDTO.from(
      populatedEvent
    );
  }

  async updateById(id, data) {
    const updatedEvent =
      await this.dao.updateById(
        id,
        data
      );

    if (!updatedEvent) {
      return null;
    }

    const populatedEvent =
      await this.dao.findById(
        updatedEvent._id,
        {
          populate: {
            path: "organizer",
            select:
              "first_name last_name email role",
          },
        }
      );

    return EventDTO.from(
      populatedEvent
    );
  }

  async exists(filter) {
    return this.dao.exists(filter);
  }
}

const eventDAO =
  new EventDAO();

const eventsRepository =
  new EventsRepository(
    eventDAO
  );

export {
  EventsRepository,
  eventsRepository,
};

export default eventsRepository;