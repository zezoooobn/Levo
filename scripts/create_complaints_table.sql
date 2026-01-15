-- Create complaints table for storing customer complaints
CREATE TABLE IF NOT EXISTS complaints (
  id SERIAL PRIMARY KEY,
  user_email VARCHAR(255),
  complaint_type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  image_urls TEXT[], -- Array to store up to 2 image URLs
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
