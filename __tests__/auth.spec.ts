import { config } from 'dotenv';
import request from 'supertest';

if (process.env.NODE_ENV === 'dev') {
    config({
        path: process.cwd() + '/.test.env'
    });
}

import '../src/common/db';
import app from '../src/app';

// services
import UserService from '../src/services/user.service';

// types
import { IUserBase } from '../src/models/user.model';

let createdUser: IUserBase;

beforeAll(async done => {
    createdUser = await UserService.Create({
        firstName: 'Hello',
        lastName: 'World',
        email: 'hello@world.com',
        phoneNumber: '0765635454',
        password: 'testing123',
    } as IUserBase);
    done();
})

describe('POST /auth/signup', () => {
    test('responds with 201 status code if account creation succeeds', async done => {
        request(app)
        .post('/auth/signup')
        .type('json')
        .send(JSON.stringify({
            email: 'user@test.com',
            password: 'testing123',
            firstName: 'Test',
            lastName: 'User',
            phoneNumber: '0764520540'
        }))
        .set('Accept', 'application/json')
        .then(response => {
            const body = response.body;
            expect(response.status).toBe(201);
            expect(body.token).not.toBeUndefined();
            done();
        });
    });
    
    test('responds with 406 if the email address is already in use', done => {
        request(app)
        .post('/auth/signup')
        .type('json')
        .send(JSON.stringify({
            email: 'user@test.com',
            password: 'testing',
            firstName: 'User',
            lastName: 'Test',
            phoneNumber: '0764520540',
        }))
        .set('Accept', 'application/json')
        .then(response => {
            expect(response.status).toBe(406);
            done();
        });
    });

    test('responds with 406 when the email is invalid', done => {
        request(app)
        .post('/auth/signup')
        .type('json')
        .send(JSON.stringify({
            email: 'nisal.com',
            password: 'testing',
            firstName: 'Nisal',
            lastName: 'Periyapperuma',
            phoneNumber: '0764520540',
        }))
        .set('Accept', 'application/json')
        .then(response => {
            expect(response.status).toBe(406);
            done();
        });
    });
});

describe('POST /auth/signin', () => {
    test('should return a 401 when incorrect credentials are supplied', done => {
        request(app)
        .post('/auth/signin')
        .type('json')
        .send(JSON.stringify({
            email: 'nisal@hirepaladin.com',
            password: 'hello',
        }))
        .set('Accept', 'application/json')
        .then(response => {
            expect(response.status).toBe(401);
            done();
        });
    });

    test('responds with 200 status code when credentials are okay', done => {
        request(app)
        .post('/auth/signin')
        .type('json')
        .send(JSON.stringify({
            email: 'user@test.com',
            password: 'testing123',
        }))
        .set('Accept', 'application/json')
        .then(response => {
            const body = response.body;
            expect(response.status).toBe(200);
            expect(body.token).not.toBeUndefined();
            done();
        });
    });
});

describe('POST /auth/verifyEmail', () => {
    test('should return a 401 when the verification code is invalid', done => {
        request(app)
        .post('/auth/verifyEmail')
        .type('json')
        .send(JSON.stringify({
            userId: createdUser._id,
            code: '456546',
        }))
        .set('Accept', 'application/json')
        .then(response => {
            expect(response.status).toBe(401);
            done();
        });
    });

    test('should return a 200 when the verification code is valid', done => {
        request(app)
        .post('/auth/verifyEmail')
        .type('json')
        .send(JSON.stringify({
            userId: createdUser._id,
            code: createdUser.emailVerificationCode,
        }))
        .set('Accept', 'application/json')
        .then(response => {
            expect(response.status).toBe(200);
            done();
        });
    });
});

afterAll(async (done) => {
    await UserService.Clean();
    done();
});