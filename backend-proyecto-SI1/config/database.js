import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Handle connection errors
prisma.$connect()
  .then(() => console.log('✅ Conectado a PostgreSQL'))
  .catch((error) => console.error('❌ Error conectando a PostgreSQL:', error));

export default prisma;
