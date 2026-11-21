
import express from 'express';

import dotenv from 'dotenv';

import db from './Config/db.js';

import userRoutes from './Routes/userRoutes.js';

import buildingcategoryRoutes from './Routes/buildingcategoryRoutes.js';

import buildingmaterialRoutes from './Routes/buildingmaterialRoutes.js';

import depotsaleRoutes from './Routes/depotsaleRoutes.js';

import session from 'express-session';

// Load environment variables

dotenv.config();

// Create Express application

const app = express();

// Middleware

app.use(express.json());

// Homepage Route

app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Welcome! Backend API is running successfully.'
    });
});

// Connect to MySQL database

try {
    const connection = await db.getConnection();

    console.log('MySQL database connected successfully!');

    connection.release();

} catch (error) {
    console.error('MySQL database connection failed:', error.message);

    process.exit(1);
}

// Session configuration

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));


// Connect user routes

app.use("/api/users", userRoutes);


// Connect building category routes

app.use("/api/building-categories", buildingcategoryRoutes);


// Connect building material routes

app.use("/api/building-materials", buildingmaterialRoutes);


// Connect depot sale routes

app.use("/api/depot-sales", depotsaleRoutes);

// Server port

const PORT = process.env.PORT || 5000;

// Start server

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
