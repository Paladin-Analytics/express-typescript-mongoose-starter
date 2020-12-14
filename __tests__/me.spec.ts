import { config } from 'dotenv';

if (process.env.NODE_ENV === 'dev') {
    config({
        path: process.cwd() + '/.test.env'
    });
}

import '../src/common/db';
import app from '../src/app';

import UserService from '../src/services/user.service';

import request from 'supertest';

// Types
import { IUserBase } from '../src/models/user.model';
import { Token } from '../src/types/user.types';

let user: IUserBase;
let token: Token;

beforeAll(async (done) => {
    user = await UserService.Create({
        email: 'test@hello.com',
        password: 'testing123',
        firstName: 'test',
        lastName: 'hello',
        phoneNumber: '0763234234',
    } as IUserBase);

    user.emailVerified = true;
    await user.save();

    token = user.generateJWT();

    done();
})

describe("GET /me", () => {
    it('expect 401 when token is invalid', async (done) => {
        request(app)
            .get('/me')
            .set('Authorization', `Bearer 234234234`)
            .send()
            .expect(401)
            .then((res) => {
                console.log(res.body);
                done();
            });
    });

    it('expect 200 when successfull', async (done) => {
        request(app)
            .get('/me')
            .set('Authorization', `Bearer ${token.token}`)
            .send()
            .expect(200)
            .then((res) => {
                console.log(res.body);
                done();
            });
    });
});

describe("PATCH /me", () => {
    it('expect 401 when token is invalid', async (done) => {
        request(app)
            .patch('/me')
            .set('Authorization', `Bearer 234234234`)
            .send()
            .expect(401)
            .then((res) => {
                console.log(res.body);
                done();
            });
    });

    it('expect 200 when successfull', async (done) => {
        request(app)
            .patch('/me')
            .set('Authorization', `Bearer ${token.token}`)
            .type('json')
            .send(JSON.stringify({
                firstName: 'Changed',
                lastName: 'Name',
                phoneNumber: '0764520540',
                email: 'test@hello.com',
            }))
            .expect(200)
            .then(() => {
                done();
            });
    });

    it('check if the firstName and lastName got changed', async (done) => {
        request(app)
            .get('/me')
            .set('Authorization', `Bearer ${token.token}`)
            .send()
            .expect(200)
            .then((res) => {
                const body = res.body;
                expect(body.firstName).toBe('Changed');
                expect(body.lastName).toBe('Name');
                done();
            });
    });

    it('check if emailVerified is set to false when the email is changed', async (done) => {
        request(app)
            .patch('/me')
            .set('Authorization', `Bearer ${token.token}`)
            .type('json')
            .send(JSON.stringify({
                firstName: 'Changed',
                lastName: 'Name',
                phoneNumber: '0764520540',
                email: 'testing@hello.com',
            }))
            .expect(200)
            .then((req) => {
                expect(req.body.emailVerified).toBe(false);
                done();
            });
    });
});

describe("POST /me/updatePassword", () => {
    it('expect 401 when token is invalid', async (done) => {
        request(app)
            .post('/me/updatePassword')
            .set('Authorization', `Bearer 234234234`)
            .type('json')
            .send(JSON.stringify({
                newPassword: 'testingnewpassword'
            }))
            .expect(401)
            .then((res) => {
                console.log(res.body);
                done();
            });
    });

    it('expect 406 when the new password has less than 6 characters', async (done) => {
        request(app)
            .post('/me/updatePassword')
            .set('Authorization', `Bearer ${token.token}`)
            .type('json')
            .send(JSON.stringify({
                newPassword: 'test'
            }))
            .expect(406)
            .then(() => {
                done();
            });
    });

    it('expect 201 when successfull', async (done) => {
        request(app)
            .post('/me/updatePassword')
            .set('Authorization', `Bearer ${token.token}`)
            .type('json')
            .send(JSON.stringify({
                newPassword: 'testingnewpassword'
            }))
            .expect(201)
            .then(() => {
                done();
            });
    });

    it('check if the password got changed', async (done) => {
        request(app)
            .post('/auth/signin')
            .type('json')
            .send(JSON.stringify({
                email: 'testing@hello.com',
                password: 'testingnewpassword'
            }))
            .expect(200)
            .then(() => {
                done();
            });
    });
});

afterAll(async (done) => {
    await UserService.Clean();
    done();
})