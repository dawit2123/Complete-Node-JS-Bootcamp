const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const { use, route } = require('../app');

const router = new express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post(
  '/forgotPassword',
  authController.protect,
  authController.forgotPassword
);
router.patch(
  '/resetPassword/:token',
  authController.protect,
  authController.resetPassword
);
router.patch(
  'updatePassword',
  authController.protect,
  authController.updatePassword
);
router.get('/get-me', userController.getMe, userController.getUser);
router.patch(
  '/updateMe',
  authController.protect,
  userController.uploadUserPhoto,
  userController.updateMe
);
router.delete('/deleteMe', authController.protect, userController.deleteMe);

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
