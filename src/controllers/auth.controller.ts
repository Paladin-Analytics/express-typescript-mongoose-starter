import {
    Body,
    Controller,
    Tags,
    Post,
    Route,
    SuccessResponse,
    Response,
    Request,
    ValidateError,
    
} from "tsoa";

import { Request as ExpRequest } from 'express';
import isEmail from 'validator/lib/isEmail';

// Controllers
import UserService from '../services/user.service';

// Types
import { IUserBase } from '../models/user.model';
import { UserResponse } from '../types/user.types';
import { ValidateErrorJSON } from '../types/response.types';

// Erros
import { NotFoundError, UnauthorizedError } from '../common/errors';

interface SignUpRequestBody {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    
    /**
     * Should contain at least 6 characters
     */
    password: string;
    testing?: string;
}

interface SignInRequestBody {
    email: string;
    password: string;
}

interface VerifyEmailRequestBody {
    /**
     * ID of the user that needs to be verified
     */
    userId: string;
    /**
     * This code is sent to the user via email or text
     */
    code: string;
}

interface ForgotPasswordRequestBody {
    /**
     * Email to reset the password for
     */
    email: string;
}

interface ResetPasswordRequestBody {
    userId: string;
    code: string;
    newPassword: string;
}

@Route("auth")
@Tags("Authentication")
export class AuthController extends Controller{
    /**
    * Creates a new user
    */
    @Post("signup")
    @SuccessResponse("201", "Created")
    @Response<ValidateErrorJSON>(406, "Invalid Request")

    public async SignUp(@Body() requestBody: SignUpRequestBody, @Request() req: ExpRequest): Promise<{
        user: UserResponse,
        token: string
    }>{
        if (!isEmail(requestBody.email)) {
            throw new ValidateError({
                'email': {
                    message: 'Email is invalid',
                }
             }, 'Invalid email provided');
        }
        if (requestBody.password.length < 6) {
            throw new ValidateError({
                'password': {
                    message: 'Password should have at least 6 characters',
                }
             }, 'Password require 6 characters');
        }

        let existingUser;

        try {
            existingUser = await UserService.GetByEmail(requestBody.email);
        } catch(e) {
            throw new Error(e);
        }

        if (existingUser) {
            throw new ValidateError({
                'email': {
                    message: 'Email already exists',
                }
             }, 'Email already exists');
        }

        const user = await UserService.Create({
            ...requestBody,
        } as IUserBase);

        const token = user.generateJWT();

        // Add workspace logic etc. here
        user.loginHistory.push({
            ip: req.connection.remoteAddress || '',
            loginAt: new Date(),
            jwtid: token.jwtid,
        });
        user.save();

        this.setStatus(201);

        return {
            user: user.getSafe(),
            token: token.token,
        }
    }

    /**
     * User sign in
     */
    @Post("signin")
    @SuccessResponse("200", "Success")

    public async SignIn(@Body() requestBody: SignInRequestBody, @Request() req: ExpRequest): Promise<{
        user: UserResponse,
        token: string
    }> {
        const user = await UserService.GetByEmail(requestBody.email);

        if (user && user?.comparePassword(requestBody.password)) {
            const token = user.generateJWT();

            user.loginHistory.push({
                ip: req.connection.remoteAddress || '',
                loginAt: new Date(),
                jwtid: token.jwtid,
            });
            await user.save();

            return { 
                user: user.getSafe(),
                token: token.token,
            };
        } else {
            throw new UnauthorizedError('Unauthorized');
        }
    }

    /**
     * Verify the user's email. A verification code will be sent to user's email. The frontend will receive this code through a link or input field. Please pass these values as parameters
     */
    @Post("verifyEmail")
    @SuccessResponse(200, "User's email verified successfully.")
    @Response<{ message: string}>(404, "Invalid userId")
    @Response<{ message: string}>(401, "Unauthorized")

    public async VerifyEmail(@Body() requestBody: VerifyEmailRequestBody): Promise<{ emailVerified: boolean }>{
        let user: IUserBase | null;
        try {
            user = await UserService.GetById(requestBody.userId);
        } catch(e) {
            throw new Error(e);
        }

        if (!user) {
            throw new NotFoundError('UserId not found');
        }

        try {
            if (user.compareEmailVerificationCode(requestBody.code)) {
                user.emailVerified = false;
                user.emailVerification = undefined;
                await user.save();
                return { 
                    emailVerified: true
                };
            }
        } catch (e) {
            throw new Error(e);
        }

        throw new UnauthorizedError('Invalid verification code');
    }

    // Forgot Password
    @Post("forgotPassword")
    @SuccessResponse(200, "Password reset token generated and sent to the user")
    public async ForgotPassword(@Body() requestBody: ForgotPasswordRequestBody): Promise<{ message: string }>{
        const user = await UserService.GetByEmail(requestBody.email);

        if (!user) {
            throw new NotFoundError('Invalid email');
        }

        const resetCode = await user.setAndSendPasswordReset();
        console.log(resetCode);
        
        return { message: 'Email sent' };
    }

    @Post("resetPassword")
    @SuccessResponse(200, "Success")
    public async ResetPassword(@Body() requestBody: ResetPasswordRequestBody): Promise<{ message: string}>{

        if (requestBody.newPassword.length < 6) {
            throw new ValidateError({
                'password': {
                    message: 'Password should have at least 6 characters',
                }
             }, 'Password require 6 characters');
        }

        const user = await UserService.GetById(requestBody.userId);
        if (!user) {
            throw new NotFoundError('UserId not found');
        }

        if (user.compareForgotPassword(requestBody.code)) {
            user.password = requestBody.newPassword;
            user.forgotPassword = undefined;
            user.lastPasswordResetAt = new Date();
            await user.save();
        } else {
            throw new UnauthorizedError('Invalid reset code');
        }
        
        return { message: 'Password Reset' };
    }
}
