export const roles = [
    'admin',
    'user',
];

export const scopes: {[key: string]: Array<string>} = {
    admin: [
        'workspace.invite.get',
        'workspace.invite.update',
        'workspace.invite.create',
        'workspace.invite.delete',
        'user.update',
        'user.get',
    ],
    user: [
        'user.update',
        'user.get',
    ],
}