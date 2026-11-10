import UserDTO from "./user.dto.js";

class EventDTO {
  constructor(event) {
    const data = EventDTO.toPlainObject(event);

    this.id = data._id?.toString() || data.id;
    this.title = data.title;
    this.description = data.description;
    this.category = data.category;
    this.date = data.date;
    this.location = data.location;
    this.capacity = data.capacity;
    this.price = data.price;
    this.status = data.status;

    this.organizer = EventDTO.mapOrganizer(
      data.organizer
    );

    if (data.createdAt) {
      this.createdAt = data.createdAt;
    }

    if (data.updatedAt) {
      this.updatedAt = data.updatedAt;
    }
  }

  static toPlainObject(event) {
    if (!event) {
      return {};
    }

    if (typeof event.toObject === "function") {
      return event.toObject();
    }

    return event;
  }

  static mapOrganizer(organizer) {
    if (!organizer) {
      return null;
    }

    /*
     * Si organizer está populated, se filtra
     * mediante UserDTO.
     */
    if (
      typeof organizer === "object" &&
      (
        organizer._id ||
        organizer.id
      )
    ) {
      return UserDTO.from(organizer);
    }

    /*
     * Si organizer es solamente un ObjectId,
     * se devuelve como texto.
     */
    return organizer.toString();
  }

  static from(event) {
    if (!event) {
      return null;
    }

    return new EventDTO(event);
  }

  static fromList(events = []) {
    return events.map(
      (event) => new EventDTO(event)
    );
  }
}

export default EventDTO;
