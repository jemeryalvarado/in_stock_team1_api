const knex = require('knex')(require('../knexfile'));
const express = require("express");
const router = express.Router();

  router.get('/:id', async (_req, res) => {
    try {
      const data = await knex('warehouses');
      const warehouseId = _req.params.id;
      const warehouse = data.find(warehouse => warehouse.id == warehouseId)
      if (warehouse) {
        const { created_at, updated_at, ...warehouseWithoutTimeStamps } = warehouse;
        res.status(200).json(warehouseWithoutTimeStamps)
      } else {
        res.status(404).json(`Warehouse id: ${warehouseId} does not exist`)
      }
    } catch(err) {
      res.status(400).send(`Error retrieving Users: ${err}`)
    }
  });

module.exports = router;