const express = require('express');
const cors = require('cors');

const app = express();
const cookieParser = require("cookie-parser");
require('dotenv').config();

// Configurar Express para confiar en proxies y obtener la IP real del cliente
app.set('trust proxy', true);

app.use(cookieParser());

app.use(cors({
    origin: function (origin, callback) {
        // Permitir requests sin origin (como apps móviles o postman)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            'https://frontend-proyecto-si-1.vercel.app',
            'http://localhost:5173',
            'http://localhost:3000'
        ];
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'Set-Cookie'],
    exposedHeaders: ['Set-Cookie']
}));

app.use(express.json());

app.use('/auth', require('./routes/Administracion/authRoute'));

app.use('/clientes', require('./routes/Administracion/clienteRoute'));

app.use('/empleados', require('./routes/Administracion/empleadoRoute'));

app.use('/usuarios', require('./routes/Administracion/usuarioRoute'));

app.use('/motos', require('./routes/Administracion/motoRoute'));

app.use('/diagnosticos', require('./routes/Operacion/diagnosticoRoute'));

app.use('/bitacora', require('./routes/Administracion/bitacoraRoute'));

app.use('/proformas', require('./routes/Pedido/proformaRoute'));

app.use('/servicios', require('./routes/Administracion/servicioRoute'));

app.listen(3000, () => 
    console.log('Server is running on port 3000'))
