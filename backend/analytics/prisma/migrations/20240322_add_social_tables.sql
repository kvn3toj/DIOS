-- Create enum types
CREATE TYPE connection_status AS ENUM ('pending', 'accepted', 'blocked');
CREATE TYPE activity_type AS ENUM ('follow', 'comment', 'reaction', 'share', 'achievement');
CREATE TYPE reaction_type AS ENUM ('like', 'love', 'celebrate', 'support', 'insightful');
CREATE TYPE visibility_type AS ENUM ('public', 'private', 'connections');
CREATE TYPE theme_type AS ENUM ('light', 'dark', 'system');

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  display_name VARCHAR(255) NOT NULL,
  bio TEXT,
  avatar TEXT,
  cover_image TEXT,
  location VARCHAR(255),
  website VARCHAR(255),
  social JSONB DEFAULT '{}',
  preferences JSONB NOT NULL DEFAULT '{
    "emailNotifications": true,
    "pushNotifications": true,
    "visibility": "public",
    "language": "en",
    "theme": "system"
  }',
  stats JSONB NOT NULL DEFAULT '{
    "followers": 0,
    "following": 0,
    "posts": 0,
    "achievements": 0
  }',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT unique_user_profile UNIQUE (user_id)
);

-- Create connections table
CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status connection_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  blocked_at TIMESTAMP WITH TIME ZONE,
  blocked_by UUID REFERENCES users(id) ON DELETE SET NULL,
  metadata JSONB,

  CONSTRAINT unique_connection UNIQUE (requester_id, recipient_id)
);

-- Create activities table
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type activity_type NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  target_id UUID NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  visibility visibility_type NOT NULL DEFAULT 'public',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB
);

-- Create comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  attachments JSONB,
  reactions JSONB DEFAULT '[]',
  is_edited BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create reactions table
CREATE TABLE reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type VARCHAR(50) NOT NULL,
  target_id UUID NOT NULL,
  type reaction_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT unique_user_reaction UNIQUE (user_id, target_type, target_id, type)
);

-- Create shares table
CREATE TABLE shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  text TEXT,
  platform VARCHAR(50),
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB
);

-- Create indexes
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_display_name ON profiles(display_name);
CREATE INDEX idx_profiles_location ON profiles(location);
CREATE INDEX idx_profiles_created_at ON profiles(created_at);

CREATE INDEX idx_connections_requester_id ON connections(requester_id);
CREATE INDEX idx_connections_recipient_id ON connections(recipient_id);
CREATE INDEX idx_connections_status ON connections(status);
CREATE INDEX idx_connections_created_at ON connections(created_at);

CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_type ON activities(type);
CREATE INDEX idx_activities_target_type_id ON activities(target_type, target_id);
CREATE INDEX idx_activities_created_at ON activities(created_at);

CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_content_id ON comments(content_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_comments_created_at ON comments(created_at);

CREATE INDEX idx_reactions_user_id ON reactions(user_id);
CREATE INDEX idx_reactions_target_type_id ON reactions(target_type, target_id);
CREATE INDEX idx_reactions_type ON reactions(type);
CREATE INDEX idx_reactions_created_at ON reactions(created_at);

CREATE INDEX idx_shares_user_id ON shares(user_id);
CREATE INDEX idx_shares_content_id ON shares(content_id);
CREATE INDEX idx_shares_created_at ON shares(created_at);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_connections_updated_at
    BEFORE UPDATE ON connections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at
    BEFORE UPDATE ON activities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reactions_updated_at
    BEFORE UPDATE ON reactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 