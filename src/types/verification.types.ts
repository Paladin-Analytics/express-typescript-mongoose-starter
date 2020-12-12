import { Document } from 'mongoose';

export interface IHashCodeSchema extends Document {
    hash: string;
    expiresAt?: Date;
}