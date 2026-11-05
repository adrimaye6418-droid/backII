import mongoose from "mongoose";
import eventsRepository from "../repositories/events.repository.js";
import { AppError } from "../utils/AppError.js";

const VALID_STATUSES = [
  "draft",
  "published",
  "cancelled",
  "finished",
];

const ALLOWED_SORT_FIELDS = [
  "date",
  "title",
  "price",
  "capacity",
  "createdAt",
];

class EventsService {
    validateId(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError("ID de evento inválido", 400);
        }
    }

    validateRequiredFields(data) {
        const requiredFields = [
            "title",
            "description",
            "category",
            "date",
            "location",
            "capacity",
            "price",
        ];

        const missingFields = requiredFields.filter(
            (field) =>
                data[field] === undefined ||
                data[field] === null ||
                data[field] === ""
        );

        if (missingFields.length > 0) {
            throw new AppError(
                `Faltan campos obligatorios: ${missingFields.join(", ")}`,
                400
            );
        }
    }

    validateNumbers({ capacity, price }) {
        const parsedCapacity = Number(capacity);
        const parsedPrice = Number(price);

        if (
            !Number.isFinite(parsedCapacity) ||
            parsedCapacity <= 0
    ) {
        throw new AppError(
            "La capacidad debe ser mayor que 0",
            400
      );
    }

        if (
            !Number.isFinite(parsedPrice) ||
            parsedPrice < 0
    ) {
        throw new AppError(
            "El precio no puede ser negativo",
            400
          );
        }
      }
    

    validateFutureDate(date) {
        const eventDate = new Date(date);

        if (
            Number.isNaN(eventDate.getTime())) 
            {
             throw new AppError(
                "La fecha del evento no es válida",
                400
      );
    }

        if (eventDate <= new Date()) {
            throw new AppError(
                "No se puede crear un evento con fecha pasada",
                400
      );
    }
  }

    validateOwnership(event, user) {
        const userId = user._id || user.id;

        const isAdmin = user.role === "admin";

        const isOwner = event.organizer.toString() === userId.toString();

        if (!isAdmin && !isOwner) {
            throw new AppError(
            "No tenés permisos para modificar este evento",
            403
        );
    }
  }

    async createEvent(data, user) {
        this.validateRequiredFields(data);
        this.validateFutureDate(data.date);
        this.validateNumbers(data);

    const organizerId = user._id || user.id;

        if (!organizerId) {
        throw new AppError("No autenticado", 401);
        }   

        return eventsRepository.create({
            title: data.title,
            description: data.description,
            category: data.category
                .trim()
                .toLowerCase(),
                    date: new Date(data.date),
                    location: data.location,
                    capacity: Number(data.capacity),
                    price: Number(data.price),

      // No se acepta organizer desde el body.
      organizer: organizerId,

      // El evento comienza como borrador.
      status: "draft",
    });
  }

    async getEvents(query) {
    const {
      status,
      category,
      location,
      dateFrom,
      dateTo,
    } = query;

    const requestedPage = Number(query.page);
    const requestedLimit = Number(query.limit);

    const page = Number.isInteger(requestedPage) && requestedPage > 0
        ? requestedPage
        : 1;

    const limit = Number.isInteger(requestedLimit) && requestedLimit > 0
        ? Math.min(requestedLimit, 100)
        : 10;

    const filter = {};

        if (status) {
            const normalizedStatus = status.toLowerCase();

        if (!VALID_STATUSES.includes(normalizedStatus)) {
        throw new AppError(
          "El estado solicitado no es válido",
          400
        );
      }

        filter.status = normalizedStatus;
    }

        if (category) {
        filter.category = category
            .trim()
            .toLowerCase();
    }

        if (location) {
        filter.location = {
            $regex: location.trim(),
            $options: "i",
        };
    }

        if (dateFrom || dateTo) {
        filter.date = {};

        if (dateFrom) {
            const from = new Date(dateFrom);

        if (Number.isNaN(from.getTime())) {
          throw new AppError(
            "dateFrom no es una fecha válida",
            400
          );
        }

        filter.date.$gte = from;
      }

        if (dateTo) {
            const to = new Date(dateTo);

        if (Number.isNaN(to.getTime())) {
          throw new AppError(
            "dateTo no es una fecha válida",
            400
          );
        }

        filter.date.$lte = to;
      }

        if (
            filter.date.$gte &&
            filter.date.$lte &&
            filter.date.$gte > filter.date.$lte
        ) {
        throw new AppError(
          "dateFrom no puede ser posterior a dateTo",
          400
        );
      }
    }

    const requestedSort = query.sort || "date";
    const descending =
      requestedSort.startsWith("-");

    const sortField = requestedSort.replace(
      /^-/,
      ""
    );

    if (!ALLOWED_SORT_FIELDS.includes(sortField)) {
      throw new AppError(
        "El campo de ordenamiento no es válido",
        400
      );
    }

    const sort = {
      [sortField]: descending ? -1 : 1,
    };

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      eventsRepository.findPaginated({
        filter,
        skip,
        limit,
        sort,
      }),
      eventsRepository.count(filter),
    ]);

    return {
      data,
      page,
      limit,
      total,
      totalPages:
        total === 0
          ? 0
          : Math.ceil(total / limit),
    };
  }

    async getEventById(id) {
        this.validateId(id);

    const event = await eventsRepository.findById(
      id
    );

    if (!event) {
      throw new AppError(
        "Evento no encontrado",
        404
      );
    }

    return event;
  }

    async updateEvent(id, data, user) {
        this.validateId(id);

    const event =
      await eventsRepository.findByIdWithoutPopulate(
        id
      );

    if (!event) {
      throw new AppError(
        "Evento no encontrado",
        404
      );
    }

    this.validateOwnership(event, user);

    if (event.status === "cancelled") {
      throw new AppError(
        "Los eventos cancelados no pueden modificarse",
        400
      );
    }

 
    const allowedFields = [
      "title",
      "description",
      "category",
      "date",
      "location",
      "capacity",
      "price",
    ];

    if (data.date !== undefined) {
      this.validateFutureDate(data.date);
    }

    this.validateNumbers({
      capacity:
        data.capacity !== undefined
          ? data.capacity
          : event.capacity,
      price:
        data.price !== undefined
          ? data.price
          : event.price,
    });

    allowedFields.forEach((field) => {
      if (data[field] !== undefined) {
        event[field] = data[field];
      }
    });

    if (data.category !== undefined) {
      event.category = data.category
        .trim()
        .toLowerCase();
    }

    event.organizer = event.organizer;

    return eventsRepository.save(event);
  }

    async changeStatus(id, newStatus, user) {
        this.validateId(id);

    const event =
      await eventsRepository.findByIdWithoutPopulate(
        id
      );

    if (!event) {
      throw new AppError(
        "Evento no encontrado",
        404
      );
    }

    this.validateOwnership(event, user);

    if (event.status === "cancelled") {
      throw new AppError(
        "No se puede cambiar el estado de un evento cancelado",
        400
      );
    }

    const normalizedStatus = String(
      newStatus || ""
    ).toLowerCase();

    if (!VALID_STATUSES.includes(normalizedStatus)) {
      throw new AppError(
        "Estado de evento no válido",
        400
      );
    }

    if (
      normalizedStatus === "published" &&
      event.status === "finished"
    ) {
      throw new AppError(
        "No se puede publicar un evento finalizado",
        400
      );
    }

    if (
      normalizedStatus === "published" &&
      event.date <= new Date()
    ) {
      throw new AppError(
        "No se puede publicar un evento cuya fecha ya pasó",
        400
      );
    }

    event.status = normalizedStatus;

    return eventsRepository.save(event);
  }
};

export default new EventsService();