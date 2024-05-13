var express = require('express');
var router = express.Router();
var UsersController = require('../controllers/UsersController.js');


router.get('/', UsersController.list);


router.get('/:id', UsersController.show);


router.post('/', UsersController.create);
router.post('/interested/', UsersController.addInterest);


router.put('/:id', UsersController.update);


router.delete('/:id', UsersController.remove);

module.exports = router;
