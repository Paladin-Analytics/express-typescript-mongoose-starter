import { jwtKey, jwtExpTime } from '../config/jwt';
import { roles } from '../config/permissions';

import isEmail from 'validator/lib/isEmail';
import { compareSync, hashSync } from 'bcryptjs';
import { Types, Model, Schema } from 'mongoose';
import moment from 'moment';
import { generate } from 'randomstring';
import { sign as jwtSign, Secret } from 'jsonwebtoken';

// Types
import { UserResponse, Token } from '../types/user.types';
import { IDocument } from '../types/mongoose.types';
import { IHashCodeSchema } from '../types/verification.types';

// Helpers
import { PublishEvent } from '../common/events';
import { SendTemplatedEmail } from '../common/mail';

// constants
import { EMAIL_VERIFICATION, PASSWORD_RESET } from '../common/mail';

export const UserSchema = new Schema({
    // basic
    email: {
        type: String,
        required: true,
        unique: true,
        validate: [ isEmail, 'Please enter a valid email' ],
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        default: '',
    },

    // state
    banned: {
        type: Boolean,
        default: false
    },

    // meta
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    profilePictureURL: {
        type: String,
        default: null
    },

    // email verification
    emailVerified: {
        type: Boolean,
        default: false
    },
    emailVerification: {
        hash: {
            type: String,
            default: null,
        },
        expiresAt: {
            type: Date,
            default: null,
        },
    },

    // phone verification
    phoneVerified: {
        type: Boolean,
        default: false
    },
    phoneVerification: {
        hash: {
            type: String,
            default: null,
        },
        expiresAt: {
            type: Date,
            default: null,
        },
    },

    // forgot password
    forgotPassword: {
        hash: {
            type: String,
            default: null,
        },
        expiresAt: {
            type: Date,
            default: null,
        },
    },

    // history
    createdAt: {
        type: Date,
        default: Date.now()
    },
    lastUpdateAt: {
        type: Date,
        default: Date.now()
    },
    lastPasswordResetAt: {
        type: Date,
        default: null,
    },

    loginHistory: {
        type: [ { 
            loginAt: {
                type: Date,
                default: Date.now()
            },
            ip: {
                type: String,
                default: '',
            },
            jwtid: {
                type: String,
                default: '',
            }
        } ]
    },

    // devices
    deviceIds: {
        type: [String],
        default: []
    },

    // Metadata
    userMetadata: {
        type: Schema.Types.Mixed,
        default: {},
    },

    appMetadata: {
        type: Schema.Types.Mixed,
        default: {},
    },

    // Permissions
    permissions: [
        {
            workspace: {
                type: Types.ObjectId,
                ref: 'workspaces',
            },
            role: {
                type: String,
                enum: roles,
                default: 'user'
            }
        }
    ]
});

export interface IUserBase extends IDocument {
    _emailModified: boolean;
    // basic
    email: string;
    phoneNumber: string;
    password: string;

    // state
    banned: boolean;

    // meta
    firstName: string;
    lastName: string;
    profilePictureURL: string;

    // email verification
    emailVerified: boolean;
    emailVerification?: {
        hash: string;
        expiresAt?: Date;
    };
    emailVerificationCode: string;  // virtual

    // phone verification
    phoneVerified: boolean;
    phoneVerification?: {
        hash: string;
        expiresAt?: Date;
    };
    phoneVerificationCode: string;  // virtual

    // forgot password
    forgotPassword?: {
        hash: string;
        expiresAt?: Date;
    };

    // history
    createdAt: Date;
    lastUpdateAt: Date;
    lastPasswordResetAt?: Date;

    loginHistory: [{
        loginAt: Date;
        ip: string;
        jwtid: string;
    }];

    // devices
    deviceIds: Array<string>;

    // metadata
    userMetadata: Map<string, unknown>;
    appMetadata: Map<string, unknown>;

    permissions: Array<{
        workspace: Types.ObjectId;
        role: string;
    }>;

