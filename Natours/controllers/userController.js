const multer = require('multer');
const path = require('path');
// const sharp = require('sharp');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./../controllers/handleFactory');
//saving into the diskStorage without making image processing
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `${path.join(__dirname, '../public/img/users')}`);
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
  }
});

//saving into the buffer
// const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        'The document is not an image. Please upload only images',
        400
      ),
      false
    );
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});
exports.uploadUserPhoto = upload.single('photo');
//req.file.filename= `user-${req.id}-${Date.now()}.jpeg`;
// exports.resizeImageProcessing = catchAsync(async (req, res, next) => {
//   await sharp(req.file.buffer).resize(200,200).toFormat('jpeg').jpeg({quality:90})
//.toFile(`public/img/user/${req.file.filename}`);
//next();
// });
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const user = await User.find();
  res.status(200).json({
    status: 'success',
    user
  });
});
exports.updateMe = catchAsync(async (req, res, next) => {
  //1) checking whether the req.body includes a password field
  if (req.body.password || req.body.passwordConfirm) {
    next(
      new AppError(
        `You cann't update the password in here. Use /update-password instead`,
        401
      )
    );
  }
  //2) filtering the req.body
  const filter = (body, ...allowedFields) => {
    let tempObj = {};
    Object.keys(body).forEach(el => {
      if (allowedFields.includes(el)) tempObj[el] = body[el];
    });
    return tempObj;
  };
  const filteredObj = filter(req.body, 'name', 'email');
  if (req.file) filteredObj.photo = req.file.filename;
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredObj, {
    new: 1,
    runValidator: 1
  });
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null
  });
});
exports.addUser = (req, res) => {
  res.status(500).json({
    status: 'success'
  });
};
exports.getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};
exports.getUser = factory.getOne(User);
exports.deleteUser = factory.deleteOne(User);
//Don't try to update the user's password here
exports.updateUser = factory.updateOne(User);
