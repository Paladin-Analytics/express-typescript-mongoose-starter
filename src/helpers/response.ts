import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export default (res: Response, status: StatusCodes, message: string, body: any, errors?: any): Response => {
    return res.status(status).json({
        status,
        message,
        body,
        errors,
    });
};
