const express = require("express"); //importing express framework
const app = express(); // creating an instance, aka server

const PORT = 3000; // the port where our server will run

app.use(express.json()); // parses incoming json to a object

app.get("/", (req, res) => {
  //this path will send a plain message back once visited
  res.send("Hello from the backend!");
});

app.listen(PORT, () => {
  // starts server and once running logs the message below
  console.log(`Server running on http://localhost${PORT}`);
});
