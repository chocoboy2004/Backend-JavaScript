// require('dotenv').config({path: './env'})
import dotenv from 'dotenv';
// import mongoose from 'mongoose';
// import { DB_NAME } from './constants';
import connectDB from './db/server.js';

dotenv.config({
    path: './env'
});

connectDB();















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