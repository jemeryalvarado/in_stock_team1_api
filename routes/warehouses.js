const knex = require('knex')(require('../knexfile'));
const express = require("express");
const router = express.Router();

router.put('/:id', async(_req, res) => {
  try {
    const warehouseId = _req.params.id;
    const data = {
      warehouse_name: "Brooklyn",
      address: "918 Morris Lane",
      city: "Brooklyn",
      country: "USA",
      contact_name: "Parmin Aujla",
      contact_position: "Warehouse Manager",
      contact_phone: "+1 (646) 123-1234",
      contact_email: "paujla@instock.com"
    };

    const result = await knex('warehouses').where({ id: warehouseId }).update(_req.body);

    if (result) {
      res.status(200).json({ updatedCount: result });
    } else {
      res.status(404).json(`Warehouse with id ${warehouseId} not found.`);
    }
  } catch(err) {
    res.status(400).json(`Error updating warehouse: ${err}`);
  }
});

module.exports = router;