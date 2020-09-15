import { jwtKey } from '../config/jwt';

import expressjwt, { IsRevokedCallback } from 'express-jwt';
import { Response, Router, Request } from 'express';
import { UNAUTHORIZED } from 'http-status-codes';

import response from '../helpers/response';

const isJWTRevoked: IsRevokedCallback = (req, payload, done) => {
    return done(null, false);
}

const authMiddleware = expressjwt({
    algorithms: ['HS256'],
    secret: <string>jwtKey,
    isRevoked: isJWTRevoked,
});

const authErrorHandler = ((err: { name: string }, req: unknown, res: Response<unknown>, next: () => void) : void => {
    if (err.name === 'UnauthorizedError') {
        response(res, UNAUTHORIZED, 'Invalid user token', null);
        return;
    }
    next();
});

export const CreateAuthenticatedRouter = ():Router => {
    const router = Router();
    router.use(authMiddleware);
    router.use(authErrorHandler);
    return router;
}

export interface AuthenticatedRequest extends Request{
    user: {
        user_id: string;
        iat: number;
        exp: number;
        jti: string;
    };
}