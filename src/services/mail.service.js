import nodemailer from "nodemailer";
import { AppError } from "../utils/AppError.js";

class MailService {
  createTransporter() {
    const port = Number(process.env.MAIL_PORT);

    if (
      !process.env.MAIL_HOST ||
      !port ||
      !process.env.MAIL_USER ||
      !process.env.MAIL_PASS ||
      !process.env.MAIL_FROM
    ) {
      throw new AppError(
        "Falta configurar alguna variable del servicio de email",
        500
      );
    }

    return nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port,
      secure: port === 465,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async sendTicketConfirmation({
    to,
    userName,
    eventTitle,
    eventDate,
    eventLocation,
    quantity,
    reservationCode,
  }) {
    const transporter = this.createTransporter();

    const formattedDate = new Intl.DateTimeFormat("es-AR", {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "America/Argentina/Buenos_Aires",
    }).format(new Date(eventDate));

    try {
      return await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to,
        subject: `Inscripción confirmada: ${eventTitle}`,

        text: `
Hola ${userName}.

Tu inscripción al evento "${eventTitle}" fue confirmada.

Fecha: ${formattedDate}
Lugar: ${eventLocation}
Cantidad: ${quantity}
Código de reserva: ${reservationCode}

Conservá este código para identificar tu inscripción.
        `.trim(),

        html: `
          <div
            style="
              max-width: 600px;
              margin: 0 auto;
              padding: 24px;
              font-family: Arial, sans-serif;
              color: #202124;
            "
          >
            <h1 style="color: #2563eb;">
              Inscripción confirmada
            </h1>

            <p>Hola <strong>${userName}</strong>.</p>

            <p>
              Tu inscripción al evento
              <strong>${eventTitle}</strong>
              fue confirmada correctamente.
            </p>

            <h2>Información de la reserva</h2>

            <ul>
              <li><strong>Fecha:</strong> ${formattedDate}</li>
              <li><strong>Lugar:</strong> ${eventLocation}</li>
              <li><strong>Cantidad:</strong> ${quantity}</li>
            </ul>

            <div
              style="
                margin-top: 20px;
                padding: 16px;
                background-color: #f3f4f6;
                border-radius: 8px;
              "
            >
              <strong>Código de reserva:</strong>
              <span>${reservationCode}</span>
            </div>

            <p style="margin-top: 24px;">
              Conservá este código para identificar tu inscripción.
            </p>
          </div>
        `,
      });
    } catch (error) {
      console.error("Error enviando email de confirmación:", error.message);

      throw new AppError(
        "No se pudo enviar el email de confirmación",
        502
      );
    }
  }
}

export default new MailService();