import express from 'express';
import cors from 'cors';

const app = express();

//middlewares
app.use(cors());
app.use(express.json())

export default app;