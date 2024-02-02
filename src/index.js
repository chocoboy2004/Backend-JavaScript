// require('dotenv').config({path: './env'})
import dotenv from 'dotenv';
// import mongoose from 'mongoose';
// import { DB_NAME } from './constants';
import connectDB from './db/server.js';
import app from './app.js';

dotenv.config({
    path: './env'
});

connectDB()
.then(() => {
    app.on('ERROR', (error) => {
        console.log(`ERROR: ${error}`);
    });
    
    app.listen(process.env.PORT || 3000, () => {
        console.log(`Server is running on port: ${process.env.PORT}`);
    });
})
.catch((error) => {
    console.log(`MongoDB connection failed error: ${error}`);
});















/*
import express from 'express';
const app = express();

(async function() {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

        app.on('ERROR', (error) => {
            console.error('ERROR:', error);
            throw error;
        });

        app.listen(process.env.PORT, () => {
            console.log(`App is listning on port ${process.env.PORT}`);
        });
    } catch {
        console.error('ERROR: ', error);
        throw error;
    }
})();
*/