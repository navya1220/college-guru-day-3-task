import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import users from './routes/users.js';

dotenv.config();

const app = express();
connectDB();

app.use(express.json());
app.use(cors());

app.use('/api/users', users);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
