import { jwtKey } from '../config/jwt';
import { scopes } from '../config/permissions';

import { Types } from 'mongoose';
import expressjwt, { IsRevokedCallback } from 'express-jwt';
import { Response, Router, Request, NextFunction } from 'express';
import { UNAUTHORIZED, FORBIDDEN } from 'http-status-codes';

import response from '../helpers/response';

// Services
import UserService from '../services/user.service';

interface UserPermission {
    workspace: Types.ObjectId;
    role: string;
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
        response(res, UNAUTHORIZED, 'Missing user', null);
        return;
      }

      if (user) {
        let workspaceId = authReq.workspace;

        if(user.permissions.length > 0 && !Types.ObjectId.isValid(workspaceId)) {
            workspaceId = (user.permissions[0].workspace).toString();
            authReq.workspace = workspaceId;
        }

        for (const perm of user.permissions) {
            const tmpPerm = perm as UserPermission;
            if (tmpPerm.workspace.equals(workspaceId))  {
                const permScopes = scopes[tmpPerm.role] || [];
                if (permScopes.indexOf(scope) > -1) {
                    next();
                    return;
                }
            }
        }
      }
  
      response(res, FORBIDDEN, 'Forbidden', null);
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
