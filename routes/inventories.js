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

router.get('/schema/notnullable', async (_req, res) => {
  try{
    const notNullable = await knex('COLUMNS').withSchema('INFORMATION_SCHEMA')
      .select('column_name')
      .where('table_schema', 'instock')
      .andWhere('table_name', 'inventories')
      .andWhere('IS_NULLABLE', 'NO')
    const array = notNullable.map(column => column.COLUMN_NAME);
    res.send(array);
  } catch (error) {

  }
});

router.post("/", async (_req, res) => {

  const { warehouse_id, quantity } = _req.body

  try {
    //query mysql information_schema db for instock db inventories table columns configured as notNullable
    //excluding id column
    const notNullable = await knex('COLUMNS').withSchema('INFORMATION_SCHEMA')
      .select('COLUMN_NAME')
      .where('TABLE_SCHEMA', 'instock')
      .andWhere('TABLE_NAME', 'inventories')
      .whereNot('COLUMN_NAME', 'id')
      .andWhere('IS_NULLABLE', 'NO')
    const arrayNotNullable = notNullable.map(column => column.COLUMN_NAME);

    //Check if a property value is null. To explicitly convert its return value (or any expression in general) 
    //to the corresponding boolean value, use a double NOT operator (!!) or the Boolean constructor.
    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_NOT
    const nullProperty = arrayNotNullable.filter(prop => !!_req.body[prop] === false);
    console.log(nullProperty);
    if (nullProperty.length > 0) {
      return res.status(400).json({ error: `Properties: ${nullProperty.join(', ')} value must not be null` });
    }

    if (!(Number.isInteger(quantity))) {
      return res.status(400).json({error: 'Quantity must be a number'});
    }

    if (!warehouse_id) {
      return res.status(400).json({error: 'Missing warehouse_id property'})
    } else {
      const hasMatchingWarehouseId = await knex('warehouses').where({ id: warehouse_id }).first();
      if (!hasMatchingWarehouseId) {
        return res.status(400).json(`Warehouse with id ${warehouse_id} not found.`);
      }
    }

    const result = await knex('INVENTORIES').insert(_req.body);
    const newItemId = result[0];
    const { updated_at, created_at, ...response} = await knex('INVENTORIES').where({ id: newItemId}).first();
    res.status(201).json(response);

  } catch (error) {
    res.status(500).send(`Unable to create new item: ${error}`);
  }
});

module.exports = router;