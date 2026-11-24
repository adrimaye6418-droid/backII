
 ** Plataforma de Eventos e Inscripciones

Descripción

API REST desarrollada con Node.js, Express, MongoDB y Mongoose para gestionar usuarios, autenticación y eventos.

 * Tecnologías

Node.js
Express
MongoDB Atlas
Mongoose
bcrypt
JWT (jsonwebtoken)
cookie-parser
dotenv
nodemon


 ** Instalación

 * Clonar el repositorio:

      git clone (https://github.com/adrimaye6418-droid/backII.git)

 * Instalar dependencias:

      npm install


 ** Ejecución
 * Modo desarrollo:
      npm run dev

 * Modo producción:
      npm start

 ** Descripción: Verificando que el servidor esté funcionando.

 * Respuesta:

{
  "status": "ok",
  "message": "Servidor activo"
}

 ** Variables de entorno

Crear archivo .env a partir de .env.example

PORT=8080
MONGO_URL=mongodb+srv://...
JWT_SECRET=...
JWT_EXPIRES_IN=1d

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=...
MAIL_PASS=...
MAIL_FROM=...

 ** Arquitectura

src/
├── config/
├── controllers/
├── dao/
├── dto/
├── middlewares/
├── models/
├── repositories/
├── routes/
├── services/
└── utils/


Los modelos de Mongoose son consumidos únicamente por los DAO.
Los repositories encapsulan el acceso a datos.
Los services contienen la lógica de negocio.
Los controllers gestionan request y response.
Los DTO controlan la información expuesta al cliente.

 ** Endpoints

  *** Sessions

      POST /api/sessions/register
      POST /api/sessions/login
      GET /api/sessions/current
      POST /api/sessions/logout

  *** Events

      GET /api/events
      GET /api/events/:id
      POST /api/events
      PUT /api/events/:id
      PATCH /api/events/:id/status

  *** Tickets

      POST /api/events/:eid/tickets
      GET /api/events/:eid/tickets
      GET /api/tickets/my-tickets
      PATCH /api/tickets/:tid/cancel

 *** Users

      GET /api/users


  ** Flujo de inscripción

      El organizer crea un evento.
      El evento se publica.
      Un usuario inicia sesión.
      El usuario se inscribe.
      Se genera un ticket.
      Se envía email de confirmación.
      Se descuenta capacidad disponible.
      El usuario puede cancelar el ticket.
      El cupo vuelve a liberarse. 

  ** Usuarios de prueba
Admin: admin@mail.com

Organizer: organizador@mail.com

User: mariagon@mail.com



 * Roles y permisos

El sistema implementa autorización basada en los roles user, organizer y admin.

Acción	                           user	   Organizer    admin
Consultar eventos publicados	      Sí		    Si         Sí
Crear eventos                      	No	    	Si         Sí
Modificar eventos propios	          No	    	Si         Sí
Modificar cualquier evento	        No		    No         Sí
Ver todos los usuarios	            No	    	No         Sí

 * Rutas protegidas

GET /api/sessions/current: cualquier usuario autenticado.
POST /api/events: solamente organizer y admin.
PUT /api/events/:eventId: organizer propietario o admin.
GET /api/users: solamente admin.


 * Casos probados

✅ Registro exitoso.

✅ Registro con campos faltantes.

✅ Registro con email inválido.

✅ Registro con email duplicado.

✅ Login correcto.

✅ Login con email inexistente.

✅ Login con contraseña incorrecta.

✅ Ruta current autenticada.

✅ Ruta current sin cookie.

✅ Logout.

✅ Password almacenada hasheada en MongoDB.

✅ Password no incluida en las respuestas.

✅ Registro de Eventos

✅ Permisos de modificacion de eventos

✅ Visualizacion de eventos disponibles


Se realizaron pruebas automatizadas y manuales para comprobar que la refactorización a la arquitectura DAO, Repository, Service, Controller y DTO no alteró el comportamiento externo de la API.

Las pruebas verifican:

Separación correcta de responsabilidades.
Autenticación mediante Passport y JWT.
Protección de datos sensibles.
Gestión de eventos.
Inscripción mediante tickets.
Control de cupos.
Prevención de inscripciones duplicadas.
Cancelación lógica.
Control de permisos.
Manejo consistente de errores.

Pruebas automatizadas
Las pruebas se ejecutan con:

npm test

PASS test/architecture.test.js
PASS test/passport.config.test.js

Test Suites: 2 passed, 2 total
Tests:       19 passed, 19 total
Snapshots:   0 total