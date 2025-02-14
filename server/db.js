const pg = require("pg");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");

const client = new pg.Client(
  process.env.DATABASE_URL ||
    "postgres://postgres:juniper23@localhost/acme_store_db"
);

//createTables

const createTables = async () => {
  const SQL = `
        DROP TABLE IF EXISTS favorites;
        DROP TABLE IF EXISTS users;
        DROP TABLE IF EXISTS products;
        CREATE TABLE users (
            id UUID PRIMARY KEY,
            username VARCHAR (50) UNIQUE NOT NULL,
            password VARCHAR (225) NOT NULL
            );
        CREATE TABLE products (
            id UUID PRIMARY KEY NOT NULL,
            name VARCHAR (225) NOT NULL
            );
        CREATE TABLE favorites (
            id UUID PRIMARY KEY,
            product_id UUID REFERENCES products(id) NOT NULL,
            user_id UUID REFERENCES users(id) NOT NULL,
            CONSTRAINT unique_user_product UNIQUE (user_id, product_id)
            );
        `;

  try {
    await client.query(SQL);
  } catch (error) {
    console.error("Error creating tables:", error);
  }
};

//create user

const createUser = async (username, password) => {
  const SQL = `
        INSERT INTO users(id, username, password) VALUES($1, $2, $3) RETURNING *`;
  const response = await client.query(SQL, [
    uuidv4(),
    username,
    await bcrypt.hash(password, 5),
  ]);
  return response.rows[0];
};

//create product

const createProduct = async (name) => {
  const SQL = `
        INSERT INTO products(id, name) VALUES($1, $2) RETURNING *`;
  const response = await client.query(SQL, [uuidv4(), name]);
  return response.rows[0];
};

//fetch users

const fetchUsers = async () => {
  const SQL = `
        SELECT * FROM users
    `;
  const response = await client.query(SQL);
  return response.rows;
};

//fetch products

const fetchProducts = async () => {
  const SQL = `
        SELECT * FROM products
    `;
  const response = await client.query(SQL);
  return response.rows;
};

//create favorite

const createFavorite = async ({ user_id, product_id }) => {
  try {
    const SQL = `
        INSERT INTO favorites(id, user_id, product_id) VALUES ($1, $2, $3) RETURNING *
        `;
    const response = await client.query(SQL, [uuidv4(), user_id, product_id]);
    return response.rows[0];
  } catch (ex) {
    next(ex);
  }
};

//fetch favorites

const fetchFavorites = async (id) => {
  const SQL = `
        SELECT * FROM favorites
        WHERE user_id = $1
        `;
  const response = await client.query(SQL, [id]);
  return response.rows;
};

//destroy favorite

const destroyFavorite = async ({ id, user_id }) => {
  const SQL = `
    DELETE FROM favorites
    WHERE id = $1 AND user_id = $2
    `;
  await client.query(SQL, [id, user_id]);
};

module.exports = {
  client,
  createTables,
  createProduct,
  createUser,
  fetchUsers,
  fetchProducts,
  createFavorite,
  fetchFavorites,
  destroyFavorite,
};
