CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100)
);

INSERT INTO users (name, email) VALUES
  ('test1', 'test1@example.com'),
  ('test2', 'test2@example.com'),
  ('test3', 'test3@example.com');
