import userProtectedRoutes from './user.protected.routes';
import userPublicRoutes from './user.public.routes';
import postRoutes from './post.routes'
import authorizationMiddleware from '../app/middlewares/authorization'

import express from 'express';

const app = express();

app.get('/', (req, res) => res.send('hello'))

app.use('/api', userPublicRoutes);
app.use('/api/auth', authorizationMiddleware, userProtectedRoutes);
app.use('/api/posts', authorizationMiddleware, postRoutes)

export default app;