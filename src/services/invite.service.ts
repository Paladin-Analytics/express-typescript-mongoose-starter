import { model, Types, deleteModel } from 'mongoose';
import { IInviteModel, IInviteBase, InviteSchema } from '../models/invite.model';

deleteModel('invites');
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

    static async GetByEmail(email: string, workspaceId: Types.ObjectId): Promise<IInviteBase | null> {
        const invite = await InviteModel.findOne({ email, workspaceId });
        return invite;
    }

    static async GetAll(workspace: Types.ObjectId): Promise<Array<IInviteBase> | null> {
        const invites = await InviteModel.find({ workspaceId: workspace });
        return invites;
    }

    static async Update(workspace: Types.ObjectId, id: Types.ObjectId, newObject: IInviteBase): Promise<IInviteBase | null> {
        const invite = await InviteModel.findOne({
            _id: id,
            workspaceId: workspace,
        });
    
        if (invite) {
            if (newObject.firstName) invite.firstName = newObject.firstName;
            if (newObject.lastName) invite.lastName = newObject.lastName;
            if (newObject.role) invite.role = newObject.role;
            await invite.save();
        }
        return invite;
    }

    static async Remove(workspace: Types.ObjectId, id: Types.ObjectId): Promise<IInviteBase | null> {
        return await InviteModel.findOneAndDelete({
            _id: id,
            workspaceId: workspace,
        });
    }

    // DANGER ZONE
    static async Clean(): Promise<unknown>{
        return await InviteModel.remove({});
    }
}
