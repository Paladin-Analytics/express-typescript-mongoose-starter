import { config } from 'dotenv';
config();

import '../common/db';

import WorkspaceService from '../services/workspace.service';

import { IWorkspaceBase } from '../models/workspace.model';
import UserService from '../services/user.service';

const workspaces = [
    {
        name: 'avocado:users',
    }
];

async function clean() {
    await UserService.Clean();
    await WorkspaceService.Clean();
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

    return false;
}

async function start():Promise<unknown>{
    await clean();
    await setupDB();
    process.exit();
}

start();