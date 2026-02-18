const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';

async function initDB() {
  await Listing.deleteMany({});
  const listingsWithOwner = initData.data.map((obj) => ({
    ...obj,
    owner: "6964dcff42b326beff4f19c2",
  }));
  await Listing.insertMany(listingsWithOwner);
  console.log("Data was saved");
}

async function main() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to DB");

    await initDB();

    process.exit(); // script complete hone ke baad exit karo
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

main();
