CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO "user" (id, name, email, email_verified, role, username, created_at, updated_at) 
VALUES (:'user_id', 'Owner Admin', :'email', true, 'admin', 'owner', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

INSERT INTO "account" (id, account_id, provider_id, user_id, password, created_at, updated_at) 
VALUES (:'account_id', :'user_id', 'credential', :'user_id', crypt(:'password', gen_salt('bf', 10)), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
