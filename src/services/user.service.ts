import { UserModel, IUserBase } from '../models/user.model';

interface IUserUpdate extends IUserBase{
    deviceId: string;
}

export async function Create(obj: IUserBase): Promise<IUserBase>{
    const user = new UserModel(obj);
    return user.save();
}

export async function GetByEmail(email: string): Promise<IUserBase | null>{
    const user = await UserModel.findOne({ email: email });
    return user;
}

export async function GetById(id: string): Promise<IUserBase | null> {
    const user = await UserModel.findById(id);
    return user;
}

export async function Update(id: string, newObject: IUserUpdate): Promise<IUserBase | null> {
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

export async function UpdateAppMetadata(id: string, newObject: IUserUpdate): Promise<IUserBase | null> {
    const user = await UserModel.findById(id);

    if (user) {
        user.appMetadata = newObject.appMetadata || user.appMetadata;
        await user.save();
    }
    return user;
}