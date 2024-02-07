const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const { use, route } = require('../app');

const router = new express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
// protect all the routes down here for only the logged in users
router.use(authController.protect);
router.patch('updatePassword', authController.updatePassword);
router.get('/get-me', userController.getMe, userController.getUser);

//protect all the down routes only to the admins
router.use(authController.restrictTo('admin'));
router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.updateMe
);
router.delete('/deleteMe', userController.deleteMe);

//restrict the down to admin

router.delete('/deleteUser/:id', userController.deleteUser);
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.addUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser);

module.exports = router;
