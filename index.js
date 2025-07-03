const express = require('express');
const pool = require('./db');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello from Express + PostgreSQL!');
});

app.post('/sitedetails', async (req, res) => {
try {
const {
site_name,
surveying_company,
prime_contractor,
construction_start,
construction_end,
rodman_id,
instrument_operator_id,
construction_area
} = req.body;

const site_id = 'SITE-' + uuidv4().split('-')[0].toUpperCase(); // e.g., SITE-3F5A9

const query = `
INSERT INTO sitedetails (
site_id, site_name, surveying_company, prime_contractor,
construction_start, construction_end, rodman_id,
instrument_operator_id, construction_area
) VALUES (
$1, $2, $3, $4, $5, $6, $7, $8, ST_GeomFromText($9, 4326)
) RETURNING *;
`;

const values = [
site_id, site_name, surveying_company, prime_contractor,
construction_start, construction_end, rodman_id,
instrument_operator_id, construction_area
];

const result = await pool.query(query, values);
res.status(201).json(result.rows[0]);
} catch (err) {
console.error("Error", err);
   res.status(500).send('Server error');
 }
});

app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
