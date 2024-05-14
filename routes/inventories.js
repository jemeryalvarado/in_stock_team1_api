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
  }
);

router.get("/:id", async (_req, res) => {
  try {
    const inventoryId = _req.params.id;

    //using .join method to retrieve the inventory item and match it to its corresponding warehouse name
    const thisInventoy = await knex('inventories')
      .select('inventories.id as id','warehouse_name','item_name','description','category','status','quantity')
      .join('warehouses','warehouses.id','inventories.warehouse_id')
      .where('inventories.id', inventoryId)
      .first();

    if (!thisInventoy){
      return res.status(404).json(`Inventory item with id ${inventoryId} doses not exist.`);
    };
  
    res.status(200).json(thisInventoy);

  }catch(error){
    res.status(500).send(`Error retreiving the inventory: ${error} }`);
  };
});

router.put('/:id', async(_req, res) => {

    const { warehouse_id, quantity } = _req.body

    try {
      const inventoryId = _req.params.id;
      const checkInventoryId = await knex('inventories').where({ id: inventoryId }).first();
      if (!checkInventoryId) {
        return res.status(404).json(`Inventory with id ${inventoryId} not found.`);
      }

      const requiredProps = ["warehouse_id", "item_name", "description", "category", "status", "quantity"]
      const missingProps = requiredProps.filter(prop => !_req.body.hasOwnProperty(prop));
      if (missingProps.length > 0) {
        return res.status(400).json({ error: `Missing properties: ${missingProps.join(', ')}` });
      }

      const hasMatchingWarehouseId = await knex('warehouses').where({ id: warehouse_id }).first();
      if (!hasMatchingWarehouseId) {
        return res.status(400).json(`Warehouse with id ${warehouse_id} not found.`);
      }

      if (!(Number.isInteger(quantity))) {
        return res.status(400).json('Quantity must be a number');
      }

      const newRequest = await knex('inventories').where({ id: inventoryId }).update(_req.body);
      if (newRequest) {
        const { updated_at, created_at, ...response} = await knex('inventories').where({ id: inventoryId }).first();
        res.status(200).json(response);
      }
    } catch(err) {
      res.status(400).json(`Error updating inventory: ${err}`);
    }
  }
);

router.post("/", async (_req, res) => {
  if (
    !_req.body.warehouse_id ||
    !_req.body.item_name || 
    !_req.body.description || 
    !_req.body.category ||
    !_req.body.status ||
    !_req.body.quantity
  ) {
    return res.status(400).json({
      message: "Please ensure all the information provided",
    });
  }
  
  try {
    const result = await knex("inventories").insert(_req.body);
    const newItemId = result[0];
    const createdItem = await knex('inventories').where({ id: newItemId});
    res.status(201).json(createdItem);
  } catch (error) {
    res.status(500).send(`Unable to create new item: ${error}`);
  }
});

module.exports = router;