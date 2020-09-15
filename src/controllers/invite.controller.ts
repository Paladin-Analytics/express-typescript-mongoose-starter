import { Types } from 'mongoose';
import express, { Request, Response } from 'express';
import { OK, INTERNAL_SERVER_ERROR, NOT_FOUND, BAD_REQUEST, CREATED, FORBIDDEN } from 'http-status-codes';

import response from '../helpers/response';

// Services
import InviteService from '../services/invite.service';

// types
import { AuthenticatedRequest, checkScope } from '../middleware/auth.middleware';

const router = express.Router();
router.use(express.json());

router.get('/', checkScope('workspace.invite.get'), async (req: Request, res: Response) => {
    const authReq = <AuthenticatedRequest>req;

    try {
        const invites = await InviteService.GetAll(Types.ObjectId(authReq.workspace));
        return response(res, OK, 'Success', invites);
    } catch (e) {
        console.log(e);
        return response(res, INTERNAL_SERVER_ERROR, 'Internal server error', null);
    }
});

router.get('/:invite_id', checkScope('workspace.invite.get'), async (req: Request, res: Response) => { 
    const authReq = <AuthenticatedRequest>req;

    try {
        const invite = await InviteService.GetById(req.params.invite_id);
        
        if (!invite) return response(res, NOT_FOUND, 'Not found', null);

        if (!invite.workspaceId.equals(authReq.workspace)) {
            return response(res, FORBIDDEN, 'Forbidden', null);
        }

        return response(res, OK, 'Success', invite);
    } catch (e) {
        console.log(e);
        return response(res, INTERNAL_SERVER_ERROR, 'Internal server error', null);
    }
});

router.post('/', checkScope('workspace.invite.create'), async (req: Request, res: Response) => { res.status(CREATED) });
router.delete('/:invite_id', checkScope('workspace.invite.delete'), async (req: Request, res: Response) => { res.status(CREATED) });
router.patch('/:invite_id', checkScope('workspace.invite.update'), async (req: Request, res: Response) => { res.status(OK) });

export default router;