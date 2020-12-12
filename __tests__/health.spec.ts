import { config } from 'dotenv';

if (process.env.NODE_ENV === 'dev') {
    config({
        path: process.cwd() + '/.test.env'
    });
}

import '../src/common/db';
import app from '../src/app';

import request from 'supertest';

describe("Test Health Endpoint", () => {
    it('expect health to return 200', async (done) => {
        request(app)
            .get('/health')
            .send()
            .expect(200)
            .then(() => {
                done();
            });
    });
});