const express = require('express');
const db = require('../database');
const router = express.Router();

router.get('/', (req, res) => {
  const { category, search } = req.query;
  let sql = 'SELECT * FROM products WHERE 1=1';
  const params = {};

  if (category && category !== 'All') {
    sql += ' AND category = @category';
    params.category = category;
  }
  if (search) {
    sql += ' AND (LOWER(name) LIKE @search OR LOWER(color) LIKE @search)';
    params.search = '%' + search.toLowerCase() + '%';
  }
  sql += ' ORDER BY name ASC';

  const rows = db.prepare(sql).all(params);
  res.json(rows.map(mapProduct));
});

router.get('/categories', (req, res) => {
  const rows = db.prepare('SELECT DISTINCT category FROM products').all();
  res.json(['All'].concat(rows.map(r => r.category)));
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Product not found' });
  res.json(mapProduct(row));
});

function mapProduct(p) {
  return {
    id: p.id,
    name: p.name,
    color: p.color,
    storage: p.storage,
    category: p.category,
    pricePi: p.price_pi,
    image: p.image,
    stock: p.stock,
    proposedPrice: !!p.proposed
  };
}

module.exports = router;