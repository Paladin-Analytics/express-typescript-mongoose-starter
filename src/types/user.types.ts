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
    loginHistory: {
        loginAt: Date;
        ip: string;
    }[];

    // devices
    deviceIds: string[];

    // metadata
    userMetadata?: { [key: string]: unknown };
    appMetadata?: { [key: string]: unknown };

    permissions: {
        workspace: unknown;
        role: unknown;
    }[]
}

export type Token = {
    token: string;
    jwtid: string;
}
