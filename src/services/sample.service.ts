import { SampleModel, ISampleBase } from '../models/sample.model';

export default class SampleService {
    // Methods
    static async Create(obj: ISampleBase): Promise<ISampleBase>{
        const user = new SampleModel(obj);
        return user.save();
    }

    static async GetById(id: string): Promise<ISampleBase | null> {
        const user = await SampleModel.findById(id).populate({});
        return user;
    }

    static async Update(id: string, newObject: ISampleBase): Promise<ISampleBase | null> {
        const sample = await SampleModel.findById(id);
    
        if (sample) {
            sample.sample = newObject.sample || sample.sample;
    
            await sample.save();
        }
        return sample;
    }

    static async Remove(id: string): Promise<ISampleBase | null> {
        return await SampleModel.findByIdAndRemove(id);
    }

    // DANGER ZONE
    static async Clean(): Promise<unknown>{
        return await SampleModel.remove({});
    }
}
