const fs = require('fs');
const path = require('path');
const http = require('http');
const fsExtra = require('fs-extra');
const url = require('url');
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
//Moving the file to the desktop
const transfer = async (src, dest) => {
  await fsExtra.move(src, dest, { overwrite: true });
  console.log('Successfully transfered ');
};
// transfer("./../../../txt", "./txt");
////////////////////////////////////SERVER////////////////////////////////////
const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/overview') {
    res.end('<h1>Hello from the overview</h1>');
  } else if (req.url === '/tour') {
    res.end('<h1>Hello from the tour</h1>');
  } else {
    res.writeHead(400, { 'Content-type': 'text/html' });
    res.end('<h1>Page not found</h1>');
  }
});
server.listen(3000, '127.0.0.1', () => {
  console.log('App listening on port 3000');
});
