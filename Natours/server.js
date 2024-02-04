const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
const mongoose = require('mongoose');
const app = require('./app');
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTIOIN 💥');
  console.log(err);
  process.exit(1);
});
mongoose
  .connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => {
    console.log('Database is connected successfully.');
  })
  .catch(err => {
    'failed to connect to the database.', err;
  });
// const testTour = new Tour({
//   name: 'The Forest Hiker part2',
//   price: 1300
// });
// testTour
//   .save()
//   .then(data => console.log(data))
//   .catch(err => console.log(err));
const server = app.listen('3000', () => {
  console.log('app listening on port 3000');
});
process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION 💥. Shutting down...');
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});
