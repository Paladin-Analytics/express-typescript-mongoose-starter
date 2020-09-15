import { Schema } from 'mongoose';

export type UserResponse = {
    _id: Schema.Types.ObjectId;

    // basic
    email: string;
    phoneNumber: string;

    // state
    banned: boolean;

    // meta
    firstName: string;
    lastName: string;
    profilePictureURL: string;

    // verification
    emailVerified: boolean;

    // history
    createdAt: Date;
    lastUpdateAt: Date;
    loginHistory: [{
        loginAt: Date;
        ip: string;
    }];

    // devices
    deviceIds: [string];

    // metadata
    userMetadata?: Map<string, unknown>;
    appMetadata?: Map<string, unknown>;
}

export type Token = string;
