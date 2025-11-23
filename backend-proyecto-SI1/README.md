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

### 1. Instalar PostgreSQL
Si no tienes PostgreSQL instalado:
- Descarga desde: https://www.postgresql.org/download/
- Durante la instalación, anota la contraseña del usuario `postgres`

### 2. Crear la Base de Datos
Abre **pgAdmin** o **psql** y ejecuta:
```sql
CREATE DATABASE taller;
```

O desde la terminal (cmd/PowerShell):
```bash
psql -U postgres
CREATE DATABASE taller;
\q
```

### 3. Instalar Dependencias
```bash
npm install
```

### 4. Configurar Variables de Entorno
```bash
# Copiar el archivo de ejemplo
copy .env.example .env

# Editar .env y cambiar:
# - tu_contraseña por la contraseña de PostgreSQL
# - Generar un JWT_SECRET único
```

### 5. Aplicar Migraciones (Crear Tablas)
```bash
npx prisma migrate deploy
```

Esto creará automáticamente todas las tablas necesarias en la base de datos.

### 6. (Opcional) Cargar Datos de Prueba
```bash
npm run seed
```

Esto creará usuarios, roles y permisos iniciales.

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
