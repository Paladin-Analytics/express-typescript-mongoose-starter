import {
    Controller,
    Tags,
    Get,
    Route,
    
} from "tsoa";

@Route("health")
@Tags("Health")

export class HealthController extends Controller{
    @Get()
    public async CheckHealth(): Promise<boolean>{
        return true;
    }
}