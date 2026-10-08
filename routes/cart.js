const express = require('express');
const db = require('../database');
const router = express.Router();

router.get('/', (req, res) => {
  const { sessionId } = req.query;
  if (!sessionId) return res.status(400).json({ error: 'sessionId required' });

  const rows = db.prepare(`
    SELECT c.id, c.quantity, p.*
    FROM cart_items c
    JOIN products p ON p.id = c.product_id
    WHERE c.session_id = ?
  `).all(sessionId);

  const total = rows.reduce((s, r) => s + r.price_pi * r.quantity, 0);
  res.json({
    items: rows.map(r => ({
      cartId: r.id,
      productId: r.id,
      name: r.name,
      color: r.color,
      pricePi: r.price_pi,
      image: r.image,
      quantity: r.quantity
    })),
    totalPi: total
  });
});

router.post('/add', (req, res) => {
  const { sessionId, productId, quantity = 1 } = req.body;
  if (!sessionId || !productId) {
    return res.status(400).json({ error: 'sessionId and productId required' });
  }
  const product = db.prepare('SELECT id FROM products WHERE id = ?').get(productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const existing = db.prepare(
    'SELECT * FROM cart_items WHERE session_id = ? AND product_id = ?'
  ).get(sessionId, productId);

  if (existing) {
    db.prepare('UPDATE cart_items SET quantity = quantity + ? WHERE id = ?')
      .run(quantity, existing.id);
  } else {
    db.prepare('INSERT INTO cart_items (session_id, product_id, quantity) VALUES (?, ?, ?)')
      .run(sessionId, productId, quantity);
  }
  res.json({ success: true });
});

router.post('/remove', (req, res) => {
  const { sessionId, productId } = req.body;
  db.prepare('DELETE FROM cart_items WHERE session_id = ? AND product_id = ?')
    .run(sessionId, productId);
  res.json({ success: true });
});

router.post('/checkout', (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ error: 'sessionId required' });

  const items = db.prepare(`
    SELECT c.quantity, p.price_pi
    FROM cart_items c
    JOIN products p ON p.id = c.product_id
    WHERE c.session_id = ?
  `).all(sessionId);

  if (!items.length) return res.status(400).json({ error: 'Cart is empty' });

  const total = items.reduce((s, r) => s + r.price_pi * r.quantity, 0);

  const tx = db.transaction(() => {
    const info = db.prepare(
      'INSERT INTO orders (session_id, total_pi, status) VALUES (?, ?, ?)'
    ).run(sessionId, total, 'pending');
    db.prepare('DELETE FROM cart_items WHERE session_id = ?').run(sessionId);
    return info.lastInsertRowid;
  });

  const orderId = tx();
  res.json({ success: true, orderId, totalPi: total });
});

module.exports = router;