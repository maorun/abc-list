-- ABC-List Cloud Sync Database Schema
-- Run this SQL in your Supabase SQL editor to set up the database

-- Enable Row Level Security
ALTER DATABASE postgres SET row_security = on;

-- Create tables for cloud synchronization

-- User ABC Lists table
CREATE TABLE IF NOT EXISTS user_abc_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_key TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  device_info JSONB DEFAULT '{}',
  UNIQUE(user_id, item_key)
);

-- User KaWa table
CREATE TABLE IF NOT EXISTS user_kawas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_key TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  device_info JSONB DEFAULT '{}',
  UNIQUE(user_id, item_key)
);

-- User KaGa table
CREATE TABLE IF NOT EXISTS user_kagas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_key TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  device_info JSONB DEFAULT '{}',
  UNIQUE(user_id, item_key)
);

-- User Stadt-Land-Fluss table
CREATE TABLE IF NOT EXISTS user_stadt_land_fluss (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_key TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  device_info JSONB DEFAULT '{}',
  UNIQUE(user_id, item_key)
);

-- User Basar Items table
CREATE TABLE IF NOT EXISTS user_basar_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_key TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  device_info JSONB DEFAULT '{}',
  UNIQUE(user_id, item_key)
);

-- User Backups table
CREATE TABLE IF NOT EXISTS user_backups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  backup_id TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  backup_data JSONB NOT NULL,
  metadata JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_abc_lists_user_id ON user_abc_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_user_abc_lists_updated_at ON user_abc_lists(updated_at);
CREATE INDEX IF NOT EXISTS idx_user_kawas_user_id ON user_kawas(user_id);
CREATE INDEX IF NOT EXISTS idx_user_kawas_updated_at ON user_kawas(updated_at);
CREATE INDEX IF NOT EXISTS idx_user_kagas_user_id ON user_kagas(user_id);
CREATE INDEX IF NOT EXISTS idx_user_kagas_updated_at ON user_kagas(updated_at);
CREATE INDEX IF NOT EXISTS idx_user_stadt_land_fluss_user_id ON user_stadt_land_fluss(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stadt_land_fluss_updated_at ON user_stadt_land_fluss(updated_at);
CREATE INDEX IF NOT EXISTS idx_user_basar_items_user_id ON user_basar_items(user_id);
CREATE INDEX IF NOT EXISTS idx_user_basar_items_updated_at ON user_basar_items(updated_at);
CREATE INDEX IF NOT EXISTS idx_user_backups_user_id ON user_backups(user_id);
CREATE INDEX IF NOT EXISTS idx_user_backups_created_at ON user_backups(created_at);

-- Row Level Security Policies

-- ABC Lists policies
ALTER TABLE user_abc_lists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own ABC lists" ON user_abc_lists
  FOR ALL USING (auth.uid() = user_id);

-- KaWa policies
ALTER TABLE user_kawas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own KaWas" ON user_kawas
  FOR ALL USING (auth.uid() = user_id);

-- KaGa policies
ALTER TABLE user_kagas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own KaGas" ON user_kagas
  FOR ALL USING (auth.uid() = user_id);

-- Stadt-Land-Fluss policies
ALTER TABLE user_stadt_land_fluss ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own Stadt-Land-Fluss games" ON user_stadt_land_fluss
  FOR ALL USING (auth.uid() = user_id);

-- Basar Items policies
ALTER TABLE user_basar_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own Basar items" ON user_basar_items
  FOR ALL USING (auth.uid() = user_id);

-- Backup policies
ALTER TABLE user_backups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own backups" ON user_backups
  FOR ALL USING (auth.uid() = user_id);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_user_abc_lists_updated_at BEFORE UPDATE ON user_abc_lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_kawas_updated_at BEFORE UPDATE ON user_kawas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_kagas_updated_at BEFORE UPDATE ON user_kagas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_stadt_land_fluss_updated_at BEFORE UPDATE ON user_stadt_land_fluss
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_basar_items_updated_at BEFORE UPDATE ON user_basar_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Optional: Create a view for user statistics
CREATE OR REPLACE VIEW user_sync_stats AS
SELECT 
  u.id as user_id,
  u.email,
  COALESCE(abc.count, 0) as abc_lists_count,
  COALESCE(kawa.count, 0) as kawas_count,
  COALESCE(kaga.count, 0) as kagas_count,
  COALESCE(slf.count, 0) as stadt_land_fluss_count,
  COALESCE(basar.count, 0) as basar_items_count,
  COALESCE(backup.count, 0) as backups_count,
  GREATEST(
    COALESCE(abc.last_updated, '1970-01-01'::timestamptz),
    COALESCE(kawa.last_updated, '1970-01-01'::timestamptz),
    COALESCE(kaga.last_updated, '1970-01-01'::timestamptz),
    COALESCE(slf.last_updated, '1970-01-01'::timestamptz),
    COALESCE(basar.last_updated, '1970-01-01'::timestamptz)
  ) as last_sync_time
FROM auth.users u
LEFT JOIN (
  SELECT user_id, COUNT(*) as count, MAX(updated_at) as last_updated
  FROM user_abc_lists GROUP BY user_id
) abc ON u.id = abc.user_id
LEFT JOIN (
  SELECT user_id, COUNT(*) as count, MAX(updated_at) as last_updated
  FROM user_kawas GROUP BY user_id
) kawa ON u.id = kawa.user_id
LEFT JOIN (
  SELECT user_id, COUNT(*) as count, MAX(updated_at) as last_updated
  FROM user_kagas GROUP BY user_id
) kaga ON u.id = kaga.user_id
LEFT JOIN (
  SELECT user_id, COUNT(*) as count, MAX(updated_at) as last_updated
  FROM user_stadt_land_fluss GROUP BY user_id
) slf ON u.id = slf.user_id
LEFT JOIN (
  SELECT user_id, COUNT(*) as count, MAX(updated_at) as last_updated
  FROM user_basar_items GROUP BY user_id
) basar ON u.id = basar.user_id
LEFT JOIN (
  SELECT user_id, COUNT(*) as count, MAX(created_at) as last_updated
  FROM user_backups GROUP BY user_id
) backup ON u.id = backup.user_id;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Optional: Enable realtime for real-time subscriptions
-- ALTER publication supabase_realtime ADD TABLE user_abc_lists;
-- ALTER publication supabase_realtime ADD TABLE user_kawas;
-- ALTER publication supabase_realtime ADD TABLE user_kagas;
-- ALTER publication supabase_realtime ADD TABLE user_stadt_land_fluss;
-- ALTER publication supabase_realtime ADD TABLE user_basar_items;