import { Types } from 'mongoose';
import express, { Request, Response } from 'express';
import { OK, INTERNAL_SERVER_ERROR, NOT_FOUND, BAD_REQUEST, CREATED, FORBIDDEN, CONFLICT } from 'http-status-codes';

import response from '../helpers/response';

// Services
import InviteService from '../services/invite.service';
import UserService from '../services/user.service';

// types
import { AuthenticatedRequest, checkScope } from '../middleware/auth.middleware';

const router = express.Router();
router.use(express.json());

router.get('/', checkScope('workspace.invite.get'), async (req: Request, res: Response) => {
    const authReq = <AuthenticatedRequest>req;

    try {
        const invites = await InviteService.GetAll(Types.ObjectId(authReq.workspace));
        return response(res, OK, 'Success', invites?.map((inv) => inv.getSafe()));
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

        return response(res, OK, 'Success', invite.getSafe());
    } catch (e) {
        console.log(e);
        return response(res, INTERNAL_SERVER_ERROR, 'Internal server error', null);
    }
});

router.post('/', checkScope('workspace.invite.create'), async (req: Request, res: Response) => { 
    const authReq = <AuthenticatedRequest>req;
    const { body } = authReq;

    try {
        const existingInvite = await InviteService.GetByEmail(body.email, Types.ObjectId(authReq.workspace));

        if (existingInvite) {
            return response(res, CONFLICT, 'Invite already sent', null);
        }

        const existingUser = await UserService.GetByEmail(body.email);
        let accountAlreadyInWorkspace = false;

        if (existingUser) {
            for (const u of existingUser.permissions) {
                if (u.workspace.equals(authReq.workspace)) {
                    accountAlreadyInWorkspace = true;
                    break;
                }
            } 
        }

        if (accountAlreadyInWorkspace) {
            return response(res, CONFLICT, 'Email already in use', null);
        }
    } catch (e) {
        console.log(e);
        return response(res, INTERNAL_SERVER_ERROR, 'Internal server error', null);
    }

    try {
        const invite = await InviteService.Create({
            ...body,
            workspaceId: authReq.workspace,
        });

        return response(res, CREATED, 'Created', invite.getSafe());
    } catch (e) {
        if (e.name === 'ValidationError') {
            console.log(`Validation Error = ${JSON.stringify(e)}`);
            return response(res, BAD_REQUEST, 'Invalid Data', null, e.message);
        }
        
        console.log(e);
        return response(res, INTERNAL_SERVER_ERROR, 'Internal server error', null);
    }
});


router.delete('/:invite_id', checkScope('workspace.invite.delete'), async (req: Request, res: Response) => { 
    const authReq = <AuthenticatedRequest>req;

    if (!Types.ObjectId.isValid(authReq.params.invite_id)) {
        return response(res, NOT_FOUND, 'Invite not found', null);
    }

    try {
        await InviteService.Remove(Types.ObjectId(authReq.workspace), Types.ObjectId(req.params.invite_id));
        return response(res, OK, 'Deleted', null);
    } catch (e) {
        console.log(e);
        return response(res, INTERNAL_SERVER_ERROR, 'Internal server error', null);
    }
});

router.post('/:invite_id/resend', checkScope('workspace.invite.update'), async (req: Request, res: Response) => { 
    const authReq = <AuthenticatedRequest>req;

    try {
        const invite = await InviteService.GetById(req.params.invite_id);
        console.log(authReq.params.invite_id);
        
        if (!invite) return response(res, NOT_FOUND, 'Not found', null);

        if (!invite.workspaceId.equals(authReq.workspace)) {
            return response(res, FORBIDDEN, 'Forbidden', null);
        }

        invite._resend = true;
        await invite.save();

        return response(res, OK, 'Success', invite.getSafe());
    } catch (e) {
        console.log(e);
        return response(res, INTERNAL_SERVER_ERROR, 'Internal server error', null);
    }
});


router.patch('/:invite_id', checkScope('workspace.invite.update'), async (req: Request, res: Response) => { 
    const authReq = <AuthenticatedRequest>req;
    const { body } = authReq;

    if (!Types.ObjectId.isValid(authReq.params.invite_id)) {
        return response(res, NOT_FOUND, 'Invite not found', null);
    }

    try {
        const updatedInvite = await InviteService.Update(Types.ObjectId(authReq.workspace), Types.ObjectId(authReq.params.invite_id), body);
        if (updatedInvite) {
            return response(res, OK, 'Success', updatedInvite.getSafe());
        }
        return response(res, NOT_FOUND, 'Invite not found', null);
    } catch (e) {
        console.log(e);
        return response(res, INTERNAL_SERVER_ERROR, 'Internal server error', null);
    }
});

export default router;