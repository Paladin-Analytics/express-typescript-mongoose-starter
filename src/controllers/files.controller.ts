import {
    Body,
    Controller,
    Tags,
    Get,
    Path,
    Post,
    Query,
    Route,
    SuccessResponse,
    Response,
    Request,
    ValidateError,
    
} from "tsoa";

import { S3 } from 'aws-sdk';

interface UploadFileRequestBody{
    folderName: string;
    fileName: string;
    contentType: string;
}

interface UploadFileResponse{
    signedRequest: string;
    url: string;
}

@Route("files")
@Tags("Files")
export class FileController extends Controller{
    /**
     * Get Presigned S3 URL
     */
    
    @Post("")
    @SuccessResponse("201", "Created")
    public async GetPresignedURL(@Body() requestBody: UploadFileRequestBody): Promise<UploadFileResponse>{
        const s3 = new S3();
        const S3_BUCKET = process.env.BUCKET_NAME;

        const s3Params = {
            Bucket: S3_BUCKET,
            Key: `${requestBody.folderName}/${requestBody.fileName}`,
            Expires: 60,
            ContentType: requestBody.contentType,
            ACL: 'public-read'
        };

        const resp = await new Promise((resolve, reject) => {
            s3.getSignedUrl('putObject', s3Params, (err, data) => {
                if (err){
                    reject(err);
                }
                const returnData = {
                    signedRequest: data,
                    url: `https://${S3_BUCKET}.s3.amazonaws.com/${requestBody.folderName}/${requestBody.fileName}`,
                };
                resolve(returnData);
            });
        });

        this.setStatus(201);
        return resp as UploadFileResponse;
    }
}
