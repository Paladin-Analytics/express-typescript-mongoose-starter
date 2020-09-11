import express from 'express';
import { BAD_REQUEST, CREATED, UNAUTHORIZED, INTERNAL_SERVER_ERROR } from 'http-status-codes';

// Helpers
import response from '../../helpers/response';

// Controllers
import * as UserControllers from '../../controllers/user.controller';

const router = express.Router();

router.use(express.json());

router.post('/sign-up', async (req, res) => {
    try {
        let user = await UserControllers.Create(req.body);
        return response(res, CREATED, 'Success', {
            user: user.getSafe(),
            token: user.generateJWT(),
        });
    } catch (e) {
        console.log(e);
        return response(res, BAD_REQUEST, 'Invalid Data', null, e.message);
    }
});

router.post('/sign-in', async (req, res) => {
    const { body } = req;

    try {
        let user = await UserControllers.GetByEmail(body.email);

        if (user && user?.comparePassword(body.password)) {
            return response(res, CREATED, 'Success', { 
                user: user.getSafe(),
                token: user.generateJWT(),
            });
        }
        return response(res, UNAUTHORIZED, 'Invalid email or password', null);
    } catch (e) {
        console.log(e);
        return response(res, INTERNAL_SERVER_ERROR, e.message, null);
    }
});

router.post('/forgot-password', async (req, res) => {
    return response(res, CREATED, 'Success', {});
});

export default router;
