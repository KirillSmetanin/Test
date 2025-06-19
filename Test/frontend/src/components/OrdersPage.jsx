import React, { useEffect, useState } from 'react';

export default function OrdersPage({ user }) {
  const [orders, setOrders] = useState([]);
  const [review, setReview] = useState({});
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!user || !user.id) return;
    fetch(`/api/orders?user_id=${user.id}`)
      .then(r => r.json())
      .then(setOrders);
  }, [user]);

  const handleReview = async (order_id) => { /* ... */ };

  if (!user || !user.id) {
    return <div>Пожалуйста, войдите в систему.</div>;
  }

  return (
    <div>
      <h2>Мои заявки</h2>
      {orders.map(order => (
        <div key={order.id} style={{ border: '1px solid #ccc', margin: 8, padding: 8 }}>
          <div>Дата: {order.date_time}</div>
          <div>Груз: {order.cargo_type}, {order.weight} кг, {order.dimensions}</div>
          <div>Откуда: {order.from_address}</div>
          <div>Куда: {order.to_address}</div>
          <div>Статус: {order.status}</div>
          {order.status === 'выполнено' && (
            <div>
              <textarea
                placeholder="Оставьте отзыв"
                value={review[order.id] || ''}
                onChange={e => setReview({ ...review, [order.id]: e.target.value })}
              />
              <button onClick={() => handleReview(order.id)}>Отправить отзыв</button>
            </div>
          )}
        </div>
      ))}
      {msg && <div style={{ color: 'green' }}>{msg}</div>}
    </div>
  );
}