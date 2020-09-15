import express, { Request, Response } from 'express';
import { OK, INTERNAL_SERVER_ERROR, NOT_FOUND, BAD_REQUEST } from 'http-status-codes';

import response from '../../helpers/response';

// Services
import UserService from '../../services/user.service';

// types
import { AuthenticatedRequest, checkScope } from '../../middleware/auth.middleware';

const router = express.Router();
router.use(express.json());

router.get('/', checkScope('user.get'), async(req: Request, res: Response) => {
    const authReq = <AuthenticatedRequest>req;

    try {
        const user = await UserService.GetById(authReq.user.user_id);
        if (user) {
            return response(res, OK, 'Success', user.getSafe());
        }
        return response(res, NOT_FOUND, 'Not found', null);
    } catch(e) {
        return response(res, INTERNAL_SERVER_ERROR, 'Internal server error', null);
    }
});

router.patch('/', checkScope('user.update'), async(req: Request, res: Response) => {
    const authReq = <AuthenticatedRequest>req;
    
    const { body } = authReq;

    if (!body) return response(res, BAD_REQUEST, 'Missing field', null);

    try {
        const user = await UserService.Update(authReq.user.user_id, body);
        
        if (user) {
            return response(res, OK, 'Success', user.getSafe());
        }
        
        return response(res, NOT_FOUND, 'Not found', null);
    } catch(e) {
        return response(res, INTERNAL_SERVER_ERROR, 'Internal server error', null);
    }
});

export default router;