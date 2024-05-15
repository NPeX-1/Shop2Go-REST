var express = require('express');
var router = express.Router();
var UsersController = require('../controllers/UsersController.js');
var Recaptcha = require('express-recaptcha').RecaptchaV3
var recaptcha = new Recaptcha('6LcqTtspAAAAAE0QJruQ6T5V_jegb87IZmrEuLRQ', '6LcqTtspAAAAAMkultau9skecTPiDCAaB-uqdYF0')
var multer = require('multer');
var upload = multer({ dest: 'public/images/profilepics' });

router.get('/', UsersController.list);

router.get('/bookmarks', UsersController.bookmarks);
router.get('/wishlist', UsersController.wishlist);
router.get('/:id', UsersController.show);
router.get('/logout', UsersController.logout);



router.post('/'/*, recaptcha.middleware.verify*/, upload.single('image'), UsersController.create);
router.post('/bookmarks/:id', recaptcha.middleware.verify, UsersController.createBookmark);
router.post('/login', UsersController.login);


router.put('/:id', UsersController.update);


router.delete('/wishlist', UsersController.removeWishlistItem);
router.delete('/:id', UsersController.remove);

module.exports = router;
