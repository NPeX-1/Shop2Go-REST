var express = require('express');
var router = express.Router();
var LogsController = require('../controllers/LogsController.js');


router.get('/', LogsController.show);

router.post('/', LogsController.create);

router.put('/', LogsController.update);

router.delete('/:id', LogsController.remove);

module.exports = router;
