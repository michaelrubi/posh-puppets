import { json } from '@sveltejs/kit';
import { Puppet, User } from '$lib';

const usernames = ['under9000', 'ice_palace_4_1', '2ndbfast', 'drablilcrab'];

const users: User[] = [];

for (const user of usernames) {
    const envName = `VITE_${user.toUpperCase()}`;
    const password = import.meta.env[envName];
    if (password) {
        users.push(new User(user, password));
    } else {
        console.warn(`⚠️ Password for ${user} not found in .env file (looked for ${envName})`);
    }
}

async function runAutomationBatch(showUrl: string, users: User[], headless: boolean) {
    console.log('🚀 Starting background automation batch...');

    for (const user of users) {
        console.log(`\n--- Starting process for: ${user.getUserName()} ---`);

        const puppet = new Puppet(user, headless);

        try {
            await puppet.init();
            await puppet.login(showUrl);
            await puppet.screenshot();
            console.log(`✅ Success for ${user.getUserName()}.`);
        } catch (error) {
            console.error(`❌ Failed process for ${user.getUserName()}:`, error);
            await puppet.close();
        }
    }
    console.log('✅ Background automation batch finished.');
}

function getUsers(count: number, users: User[]): User[] {
    const puppets = [];
    for (let i = 0; i < count; i++) {
        if (i < users.length) {
            puppets.push(users[i])
        } else {
            const mod = i % users.length;
            puppets.push(users[mod])
        }
    }
    return puppets;
}


export async function POST({ request }: { request: Request }) {
    try {
        const { showUrl, count, showWindow } = await request.json();

        if (!showUrl || typeof showWindow !== 'boolean') {
            return json({ message: 'Invalid input.' }, { status: 400 });
        }

        const puppets = getUsers(count, users);

        runAutomationBatch(showUrl, puppets, !showWindow);

        const time = new Date();

        return json({ message: `Automation batch process has been started at ${time}` });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
        return json({ message: 'Failed to parse request body.' }, { status: 400 });
    }
}