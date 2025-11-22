# Backend Proyecto SI1

Backend API REST con Node.js, Express, Prisma y PostgreSQL.

## 🚀 Tecnologías

- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- JWT (JSON Web Tokens)
- Bcrypt para encriptación de contraseñas

## 📋 Prerequisitos

- Node.js (v18 o superior)
- PostgreSQL (instalado y corriendo)
- npm o yarn

## ⚙️ Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
   - Copiar el archivo `.env` y configurar tu conexión a PostgreSQL
   - Actualizar `DATABASE_URL` con tus credenciales

3. Crear la base de datos en PostgreSQL:
```sql
CREATE DATABASE proyecto_si1;
```

4. Ejecutar migraciones de Prisma:
```bash
npx prisma migrate dev --name init
```

5. Generar el cliente de Prisma:
```bash
npm run prisma:generate
```

## 🏃‍♂️ Ejecutar el proyecto

### Modo desarrollo:
```bash
npm run dev
```

### Modo producción:
```bash
npm start
```

El servidor estará disponible en: `http://localhost:3000`

## 📚 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario

### Usuarios (requiere autenticación)
- `GET /api/usuarios` - Obtener todos los usuarios
- `GET /api/usuarios/:id` - Obtener usuario por ID
- `POST /api/usuarios` - Crear usuario
- `PUT /api/usuarios/:id` - Actualizar usuario
- `DELETE /api/usuarios/:id` - Eliminar usuario

### Roles (requiere autenticación)
- `GET /api/roles` - Obtener todos los roles
- `GET /api/roles/:id` - Obtener rol por ID
- `POST /api/roles` - Crear rol
- `PUT /api/roles/:id` - Actualizar rol
- `DELETE /api/roles/:id` - Eliminar rol
- `POST /api/roles/:id/permisos` - Asignar permisos a un rol

### Permisos (requiere autenticación)
- `GET /api/permisos` - Obtener todos los permisos
- `GET /api/permisos/:id` - Obtener permiso por ID
- `POST /api/permisos` - Crear permiso
- `PUT /api/permisos/:id` - Actualizar permiso
- `DELETE /api/permisos/:id` - Eliminar permiso

## 🔐 Autenticación

La API usa JWT para autenticación. Para usar endpoints protegidos:

1. Hacer login en `/api/auth/login`
2. Usar el token recibido en el header: `Authorization: Bearer <token>`

## 🗄️ Base de Datos

El esquema incluye las siguientes tablas:
- **USUARIO**: Gestión de usuarios
- **ROL**: Roles del sistema
- **PERMISO**: Permisos del sistema
- **ROL_PERMISO**: Relación muchos a muchos entre roles y permisos

## 🛠️ Scripts útiles

- `npm run dev` - Iniciar en modo desarrollo
- `npm run prisma:generate` - Generar cliente de Prisma
- `npm run prisma:migrate` - Crear nueva migración
- `npm run prisma:studio` - Abrir Prisma Studio (GUI para la BD)

## 📝 Notas

- Las contraseñas se hashean con bcrypt antes de guardarlas
- El campo PASSWORD en la BD soporta hasta 255 caracteres para el hash
- Los tokens JWT expiran en 7 días (configurable en .env)
