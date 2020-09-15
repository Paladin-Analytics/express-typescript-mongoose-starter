import { Model, model, Schema } from 'mongoose';

// Types
import { IDocument } from '../types/mongoose.types';

export const RoleSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    scopes: {
        type: [String],
        default: [],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    lastUpdateAt: {
        type: Date,
        default: Date.now,
    }
});

export interface IRoleBase extends IDocument {
    // properties
    name: string;
    scopes: [ string ];
    createdAt: Date;
    lastUpdateAt: Date;

    // methods
}

export type IRoleModel = Model<IRoleBase>

// Middleware

RoleSchema.pre<IRoleBase>('save', function (next) {
    this._new = this.isNew;
    this._modified = this.isModified();
    
    next();
});

RoleSchema.post('save', async function(doc: IRoleBase) {
    if (doc._new) {
        //await PublishEvent('user.new', doc.getSafe());
    } else if (doc._modified){
        //await PublishEvent('user.update', doc.getSafe());
    }
});

// Methods and virtuals

/*
RoleSchema.methods.comparePassword = function() {
};
*/

export const RoleModel = model<IRoleBase, IRoleModel>('role', RoleSchema);
