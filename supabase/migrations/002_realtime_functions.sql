-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE users;
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE session_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE ratings;
ALTER PUBLICATION supabase_realtime ADD TABLE user_stats;
ALTER PUBLICATION supabase_realtime ADD TABLE user_play_type_stats;

-- Function to add participant to session atomically
CREATE OR REPLACE FUNCTION add_participant_to_session(
  p_session_id UUID,
  p_user_id UUID
) RETURNS session_participants
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_session sessions%ROWTYPE;
  v_participant session_participants%ROWTYPE;
  v_current_count INTEGER;
BEGIN
  -- Get session info
  SELECT * INTO v_session FROM sessions WHERE id = p_session_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Session not found';
  END IF;
  
  -- Check if session is still accepting participants
  IF v_session.status NOT IN ('upcoming', 'active') THEN
    RAISE EXCEPTION 'Session is not accepting participants';
  END IF;
  
  -- Check current participant count
  SELECT COUNT(*) INTO v_current_count 
  FROM session_participants 
  WHERE session_id = p_session_id AND is_confirmed = true;
  
  IF v_current_count >= v_session.max_participants THEN
    RAISE EXCEPTION 'Session is full';
  END IF;
  
  -- Check if user is already a participant
  SELECT * INTO v_participant 
  FROM session_participants 
  WHERE session_id = p_session_id AND user_id = p_user_id;
  
  IF FOUND THEN
    -- Update existing record to confirmed
    UPDATE session_participants 
    SET is_confirmed = true, joined_at = CURRENT_TIMESTAMP
    WHERE session_id = p_session_id AND user_id = p_user_id
    RETURNING * INTO v_participant;
  ELSE
    -- Insert new participant
    INSERT INTO session_participants (session_id, user_id, is_confirmed, joined_at)
    VALUES (p_session_id, p_user_id, true, CURRENT_TIMESTAMP)
    RETURNING * INTO v_participant;
  END IF;
  
  -- Update session participant count
  UPDATE sessions 
  SET participant_count = (
    SELECT COUNT(*) FROM session_participants 
    WHERE session_id = p_session_id AND is_confirmed = true
  )
  WHERE id = p_session_id;
  
  RETURN v_participant;
END;
$$;

