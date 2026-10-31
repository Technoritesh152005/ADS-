const express = require('express');
const router = express.Router();
const {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  quickRestock,
} = require('../controllers/itemController');

router.route('/')
  .get(getItems)
  .post(createItem);

router.route('/:id')
  .get(getItemById)
  .put(updateItem)
  .delete(deleteItem);

router.route('/:id/restock')
  .patch(quickRestock);

module.exports = router;
