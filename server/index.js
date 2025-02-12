const express = require("express");
const app = express();
app.use(express.json());
const { Client } = require("pg");

const {
  client,
  createTables,
  createProduct,
  createUser,
  fetchUsers,
  fetchProducts,
  createFavorite,
  fetchFavorites,
  destroyFavorite,
} = require("./db");


const init = async () => {
  await client.connect();
  console.log("connected to db");
  await createTables();
  console.log("created tables");
  const [
    timothy,
    marcus,
    frannie,
    bananaBread,
    chocolatechipCookies,
    strawberryShortcake,
  ] = await Promise.all([
    createUser("timothy", "password"),
    createUser("marcus", "password2"),
    createUser("frannie", "password3"),
    createProduct("bananaBread"),
    createProduct("chocolateChipCookies"),
    createProduct("strawberryShortcake"),
  ]);
  console.log(await fetchUsers());
  console.log(await fetchProducts());

  const favorites = await Promise.all([
    createFavorite({
      user_id: timothy.id,
      product_id: strawberryShortcake.id,
    }),
    createFavorite({
      user_id: frannie.id,
      product_id: chocolatechipCookies.id,
    }),
    createFavorite({
      user_id: marcus.id,
      product_id: bananaBread.id,
    }),
  ]);
  console.log(await fetchFavorites(timothy.id));
  
  await destroyFavorite({ id: favorites.id, user_id: favorites.user_id});
  console.log(await fetchFavorites())
};

init();
