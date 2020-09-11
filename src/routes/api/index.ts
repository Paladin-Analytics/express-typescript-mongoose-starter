import express from 'express';
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes';

import response from '../../helpers/response';

import { UserModel } from '../../models/user.model';

const router = express.Router();

router.get('/me/memberships', async (_, res) => {
    const tmp = new UserModel({});
    console.log(tmp);
    try {
        await tmp.save();
    } catch (e) {
        return response(res, OK, 'Invalid data', null, e.errors);
    }

    return response(res, 200, 'Success', {});
});

router.get('/me/profile', async (_, res) => {
    return response(res, 200, 'Success', {});
});

router.get('/me/content', async (_, res) => {
    return response(res, 200, 'Success', {});
});

router.get('/me/activity', async (_, res) => {
    return response(res, 200, 'Success', {});
});

router.get('/me/new', async (_, res) => {
    return response(res, 200, 'Success', {});
});

export default router;
