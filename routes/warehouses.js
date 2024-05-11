const knex = require('knex')(require('../knexfile'));
const express = require("express");
const router = express.Router();

router.get("/", async(_req, res) => {
  try{
    const all_warehouses = await knex('warehouses');
    const all_warehouses_noTimeStamps= all_warehouses.map(({created_at, updated_at, ...cleanedData})=>cleanedData); 
    res.status(200).json(all_warehouses_noTimeStamps);
  }catch{
    res.status(500).send('Error getting warehouses');
  }
  });
  

module.exports = router;