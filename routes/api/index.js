const router = require('express').Router();
const pizzaRoutes = require('./pizza-routes');

//add prefix of '/pizzas' to routes created in pizza-routes
router.use('/pizzas', pizzaRoutes);

module.exports = router;