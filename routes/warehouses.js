const knex = require('knex')(require('../knexfile'));
const express = require("express");
const router = express.Router();

router.get("/", async(req, res) => {
  try{
    const all_warehouses = await knex('warehouses');
    const all_warehouses_noTimeStamps= all_warehouses.map(({created_at, updated_at, ...cleanedData})=>cleanedData); 
    res.status(200).json(all_warehouses_noTimeStamps);
  }catch{
    res.status(500).send('Error getting warehouses');
  }
});

router.get('/:id', async (req, res) => {
  try {
    const data = await knex('warehouses');
    const warehouseId = req.params.id;
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

router.put('/:id', async(req, res) => {
  try {
    const warehouseId = req.params.id;

    const requiredProps = ["warehouse_name", "street_address", "city", "country", "contact_name", "position", "phone_number","email"]
    const missingProps = requiredProps.filter(prop => !req.body.hasOwnProperty(prop));
    if (missingProps.length > 0) {
      return res.status(400).json({ error: `Missing properties: ${missingProps.join(', ')}` });
    }

    const phoneNumberValidator = /^\d+$/;
    if (!phoneNumberValidator.test(req.body.phone_number)) {
      return res.status(400).json({ error: "Phone number must contain only integers." });
    }

    const emailValidator = /\S+@\S+\.\S+/;
    if (!emailValidator.test(req.body.email)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    const updateResult = await knex('warehouses').where({ id: warehouseId }).update(req.body);
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

router.post("/", (req, res) => {
  const {
    warehouse_name,
    address,
    city,
    country,
    contact_name,
    contact_position,
    contact_phone,
    contact_email
  } = req.body;

  const requiredProps = ["warehouse_name", "address", "city", "country", "contact_name", "contact_position", "contact_phone", "contact_email"];
  const missingProps = requiredProps.filter(prop => !req.body.hasOwnProperty(prop));
  if (missingProps.length > 0) {
    return res.status(400).json({ error: `Missing properties: ${missingProps.join(', ')}` });
  }

  const phoneNumberValidator = /^\d+$/;
  if (!phoneNumberValidator.test(req.body.contact_phone)) {
    console.log(req.body.contact_phone)
    return res.status(400).json({ error: "Phone number must contain only integers." });
  }
  const emailValidator = /\S+@\S+\.\S+/;
  if (!emailValidator.test(contact_email)) {
    return res.status(400).json({ error: "Invalid email format." });
  }

  knex("warehouses").insert({
    warehouse_name,
    address,
    city,
    country,
    contact_name,
    contact_position,
    contact_phone,
    contact_email
  })
  .then(([newWarehouseId]) => {
    return knex("warehouses").where({ id: newWarehouseId }).first();
  })
  .then(newWarehouse => {
    res.status(201).json(newWarehouse);
  })
  .catch(error => {
    console.error("Error creating warehouse:", error); 
    res.status(500).json({ error: "Error creating warehouse" });
  });
});
router.delete('/:id', async (req, res) => {
  try {
    const warehouseId = req.params.id;

    const warehouseExists = await knex('warehouses').where({ id: warehouseId}).first();
    if (!warehouseExists) {
      return res.status(404).json({ error: `Warehouse with id ${warehouseId} does not exist.` });
    } else {
      // deletes inventories associated with warehouse
      await (knex('inventories').where({ warehouse_id: warehouseId }).select('*').del()
      // deletes warehouse
            && knex('warehouses').where({ id: warehouseId }).del()
            );
      res.sendStatus(204);
    }
  } catch (error) {
    res.status(500).json({ error: `Error deleting warehouse: ${error}` });
  }

});

module.exports = router;