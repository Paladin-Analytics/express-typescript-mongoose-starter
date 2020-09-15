import express from 'express';
import { BAD_REQUEST, CREATED, UNAUTHORIZED, INTERNAL_SERVER_ERROR, 
        OK, NOT_FOUND, CONFLICT, FORBIDDEN } from 'http-status-codes';

// Helpers
import response from '../../helpers/response';

// Controllers
import UserService from '../../services/user.service';

const router = express.Router();

router.use(express.json());

router.post('/sign-up', async (req, res) => {
    const { body } = req;

    try {
        const existingUser = await UserService.GetByEmail(body.email);
        if (existingUser) {
            return response(res, CONFLICT, 'Email already exists', null);
        }
    } catch(e) {
        return response(res, INTERNAL_SERVER_ERROR, e.message, null);
    }

    try {
        const user = await UserService.Create(body);
        const token = user.generateJWT();

        user.loginHistory.push({
            ip: req.connection.remoteAddress || '',
            loginAt: new Date(),
            jwtid: token.jwtid,
        });
        user.save();
        
        return response(res, CREATED, 'Success', {
            user: user.getSafe(),
            token: token.token,
        });
    } catch (e) {
        if (e.name === 'ValidationError') {
            console.log(`Validation Error = ${JSON.stringify(e)}`);
            return response(res, BAD_REQUEST, 'Invalid Data', null, e.message);
        }
        return response(res, INTERNAL_SERVER_ERROR, e.message, null);
    }
});

router.post('/sign-in', async (req, res) => {
    const { body } = req;

    try {
        const user = await UserService.GetByEmail(body.email);

        if (user && user?.comparePassword(body.password)) {
            const token = user.generateJWT();

            user.loginHistory.push({
                ip: req.connection.remoteAddress || '',
                loginAt: new Date(),
                jwtid: token.jwtid,
            });
            await user.save();

            return response(res, CREATED, 'Success', { 
                user: user.getSafe(),
                token: token.token,
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
    const { body } = req;

    if (!body || !body.email) return response(res, BAD_REQUEST, 'Missing email', null);

    try {
        const user = await UserService.GetByEmail(body.email);

        if (!user) {
            return response(res, NOT_FOUND, 'Invalid user_id', null);
        }

        await user.setAndSendPasswordReset();
        await user.save();

        return response(res, OK, 'Reset email sent', null);
    } catch (e) {
        console.log(e);
        return response(res, INTERNAL_SERVER_ERROR, e.message, null);
    }
});

router.post('/reset-password', async (req, res) => {
    const { body } = req;

    if (!body.newPassword || body.newPassword.length < 6) 
        return response(res, BAD_REQUEST, 'Password should have at least 6 characters', null);
    
    try {
        const user = await UserService.GetById(body.user_id);
        if (!user) {
            return response(res, NOT_FOUND, 'Invalid user_id', null);
        }
        if (user.compareForgotPassword(body.code)) {
            user.password = body.newPassword;
            user.forgotPassword = undefined;
            user.lastPasswordResetAt = new Date();
            await user.save();
            return response(res, OK, 'Password Reset', null);
        }

        return response(res, FORBIDDEN, 'Invalid pasword reset code', null);
    } catch (e) {
        console.log(e);
        return response(res, INTERNAL_SERVER_ERROR, e.message, null);
    }
});

export default router;
