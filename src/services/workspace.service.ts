import { model } from 'mongoose';
import { IWorkspaceModel, IWorkspaceBase, WorkspaceSchema } from '../models/Workspace.model';

export const WorkspaceModel = model<IWorkspaceBase, IWorkspaceModel>('workspaces', WorkspaceSchema);

export default class WorkspaceService {
    // Methods
    static async Create(obj: IWorkspaceBase): Promise<IWorkspaceBase>{
        const workspace = new WorkspaceModel(obj);
        return workspace.save();
    }

    static async GetById(id: string): Promise<IWorkspaceBase | null> {
        const workspace = await WorkspaceModel.findById(id).populate({});
        return workspace;
    }

    static async Update(id: string, newObject: IWorkspaceBase): Promise<IWorkspaceBase | null> {
        const workspace = await WorkspaceModel.findById(id);
    
        if (workspace) {
            await workspace.save();
        }
        return workspace;
    }

    static async Remove(id: string): Promise<IWorkspaceBase | null> {
        return await WorkspaceModel.findByIdAndRemove(id);
    }

    // DANGER ZONE
    static async Clean(): Promise<unknown>{
        return await WorkspaceModel.remove({});
    }
}
