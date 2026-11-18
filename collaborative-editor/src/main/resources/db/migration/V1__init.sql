CREATE TABLE users (
                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                       email VARCHAR(255) NOT NULL UNIQUE,

                       display_name VARCHAR(255) NOT NULL,

                       avatar_url TEXT,

                       provider VARCHAR(50) NOT NULL,

                       provider_user_id VARCHAR(255) NOT NULL,

                       created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

                       UNIQUE (provider, provider_user_id)
);


CREATE TABLE workspaces (
                            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                            owner_id UUID NOT NULL
                                REFERENCES users(id)
                                    ON DELETE CASCADE,

                            title VARCHAR(255) NOT NULL,

                            language VARCHAR(50) NOT NULL DEFAULT 'javascript',

                            mode VARCHAR(20) NOT NULL DEFAULT 'READ_ONLY'
                                CHECK (mode IN ('READ_ONLY', 'COLLABORATIVE')),

                            public_slug VARCHAR(64) NOT NULL UNIQUE,

                            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

                            updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


CREATE TABLE workspace_snapshots (
                                     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                                     workspace_id UUID NOT NULL
                                         REFERENCES workspaces(id)
                                             ON DELETE CASCADE,

                                     doc_state BYTEA NOT NULL,

                                     version BIGINT NOT NULL DEFAULT 1,

                                     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


CREATE INDEX idx_workspaces_owner
    ON workspaces(owner_id);


CREATE INDEX idx_snapshots_workspace_latest
    ON workspace_snapshots(workspace_id, created_at DESC);