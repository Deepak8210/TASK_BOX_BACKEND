const express = require("express");
const cors = require("cors");
const routes = require("./routes");

const app = express();

//MIDDLEWARES
app.use(cors());
app.use(express.json({ limit: "10mb" }));

//ROUTES
app.use("/api/v1", routes);

module.exports = app;
