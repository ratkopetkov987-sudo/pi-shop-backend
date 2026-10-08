const express = require('express');
const db = require('../database');
const nodemailer = require('nodemailer');
const router = express.Router();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

router.post('/offer', async (req, res) => {
  const { tradeName, customName, modelDate, piValue, productId, email } = req.body;

  if (!tradeName || !piValue || !productId || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  const pi = Number(piValue);
  if (!Number.isFinite(pi) || pi <= 0 || pi > 1000000) {
    return res.status(400).json({ error: 'Invalid Pi amount' });
  }

  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const info = db.prepare(`
    INSERT INTO trade_offers
      (trade_name, custom_name, model_date, pi_value, product_id, email, ip)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(tradeName, customName || null, modelDate || null, pi, productId, email, req.ip);

  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.NOTIFY_EMAIL || process.env.SMTP_USER,
      subject: 'New trade-in offer #' + info.lastInsertRowid,
      text: 'Offer #' + info.lastInsertRowid + '\nTrade-in: ' + tradeName + '\nPi added: ' + pi + '\nProduct: ' + product.name + '\nEmail: ' + email
    }).catch(err => console.error('Email send failed:', err.message));
  }

  res.json({
    success: true,
    offerId: info.lastInsertRowid,
    message: 'Offer received. You will be notified within 1-3 hours.'
  });
});

router.get('/offers', (req, res) => {
  const rows = db.prepare(`
    SELECT o.*, p.name AS product_name
    FROM trade_offers o
    LEFT JOIN products p ON p.id = o.product_id
    ORDER BY o.created_at DESC
    LIMIT 200
  `).all();
  res.json(rows);
});

module.exports = router;