const express = require("express");
const app = express();
const cors = require("cors");
const warehouses = require("./routes/warehouses.js");
const inventories = require("./routes/inventories.js");

app.use(express.json());

require("dotenv").config();
const { CORS_ORIGIN } = process.env;
app.use(cors({ origin: CORS_ORIGIN }));

app.use(express.static("public"));

app.use((req, res, next) => {
  next();
});

app.use("/warehouses", warehouses);
app.use("/inventories", inventories);

app.listen(8080, () => {
  console.log("Server is working on http://localhost:8080");
});