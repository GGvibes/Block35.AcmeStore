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


//get users

app.get('/api/users', async(req, res, next)=> {
  try {
    res.send(await fetchUsers());
  }
  catch(ex){
    next(ex);
  }
});

//get products

app.get('/api/products', async(req, res, next)=> {
  try {
    res.send(await fetchProducts());
  }
  catch(ex){
    next(ex);
  }
});

//get favorites

app.get('/api/users/:id/favorites', async(req, res, next)=> {
  try {
    res.send(await fetchFavorites(req.params.id));
  }
  catch(ex){
    next(ex);
  }
});

//create favorite
app.post("/api/users/:user_id/favorites", async (req, res, next) => {
  try {
   
    const favorite = await createFavorite({
      user_id: req.params.user_id, 
      product_id: req.body.product_id,
    });

    res.status(201).send(favorite);
  } 
  catch (err) {
    next(err);
  }
});


//delete favorite

app.delete('/api/users/:user_id/favorites/:id', async(req, res, next) => {
  try {
      await destroyFavorite({user_id: req.params.user_id, id: req.params.id})
      res.sendStatus(204);
      } catch(ex) {
      next(ex);
  }
})

const init = async () => {
  await client.connect();
  console.log("connected to db");
  await createTables(console.log("created tables"));

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
  
  await destroyFavorite(favorites[0].id);

  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`listening on port ${port}`))
};

init();
