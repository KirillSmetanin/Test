import React, { useEffect, useState } from 'react';

const statuses = ['Новая', 'В работе', 'Отменена', 'выполнено'];

export default function AdminPanelPage({ user }) {
  if (!user || !user.is_admin) {
    return <div>Доступ только для администратора.</div>;
  }

  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const fetchOrders = () => {
    fetch(`/api/admin/orders?status=${status}&page=${page}`)
      .then(r => r.json())
      .then(setOrders);
  };

  useEffect(fetchOrders, [status, page]);

  const changeStatus = async (id, newStatus) => {
    await fetch('/api/admin/order-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: id, status: newStatus })
    });
    fetchOrders();
  };

  const removeOrder = async id => {
    if (!window.confirm('Удалить заявку?')) return;
    await fetch(`/api/admin/orders/${id}`, { method: 'DELETE' });
    fetchOrders();
  };

  return (
    <div>
      <h2>Панель администратора</h2>
      <div>
        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">Все статусы</option>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {orders.map(order => (
        <div key={order.id} style={{ border: '1px solid #ccc', margin: 8, padding: 8 }}>
          <div>Пользователь: {order.fio} ({order.phone}, {order.email})</div>
          <div>Дата: {order.date_time}</div>
          <div>Груз: {order.cargo_type}, {order.weight} кг, {order.dimensions}</div>
          <div>Откуда: {order.from_address}</div>
          <div>Куда: {order.to_address}</div>
          <div>Статус: {order.status}</div>
          <button onClick={() => changeStatus(order.id, 'В работе')}>В работу</button>
          <button onClick={() => changeStatus(order.id, 'Отменена')}>Отменить</button>
          <button onClick={() => changeStatus(order.id, 'выполнено')}>Выполнено</button>
          <button onClick={() => removeOrder(order.id)} style={{ color: 'red' }}>Удалить</button>
        </div>
      ))}
      <div>
        <button onClick={() => setPage(p => Math.max(1, p - 1))}>Назад</button>
        <span>Стр. {page}</span>
        <button onClick={() => setPage(p => p + 1)}>Вперёд</button>
      </div>
    </div>
  );
}