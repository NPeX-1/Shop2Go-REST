var express = require('express');
var router = express.Router();
var UsersController = require('../controllers/UsersController.js');
var Recaptcha = require('express-recaptcha').RecaptchaV3
var recaptcha = new Recaptcha('6LcqTtspAAAAAE0QJruQ6T5V_jegb87IZmrEuLRQ', '6LcqTtspAAAAAMkultau9skecTPiDCAaB-uqdYF0')

router.get('/', UsersController.list);

router.get('/bookmarks', User.Controller.bookmarks);
router.get('/wishlist', User.Controller.wishlist);
router.get('/:id', UsersController.show);



router.post('/', recaptcha.middleware.verify, UsersController.create);
router.post('/bookmarks/:id', recaptcha.middleware.verify, UsersController.createBookmark);


router.put('/:id', UsersController.update);


router.delete('/wishlist', UsersController.removeWishlistItem);
router.delete('/:id', UsersController.remove);

module.exports = router;
