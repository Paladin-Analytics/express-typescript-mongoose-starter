import express, {
    Response as ExResponse,
    Request as ExRequest,
    NextFunction, 
} from "express";
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import { ValidateError } from "tsoa";

// Errors
import { NotFoundError, UnauthorizedError } from './common/errors';

// Register Routes
import { RegisterRoutes } from '../build/routes';


const app = express();

// Middleware
app.use(
    express.urlencoded({
        extended: true,
    })
);
app.use(express.json());
app.use(morgan('combined'));

app.use("/docs", swaggerUi.serve, async (_req: ExRequest, res: ExResponse) => {
  return res.send(
    swaggerUi.generateHTML(await import("../build/swagger.json"))
  );
});

RegisterRoutes(app);

function errorHandler(err: unknown, req: ExRequest, res: ExResponse,next: NextFunction): ExResponse | void {
  let errCode = 500;

  console.log(err);
  if (err instanceof ValidateError) {
    console.warn(`Caught Validation Error for ${req.path}:`, err.fields);
    return res.status(406).json({
      message: "Validation Failed",
      errors: err?.fields,
    });
  } 
  
  if (err instanceof NotFoundError) errCode = 404;
  if (err instanceof UnauthorizedError) errCode = 401;
  
  if (err instanceof Error) {
    return res.status(errCode).json({
      message: err.message,
    });
  }
  next();
}

app.use(errorHandler);

app.use(function notFoundHandler(_req, res: ExResponse) {
    res.status(404).send({
        message: "Not Found",
    });
});

export default app;