    // methods
    setAndSendPasswordReset(): Promise<boolean>;
    comparePassword(password: string): boolean;
    compareEmailVerificationCode(code: string): boolean;
    compareForgotPassword(code: string): boolean;
    getSafe(): UserResponse;
    generateJWT(): Token;
}

export type IUserModel = Model<IUserBase>

// Middleware

UserSchema.pre<IUserBase>('save', function (next) {
    this._new = this.isNew;
    this._modified = this.isModified();

    this.lastUpdateAt = new Date();

    if (this.isModified('password')) {
        this.password = hashSync(this.password, 10);
    }

    if (this.isModified('email') || this.isNew) {
        this._emailModified = true;
        this.emailVerified = false;
        
        this.emailVerificationCode = generate({
            length: 6,
            charset: 'numeric',
        });
    
        this.emailVerification = <IHashCodeSchema>{
            hash: hashSync(this.emailVerificationCode, 10), 
            expiresAt: moment().add(30 * 60, 's').toDate(),
        }
    }
    
    next();
});

UserSchema.post('save', async function(doc: IUserBase) {
    if (doc._emailModified) {
        SendTemplatedEmail(EMAIL_VERIFICATION, { 
            code: doc.emailVerificationCode, 
            user: {
                _id: doc._id,
                firstName: doc.firstName,
                lastName: doc.lastName,
                email: doc.email,
            }
        });
    }

    if (doc._new) {
        await PublishEvent('user.new', doc.getSafe());
    } else if (doc._modified){
        await PublishEvent('user.update', doc.getSafe());
    }
});

// Methods and virtuals

UserSchema.methods.setAndSendPasswordReset = async function(): Promise<boolean> {
    const resetCode = generate({
        length: 6,
        charset: 'numeric',
    });

    this.forgotPassword = <IHashCodeSchema>{
        hash: hashSync(resetCode, 10),
        expiresAt: moment().add(30 * 60, 's').toDate(),
    }

   return await SendTemplatedEmail(PASSWORD_RESET, { 
        code: resetCode, 
        user: {
            _id: this._id,
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
        }
    });
}

UserSchema.methods.comparePassword = function(password: string): boolean {
    return compareSync(password, this.password);
};

UserSchema.methods.compareEmailVerificationCode = function(code: string): boolean {
    if (this.emailVerification && this.emailVerification.hash && this.emailVerification.expiresAt) {
        return compareSync(code, this.emailVerification.hash) && new Date() < this.emailVerification.expiresAt;
    }
    return false;
};

UserSchema.methods.compareForgotPassword = function(code: string): boolean {
    if (this.forgotPassword && this.forgotPassword.hash && this.forgotPassword.expiresAt) {
        return compareSync(code, this.forgotPassword.hash) && new Date() < this.forgotPassword.expiresAt;
    }
    return false;
};

UserSchema.methods.getSafe = function(): UserResponse {
    const parsed = {
        _id: this._id,

        // basic
        email: this.email,
        phoneNumber: this.phoneNumber,

        // state
        banned: this.banned,

        // meta
        firstName: this.firstName,
        lastName: this.lastName,
        profilePictureURL: this.profilePictureURL,

        // verification
        emailVerified: this.emailVerified,
        phoneVerified: this.phoneVerified,

        // history
        createdAt: this.createdAt,
        lastUpdateAt: this.lastUpdateAt,
        loginHistory: this.loginHistory,
        
        // devices
        deviceIds: this.deviceIds,

        // metadata
        userMetadata: this.userMetadata,
        appMetadata: this.appMetadata,

        permissions: this.permissions,
    };
    return parsed;
}

UserSchema.methods.generateJWT = function(): Token{
    const jwtid = generate({
        length: 24,
        charset: 'alphanumeric',
    });

    const token = jwtSign({
        user_id: this._id,
    }, <Secret>jwtKey, { 
        expiresIn: jwtExpTime,
        jwtid,
        algorithm: 'HS256',
    });

    return {
        jwtid,
        token,
    }
}

