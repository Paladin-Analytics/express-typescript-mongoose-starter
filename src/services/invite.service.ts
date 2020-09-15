import { model, Types } from 'mongoose';
import { IInviteModel, IInviteBase, InviteSchema } from '../models/invite.model';

export const InviteModel = model<IInviteBase, IInviteModel>('invites', InviteSchema);

export default class InviteService {
    // Methods
    static async Create(obj: IInviteBase): Promise<IInviteBase>{
        const user = new InviteModel(obj);
        return user.save();
    }

    static async GetById(id: string): Promise<IInviteBase | null> {
        const user = await InviteModel.findById(id);
        return user;
    }

    static async GetAll(workspace: Types.ObjectId): Promise<Array<IInviteBase> | null> {
        const invites = await InviteModel.find({ workspaceId: workspace });
        return invites;
    }

    static async Update(id: string, newObject: IInviteBase): Promise<IInviteBase | null> {
        const invite = await InviteModel.findById(id);
    
        if (invite) {
            await invite.save();
        }
        return invite;
    }

    static async Remove(id: string): Promise<IInviteBase | null> {
        return await InviteModel.findByIdAndRemove(id);
    }

    // DANGER ZONE
    static async Clean(): Promise<unknown>{
        return await InviteModel.remove({});
    }
}
