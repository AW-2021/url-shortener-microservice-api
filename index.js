require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dns = require("dns");
const app = express();
const Url = require("./models/url.model");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(express.urlencoded({ extended: false }));

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.post("/api/shorturl", (req, res) => {
  try {
    const hostname = new URL(req.body.url).hostname;

    dns.lookup(hostname, async (err, address, family) => {
      if (err) {
        res.json({
          error: "invalid url",
        });
      } else {
        const dbUrl = await Url.findOne({ original_url: req.body.url });

        if (!dbUrl) {
          Url.estimatedDocumentCount().then(async (count) => {
            const url = await Url.create({
              original_url: req.body.url,
              short_url: ++count,
            });
            res.status(200).json(url);
          });
        } else {
          res.status(200).json(dbUrl);
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/shorturl/:short_url", async (req, res) => {
  try {
    const { short_url } = req.params;
    const url = await Url.findOne({ short_url });
    res.redirect(url.original_url);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to the database!");
    app.listen(port, function () {
      console.log(`Listening on port ${port}`);
    });
  })
  .catch(() => {
    console.log("Connection to database failed...");
  });
