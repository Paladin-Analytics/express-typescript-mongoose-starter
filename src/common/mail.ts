export const EMAIL_VERIFICATION = 'EMAIL_VERIFICATION';
export const PASSWORD_RESET = 'PASSWORD_RESET';

// Invitations
export const EMAIL_INVITE = 'EMAIL_INVITE';

export function SendTemplatedEmail(templateId: string, params: {[key: string]: unknown}):Promise<boolean>{
    return new Promise((resolve) => {
        console.log(`EMAIL: ${templateId} - ${JSON.stringify(params)}`);
        resolve(true);
    });
}