const EventEmitter = require("events");
//creating a modified Sales event emmiter class that extends the events class
class Sales extends EventEmitter {
  constructor() {
    super();
  }
}
const newSales = new Sales();
newSales.on("sale", () =>
  console.log("event is emmited and this is the callback")
);
newSales.on("sale", (price) => console.log(`name: Deep Work Amount: ${price}`));

newSales.emit("sale", 190);
