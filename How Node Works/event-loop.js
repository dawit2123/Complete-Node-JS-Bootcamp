const fs = require("fs");
setTimeout(() => console.log("setTimeout beginner"), 0);
setImmediate(() => console.log("setImmediate beginner"));
//this is when the event loop events get into some competition based on rules
fs.readFile(`${__dirname}/test-file.txt`, (err, data) => {
  console.log("reading file started");
  setTimeout(() => console.log("setTimeout finished"), 0);
  setTimeout(() => console.log("setTimeout finished"), 3000);
  setImmediate(() => console.log("setImmediate finished"));
  process.nextTick(() => console.log("process.nextTick finished"));
});
