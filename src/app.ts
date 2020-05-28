require('dotenv').config();
import express from 'express';
import middlewares from './app/middlewares/app'
import routes from './routes/routes'

const app = express();

app.use(middlewares);
app.use(routes);

const PORT: number = Number (process.env.API_PORT) || 3000 || 3010 || 3011
const HOST: string = String (process.env.API_HOST) || 'localhost' || '127.0.01'

app.listen(PORT, HOST, () => console.log (`server on http://${HOST}:${PORT}`));

export default app;
