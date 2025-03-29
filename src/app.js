const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const routes = require("./routes");

const app = express();
const port = process.env.PORT || 3001;

// Connect to MongoDB
// mongoose
//   .connect("mongodb://localhost:27617/summarizer")
//   .then(() => {
//     console.log("Connected to MongoDB");
//   })
//   .catch((err) => {
//     console.error("Failed to connect to MongoDB", err);
//   });

mongoose
  .connect("mongodb://127.0.0.1:27017/mydatabase", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected!"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.use(bodyParser.json());
app.use("/api", routes);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "..", "public")));

// Serve the index.html file for the root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
