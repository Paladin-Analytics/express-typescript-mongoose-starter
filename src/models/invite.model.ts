import { roles } from '../config/permissions';

import { Model, Schema, Types } from 'mongoose';
import { generate } from 'randomstring';
import { compareSync, hashSync } from 'bcryptjs';
import moment from 'moment';
import isEmail from 'validator/lib/isEmail';

// Types
import { IDocument } from '../types/mongoose.types';
import { IHashCodeSchema } from '../types/verification.types';
import { InviteResponse } from '../types/invite.types';

// Helpers
import { SendTemplatedEmail } from '../common/mail';

// constants
import { EMAIL_INVITE } from '../common/mail';

export const InviteSchema = new Schema({
    workspaceId: {
        type: Types.ObjectId,
        ref: 'workspaces',
    },
    email: {
        type: String,
        required: true,
        validate: [ isEmail, 'Please enter a valid email' ],
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    accepted: {
        type: Boolean,
        default: false,
    },
    invitation: {
        hash: {
            type: String,
            default: null,
        },
        expiresAt: {
            type: Date,
            default: null,
        },
    },
    role: {
        type: String,
        enum: roles,
        default: 'user',
    },

    // history
    createdAt: {
        type: Date,
        default: Date.now,
    },
    lastUpdateAt: {
        type: Date,
        default: Date.now,
    },
    acceptedAt: {
        type: Date,
        default: null,
    }
});

export interface IInviteBase extends IDocument {
    // properties
    workspaceId: Types.ObjectId;
    email: string;
    firstName: string;
    lastName: string;
    accepted: boolean;

    invitationCode: string;
    invitation?: {
        hash: string;
        expiresAt?: Date;
    }; 
    role: string;

    createdAt: Date;
    lastUpdateAt: Date;

    // private
    _invitationModified: boolean;
    _resend: boolean;

    // methods
    compareInviteCode(code: string): boolean;
    getSafe(): InviteResponse;
}

export type IInviteModel = Model<IInviteBase>

// Middleware

InviteSchema.pre<IInviteBase>('save', function (next) {
    this._new = this.isNew;
    this._modified = this.isModified();

    if (this._new || this._resend) {
        this.invitationCode = generate({
            length: 6,
            charset: 'numeric',
        });
    
        this.invitation = <IHashCodeSchema>{
            hash: hashSync(this.invitationCode, 10), 
            expiresAt: moment().add(30 * 60, 's').toDate(),
        }

        this._invitationModified = true;
    }
    
    this.lastUpdateAt = new Date();
    
    next();
});

InviteSchema.post('save', async function(doc: IInviteBase) {
    if (doc._invitationModified) {
        SendTemplatedEmail(EMAIL_INVITE, { 
            code: doc.invitationCode, 
            user: {
                _id: doc._id,
                firstName: doc.firstName,
                lastName: doc.lastName,
                email: doc.email,
            }
        });
    }

    if (doc._new) {
        //await PublishEvent('invite.new', doc.getSafe());
    } else if (doc._modified){
        //await PublishEvent('invite.update', doc.getSafe());
    }
});

// Methods and virtuals

InviteSchema.virtual('_resend');

InviteSchema.methods.compareInviteCode = function(code: string): boolean {
    if (this.invitation && this.invitation.hash && this.invitation.expiresAt) {
        return compareSync(code, this.invitation.hash) && new Date() < this.invitation.expiresAt;
    }
    return false;
};

InviteSchema.methods.getSafe = function(): InviteResponse {
    const parsed = {
        _id: this._id,
        email: this.email,
        firstName: this.firstName,
        lastName: this.lastName,
        role: this.role,

        workspaceId: this.workspaceId,

        accepted: this.accepted,

        createdAt: this.createdAt,
        lastUpdateAt: this.lastUpdateAt,
        acceptedAt: this.acceptedAt,
    };

    return parsed;
}

/*
InviteSchema.methods.comparePassword = function() {
};
*/
