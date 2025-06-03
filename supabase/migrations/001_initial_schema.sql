-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for play types
CREATE TYPE play_type AS ENUM ('fun', 'competitive', 'fair_play', 'technical', 'social', 'reliable');

-- Create enum for session status
CREATE TYPE session_status AS ENUM ('upcoming', 'active', 'completed', 'cancelled');

-- Create enum for rating status
CREATE TYPE rating_status AS ENUM ('pending', 'completed');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    profile_image_url TEXT,
    phone_number VARCHAR(20),
    date_of_birth DATE,
    bio TEXT,
    location VARCHAR(100),
    current_overall_rating DECIMAL(3,2) DEFAULT 0,
    play_type_distribution JSONB DEFAULT '{}',
    total_sessions_played INTEGER DEFAULT 0,
    total_ratings_given INTEGER DEFAULT 0,
    total_ratings_received INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions table
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    location VARCHAR(200) NOT NULL,
    date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration INTEGER NOT NULL, -- in minutes
    max_participants INTEGER NOT NULL,
    current_participants INTEGER DEFAULT 0,
    qr_code_data TEXT UNIQUE NOT NULL,
    organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status session_status DEFAULT 'upcoming',
    is_mvp_determined BOOLEAN DEFAULT FALSE,
    mvp_user_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session participants table
CREATE TABLE session_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_confirmed BOOLEAN DEFAULT FALSE,
    UNIQUE(session_id, user_id)
);

-- Ratings table
CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    rater_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rated_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    overall_score INTEGER NOT NULL CHECK (overall_score >= 1 AND overall_score <= 10),
    play_type play_type NOT NULL,
    comment TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    status rating_status DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(session_id, rater_id, rated_user_id),
    CHECK (rater_id != rated_user_id)
);

-- User stats table for tracking detailed statistics
CREATE TABLE user_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    avg_overall_rating DECIMAL(3,2) DEFAULT 0,
    total_ratings_count INTEGER DEFAULT 0,
    play_type_distribution JSONB DEFAULT '{}',
    rating_breakdown JSONB DEFAULT '{}', -- distribution of scores 1-10
    mvp_count INTEGER DEFAULT 0,
    last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- User play type stats for detailed play type analytics
CREATE TABLE user_play_type_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    play_type play_type NOT NULL,
    count INTEGER DEFAULT 0,
    avg_score DECIMAL(3,2) DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    last_received_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, play_type)
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_overall_rating ON users(current_overall_rating);

CREATE INDEX idx_sessions_organizer ON sessions(organizer_id);
CREATE INDEX idx_sessions_date_time ON sessions(date_time);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_qr_code ON sessions(qr_code_data);

CREATE INDEX idx_session_participants_session ON session_participants(session_id);
CREATE INDEX idx_session_participants_user ON session_participants(user_id);

CREATE INDEX idx_ratings_session ON ratings(session_id);
CREATE INDEX idx_ratings_rater ON ratings(rater_id);
CREATE INDEX idx_ratings_rated_user ON ratings(rated_user_id);
CREATE INDEX idx_ratings_play_type ON ratings(play_type);
CREATE INDEX idx_ratings_overall_score ON ratings(overall_score);

CREATE INDEX idx_user_stats_user ON user_stats(user_id);
CREATE INDEX idx_user_play_type_stats_user ON user_play_type_stats(user_id);
CREATE INDEX idx_user_play_type_stats_type ON user_play_type_stats(play_type);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ratings_updated_at BEFORE UPDATE ON ratings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON user_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_play_type_stats_updated_at BEFORE UPDATE ON user_play_type_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_play_type_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Public users are viewable by everyone" ON users FOR SELECT USING (true);

-- Create RLS policies for sessions table
CREATE POLICY "Anyone can view sessions" ON sessions FOR SELECT USING (true);
CREATE POLICY "Users can create sessions" ON sessions FOR INSERT WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "Organizers can update their sessions" ON sessions FOR UPDATE USING (auth.uid() = organizer_id);
CREATE POLICY "Organizers can delete their sessions" ON sessions FOR DELETE USING (auth.uid() = organizer_id);

-- Create RLS policies for session_participants table
CREATE POLICY "Anyone can view session participants" ON session_participants FOR SELECT USING (true);
CREATE POLICY "Users can join sessions" ON session_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave sessions" ON session_participants FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for ratings table
CREATE POLICY "Users can view ratings for sessions they participated in" ON ratings FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM session_participants sp 
        WHERE sp.session_id = ratings.session_id 
        AND sp.user_id = auth.uid()
    )
);
CREATE POLICY "Users can create ratings for sessions they participated in" ON ratings FOR INSERT WITH CHECK (
    auth.uid() = rater_id AND
    EXISTS (
        SELECT 1 FROM session_participants sp 
        WHERE sp.session_id = ratings.session_id 
        AND sp.user_id = auth.uid()
    )
);

-- Create RLS policies for user_stats table
CREATE POLICY "Anyone can view user stats" ON user_stats FOR SELECT USING (true);
CREATE POLICY "System can update user stats" ON user_stats FOR ALL USING (true);

-- Create RLS policies for user_play_type_stats table
CREATE POLICY "Anyone can view user play type stats" ON user_play_type_stats FOR SELECT USING (true);
CREATE POLICY "System can update user play type stats" ON user_play_type_stats FOR ALL USING (true); 