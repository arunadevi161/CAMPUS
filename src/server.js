const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const app = express();

// Read HTML form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch((error) => {
        console.log("MongoDB connection error:", error.message);
    });

// Campus Club Member Schema
const memberSchema = new mongoose.Schema({
    memberId: String,
    name: String,
    clubName: String,
    year: Number,
    role: String,
    points: Number,
    interests: [String],
    status: String
});

// Model
const Member = mongoose.model("Member", memberSchema);

// Display HTML page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Add Club Member
app.post("/members", async (req, res) => {
    try {
        console.log("\nReceived member data:");
        console.log(req.body);

        const member = new Member({
            memberId: req.body.memberId,
            name: req.body.name,
            clubName: req.body.clubName,
            year: Number(req.body.year),
            role: req.body.role,
            points: Number(req.body.points),
            interests: req.body.interests
                .split(",")
                .map(item => item.trim()),
            status: req.body.status
        });

        const savedMember = await member.save();

        console.log("\nClub member inserted successfully!");
        console.log(savedMember);

        res.send("Club member added successfully!");
    } catch (error) {
        console.log("Error inserting member:", error.message);
        res.status(500).send("Error adding club member");
    }
});

// Search members by club and minimum points
app.get("/search-club", async (req, res) => {
    try {
        const result = await Member.find({
            clubName: req.query.club,
            points: { $gt: Number(req.query.points) }
        });

        console.log("\nSearch result:");
        console.log(result);

        res.json(result);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Search member using Member ID
app.get("/member/:id", async (req, res) => {
    try {
        const result = await Member.findOne({
            memberId: req.params.id
        });

        console.log("\nMember found:");
        console.log(result);

        res.json(result);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Display only Name, Club Name, Role and Points
app.get("/details/:id", async (req, res) => {
    try {
        const result = await Member.findOne(
            { memberId: req.params.id },
            {
                _id: 0,
                name: 1,
                clubName: 1,
                role: 1,
                points: 1
            }
        );

        console.log("\nSelected member details:");
        console.log(result);

        res.json(result);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Update role and points
app.put("/update/:id", async (req, res) => {
    try {
        const result = await Member.updateOne(
            { memberId: req.params.id },
            {
                $set: {
                    role: req.body.role,
                    points: Number(req.body.points)
                }
            }
        );

        console.log("\nMember updated:");
        console.log(result);

        res.json(result);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Increase points for all members in a club
app.put("/increase-points", async (req, res) => {
    try {
        const result = await Member.updateMany(
            { clubName: req.body.clubName },
            {
                $inc: {
                    points: Number(req.body.points)
                }
            }
        );

        console.log("\nPoints increased:");
        console.log(result);

        res.json(result);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Search members within points range
app.get("/points-range", async (req, res) => {
    try {
        const result = await Member.find({
            points: {
                $gte: Number(req.query.min),
                $lte: Number(req.query.max)
            }
        });

        console.log("\nMembers in points range:");
        console.log(result);

        res.json(result);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Delete member using Member ID
app.delete("/delete/:id", async (req, res) => {
    try {
        const result = await Member.deleteOne({
            memberId: req.params.id
        });

        console.log("\nMember deleted:");
        console.log(result);

        res.json(result);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Display all members in descending order of points
app.get("/all", async (req, res) => {
    try {
        const result = await Member.find()
            .sort({ points: -1 });

        console.log("\nAll members - descending points:");
        console.log(result);

        res.json(result);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Start server
app.listen(3000, () => {
    console.log("Server running on port 3000");
});