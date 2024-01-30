const fs = require("fs");
const path = require("path");
const http = require("http");
////////////////////////FILES//////////////////////////////
// //reading and writing the file in synchronous way
// const readedFile = fs.readFileSync(
//   path.join(__dirname, "./txt/read-this.txt"),
//   "utf-8"
// );
// const writedFile = fs.writeFileSync(
//   path.join(__dirname, "./txt/writedFile.txt"),
//   `The Written file document is ${readedFile}\n Document creaded time ${Date.now()}`
// );

////////////////////////////////////SERVER////////////////////////////////////
