import { Schema } from 'mongoose';

export type InviteResponse = {
    _id: Schema.Types.ObjectId;

    email: string;
    firstName: string;
    lastName: string;
    role: string;

    workspaceId: Schema.Types.ObjectId;

    // state
    accepted: boolean;

    // history
    createdAt: Date;
    lastUpdateAt: Date;
    acceptedAt?: Date;
}

export type Token = {
    token: string;
    jwtid: string;
}
