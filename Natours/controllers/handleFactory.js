const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');
exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (doc.length === 0) {
      return next(new AppError('404 No document found by that ID', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null
    });
  });
exports.updateOne = model =>
  catchAsync(async (req, res, next) => {
    const doc = await model.findByIdAndUpdate(req.params.id, req.body, {
      new: 1,
      runValidator: 1
    });
    if (doc.length === 0) {
      return next(new AppError('404 No document found by that ID', 404));
    }
    res.json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });
exports.createOne = model =>
  catchAsync(async (req, res, next) => {
    const doc = await model.create(req.body);
    res.json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });
exports.getOne = (model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = model.find({ _id: req.params.id });
    if (popOptions) query = query.populate(popOptions);
    // const data = await Tour.findById(id);
    const doc = await query;
    if (doc.length === 0) {
      return next(new AppError('404 No document found by that ID', 404));
    }
    res.json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });
exports.getAll = model =>
  catchAsync(async (req, res, next) => {
    //to allow for nested get reviews on tour
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    const feature = new APIFeatures(model.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    // const doc = await feature.query.explain();
    const doc = await feature.query;
    //SENDING THE RESULT
    res.status(200).json({
      status: 'sucess',
      result: doc.length,
      data: { data: doc }
    });
  });
