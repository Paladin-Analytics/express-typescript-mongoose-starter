import {
    Body,
    Controller,
    Tags,
    Get,
    Patch,
    Path,
    Post,
    Query,
    Route,
    SuccessResponse,
    Security,
    Response,
    Request,
    ValidateError,
    
} from "tsoa";

import { Request as ExpRequest, request } from 'express';
import isEmail from 'validator/lib/isEmail';

// Controllers
import UserService from '../services/user.service';

// Types
import { AuthenticatedRequest } from '../types/response.types';
import { UserResponse } from '../types/user.types';

// Erros
import { NotFoundError } from '../common/errors';

interface UserPatchRequest{
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    profilePictureURL?: string;
}

interface UpdatePasswordRequest{
    newPassword: string;
}

@Route("me")
@Tags("Account")
export class MeController extends Controller{
    /**
    * Get current user
    */
    @Security("jwt")
    @Get()
    @SuccessResponse("200", "Success")

    public async Get(@Request() request: AuthenticatedRequest): Promise<UserResponse>{
        const user = await UserService.GetById(request.user.user_id);

        if (!user) {
            throw new NotFoundError('User not found');
        }
        return user.getSafe();
    }

    /**
     * Patch current user's details
     */
    @Security("jwt")
    @Patch()
    @SuccessResponse("201", "Updated")
    public async Patch(@Body() requestBody: UserPatchRequest, @Request() request: AuthenticatedRequest): Promise<UserResponse> {
        const user = await UserService.GetById(request.user.user_id);

        if (!user) {
            throw new NotFoundError('User not found');
        }

        user.firstName = requestBody.firstName;
        user.lastName = requestBody.lastName;
        user.phoneNumber = requestBody.phoneNumber;
        
        if (requestBody.profilePictureURL) user.profilePictureURL = requestBody.profilePictureURL;

        if (isEmail(user.email)) {
            user.email = requestBody.email;
        }

        await user.save();

        return user.getSafe();
    }

    /**
     * Update current user's password
     */
    @Security("jwt")
    @Post("updatePassword")
    @SuccessResponse("201", "Password Updated")
    public async UpdatePassword(@Body() requestBody: UpdatePasswordRequest, @Request() request: AuthenticatedRequest): Promise<{ message: string}>{
        if (requestBody.newPassword.length < 6) {
            throw new ValidateError({
                'password': {
                    message: 'Password should have at least 6 characters',
                }
             }, 'Password require 6 characters');
        }

        const user = await UserService.GetById(request.user.user_id);

        if (!user) {
            throw new NotFoundError('User not found');
        }

        user.password = requestBody.newPassword;
        await user.save();

        this.setStatus(201);
        return {
            message: 'Password Updated',
        }
    }

}
