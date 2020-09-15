import { Model, model, Schema } from 'mongoose';

// Types
import { IDocument } from '../types/mongoose.types';

export const SampleSchema = new Schema({

});

export interface ISampleBase extends IDocument {
    // properties
    sample: boolean;

    // methods
}

export type ISampleModel = Model<ISampleBase>

// Middleware

SampleSchema.pre<ISampleBase>('save', function (next) {
    this._new = this.isNew;
    this._modified = this.isModified();
    
    next();
});

SampleSchema.post('save', async function(doc: ISampleBase) {
    if (doc._new) {
        //await PublishEvent('user.new', doc.getSafe());
    } else if (doc._modified){
        //await PublishEvent('user.update', doc.getSafe());
    }
});

// Methods and virtuals

/*
SampleSchema.methods.comparePassword = function() {
};
*/

export const SampleModel = model<ISampleBase, ISampleModel>('<model_name>', SampleSchema);
