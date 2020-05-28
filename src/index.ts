import 'reflect-metadata';
import express from 'express';
import * as typeORM from 'typeorm';
import app from './app';

const server = express();

server.use(app);

typeORM.createConnection();

