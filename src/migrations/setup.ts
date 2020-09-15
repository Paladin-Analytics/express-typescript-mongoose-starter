import { config } from 'dotenv';
config();

import '../common/db';

import WorkspaceService from '../services/workspace.service';
import RoleService from '../services/role.service';

import { IWorkspaceBase } from '../models/workspace.model';
import { IRoleBase } from '../models/role.model';
import UserService from '../services/user.service';

const workspaces = [
    {
        name: 'avocado:all',
    }
];

const roles = [
    {
        name: 'admin',
        scopes: [
            'workspace.invite.get',
            'workspace.invite.update',
            'user.update',
            'user.get',
        ]
    },
    {
        name: 'user',
        scopes: [
            'user.update',
            'user.get',
        ]
    }
];

async function clean() {
    await UserService.Clean();
    await WorkspaceService.Clean();
    await RoleService.Clean();
}

async function setupDB():Promise<unknown>{
    console.log('Start DB Setup');
    console.log(`===============================`);

    console.log(`Setup workspaces`);
    console.log(`-------------------------------`);
    for (const workspace of workspaces) {
        const tmp = await WorkspaceService.Create(<IWorkspaceBase>workspace);
        console.log(JSON.stringify(tmp));
    }
    console.log(`===============================`);

    console.log(`Setup roles`);
    console.log(`-------------------------------`);
    for (const role of roles) {
        const tmp = await RoleService.Create(<IRoleBase>role);
        console.log(JSON.stringify(tmp));
    }

    return false;
}

async function start():Promise<unknown>{
    await clean();
    await setupDB();
    process.exit();
}

start();