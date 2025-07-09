const express = require('express');
const pool = require('./db');
const { v4: uuidv4 } = require('uuid');
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger"); // if saved as swagger.js
require('dotenv').config();

const app = express();
app.use(express.json());
// Swagger route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
/**
 * @swagger
 * /api/hello:
 *   get:
 *     summary: Returns a Hello World message
 *     responses:
 *       200:
 *         description: A successful response
 */
app.get('/', (req, res) => {
  res.send('Hello from Express + PostgreSQL!');
});

/**
 * @swagger
 * /sitedetails:
 *   post:
 *     summary: Create a new site entry
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               site_name:
 *                 type: string
 *               surveying_company:
 *                 type: string
 *               prime_contractor:
 *                 type: string
 *               construction_start:
 *                 type: string
 *                 format: date
 *               construction_end:
 *                 type: string
 *                 format: date
 *               rodman_id:
 *                 type: string
 *               instrument_operator_id:
 *                 type: string
 *               construction_area:
 *                 type: string
 *     responses:
 *       201:
 *         description: Site created
 *       500:
 *         description: Server error
 */

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

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
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
