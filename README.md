# Sistema de Gestión de Taller Mecánico 🏍️

Sistema integral para la gestión de un taller mecánico de motos, desarrollado con React y Node.js.

## 🚀 Tecnologías

### Backend
- Node.js + Express
- PostgreSQL
- Prisma ORM
- JWT Authentication
- ExcelJS & PDFKit para reportes

### Frontend
- React 18 + Vite
- Chakra UI
- React Router DOM
- Chart.js para gráficos

## 📋 Características

- ✅ Gestión de usuarios y roles
- ✅ Control de empleados y horarios
- ✅ Registro de clientes y motos
- ✅ Diagnósticos y proformas
- ✅ Órdenes de trabajo
- ✅ Sistema de comisiones
- ✅ Control de herramientas
- ✅ Reportes y estadísticas
- ✅ Valoraciones de clientes (pública)
- ✅ Cuentas por pagar
- ✅ Bitácora de actividades

## 🛠️ Instalación

### Requisitos Previos
- Node.js (v18 o superior)
- PostgreSQL (v14 o superior)
- npm o yarn

### Backend

```bash
cd backend-proyecto-SI1
npm install
```

Crear archivo `.env`:
```env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/taller"
JWT_SECRET="tu_secreto_jwt"
PORT=3000
```

Ejecutar migraciones:
```bash
npx prisma migrate dev
npx prisma generate
```

Iniciar servidor:
```bash
npm start
```

### Frontend

```bash
cd frontend-proyecto-SI1
npm install
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

## 📱 Acceso Público

### Valoraciones de Clientes
Los clientes pueden dejar valoraciones sin necesidad de login en:
```
http://localhost:5173/valoracion
```

## 🔐 Credenciales de Prueba

```
Usuario: admin@taller.com
Contraseña: (definir en el seed)
```

## 📊 Estructura del Proyecto

```
A-REIR/
├── backend-proyecto-SI1/
│   ├── controllers/      # Lógica de negocio
│   ├── middleware/       # Autenticación y permisos
│   ├── routes/          # Rutas de la API
│   ├── prisma/          # Schema y migraciones
│   └── services/        # Servicios auxiliares
│
└── frontend-proyecto-SI1/
    ├── src/
    │   ├── components/  # Componentes reutilizables
    │   ├── contexts/    # Context API
    │   ├── pages/       # Páginas de la aplicación
    │   └── config.js    # Configuración
    └── public/
```

## 🌟 Módulos Principales

### Administración
- Usuarios y roles
- Empleados
- Clientes
- Bitácora

### Pedidos
- Motos
- Diagnósticos
- Servicios y categorías
- Proformas

### Producción
- Horarios
- Órdenes de trabajo
- Comisiones
- Cuentas por pagar
- Herramientas y movimientos

### Reportes
- Clientes frecuentes
- Servicios más solicitados
- Ingresos mensuales
- Productividad de empleados
- Marcas de motos más atendidas
- Actividad de empleados

### Valoraciones (Público)
- Sistema de calificación 1-5 estrellas
- Límite de 1 valoración por día por IP
- Panel de gestión para empleados
- Código QR para compartir

## 🔄 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/me` - Obtener usuario actual

### Valoraciones (Público)
- `POST /api/valoraciones` - Crear valoración (sin auth)
- `GET /api/valoraciones` - Listar valoraciones (requiere auth)

## 📄 Licencia

Este proyecto es privado y confidencial.

## 👥 Equipo de Desarrollo

Desarrollado para gestión interna del taller mecánico.

## 📞 Soporte

Para soporte técnico, contactar al administrador del sistema.
