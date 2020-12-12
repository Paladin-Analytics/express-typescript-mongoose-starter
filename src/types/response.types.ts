export interface ValidateErrorJSON {
    message: "Validation failed";
    errors?: { [name: string]: unknown };
}