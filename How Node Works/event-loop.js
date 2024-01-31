const fs = require("fs");
setTimeout(() => console.log("setTimeout beginner"), 0);
setImmediate(() => console.log("setImmediate beginner"));
fs.readFile(`${__dirname}/test-file.txt`, (err, data) => {
  console.log("reading file started");
  setTimeout(() => console.log("setTimeout final"), 0);
  setTimeout(() => console.log("setTimeout final"), 3000);
  setImmediate(() => console.log("setImmediate final"));
});
