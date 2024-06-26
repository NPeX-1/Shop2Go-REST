var express = require('express');
var router = express.Router();
var UsersController = require('../controllers/UsersController.js');
var Recaptcha = require('express-recaptcha').RecaptchaV3
var recaptcha = new Recaptcha('6LeOzNIpAAAAANvIOeeILUXdJHFdNxVTcwYBKdoE', '6LeOzNIpAAAAAO9XTv1zDXAexMHZSwTgnpw9y_mn')
var multer = require('multer');
var upload = multer({ dest: 'public/images/profilepics/' });


function requiresLogin(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    } else {
        var err = new Error("You must be logged in to view this page");
        err.status = 401;
        return next(err);
    }
}

router.get('/', UsersController.list);

router.get('/status', UsersController.getStatus);
router.get('/bookmarks', UsersController.bookmarks);
router.get('/wishlist', UsersController.wishlist);
router.get('/logout', UsersController.logout);
router.get('/notifications', UsersController.notifications);
router.get('/history', requiresLogin, UsersController.getHistory);
router.get('/posts/:id', UsersController.getPostsByUser);
router.get('/:id', UsersController.show);

router.post('/addInterest', UsersController.addInterest);

router.post('/', recaptcha.middleware.verify, upload.single('image'), UsersController.create);
router.post('/bookmarks/:id', UsersController.createBookmark);
router.post('/login', UsersController.login);

router.put('/:id', UsersController.update);

router.delete('/wishlist/:toRemove', UsersController.removeWishlistItem);
router.delete('/notification/:id', requiresLogin, UsersController.seen)
router.delete('/history/:id', requiresLogin, UsersController.delHistory)
router.delete('/:id', requiresLogin, UsersController.remove);


module.exports = router;
