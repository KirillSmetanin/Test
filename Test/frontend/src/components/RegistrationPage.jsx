import React, { useState } from 'react';

const initial = { fio: '', phone: '', email: '', login: '', password: '' };

function validate({ fio, phone, email, login, password }) {
  const errors = {};
  if (!fio.match(/^[А-Яа-яЁё\s]+$/)) errors.fio = 'ФИО: только кириллица и пробелы';
  if (!phone.match(/^\+7\(\d{3}\)-\d{3}-\d{2}-\d{2}$/)) errors.phone = 'Телефон: формат +7(XXX)-XXX-XX-XX';
  if (!email.match(/^[^@]+@[^@]+\.[^@]+$/)) errors.email = 'Некорректный email';
  if (!login.match(/^[А-Яа-яЁё0-9]{6,}$/)) errors.login = 'Логин: кириллица, не менее 6 символов';
  if (password.length < 6) errors.password = 'Пароль: минимум 6 символов';
  return errors;
}

export default function RegistrationPage() {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setMsg('');
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    if (data.error) setMsg(data.error);
    else setMsg('Регистрация успешна! Теперь войдите.');
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '0 auto' }}>
      <h2>Регистрация</h2>
      <input name="fio" placeholder="ФИО" value={form.fio} onChange={handleChange} />
      {errors.fio && <div style={{ color: 'red' }}>{errors.fio}</div>}
      <input name="phone" placeholder="Телефон +7(XXX)-XXX-XX-XX" value={form.phone} onChange={handleChange} />
      {errors.phone && <div style={{ color: 'red' }}>{errors.phone}</div>}
      <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
      {errors.email && <div style={{ color: 'red' }}>{errors.email}</div>}
      <input name="login" placeholder="Логин" value={form.login} onChange={handleChange} />
      {errors.login && <div style={{ color: 'red' }}>{errors.login}</div>}
      <input name="password" type="password" placeholder="Пароль" value={form.password} onChange={handleChange} />
      {errors.password && <div style={{ color: 'red' }}>{errors.password}</div>}
      <button type="submit">Зарегистрироваться</button>
      {msg && <div style={{ marginTop: 10, color: msg.startsWith('Регистрация') ? 'green' : 'red' }}>{msg}</div>}
    </form>
  );
}