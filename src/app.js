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
import userRouter from './routes/user.route.js';
import videoRouter from "./routes/video.route.js";
import playlistRouter from "./routes/playlist.route.js"
import commentRouter from "./routes/comment.route.js"
import tweetRouter from "./routes/tweet.route.js"
import likeRouter from "./routes/like.route.js"
import subscriptionRouter from "./routes/subscription.route.js"
import dashboardRouter from "./routes/dashboard.route.js"
import healthcheckRouter from "./routes/healthcheck.route.js"

// route declaration
app.use('/api/v1/users', userRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/playlists", playlistRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/dashboard", dashboardRouter)
app.use("/api/v1/healthcheck", healthcheckRouter)

export default app