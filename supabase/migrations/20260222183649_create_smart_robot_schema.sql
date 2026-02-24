/*
  # Smart Guide Robot Schema

  1. New Tables
    - `faculties`
      - `id` (uuid, primary key)
      - `name` (text) - Faculty name
      - `floors` (integer) - Number of floors
      - `created_at` (timestamp)
    
    - `classrooms`
      - `id` (uuid, primary key)
      - `name` (text) - Classroom name/code
      - `faculty_id` (uuid, foreign key)
      - `floor` (integer) - Floor number
      - `room_type` (text) - Type of room (lecture, lab, office, etc.)
      - `x_coordinate` (numeric) - Map X position
      - `y_coordinate` (numeric) - Map Y position
      - `created_at` (timestamp)
    
    - `robot_state`
      - `id` (uuid, primary key)
      - `status` (text) - Current status (idle, moving, arrived, error)
      - `battery_level` (integer) - Battery percentage (0-100)
      - `current_x` (numeric) - Current X position
      - `current_y` (numeric) - Current Y position
      - `target_classroom_id` (uuid, nullable) - Target destination
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for public access (demo mode)
*/

-- Create faculties table
CREATE TABLE IF NOT EXISTS faculties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  floors integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Create classrooms table
CREATE TABLE IF NOT EXISTS classrooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  faculty_id uuid REFERENCES faculties(id) ON DELETE CASCADE,
  floor integer NOT NULL DEFAULT 1,
  room_type text NOT NULL DEFAULT 'lecture',
  x_coordinate numeric DEFAULT 0,
  y_coordinate numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create robot_state table
CREATE TABLE IF NOT EXISTS robot_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'idle',
  battery_level integer NOT NULL DEFAULT 100,
  current_x numeric DEFAULT 0,
  current_y numeric DEFAULT 0,
  target_classroom_id uuid REFERENCES classrooms(id) ON DELETE SET NULL,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE faculties ENABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE robot_state ENABLE ROW LEVEL SECURITY;

-- Public access policies for demo mode
CREATE POLICY "Public can view faculties"
  ON faculties FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can insert faculties"
  ON faculties FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can update faculties"
  ON faculties FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete faculties"
  ON faculties FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Public can view classrooms"
  ON classrooms FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can insert classrooms"
  ON classrooms FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can update classrooms"
  ON classrooms FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete classrooms"
  ON classrooms FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Public can view robot state"
  ON robot_state FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can insert robot state"
  ON robot_state FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can update robot state"
  ON robot_state FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Insert initial robot state
INSERT INTO robot_state (status, battery_level, current_x, current_y)
VALUES ('idle', 100, 0, 0)
ON CONFLICT DO NOTHING;

-- Insert demo faculties
INSERT INTO faculties (name, floors) VALUES 
  ('Information Technology', 3),
  ('Engineering', 4)
ON CONFLICT DO NOTHING;

-- Insert demo classrooms (IT Department only)
DO $$
DECLARE
  it_faculty_id uuid;
BEGIN
  SELECT id INTO it_faculty_id FROM faculties WHERE name = 'Information Technology' LIMIT 1;
  
  IF it_faculty_id IS NOT NULL THEN
    INSERT INTO classrooms (name, faculty_id, floor, room_type, x_coordinate, y_coordinate) VALUES
      ('IT-101', it_faculty_id, 1, 'lecture', 50, 100),
      ('IT-102', it_faculty_id, 1, 'lab', 150, 100),
      ('IT-201', it_faculty_id, 2, 'lecture', 50, 200),
      ('IT-202', it_faculty_id, 2, 'lab', 150, 200),
      ('IT-301', it_faculty_id, 3, 'office', 50, 300)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;