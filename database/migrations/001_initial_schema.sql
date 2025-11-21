-- Rival P2P Gaming Platform - Initial Database Schema
-- This file creates all the necessary tables for the gaming platform

-- Table: users
-- Stores user account information
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) UNIQUE NOT NULL,
    username VARCHAR(50) GENERATED ALWAYS AS (
        'Player_' || substring(phone, -4)
    ) STORED,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    nin VARCHAR(14),
    email VARCHAR(255),
    password_hash VARCHAR(255),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for users table
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_users_verified ON users(is_verified);

-- Table: wallets
-- Stores user wallet information for real money gaming
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    balance BIGINT DEFAULT 0, -- Store in UGX cents (smallest unit)
    pending_deposits BIGINT DEFAULT 0,
    pending_withdrawals BIGINT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for wallets table
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_wallets_balance ON wallets(balance);
CREATE UNIQUE INDEX idx_wallets_user_unique ON wallets(user_id);

-- Table: games
-- Stores available game configurations
CREATE TABLE games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    icon_url TEXT,
    min_stake INTEGER DEFAULT 500, -- Minimum stake in UGX
    max_stake INTEGER DEFAULT 50000, -- Maximum stake in UGX
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default games
INSERT INTO games (name, type, description, min_stake, max_stake) VALUES
('Rock Paper Scissors', 'rock_paper_scissors', 'Classic hand game', 500, 50000),
('Ball in Cup', 'ball_in_cup', 'Find the hidden ball', 500, 50000),
('Tic Tac Toe', 'tic_tac_toe', 'Three in a row wins', 500, 50000),
('Penalty Take', 'penalty_take', 'Score against the keeper', 500, 50000);

-- Table: matches
-- Stores game match information
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

-- Indexes for matches table
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_players ON matches(player1_id, player2_id);
CREATE INDEX idx_matches_game_type ON matches(game_id, status);
CREATE INDEX idx_matches_created ON matches(created_at);

-- Table: transactions
-- Stores all financial transactions
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

-- Indexes for transactions table
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_created ON transactions(created_at);

-- Table: game_sessions
-- Stores individual game session data
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

-- Indexes for game_sessions table
CREATE INDEX idx_game_sessions_match ON game_sessions(match_id);
CREATE UNIQUE INDEX idx_game_sessions_unique ON game_sessions(match_id, player_id);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- Row Level Security Policies

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid()::text = id::text);

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

-- Database Functions and Triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
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

-- Function to handle game transactions
CREATE OR REPLACE FUNCTION process_game_winnings(
    p_match_id UUID,
    p_winner_id UUID,
    p_loser_id UUID,
    p_stake_amount INTEGER
)
RETURNS VOID AS $$
DECLARE
    net_winnings INTEGER;
BEGIN
    -- Calculate net winnings (90% of stake, 10% platform fee)
    net_winnings := p_stake_amount * 90;

    -- Credit winner's wallet (minus platform fee)
    UPDATE wallets
    SET balance = balance + net_winnings
    WHERE user_id = p_winner_id;

    -- Debit loser's wallet (full stake)
    UPDATE wallets
    SET balance = balance - p_stake_amount
    WHERE user_id = p_loser_id;

    -- Create winner transaction
    INSERT INTO transactions (
        user_id,
        type,
        amount,
        status,
        description,
        metadata,
        completed_at
    ) VALUES (
        p_winner_id,
        'game_win',
        net_winnings,
        'completed',
        'Game winning',
        json_build_object('match_id', p_match_id),
        NOW()
    );

    -- Create loser transaction
    INSERT INTO transactions (
        user_id,
        type,
        amount,
        status,
        description,
        metadata,
        completed_at
    ) VALUES (
        p_loser_id,
        'game_loss',
        -p_stake_amount,
        'completed',
        'Game loss',
        json_build_object('match_id', p_match_id),
        NOW()
    );

    -- Create platform fee transaction
    INSERT INTO transactions (
        user_id,
        type,
        amount,
        status,
        description,
        metadata,
        completed_at
    ) VALUES (
        p_winner_id,
        'fee',
        -(p_stake_amount * 10), -- 10% fee
        'completed',
        'Platform fee',
        json_build_object('match_id', p_match_id, 'fee_rate', 0.10),
        NOW()
    );
END;
$$ LANGUAGE plpgsql;