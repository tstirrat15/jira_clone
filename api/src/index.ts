import 'module-alias/register';
import 'dotenv/config';
import 'reflect-metadata';
import express from 'express';
import cors from 'cors';

import createDatabaseConnection from 'database/createConnection';
import { addRespondToResponse } from 'middleware/response';
import { authenticateUser } from 'middleware/authentication';
import { handleError } from 'middleware/errors';
import { RouteNotFoundError } from 'errors';

import { attachPublicRoutes, attachPrivateRoutes } from './routes';

const establishDatabaseConnection = async (): Promise<void> => {
  try {
      console.log('creating db connection')
    const thing = await createDatabaseConnection();
    console.log('this should be getting called')
    console.log(thing)
  } catch (error) {
      console.log('there is a db error');
    console.log(error);
  }
};

const initializeExpress = (): void => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded());

  app.use(addRespondToResponse);

  attachPublicRoutes(app);

  app.use('/', authenticateUser);

  attachPrivateRoutes(app);

  app.use((req, _res, next) => next(new RouteNotFoundError(req.originalUrl)));
  app.use(handleError);

  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`running on ${port}`));
};

const initializeApp = async (): Promise<void> => {
    console.log('starting db')
  await establishDatabaseConnection();
  console.log('done, starting express')
  initializeExpress();
};

initializeApp();
