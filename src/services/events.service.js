import mongoose from "mongoose";
import eventsRepository from "../repositories/events.repository.js";
import { AppError } from "../utils/AppError.js";

const VALID_STATUSES = [
  "draft",
  "published",
  "cancelled",
  "finalized",
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
                (typeof data[field] === "string" && data[field].trim() === "")
        );

        if (missingFields.length > 0) {
            throw new AppError(
                `Faltan campos obligatorios: ${missingFields.join(", ")}`,
                400);
        }
    }

    validateNumbers({ capacity, price }) {
        const parsedCapacity = Number(capacity);
        const parsedPrice = Number(price);

        if (!Number.isInteger(parsedCapacity) || parsedCapacity <= 0
        ) {throw new AppError("La capacidad debe ser mayor que 0",
                400);
        }

        if (!Number.isFinite(parsedPrice) ||
            parsedPrice < 0
        ) {throw new AppError("El precio no puede ser negativo",
            400);
        }
    }
    
    validateFutureDate(date) {
        const eventDate = new Date(date);

        if (Number.isNaN(eventDate.getTime())) 
            {throw new AppError("La fecha del evento no es válida",
                400);
            }
        if (eventDate <= new Date()) {
            throw new AppError("No se puede crear un evento con fecha pasada",
                400);
            }
        return eventDate;
    }
    
    validateTextField(fieldValue, fieldName) {
        const normalizedValue = String(fieldValue || "").trim();

        if (normalizedValue === "") {
            throw new AppError(`El campo ${fieldName} no puede estar vacío`, 
                400);
            }
        return normalizedValue;
    }

    validateOwnership(event, user) {
        const userId = user?._id || user?.id;
            if (!userId) {
                throw new AppError("No autenticado", 
                    401);
            }

        const isAdmin = user.role === "admin";

        const isOwner = event.organizer.toString() === userId.toString();

            if (!isAdmin && !isOwner) {
                throw new AppError("No tenés permisos para modificar este evento",
                    403);
                }
    }

    async createEvent(data, user) {
        this.validateRequiredFields(data);
        this.validateFutureDate(data.date);
        this.validateNumbers(data);

        const organizerId = user?._id || user?.id;

            if (!organizerId) {
                throw new AppError("No autenticado", 
                    401);
            }   
        const title = this.validateTextField(data.title, "title");
        const description = this.validateTextField(data.description, "description");
        const category = this.validateTextField(data.category, "category").toLowerCase();
        const location = this.validateTextField(data.location, "location");

        return eventsRepository.create({
            title,
            description,
            category,
            date: new Date(data.date),
            location,
            capacity: Number(data.capacity),
            price: Number(data.price),
            organizer: organizerId,
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
            const normalizedStatus = String(status || "").trim().toLowerCase();
                if (!VALID_STATUSES.includes(normalizedStatus)) {
                throw new AppError("El estado solicitado no es válido",
                    400
                );
            }
            filter.status = normalizedStatus;
        }

        if (category) {
            const normalizedCategory = String(category)
            .trim()
            .toLowerCase();
            if (!normalizedCategory) {
                throw new AppError("La categoría no puede estar vacía",
                    400
                );
            }
            filter.category = normalizedCategory;
    }

        if (location) {
            const normalizedLocation = String(location)
            .trim()
            .toLowerCase();
            if (!normalizedLocation) {
                throw new AppError("La ubicación no puede estar vacía",
                    400
                );
            }
            filter.location = {
                $regex: normalizedLocation,
                $options: "i"
            };
        }

        if (dateFrom || dateTo) {
        filter.date = {};

            if (dateFrom) {
                const from = new Date(dateFrom);

                if (Number.isNaN(from.getTime())) {
                    throw new AppError("dateFrom no es una fecha válida",
                         400
                        );
                    }

            filter.date.$gte = from;
            }
            
            if (dateTo) {
                const to = new Date(dateTo);

                if (Number.isNaN(to.getTime())) {
                    throw new AppError("dateTo no es una fecha válida",
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
                throw new AppError("dateFrom no puede ser posterior a dateTo",
                    400
                    );
                }
        }

        const requestedSort = String(query.sort || "date").trim();
        const descending = requestedSort.startsWith("-");
        const sortField = requestedSort.replace(/^-/, "");

            if (!ALLOWED_SORT_FIELDS.includes(sortField)) {
                throw new AppError("El campo de ordenamiento no es válido",
                    400);
                }

        const sort = {[sortField]: descending ? -1 : 1,
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

    const event = await eventsRepository.findById(id);

        if (!event) {
        throw new AppError("Evento no encontrado",
            404
            );
        }

        return event;
    }

    async updateEvent(id, data, user) {
        this.validateId(id);

    const event = await eventsRepository.findByIdWithoutPopulate(id);

        if (!event) {
            throw new AppError("Evento no encontrado",
                404
            );
        }

        this.validateOwnership(event, user);

        if (event.status === "cancelled") {
            throw new AppError("Los eventos cancelados no pueden modificarse",
                400
            );
        }
        if (event.status === "finalized") {
            throw new AppError("Los eventos finalizados no pueden modificarse",
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

    const receivedFields = Object.keys(data);

    const invalidFields = receivedFields.filter(
      (field) => !allowedFields.includes(field)
    );

        if (invalidFields.length > 0) {
            throw new AppError(`Los siguientes campos no son válidos: ${invalidFields.join(", ")}`,
                400
            );
        }

        if (receivedFields.length === 0) {
            throw new AppError("Debes enviar al menos un campo para actualizar",
                400
            );
        }

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

            if (data.title !== undefined) {
                event.title = this.validateTextField(data.title, "title");
            }

            if (data.description !== undefined) {
                event.description = this.validateTextField(data.description, "description");
            }
            if (data.category !== undefined) {
                event.category = this.validateTextField(data.category, "category").toLowerCase();
            }
            if (data.location !== undefined) {
                event.location = this.validateTextField(data.location, "location");
            }
            if (data.date !== undefined) {
                event.date = new Date(data.date);  
            }
            if (data.capacity !== undefined) {
                event.capacity = Number(data.capacity);
            }
            if (data.price !== undefined) {
                event.price = Number(data.price);
            }
            
            return eventsRepository.save(event);
        }

        


    async changeStatus(id, newStatus, user) {
        this.validateId(id);

    const event = await eventsRepository.findByIdWithoutPopulate(id);

        if (!event) {
            throw new AppError("Evento no encontrado",
                404
            );
        }

        this.validateOwnership(event, user);

        if (event.status === "cancelled") {
            throw new AppError("No se puede cambiar el estado de un evento cancelado",
                400
            );
        }

        if (event.status === "finalized") {
            throw new AppError("No se puede cambiar el estado de un evento finalizado",
                400
            );
        }

        const normalizedStatus = String(newStatus || "")
            .trim()
            .toLowerCase();

        if (!VALID_STATUSES.includes(normalizedStatus)) {
            throw new AppError("Estado de evento no válido",
                400
            );
        }
        if (event.status === normalizedStatus) {
            throw new AppError(`El evento ya se encuentra en estado ${normalizedStatus}`,
                409
            );
        }

        if (normalizedStatus === "published" &&
            event.date <= new Date()) {
            throw new AppError("No se puede publicar un evento cuya fecha ya pasó",
                400
            );
        }
        event.status = normalizedStatus;

        return eventsRepository.save(event);
    }

}
export default new EventsService();