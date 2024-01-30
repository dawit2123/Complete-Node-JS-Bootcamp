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
// reading and writing the file in asynchronous way
// fs.readFile(
//   path.join(__dirname, "./txt/read-this.txt"),
//   "utf-8",
//   (err, data1) => {
//     if (err) console.log(err);
//     fs.writeFile(
//       path.join(__dirname, "/txt/writtenFileAsync.txt"),
//       `The file that is written asynchronously is: ${data1} \n Created at ${Date.now()}`,
//       (err) => {
//         if (err) console.log(err);
//         console.log("File written successfully");
//       }
//     );
//   }
// );
////////////////////////////////////SERVER////////////////////////////////////
