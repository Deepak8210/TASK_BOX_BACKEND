require("dotenv").config();
const app = require("./src/app");
const conncectDB = require("./src/config/db");

const PORT = process.env.PORT || 5000;

conncectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
