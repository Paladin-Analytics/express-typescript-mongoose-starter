import { jwtKey } from '../config/jwt';

import expressjwt, { IsRevokedCallback } from 'express-jwt';
import { Response, Router, Request, NextFunction } from 'express';
import { UNAUTHORIZED } from 'http-status-codes';

import response from '../helpers/response';

// Services
import UserService from '../services/user.service';
import { Types } from 'mongoose';

interface UserPermissionPopulated {
    workspace: {
        _id: Types.ObjectId;
        name: string;
    }
    role: {
        scopes: [string];
    }
}

const isJWTRevoked: IsRevokedCallback = (req, payload, done) => {
    return done(null, false);
}

export interface AuthenticatedRequest extends Request{
    user: {
        user_id: string;
        iat: number;
        exp: number;
        jti: string;
    };
    workspace: string;
}

const authMiddleware = expressjwt({
    algorithms: ['HS256'],
    secret: <string>jwtKey,
    isRevoked: isJWTRevoked,
});

const authErrorHandler = ((err: Error, req: Request, res: Response, next: NextFunction) : void => {
    if (err.name === 'UnauthorizedError') {
        response(res, UNAUTHORIZED, 'Invalid user token', null);
        return;
    }
    next();
});

export const checkScope = (scope: string) => {
    return async (req: Request, res: Response, next: NextFunction):Promise<void> => {
      //Get the user ID from previous midleware
      const authReq = (req as AuthenticatedRequest);
      const userId = authReq.user.user_id;
  
      //Get user role from the database
      let user;

      try {
        user = await UserService.GetById(userId);
      } catch (id) {
        response(res, UNAUTHORIZED, 'Invalid user token', null);
        return;
      }

      if (user) {
        let workspaceId = authReq.workspace;

        if(user.permissions.length > 0 && workspaceId.length === 0) {
            workspaceId = (user.permissions[0] as UserPermissionPopulated).workspace._id.toHexString();
        }

        for (const perm of user.permissions) {
            const tmpPerm = perm as UserPermissionPopulated;

            if (tmpPerm.workspace._id.equals(workspaceId))  {
                for (const s of tmpPerm.role.scopes) {
                    console.log(s);
                    if (s === scope) {
                        next();
                        return;
                    }
                }
            }
        }
      }
  
      response(res, UNAUTHORIZED, 'Invalid user token', null);
    };
};

export const CreateAuthenticatedRouter = ():Router => {
    const router = Router();
    router.use(authMiddleware);
    router.use(authErrorHandler);
    router.use((req: Request, res: Response, next: NextFunction) => {
        (req as AuthenticatedRequest).workspace = req.get('Active-Workspace') || '';
        next();
    })
    return router;
}
