import express, { Request, Response } from 'express';
import { OK, INTERNAL_SERVER_ERROR, NOT_FOUND, BAD_REQUEST } from 'http-status-codes';

import response from '../../helpers/response';

// Services
import UserService from '../../services/user.service';

// types
import { AuthenticatedRequest, checkScope } from '../../middleware/auth.middleware';

const router = express.Router();
router.use(express.json());

router.get('/:workspace_id/invites', (req: Request, res: Response) => {
    return response(res, OK, 'Success', null);
});

export default router;