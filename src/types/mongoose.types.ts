import { Document } from 'mongoose';

export interface IDocument extends Document{
    // Internals
    _new: boolean;
    _modified: boolean;
}