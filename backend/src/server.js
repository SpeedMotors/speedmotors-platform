import app from './app.js';
import prisma from './config/prisma.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  // Start Express listener
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(` SpeedMotors API Server is running successfully.`);
    console.log(` Port: ${PORT}`);
    console.log(` Environment: ${process.env.NODE_ENV}`);
    console.log(` Health Check: http://localhost:${PORT}/health`);
    console.log(`===============================================`);
  });

  // Verify database connection asynchronously so it doesn't crash the boot process if offline
  console.log('Connecting to PostgreSQL database via Prisma...');
  try {
    await prisma.$connect();
    console.log('Database connection established successfully.');
  } catch (error) {
    console.error('===============================================');
    console.error(' DATABASE CONNECTION WARNING:');
    console.error(' Could not connect to PostgreSQL database via Prisma.');
    console.error(' Please ensure your database is running and check your DATABASE_URL in .env');
    console.error(' Error Code:', error.code || 'N/A');
    console.error('===============================================');
  }
}

// Global process error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception thrown:', error);
  process.exit(1);
});

// Run server startup
startServer();
