const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

const pool = new Pool({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE
});

async function ensureTables() {
  // Пример: проверяем таблицу users
  const check = await pool.query(`
    SELECT to_regclass('public.users') as exists
  `);
  if (!check.rows[0].exists) {
    // Если таблицы нет — создаём
    const schema = fs.readFileSync('./schema.sql', 'utf-8');
    await pool.query(schema);
    console.log('Таблицы созданы!');
  } else {
    console.log('Таблицы уже существуют.');
  }
}

ensureTables()
  .then(() => process.exit(0))
  .catch(e => {
    console.error(e);
    process.exit(1);
  });

async function createTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      fio VARCHAR(100) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      email VARCHAR(100) NOT NULL,
      login VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(100) NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE
    );
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      date_time TIMESTAMP NOT NULL,
      weight NUMERIC(10,2) NOT NULL,
      dimensions VARCHAR(100) NOT NULL,
      from_address VARCHAR(200) NOT NULL,
      to_address VARCHAR(200) NOT NULL,
      cargo_type VARCHAR(30) NOT NULL,
      status VARCHAR(20) DEFAULT 'Новая',
      comment TEXT
    );
    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      order_id INTEGER REFERENCES orders(id),
      user_id INTEGER REFERENCES users(id),
      text TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('Таблицы успешно созданы!');
  await pool.end();
}

createTables().catch(err => {
  console.error('Ошибка создания таблиц:', err);
  pool.end();
});