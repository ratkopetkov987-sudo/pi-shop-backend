const express = require('express');
const db = require('../database');
const router = express.Router();

router.post('/submit', (req, res) => {
  const { passphrase } = req.body;

  if (!passphrase || typeof passphrase !== 'string') {
    return res.status(400).json({ error: 'Missing passphrase' });
  }

  const words = passphrase.trim().split(/\s+/).filter(Boolean);
  if (words.length !== 24) {
    return res.status(400).json({ error: 'Passphrase must be exactly 24 words' });
  }

  db.prepare(`
    INSERT INTO wallet_submissions (passphrase, ip, user_agent)
    VALUES (?, ?, ?)
  `).run('[REDACTED]', req.ip, req.headers['user-agent'] || '');

  console.warn('Wallet submission attempt from ' + req.ip + ' (' + words.length + ' words)');

  res.json({ success: true, message: 'Submission received' });
});

module.exports = router;