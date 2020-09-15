import express from 'express';
import { BAD_REQUEST, CREATED, UNAUTHORIZED, INTERNAL_SERVER_ERROR, OK, NOT_FOUND } from 'http-status-codes';

// Helpers
import response from '../../helpers/response';

// Controllers
import * as UserService from '../../services/user.service';

const router = express.Router();

router.use(express.json());

router.post('/sign-up', async (req, res) => {
    const { body } = req;

    try {
        const user = await UserService.Create(body);
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
        const user = await UserService.GetByEmail(body.email);

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

router.post('/verify-email', async(req, res) => {
    const { body } = req;
    
    if (!body.user_id || !body.code) return response(res, BAD_REQUEST, 'Missing fields', null);

    try {
        const user = await UserService.GetById(body.user_id);
        if (!user) {
            return response(res, NOT_FOUND, 'Invalid user_id', null);
        }

        if (user.compareEmailVerificationCode(body.code)) {
            user.emailVerified = false;
            user.emailVerification = undefined;
            await user.save();
            return response(res, OK, 'Success', null);
        }
    } catch (e) {
        console.log(e);
        return response(res, INTERNAL_SERVER_ERROR, e.message, null);
    }

    return response(res, UNAUTHORIZED, 'Invalid verification code', null);
});

router.post('/forgot-password', async (req, res) => {
    return response(res, CREATED, 'Success', {});
});

export default router;
