import { UserModel, IUserBase } from '../models/user.model';

export async function Create(obj: IUserBase){
    const user = new UserModel(obj);
    return user.save();
}

export async function GetByEmail(email: string){
    const user = await UserModel.findOne({ email: email });
    return user;
}