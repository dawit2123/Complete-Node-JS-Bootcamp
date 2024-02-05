const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const { use, route } = require('../app');

const router = new express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/login', authController.login);
router.post(
  '/forgot-password',
  authController.protect,
  authController.forgotPassword
);
router.post(
  '/reset-password/:token',
  authController.protect,
  authController.resetPassword
);

router.get('/get-me', userController.getMe, userController.getUser);
router.patch(
  '/update-me',
  userController.uploadUserPhoto,
  userController.updateMe
);
router.delete('/delete-me', userController.deleteMe);

//restrict the down to admin

router.delete('/delete-user/:id', userController.deleteUser);
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.addUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser);

module.exports = router;
