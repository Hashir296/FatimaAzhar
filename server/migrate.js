const dns = require("dns");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

require("dotenv").config({ path: path.join(__dirname, ".env") });

const DATA_FILE = path.join(__dirname, "data", "submissions.json");

function readStore() {
  const parsed = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  return {
    leads: Array.isArray(parsed.leads) ? parsed.leads : [],
    subscribers: Array.isArray(parsed.subscribers) ? parsed.subscribers : [],
    meetings: Array.isArray(parsed.meetings) ? parsed.meetings : [],
  };
}

function withDate(item) {
  const next = { ...item };
  if (next.createdAt) next.createdAt = new Date(next.createdAt);
  delete next._id;
  return next;
}

async function replaceCollection(name, docs) {
  const collection = mongoose.connection.collection(name);
  await collection.deleteMany({});
  if (!docs.length) return 0;
  const result = await collection.insertMany(docs.map(withDate));
  return result.insertedCount;
}

async function main() {
  const uri = process.env.MONGO_URI || "";
  if (!uri.startsWith("mongodb+srv://")) {
    throw new Error("MONGO_URI in server/.env must be the Atlas connection string.");
  }

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
  const store = readStore();
  const leads = await replaceCollection("leads", store.leads);
  const subscribers = await replaceCollection("subscribers", store.subscribers);
  const meetings = await replaceCollection("meetings", store.meetings);

  console.log(`Migrated to ${mongoose.connection.host} / ${mongoose.connection.name}`);
  console.log(`leads: ${leads}, subscribers: ${subscribers}, meetings: ${meetings}`);
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
