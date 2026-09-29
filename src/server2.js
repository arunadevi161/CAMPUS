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

// Travel Buddy Schema
const travelBuddySchema = new mongoose.Schema({
    buddyId: String,
    name: String,
    destination: String,
    age: Number,
    budget: Number,
    tripDuration: Number,
    interests: [String],
    status: String
});

// Model
const TravelBuddy = mongoose.model("TravelBuddy", travelBuddySchema);

// Display HTML page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index2.html"));
});

// Add Travel Buddy
app.post("/travellers", async (req, res) => {
    try {
        console.log("\nReceived travel buddy data:");
        console.log(req.body);

        const traveller = new TravelBuddy({
            buddyId: req.body.buddyId,
            name: req.body.name,
            destination: req.body.destination,
            age: Number(req.body.age),
            budget: Number(req.body.budget),
            tripDuration: Number(req.body.tripDuration),
            interests: req.body.interests
                .split(",")
                .map(item => item.trim()),
            status: req.body.status
        });

        const savedTraveller = await traveller.save();

        console.log("\nTravel buddy inserted successfully!");
        console.log(savedTraveller);

        res.send("Travel buddy added successfully!");
    } catch (error) {
        console.log("Error inserting travel buddy:", error.message);
        res.status(500).send("Error adding travel buddy");
    }
});

// Search destination with budget greater than given amount
app.get("/search-destination", async (req, res) => {
    try {
        const result = await TravelBuddy.find({
            destination: req.query.destination,
            budget: { $gt: Number(req.query.budget) }
        });

        console.log("\nSearch result:");
        console.log(result);

        res.json(result);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Search using Buddy ID
app.get("/buddy/:id", async (req, res) => {
    try {
        const result = await TravelBuddy.findOne({
            buddyId: req.params.id
        });

        console.log("\nTravel buddy found:");
        console.log(result);

        res.json(result);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Display only Name, Destination, Budget and Trip Duration
app.get("/details/:id", async (req, res) => {
    try {
        const result = await TravelBuddy.findOne(
            { buddyId: req.params.id },
            {
                _id: 0,
                name: 1,
                destination: 1,
                budget: 1,
                tripDuration: 1
            }
        );

        console.log("\nSelected travel buddy details:");
        console.log(result);

        res.json(result);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Update destination and budget
app.put("/update/:id", async (req, res) => {
    try {
        const result = await TravelBuddy.updateOne(
            { buddyId: req.params.id },
            {
                $set: {
                    destination: req.body.destination,
                    budget: Number(req.body.budget)
                }
            }
        );

        console.log("\nTravel buddy updated:");
        console.log(result);

        res.json(result);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Increase budget for all buddies travelling to a destination
app.put("/increase-budget", async (req, res) => {
    try {
        const result = await TravelBuddy.updateMany(
            { destination: req.body.destination },
            {
                $inc: {
                    budget: Number(req.body.amount)
                }
            }
        );

        console.log("\nBudget increased:");
        console.log(result);

        res.json(result);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Search buddies within budget range
app.get("/budget-range", async (req, res) => {
    try {
        const result = await TravelBuddy.find({
            budget: {
                $gte: Number(req.query.min),
                $lte: Number(req.query.max)
            }
        });

        console.log("\nTravel buddies in budget range:");
        console.log(result);

        res.json(result);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Delete using Buddy ID
app.delete("/delete/:id", async (req, res) => {
    try {
        const result = await TravelBuddy.deleteOne({
            buddyId: req.params.id
        });

        console.log("\nTravel buddy deleted:");
        console.log(result);

        res.json(result);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Display all buddies in descending order of budget
app.get("/all", async (req, res) => {
    try {
        const result = await TravelBuddy.find()
            .sort({ budget: -1 });

        console.log("\nAll travel buddies - descending budget:");
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