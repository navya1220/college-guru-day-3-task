import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import users from './routes/users.js';
import courses from './routes/courses.js';

dotenv.config();

const app = express();
connectDB();

app.use(express.json());
app.use(cors());

app.use('/api/users', users);
app.use('/api/courses',courses);

app.use((req, res, next) => {
  console.log('Incoming request headers:', req.headers);
  next();
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
