const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.static("src"));

const PORT = process.env.PORT || 4150;
app.listen(PORT, () => {
  console.log(`Serveur started on http://localhost:${PORT}`);
});
