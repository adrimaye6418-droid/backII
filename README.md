
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

 * Registro

      POST /api/sessions/register

      Descripción: Se registra un nuevo usuario.

Body:

{
  "first_name": "Ana",
  "last_name": "Perez",
  "email": "ana@mail.com",
  "password": "Secreta123"
}

Respuesta 201:

{
  "status": "success",
  "payload": {
    "id": "68c...",
    "first_name": "Ana",
    "last_name": "Perez",
    "email": "ana@mail.com",
    "role": "user"
  }
}

 * Login

      POST /api/sessions/login

Descripción: Se autentica un usuario y genera una cookie HTTP Only con JWT.

Body:

{
  "email": "ana@mail.com",
  "password": "Secreta123"
}

Respuesta 200:

{
  "status": "success",
  "message": "Login correcto"
}

Respuesta 401:

{
  "status": "error",
  "message": "Credenciales inválidas"
}

 * Usuario actual
      GET /api/sessions/current
Descripción: Devuelve los datos del usuario autenticado.

Respuesta 200:

{
  "status": "success",
  "payload": {
    "id": "68c...",
    "email": "ana@mail.com",
    "role": "user"
  }
}
Respuesta 401:

{
  "status": "error",
  "message": "No autenticado"
}

 * Logout
      POST /api/sessions/logout
Descripción: Elimina la cookie de autenticación.

Respuesta 200:

{
  "status": "success",
  "message": "Sesión cerrada"
}

 * Crear un evento sin iniciar sesión
      POST /api/events

{
  "title": "Congreso Tech 2026",
  "description": "Evento de tecnología",
  "date": "2026-12-10T18:00:00.000Z",
  "location": "Buenos Aires"
}
Respuesta 401 Unauthorized

{
  "status": "error",
  "message": "No autenticado"
}

 * Crear un evento con rol user
Respuesta 403 Forbidden

{
  "status": "error",
  "message": "No tenés permisos para realizar esta acción"
}

 * Crear un evento con rol admin
Respuesta 201 Created

{
  "status": "success",
  "payload": {
    "id": "67195eb89c813f52c1123456",
    "title": "Congreso Tech 2026",
    "organizer": "67195d719c813f52c1654321"
  }
}

 * Consultar eventos publicados
Respuesta 200 OK

{
  "status": "success",
  "payload": [
    {
      "_id": "67195eb89c813f52c1123456",
      "title": "Congreso Tech 2026",
      "description": "Evento de tecnología",
      "date": "2026-12-10T18:00:00.000Z",
      "location": "Buenos Aires",
      "status": "published",
      "organizer": {
        "_id": "67195d719c813f52c1654321",
        "first_name": "Adriana",
        "last_name": "Cancino",
        "email": "organizador@mail.com"
      }
    }
  ]
}
 * Admin modificando cualquier evento
Respuesta 200 OK
{
  "status": "success",
  "payload": {
    "_id": "67195eb89c813f52c1123456",
    "title": "Evento actualizado por administrador",
    "description": "Evento de tecnología",
    "date": "2026-12-10T18:00:00.000Z",
    "location": "Buenos Aires",
    "status": "published",
    "organizer": "67195d719c813f52c1654321"
  }
}

 * Seguridad implementada

Contraseñas hasheadas con bcrypt.
JWT firmado mediante JWT_SECRET.
Cookie HTTP Only.
Validación de email.
Validación de campos obligatorios.
Control de emails duplicados.
Protección de rutas mediante middleware auth.
El password nunca se devuelve en las respuestas.

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



