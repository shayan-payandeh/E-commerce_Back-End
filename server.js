import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import productRouter from './routes/products.js';
import brandRouter from './routes/brand.js';
import categoryRouter from './routes/category.js';
import userRouter from './routes/user.js';
import orderRouter from './routes/order.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

dotenv.config();

const app = express();
//set a middleware to parse data
app.use(express.json()); // parses application/json
app.use(express.urlencoded({ extended: true })); // parses application/x-www-form-urlencoded

// Connect to DB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('MongoDB connected!!');
  })
  .catch((err) => {
    console.log('Failed to connect to MongoDB', err);
  });

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

// //? Router middleware :
// const origin =
//   process.env.NODE_ENV === 'development' ? 'http://localhost:1500' : 'https://';
const origin =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:1500'
    : 'https://fronthooks.ir';

// app.use(cors({ credentials: true, origin }));
app.use(cors());
app.use((req, res, next) => {
  res.header(
    'Access-Control-Allow-Headers, *, Access-Control-Allow-Origin',
    'Origin, X-Requested-with, Content_Type,Accept,Authorization',
    'http://localhost:9000'
  );
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT,POST,PATCH,DELETE,GET');
    return res.status(200).json({});
  }
  next();
});
app.use(
  cookieParser(process.env.COOKIE_PARSER_SECRET || 'COOKIE PARSER SECRET')
);
app.use('/api/user', userRouter);
app.use('/api/products', productRouter);
app.use('/api/category', categoryRouter);
app.use('/api/brand', brandRouter);
app.use('/api/order', orderRouter);
// app.use("/api/posts", postRouter);
// app.use("/api/post-category", postCategoryRouter);
// app.use("/api/post-comment", postCommentRouter);

//? PORT
const port = process.env.PORT || 1500;
app.listen(port, () => console.log(`listening on port ${port}`));