-- Function to remove participant from session atomically
CREATE OR REPLACE FUNCTION remove_participant_from_session(
  p_session_id UUID,
  p_user_id UUID
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Remove participant
  DELETE FROM session_participants 
  WHERE session_id = p_session_id AND user_id = p_user_id;
  
  -- Update session participant count
  UPDATE sessions 
  SET participant_count = (
    SELECT COUNT(*) FROM session_participants 
    WHERE session_id = p_session_id AND is_confirmed = true
  )
  WHERE id = p_session_id;
  
  RETURN FOUND;
END;
$$;

-- Function to create rating and update user stats atomically
CREATE OR REPLACE FUNCTION create_rating_with_stats(
  p_session_id UUID,
  p_rater_id UUID,
  p_rated_user_id UUID,
  p_overall_score INTEGER,
  p_play_type play_type_enum,
  p_comments TEXT DEFAULT NULL
) RETURNS ratings
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_rating ratings%ROWTYPE;
  v_user users%ROWTYPE;
  v_current_stats user_stats%ROWTYPE;
  v_play_type_stats user_play_type_stats%ROWTYPE;
  v_new_overall_rating DECIMAL(3,2);
  v_new_total_ratings INTEGER;
BEGIN
  -- Validate the rating can be created
  IF NOT EXISTS (
    SELECT 1 FROM session_participants sp1
    JOIN session_participants sp2 ON sp1.session_id = sp2.session_id
    JOIN sessions s ON s.id = sp1.session_id
    WHERE sp1.user_id = p_rater_id 
    AND sp2.user_id = p_rated_user_id 
    AND sp1.session_id = p_session_id
    AND s.status = 'completed'
  ) THEN
    RAISE EXCEPTION 'Cannot rate: users did not participate in the same completed session';
  END IF;
  
  -- Check for existing rating
  IF EXISTS (
    SELECT 1 FROM ratings 
    WHERE session_id = p_session_id 
    AND rater_id = p_rater_id 
    AND rated_user_id = p_rated_user_id
  ) THEN
    RAISE EXCEPTION 'Rating already exists for this session and users';
  END IF;
  
  -- Create the rating
  INSERT INTO ratings (session_id, rater_id, rated_user_id, overall_score, play_type, comments)
  VALUES (p_session_id, p_rater_id, p_rated_user_id, p_overall_score, p_play_type, p_comments)
  RETURNING * INTO v_rating;
  
  -- Get current user
  SELECT * INTO v_user FROM users WHERE id = p_rated_user_id;
  
  -- Get or create user stats
  SELECT * INTO v_current_stats FROM user_stats WHERE user_id = p_rated_user_id;
  
  IF NOT FOUND THEN
    INSERT INTO user_stats (user_id, total_ratings_received, average_overall_rating)
    VALUES (p_rated_user_id, 1, p_overall_score)
    RETURNING * INTO v_current_stats;
  ELSE
    -- Calculate new average
    v_new_total_ratings := v_current_stats.total_ratings_received + 1;
    v_new_overall_rating := (
      (v_current_stats.average_overall_rating * v_current_stats.total_ratings_received) + p_overall_score
    ) / v_new_total_ratings;
    
    -- Update user stats
    UPDATE user_stats 
    SET 
      total_ratings_received = v_new_total_ratings,
      average_overall_rating = v_new_overall_rating,
      last_rated_at = CURRENT_TIMESTAMP
    WHERE user_id = p_rated_user_id
    RETURNING * INTO v_current_stats;
  END IF;
  
  -- Update play type stats
  SELECT * INTO v_play_type_stats 
  FROM user_play_type_stats 
  WHERE user_id = p_rated_user_id AND play_type = p_play_type;
  
  IF NOT FOUND THEN
    INSERT INTO user_play_type_stats (user_id, play_type, count, average_score)
    VALUES (p_rated_user_id, p_play_type, 1, p_overall_score);
  ELSE
    UPDATE user_play_type_stats 
    SET 
      count = count + 1,
      average_score = ((average_score * count) + p_overall_score) / (count + 1)
    WHERE user_id = p_rated_user_id AND play_type = p_play_type;
  END IF;
  
  -- Update user's current overall rating
  UPDATE users 
  SET 
    current_overall_rating = v_current_stats.average_overall_rating,
    total_ratings_received = v_current_stats.total_ratings_received,
    total_sessions_played = (
      SELECT COUNT(DISTINCT session_id) 
      FROM session_participants 
      WHERE user_id = p_rated_user_id AND is_confirmed = true
    )
  WHERE id = p_rated_user_id;
  
  RETURN v_rating;
END;
$$;

-- Function to get pending ratings for a user
CREATE OR REPLACE FUNCTION get_pending_ratings(p_user_id UUID)
RETURNS TABLE (
  session_id UUID,
  session_title TEXT,
  session_date_time TIMESTAMPTZ,
  participants_to_rate JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id as session_id,
    s.title as session_title,
    s.date_time as session_date_time,
    jsonb_agg(
      jsonb_build_object(
        'id', u.id,
        'username', u.username,
        'display_name', u.display_name,
        'current_overall_rating', u.current_overall_rating
      )
    ) as participants_to_rate
  FROM sessions s
  JOIN session_participants sp1 ON s.id = sp1.session_id
  JOIN session_participants sp2 ON s.id = sp2.session_id
  JOIN users u ON sp2.user_id = u.id
  WHERE s.status = 'completed'
    AND sp1.user_id = p_user_id
    AND sp1.is_confirmed = true
    AND sp2.user_id != p_user_id
    AND sp2.is_confirmed = true
    AND NOT EXISTS (
      SELECT 1 FROM ratings r
      WHERE r.session_id = s.id
        AND r.rater_id = p_user_id
        AND r.rated_user_id = sp2.user_id
    )
  GROUP BY s.id, s.title, s.date_time
  HAVING COUNT(sp2.user_id) > 0
  ORDER BY s.date_time DESC;
END;
$$;

-- Function to determine session MVP
CREATE OR REPLACE FUNCTION determine_session_mvp(p_session_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_mvp_user_id UUID;
BEGIN
  SELECT rated_user_id INTO v_mvp_user_id
  FROM ratings
  WHERE session_id = p_session_id
  GROUP BY rated_user_id
  ORDER BY AVG(overall_score) DESC, COUNT(*) DESC
  LIMIT 1;
  
  -- Update session with MVP
  IF v_mvp_user_id IS NOT NULL THEN
    UPDATE sessions 
    SET mvp_user_id = v_mvp_user_id
    WHERE id = p_session_id;
  END IF;
  
  RETURN v_mvp_user_id;
END;
$$;

-- Trigger function to automatically determine MVP when ratings are complete
CREATE OR REPLACE FUNCTION check_session_mvp_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_total_participants INTEGER;
  v_total_ratings INTEGER;
  v_expected_ratings INTEGER;
BEGIN
  -- Only for completed sessions
  IF EXISTS (SELECT 1 FROM sessions WHERE id = NEW.session_id AND status = 'completed') THEN
    -- Get total confirmed participants
    SELECT COUNT(*) INTO v_total_participants
    FROM session_participants
    WHERE session_id = NEW.session_id AND is_confirmed = true;
    
    -- Get total ratings for this session
    SELECT COUNT(*) INTO v_total_ratings
    FROM ratings
    WHERE session_id = NEW.session_id;
    
    -- Expected ratings = n * (n-1) where n is participants
    v_expected_ratings := v_total_participants * (v_total_participants - 1);
    
    -- If all ratings are complete, determine MVP
    IF v_total_ratings >= v_expected_ratings THEN
      PERFORM determine_session_mvp(NEW.session_id);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for MVP determination
DROP TRIGGER IF EXISTS trigger_check_session_mvp ON ratings;
CREATE TRIGGER trigger_check_session_mvp
  AFTER INSERT ON ratings
  FOR EACH ROW
  EXECUTE FUNCTION check_session_mvp_trigger();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION add_participant_to_session TO authenticated;
GRANT EXECUTE ON FUNCTION remove_participant_from_session TO authenticated;
GRANT EXECUTE ON FUNCTION create_rating_with_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_pending_ratings TO authenticated;
GRANT EXECUTE ON FUNCTION determine_session_mvp TO authenticated; 