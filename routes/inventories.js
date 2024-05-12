const knex = require('knex')(require('../knexfile'));
const express = require("express");
const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const all_inventories = await knex('inventories');
    const all_inventories_noTimeStamps = all_inventories.map(({created_at, updated_at, ...cleanedData})=>cleanedData);
    res.status(200).json(all_inventories_noTimeStamps);
  } catch (error) {
    res.send(`Error getting inventories: ${error}`);
  }   
});
  
module.exports = router;