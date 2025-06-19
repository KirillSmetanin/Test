const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE
});

// Регистрация
app.post('/api/register', async (req, res) => {
  const { fio, phone, email, login, password } = req.body;
  // Валидация на сервере (можно расширить)
  if (!fio || !phone || !email || !login || !password) return res.status(400).json({ error: 'Все поля обязательны' });
  const exists = await pool.query('SELECT 1 FROM users WHERE login=$1', [login]);
  if (exists.rowCount > 0) return res.status(400).json({ error: 'Логин уже занят' });
  const hash = await bcrypt.hash(password, 10);
  await pool.query(
    'INSERT INTO users (fio, phone, email, login, password) VALUES ($1,$2,$3,$4,$5)',
    [fio, phone, email, login, hash]
  );
  res.json({ ok: true });
});

// Авторизация
app.post('/api/login', async (req, res) => {
  const { login, password } = req.body;
  const user = await pool.query('SELECT * FROM users WHERE login=$1', [login]);
  if (!user.rowCount) return res.status(400).json({ error: 'Пользователь не найден' });
  const valid = await bcrypt.compare(password, user.rows[0].password);
  if (!valid) return res.status(400).json({ error: 'Неверный пароль' });
  res.json({
    fio: user.rows[0].fio,
    id: user.rows[0].id,
    is_admin: user.rows[0].is_admin
  });
});

// Получить заявки пользователя
app.get('/api/orders', async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: 'user_id обязателен' });
  const result = await pool.query('SELECT * FROM orders WHERE user_id=$1 ORDER BY id DESC', [user_id]);
  res.json(result.rows);
});

// Создать заявку
app.post('/api/orders', async (req, res) => {
  const { user_id, date_time, weight, dimensions, from_address, to_address, cargo_type } = req.body;
  await pool.query(
    `INSERT INTO orders (user_id, date_time, weight, dimensions, from_address, to_address, cargo_type)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [user_id, date_time, weight, dimensions, from_address, to_address, cargo_type]
  );
  res.json({ ok: true });
});

// Оставить отзыв
app.post('/api/reviews', async (req, res) => {
  const { order_id, user_id, text } = req.body;
  await pool.query(
    'INSERT INTO reviews (order_id, user_id, text) VALUES ($1,$2,$3)',
    [order_id, user_id, text]
  );
  res.json({ ok: true });
});

// Получить отзывы по заявке
app.get('/api/reviews', async (req, res) => {
  const { order_id } = req.query;
  const result = await pool.query('SELECT * FROM reviews WHERE order_id=$1', [order_id]);
  res.json(result.rows);
});

// Админ: получить все заявки
app.get('/api/admin/orders', async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  let query = 'SELECT o.*, u.fio, u.phone, u.email FROM orders o JOIN users u ON o.user_id=u.id';
  let params = [];
  if (status && status !== '') {
    query += ' WHERE o.status=$1';
    params.push(status);
    query += ' ORDER BY o.id DESC LIMIT $2 OFFSET $3';
    params.push(limit, (page - 1) * limit);
  } else {
    query += ' ORDER BY o.id DESC LIMIT $1 OFFSET $2';
    params.push(limit, (page - 1) * limit);
  }
  const result = await pool.query(query, params);
  res.json(result.rows);
});

// Админ: сменить статус заявки
app.post('/api/admin/order-status', async (req, res) => {
  const { order_id, status } = req.body;
  await pool.query('UPDATE orders SET status=$1 WHERE id=$2', [status, order_id]);
  res.json({ ok: true });
});

// Админ: удалить заявку
app.delete('/api/admin/orders/:id', async (req, res) => {
  await pool.query('DELETE FROM orders WHERE id=$1', [req.params.id]);
  res.json({ ok: true });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend запущен на http://localhost:${PORT}`);
});