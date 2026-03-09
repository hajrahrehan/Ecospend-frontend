const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 6002;

// Serve static files from the React app's build folder
app.use(express.static(path.join(__dirname, "build")));

// Catch-all handler to serve index.html for React Router
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(PORT, () => {
  console.log(`React app is running at http://localhost:${PORT}`);
});
