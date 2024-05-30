var express = require('express');
var router = express.Router();
var NotificationsController = require('../controllers/NotificationsController.js');

/*
 * GET
 */
router.get('/', NotificationsController.list);

/*
 * GET
 */
router.get('/:id', NotificationsController.show);

/*
 * POST
 */
router.post('/', NotificationsController.create);

/*
 * PUT
 */
router.put('/:id', NotificationsController.update);

/*
 * DELETE
 */
router.delete('/:id', NotificationsController.remove);

module.exports = router;
