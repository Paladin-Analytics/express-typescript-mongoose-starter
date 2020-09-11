import { Document, Schema, Types } from 'mongoose';

export type UserResponse = {
    _id: Schema.Types.ObjectId;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    verified: boolean;
    banned: boolean;
    profilePictureURL: string;
    createdAt: Date;
    lastUpdateAt: Date;
    instagramURL: string;
    country: string;
    b2bMemberships: Types.Array<IB2BMembershipSchema>;
}

export type Token = string;

enum B2BMembershipStatus {
    Pending = 0,
    Approved = 1,
    Rejected = 2
}

export interface IB2BMembershipSchema extends Document {
    partnerId: Schema.Types.ObjectId;
    status: B2BMembershipStatus;
    requestedAt: Date;
    respondedAt: Date;
}