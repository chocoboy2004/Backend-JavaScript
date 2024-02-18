import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

// app.get('/', (req, res) => {
//     res.send('success')
// })

// app.listen(process.env.PORT, () => {
//     console.log(`App is running`);
// })

app.use(express.json({limit: '16kb'}));
app.use(express.urlencoded({extended: true, limit: '16kb'}));
app.use(express.static('public'));
app.use(cookieParser());

// import routes
import userRouter from './routes/user.router.js';

// route declaration
app.use('/api/v1/users', userRouter)


export default app