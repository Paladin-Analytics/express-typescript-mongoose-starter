export const EMAIL_VERIFICATION = 'EMAIL_VERIFICATION';
export const PASSWORD_RESET = 'PASSWORD_RESET';

export function SendTemplatedEmail(templateName: string, params: unknown):Promise<boolean>{
    return new Promise((resolve) => {
        console.log(`EMAIL: ${templateName} - ${JSON.stringify(params)}`);
        resolve(true);
    });
}