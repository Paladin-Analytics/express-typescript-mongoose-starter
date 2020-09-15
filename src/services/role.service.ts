import { RoleModel, IRoleBase } from '../models/role.model';

export default class RoleService {
    // Methods
    static async Create(obj: IRoleBase): Promise<IRoleBase>{
        const user = new RoleModel(obj);
        return user.save();
    }

    static async GetById(id: string): Promise<IRoleBase | null> {
        const user = await RoleModel.findById(id).populate({});
        return user;
    }

    static async Update(id: string, newObject: IRoleBase): Promise<IRoleBase | null> {
        const role = await RoleModel.findById(id);
    
        if (role) {
            await role.save();
        }
        return role;
    }

    static async Remove(id: string): Promise<IRoleBase | null> {
        return await RoleModel.findByIdAndRemove(id);
    }

    // DANGER ZONE
    static async Clean(): Promise<unknown>{
        return await RoleModel.remove({});
    }
}
