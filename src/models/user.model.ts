import { jwtKey, jwtExpTime } from '../config/jwt';

import { compareSync, hashSync } from 'bcryptjs';
import { Document, Model, model, Schema, Types } from 'mongoose';
import moment from 'moment';
import { generate } from 'randomstring';
import { sign as jwtSign, Secret } from 'jsonwebtoken';

// Types
import { UserResponse, Token, IB2BMembershipSchema } from '../types/user.types';

// Helpers
import { PublishEvent } from '../common/events';

const B2BMembershipSchema = new Schema({
    partnerId: {
        type: Schema.Types.ObjectId,
        ref: 'Partner',
        required: true
    },
    status: {
        type: Number,
        enum: [0, 1, 2],
        default: 0
    },
    requestedAt: {
        type: Date,
        default: Date.now()
    },
    respondedAt: {
        type: Date,
        default: null
    }
});

export const UserSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    verification: {
        hash: {
            type: String,
            default: null,
        },
        expiresAt: {
            type: Date,
            default: null,
        },
    },
    hashedPassword: {
        type: String,
        default: '',
    },
    verified: {
        type: Boolean,
        default: false
    },
    banned: {
        type: Boolean,
        default: false
    },
    profilePictureURL: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    lastUpdateAt: {
        type: Date,
        default: Date.now()
    },
    instagramURL: {
        type: String,
        default: null
    },
    country: {
        type: String,
        default: 'LK'
    },
    b2bMemberships: {
        type: [ B2BMembershipSchema ],
        default: []
    },
    deviceIds: {
        type: [String],
        default: []
    }
});

interface IVerificationCodeSchema extends Document {
    hash: string;
    expiresAt?: Date;
}

export interface IUserBase extends Document {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    
    password: string;
    hashedPassword?: string;

    verificationCode: string;
    verification?: {
        hash: string;
        expiresAt?: Date;
    };
    
    verified: boolean;
    banned: boolean;
    profilePictureURL: string;
    createdAt: Date;
    lastUpdateAt: Date;
    instagramURL: string;
    country: string;
    b2bMemberships: Types.Array<IB2BMembershipSchema>;

    // methods
    comparePassword(password: string): boolean;
    getSafe(): UserResponse;
    generateJWT(): Token;
}

interface IUserModel extends Model<IUserBase> {}

// Middleware

UserSchema.pre<IUserBase>('save', function (next) {
    console.log('HERE');
    this.hashedPassword = hashSync(this.password, 10);
    this.verificationCode = generate({
        length: 6,
        charset: 'numeric',
    }),

    this.verification = <IVerificationCodeSchema>{
        hash: hashSync(this.verificationCode, 10), 
        expiresAt: moment().add(30, 's').toDate(),
    }
    
    next();
});

UserSchema.post<IUserBase>('save', async function(doc, next) {
    await PublishEvent('user.new', doc.getSafe());
    next();
});

// Methods and virtuals

UserSchema.virtual('password');

UserSchema.methods.comparePassword = function(password: string): boolean {
    return compareSync(password, this.hashedPassword);
};

UserSchema.methods.getSafe = function(): UserResponse {
    const parsed = {
        _id: this._id,
        firstName: this.firstName,
        lastName: this.lastName,
        phoneNumber: this.phoneNumber,
        email: this.email,
        verified: this.verified,
        banned: this.banned,
        profilePictureURL: this.profilePictureURL,
        createdAt: this.createdAt,
        lastUpdateAt: this.lastUpdateAt,
        instagramURL: this.instagramURL,
        country: this.country,
        b2bMemberships: this.b2bMemberships,
    };
    return parsed;
}

UserSchema.methods.generateJWT = function(): Token{
    return jwtSign({
       user_id: this._id,
    }, <Secret>jwtKey, { 
       expiresIn: jwtExpTime,
    });
}

export const UserModel = model<IUserBase, IUserModel>('User', UserSchema);
