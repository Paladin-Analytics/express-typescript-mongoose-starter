import { Model, Schema } from 'mongoose';

// Types
import { IDocument } from '../types/mongoose.types';

export const WorkspaceSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    lastUpdateAt: {
        type: Date,
        default: Date.now,
    },
});

export interface IWorkspaceBase extends IDocument {
    name: string;

    createdAt?: Date;
    lastUpdateAt?: Date;

    // methods
}

export type IWorkspaceModel = Model<IWorkspaceBase>

// Middleware

WorkspaceSchema.pre<IWorkspaceBase>('save', function (next) {
    this._new = this.isNew;
    this._modified = this.isModified();
    
    next();
});

WorkspaceSchema.post('save', async function(doc: IWorkspaceBase) {
    if (doc._new) {
        //await PublishEvent('user.new', doc.getSafe());
    } else if (doc._modified){
        //await PublishEvent('user.update', doc.getSafe());
    }
});

// Methods and virtuals

/*
WorkspaceSchema.methods.comparePassword = function() {
};
*/

