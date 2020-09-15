import { model} from 'mongoose';

import { IUserModel, IUserBase, UserSchema } from '../models/user.model';
import { WorkspaceModel } from './workspace.service';
import { RoleModel } from './role.service';

interface IUserUpdate extends IUserBase{
    deviceId: string;
}

export const UserModel = model<IUserBase, IUserModel>('users', UserSchema);

export default class UserService {
    // Methods
    static async Create(obj: IUserBase): Promise<IUserBase>{
        const user = new UserModel(obj);
        return user.save();
    }

    static async GetByEmail(email: string): Promise<IUserBase | null>{
        const user = await UserModel.findOne({ email: email })
            .populate('permissions.workspace', null , WorkspaceModel)
            .populate('permissions.role', null, RoleModel);
        return user;
    }

    static async GetById(id: string): Promise<IUserBase | null> {
        const user = await UserModel.findById(id)
            .populate('permissions.workspace', null , WorkspaceModel)
            .populate('permissions.role', null, RoleModel);
        return user;
    }

    static async Update(id: string, newObject: IUserUpdate): Promise<IUserBase | null> {
        const user = await UserModel.findById(id);
    
        if (user) {
            user.firstName = newObject.firstName || user.firstName;
            user.lastName = newObject.lastName || user.lastName;
            user.phoneNumber = newObject.phoneNumber || user.phoneNumber;
            user.email = newObject.email || user.email;
            user.profilePictureURL = newObject.profilePictureURL || user.profilePictureURL;
    
            user.userMetadata = newObject.userMetadata || user.userMetadata;
    
            if (newObject.deviceId) {
                user.deviceIds.push(newObject.deviceId);
            }
    
            await user.save();
        }
        return user;
    }

    static async UpdateAppMetadata(id: string, newObject: IUserUpdate): Promise<IUserBase | null> {
        const user = await UserModel.findById(id);
    
        if (user) {
            user.appMetadata = newObject.appMetadata || user.appMetadata;
            await user.save();
        }
        return user;
    }

    // DANGER ZONE
    static async Clean(): Promise<unknown>{
        return await UserModel.remove({});
    }
}
