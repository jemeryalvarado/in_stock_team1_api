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

router.put('/:id', async(_req, res) => {
  try {
    const warehouseId = _req.params.id;

    const requiredProps = ["warehouse_name", "street_address", "city", "country", "contact_name", "position", "phone_number","email"]
    const missingProps = requiredProps.filter(prop => !_req.body.hasOwnProperty(prop));
    if (missingProps.length > 0) {
      return res.status(400).json({ error: `Missing properties: ${missingProps.join(', ')}` });
    }

    const phoneNumberValidator = /^\d+$/;
    if (!phoneNumberValidator.test(_req.body.phone_number)) {
      return res.status(400).json({ error: "Phone number must contain only integers." });
    }

    const emailValidator = /\S+@\S+\.\S+/;
    if (!emailValidator.test(_req.body.email)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    const updateResult = await knex('warehouses').where({ id: warehouseId }).update(_req.body);
    if (updateResult) {
      const updatedWarehouse = await knex('warehouses').where({ id: warehouseId }).first();
      res.status(200).json({ updatedWarehouse });
    } else {
      res.status(404).json(`Warehouse with id ${warehouseId} not found.`);
    }
  } catch(err) {
    res.status(400).json(`Error updating warehouse: ${err}`);
  }
});

module.exports = router;