-- Create villages table
CREATE TABLE IF NOT EXISTS villages (
  village_id SERIAL PRIMARY KEY,
  village_name TEXT NOT NULL,
  district_name TEXT NOT NULL,
  pincode TEXT NOT NULL
);

-- Create citizens table
CREATE TABLE IF NOT EXISTS citizens (
  aadhar_number TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  dob DATE NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL,
  address TEXT NOT NULL,
  marital_status TEXT NOT NULL,
  father_name TEXT,
  mother_name TEXT,
  spouse_name TEXT,
  education TEXT NOT NULL,
  occupation TEXT NOT NULL,
  village_id INTEGER NOT NULL REFERENCES villages(village_id) ON DELETE CASCADE
);

-- Create admin users table
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample admin user (username: admin, password: password)
INSERT INTO admins (username, password) VALUES ('admin', 'password');

-- Insert sample villages
INSERT INTO villages (village_name, district_name, pincode) VALUES
('Rampur', 'Jaipur', '302001'),
('Shyampur', 'Ajmer', '305001'),
('Ganeshpur', 'Udaipur', '313001');

-- Insert sample citizens
INSERT INTO citizens (aadhar_number, name, dob, age, gender, address, marital_status, father_name, mother_name, spouse_name, education, occupation, village_id) VALUES
('123456789012', 'Raj Kumar', '1985-05-15', 38, 'Male', 'House No. 123, Rampur', 'Married', 'Mohan Lal', 'Kamla Devi', 'Sunita Devi', 'Graduate', 'Farmer', 1),
('234567890123', 'Priya Singh', '1990-08-22', 33, 'Female', 'House No. 456, Shyampur', 'Married', 'Ramesh Singh', 'Geeta Singh', 'Vikram Singh', 'Post Graduate', 'Teacher', 2),
('345678901234', 'Amit Sharma', '1995-03-10', 28, 'Male', 'House No. 789, Ganeshpur', 'Unmarried', 'Suresh Sharma', 'Radha Sharma', null, 'Graduate', 'Software Engineer', 3);

-- Enable realtime for tables
alter publication supabase_realtime add table villages;
alter publication supabase_realtime add table citizens;
alter publication supabase_realtime add table admins;