/**
 * ユーザーを作成するスクリプト
 */

import config from './seed-users.config.json' with { type: 'json' };
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL ?? 'http://127.0.0.1:54321';
const serviceRoleKey = process.env.SUPABASE_SECRET_KEY!;
console.log(supabaseUrl, serviceRoleKey);

const emails = config.users.map((user) => user.email);

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
    for (const email of emails) {
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            email_confirm: true,
        });

        if (error) {
            console.error(`作成失敗: ${email}`, error.message);
            continue;
        }

        console.log(`作成成功: ${email} (id: ${data.user.id})`);
    }
}

main();