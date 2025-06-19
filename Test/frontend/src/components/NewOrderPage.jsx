import React, { useState } from 'react';

const cargoTypes = [
  'хрупкое', 'скоропортящееся', 'требуется рефрижератор', 'животные', 'жидкость', 'мебель', 'мусор'
];

export default function NewOrderPage({ user }) {
  const [form, setForm] = useState({
    date_time: '', weight: '', dimensions: '', from_address: '', to_address: '', cargo_type: ''
  });
  const [msg, setMsg] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg('');
    if (form.cargo_type === 'мусор') alert('Стоимость заказа увеличена, требуется утилизация!');
    await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, user_id: user.id })
    });
    setMsg('Заявка отправлена!');
    setForm({ date_time: '', weight: '', dimensions: '', from_address: '', to_address: '', cargo_type: '' });
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '0 auto' }}>
      <h2>Новая заявка</h2>
      <input name="date_time" type="datetime-local" value={form.date_time} onChange={handleChange} required />
      <input name="weight" placeholder="Вес (кг)" value={form.weight} onChange={handleChange} required />
      <input name="dimensions" placeholder="Габариты" value={form.dimensions} onChange={handleChange} required />
      <input name="from_address" placeholder="Адрес отправления" value={form.from_address} onChange={handleChange} required />
      <input name="to_address" placeholder="Адрес доставки" value={form.to_address} onChange={handleChange} required />
      <select name="cargo_type" value={form.cargo_type} onChange={handleChange} required>
        <option value="">Тип груза</option>
        {cargoTypes.map(type => <option key={type} value={type}>{type}</option>)}
      </select>
      <button type="submit">Отправить</button>
      {msg && <div style={{ color: 'green', marginTop: 10 }}>{msg}</div>}
    </form>
  );
}