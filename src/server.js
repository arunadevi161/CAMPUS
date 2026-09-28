const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const app = express();

// Read data from HTML form
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch((error) => {
        console.log("MongoDB connection error:", error.message);
    });

// Member Schema
const memberSchema = new mongoose.Schema({
    memberId: String,
    name: String,
    department: String,
    year: Number,
    club: String
});

// Member Model
const Member = mongoose.model("Member", memberSchema);

// Display HTML page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Insert member
app.post("/members", async (req, res) => {
    try {
        console.log(req.body);

        const member = new Member({
            memberId: req.body.memberId,
            name: req.body.name,
            department: req.body.department,
            year: req.body.year,
            club: req.body.club
        });

        await member.save();

        res.send("Member added successfully!");
    } catch (error) {
        console.log(error);
        res.status(500).send("Error adding member");
    }
});

// Start server
app.listen(3000, () => {
    console.log("Server running on port 3000");
});