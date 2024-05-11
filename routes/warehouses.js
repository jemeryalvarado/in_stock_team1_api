const knex = require('knex')(require('../knexfile'));
const express = require("express");
const router = express.Router();

router.get("/", async(_req, res) => {
  try{
    const all_warehouses = await knex('warehouses');
    res.status(200).json(all_warehouses);
  }catch{
    res.status(500).send('Error getting warehouses');
  }
  });
  

module.exports = router;