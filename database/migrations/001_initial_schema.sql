-- Rival P2P Gaming Platform - Initial Schema
-- Created by: Naughty Code Systems 2025

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) UNIQUE NOT NULL,
    username VARCHAR(50) GENERATED ALWAYS AS (
        'Player_' || substring(phone, -4)
    ) STORED,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    nin VARCHAR(14),
    email VARCHAR(255),
    password_hash VARCHAR(255),
    date_of_birth DATE,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for users
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Create wallets table
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    balance BIGINT DEFAULT 0, -- Store in UGX cents (multiply by 100)
    pending_deposits BIGINT DEFAULT 0,
    pending_withdrawals BIGINT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for wallets
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_wallets_balance ON wallets(balance);
CREATE UNIQUE INDEX idx_wallets_user_unique ON wallets(user_id);

-- Create games table
CREATE TABLE games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    icon_url TEXT,
    min_stake INTEGER DEFAULT 500, -- UGX cents (5000 UGX)
    max_stake INTEGER DEFAULT 50000, -- UGX cents (500000 UGX)
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default games
INSERT INTO games (name, type, description, min_stake, max_stake) VALUES
('Rock Paper Scissors', 'rock_paper_scissors', 'Classic hand game with instant results', 500, 50000),
('Ball in Cup', 'ball_in_cup', 'Find the hidden ball in this classic shell game variation', 500, 50000),
('Tic Tac Toe', 'tic_tac_toe', 'Strategic three-in-a-row game for quick matches', 500, 50000),
('Penalty Take', 'penalty_take', 'Score against the keeper in this exciting penalty shootout game', 500, 50000);

-- Create matches table
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id),
    player1_id UUID NOT NULL REFERENCES users(id),
    player2_id UUID REFERENCES users(id),
    stake_amount INTEGER NOT NULL CHECK (stake_amount >= 500),
    status VARCHAR(20) DEFAULT 'matchmaking'
        CHECK (status IN ('matchmaking', 'active', 'completed', 'cancelled')),
    winner_id UUID REFERENCES users(id),
    game_data JSONB DEFAULT '{}',
    agora_channel VARCHAR(100) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- Create indexes for matches
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_players ON matches(player1_id, player2_id);
CREATE INDEX idx_matches_game_type ON matches(game_id, status);
CREATE INDEX idx_matches_created ON matches(created_at);

-- Create transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR(20) NOT NULL CHECK (type IN
        ('deposit', 'withdrawal', 'game_win', 'game_loss', 'fee')),
    amount BIGINT NOT NULL, -- UGX cents, can be negative for losses
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN
        ('pending', 'completed', 'failed', 'cancelled')),
    reference VARCHAR(255), -- External transaction ID
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Create indexes for transactions
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_created ON transactions(created_at);

-- Create game_sessions table
CREATE TABLE game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES matches(id),
    player_id UUID NOT NULL REFERENCES users(id),
    move_data JSONB DEFAULT '{}',
    is_ready BOOLEAN DEFAULT false,
    has_moved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for game_sessions
CREATE INDEX idx_game_sessions_match ON game_sessions(match_id);
CREATE UNIQUE INDEX idx_game_sessions_unique ON game_sessions(match_id, player_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_sessions_updated_at BEFORE UPDATE ON game_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create wallet for new user
CREATE OR REPLACE FUNCTION create_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO wallets (user_id) VALUES (NEW.id);
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to create wallet when user is created
CREATE TRIGGER create_wallet_for_new_user AFTER INSERT ON users
    FOR EACH ROW EXECUTE FUNCTION create_user_wallet();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Wallet access policies
CREATE POLICY "Users can view own wallet" ON wallets
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own wallet" ON wallets
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Matches policies - players can see their matches
CREATE POLICY "Players can view their matches" ON matches
    FOR SELECT USING (
        auth.uid()::text = player1_id::text OR
        auth.uid()::text = player2_id::text
    );

-- Transactions policies - users can only see their transactions
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Game sessions policies
CREATE POLICY "Players can view their game sessions" ON game_sessions
    FOR SELECT USING (
        auth.uid()::text = player_id::text
    );