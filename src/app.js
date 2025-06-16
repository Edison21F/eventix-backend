const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const { connectMongoDB } = require('./config/database');
const routes = require('./routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));
app.use(compression());

// DB Connections
connectMongoDB();
// Conectar Prisma: requiere manejar aparte

// Rutas
app.use('/api', routes);

// Error handler
app.use(require('./middleware/errorHandler.middleware'));

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
