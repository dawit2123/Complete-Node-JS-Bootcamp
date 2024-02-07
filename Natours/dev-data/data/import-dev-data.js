const dotenv = require('dotenv');

dotenv.config({ path: `${__dirname}/../../config.env` });
const mongoose = require('mongoose');
const fs = require('fs');
const Tour = require('./../../models/tourModels');
const Review = require('./../../models/reviewModel');
const User = require('./../../models/userModel');
mongoose
  .connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => {
    console.log('Database is connected successfully.');
  });
const toursData = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`));
const usersData = JSON.parse(fs.readFileSync(`${__dirname}/users.json`));
const reviewsData = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`));
const insertTours = async () => {
  try {
    await Tour.create(toursData, { validateBeforeSave: false });
    await User.create(usersData, { validateBeforeSave: false });
    await Review.create(reviewsData, { validateBeforeSave: false });
    console.log('Data is successfully imported');
  } catch (err) {
    console.log(`Error occured in loading the data. ${err}`);
  }
  process.exit();
};
const deleteAllTours = async () => {
  try {
    await Tour.deleteMany({});
    await User.deleteMany({});
    await Review.deleteMany({});
    console.log('All data are deleted successfully');
  } catch (err) {
    console.log(`Error occured in deleting. ${err}`);
  }
  process.exit();
};
if (process.argv[2] === '--import') {
  try {
    insertTours();
  } catch (err) {
    console.log(err);
  }
} else if (process.argv[2] === '--delete') {
  try {
    deleteAllTours();
  } catch (err) {
    console.log(err);
  }
}
