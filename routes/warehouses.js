const express = require("express");
const router = express.Router();

router.put('/:id', async(_req, res) => {
  const warehouseId = _req.params.id;
  const warehouse = data.find(warehouse => warehouse.id == warehouseId);
  const result = await warehouse.replaceOne({_id: warehouseId}, _req.body);
  console.log(result);

  if (warehouse) {
    res.status(200).json(warehouse)
  } else {
    res.status(404).json(`New warehouse ${warehouseId} is not updated.`)
  }
  res.json({updatedCount: result.modifiedCount});
});

module.exports = router;