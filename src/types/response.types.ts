export interface ValidateErrorJSON {
    message: "Validation failed";
    errors?: { [name: string]: unknown };
}

export interface AuthenticatedRequest extends Request{
    user: {
        user_id: string;
        iat: number;
        exp: number;
        jti: string;
    };
    workspace: string;
}