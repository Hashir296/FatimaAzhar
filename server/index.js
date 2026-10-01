const dns = require("dns");
const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

require("dotenv").config({ path: path.join(__dirname, ".env") });

const PORT = Number(process.env.PORT) || 5001;
const DATA_FILE = path.join(__dirname, "data", "submissions.json");

mongoose.set("bufferCommands", false);

const app = express();
app.use(cors());
app.use(express.json({ limit: "100kb" }));

const leadSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    social: { type: String, default: "", trim: true },
    interest: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

const subscriberSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true },
  },
  { timestamps: true }
);

leadSchema.add({ delivery: { type: mongoose.Schema.Types.Mixed } });
subscriberSchema.add({ delivery: { type: mongoose.Schema.Types.Mixed } });

const meetingSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    service: { type: String, required: true, trim: true },
    meetingDate: { type: String, required: true, trim: true },
    meetingTime: { type: String, required: true, trim: true },
    note: { type: String, default: "", trim: true },
    delivery: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

const Lead = mongoose.model("Lead", leadSchema);
const Subscriber = mongoose.model("Subscriber", subscriberSchema);
const Meeting = mongoose.model("Meeting", meetingSchema);
const { deliver, integrationStatus } = require("./integrations/deliver");

let mongoReady = false;

function emptyStore() {
  return { leads: [], subscribers: [], meetings: [] };
}

function readStore() {
  try {
    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    return {
      leads: Array.isArray(parsed.leads) ? parsed.leads : [],
      subscribers: Array.isArray(parsed.subscribers) ? parsed.subscribers : [],
      meetings: Array.isArray(parsed.meetings) ? parsed.meetings : [],
    };
  } catch {
    return emptyStore();
  }
}

function writeStore(store) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function clean(value, max) {
  return String(value || "").trim().slice(0, max);
}

async function saveLead(lead) {
  if (mongoReady) {
    try {
      await Lead.create(lead);
      return;
    } catch (err) {
      console.error("Mongo lead save failed:", err.message);
    }
  }
  const store = readStore();
  store.leads.push({ ...lead, createdAt: new Date().toISOString() });
  writeStore(store);
}

const SERVICES = ["Video Editing", "Ads", "Business Growth"];
const TIMES = ["10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"];

function todayStamp() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

async function saveMeeting(entry) {
  if (mongoReady) {
    try {
      await Meeting.create(entry);
      return;
    } catch (err) {
      console.error("Mongo meeting save failed:", err.message);
    }
  }
  const store = readStore();
  store.meetings.push({ ...entry, createdAt: new Date().toISOString() });
  writeStore(store);
}

async function saveSubscriber(entry) {
  if (mongoReady) {
    try {
      await Subscriber.create(entry);
      return;
    } catch (err) {
      console.error("Mongo subscriber save failed:", err.message);
    }
  }
  const store = readStore();
  store.subscribers.push({ ...entry, createdAt: new Date().toISOString() });
  writeStore(store);
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    storage: mongoReady ? "mongo" : "file",
    integrations: integrationStatus(),
  });
});

app.post("/api/leads", async (req, res) => {
  try {
    const firstName = clean(req.body.firstName, 60);
    const lastName = clean(req.body.lastName, 60);
    const email = clean(req.body.email, 120).toLowerCase();
    const social = clean(req.body.social, 80);
    const interest = clean(req.body.interest, 80);

    if (!firstName || !lastName) {
      return res.status(400).json({ ok: false, message: "Please enter your first and last name." });
    }
    if (!isEmail(email)) {
      return res.status(400).json({ ok: false, message: "Please enter a valid email address." });
    }

    const delivery = await deliver({
      type: "lead",
      firstName,
      lastName,
      email,
      social,
      interest,
      tags: ["portfolio-lead", "content-creation", interest].filter(Boolean),
    });
    await saveLead({ firstName, lastName, email, social, interest, delivery });
    return res.json({ ok: true, message: "You're in. Your content series link is on its way." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: "Something went wrong. Please try again." });
  }
});

app.post("/api/meetings", async (req, res) => {
  try {
    const firstName = clean(req.body.firstName, 60);
    const lastName = clean(req.body.lastName, 60);
    const email = clean(req.body.email, 120).toLowerCase();
    const phone = clean(req.body.phone, 30);
    const service = clean(req.body.service, 40);
    const meetingDate = clean(req.body.meetingDate, 10);
    const meetingTime = clean(req.body.meetingTime, 5);
    const note = clean(req.body.note, 400);

    if (!firstName || !lastName) {
      return res.status(400).json({ ok: false, message: "Please enter your first and last name." });
    }
    if (!isEmail(email)) {
      return res.status(400).json({ ok: false, message: "Please enter a valid email address." });
    }
    if (phone.replace(/\D/g, "").length < 7) {
      return res.status(400).json({ ok: false, message: "Please enter a phone number we can call." });
    }
    if (!SERVICES.includes(service)) {
      return res.status(400).json({ ok: false, message: "Please choose a service." });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(meetingDate) || meetingDate < todayStamp()) {
      return res.status(400).json({ ok: false, message: "Please choose a meeting date from today onward." });
    }
    if (!TIMES.includes(meetingTime)) {
      return res.status(400).json({ ok: false, message: "Please choose a meeting time." });
    }

    const delivery = await deliver({
      type: "meeting",
      firstName,
      lastName,
      email,
      phone,
      service,
      interest: service,
      meetingDate,
      meetingTime,
      note,
      tags: ["meeting", "agency", service],
    });
    await saveMeeting({ firstName, lastName, email, phone, service, meetingDate, meetingTime, note, delivery });
    const mailed = delivery.email === "sent";
    return res.json({
      ok: true,
      delivery,
      message: mailed
        ? "Your meeting is saved and a confirmation email is on its way."
        : "Your meeting request is saved. The agency will confirm this call.",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: "Something went wrong. Please try again." });
  }
});

app.post("/api/subscribe", async (req, res) => {
  try {
    const email = clean(req.body.email, 120).toLowerCase();
    if (!isEmail(email)) {
      return res.status(400).json({ ok: false, message: "Please enter a valid email address." });
    }
    const delivery = await deliver({
      type: "newsletter",
      email,
      tags: ["newsletter", "content-creation"],
    });
    await saveSubscriber({ email, delivery });
    const mailed = delivery.email === "sent";
    return res.json({
      ok: true,
      delivery,
      message: mailed
        ? "You're subscribed. A confirmation email is on its way."
        : "You're subscribed. We'll follow up on this email.",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: "Something went wrong. Please try again." });
  }
});

app.use("/api", (_req, res) => {
  res.status(404).json({ ok: false, message: "Not found." });
});

const dist = path.join(__dirname, "..", "client", "dist");
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(dist, "index.html"));
  });
}

app.use((err, _req, res, _next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ ok: false, message: "Invalid request." });
  }
  console.error(err);
  return res.status(500).json({ ok: false, message: "Something went wrong. Please try again." });
});

async function start() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/fatima_azhar";
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
    mongoReady = true;
    console.log("MongoDB connected:", mongoose.connection.host);
  } catch {
    mongoReady = false;
    await mongoose.disconnect().catch(() => {});
    console.log("MongoDB not available. Submissions will be saved to server/data/submissions.json");
  }

  const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
  server.on("error", (err) => {
    console.error(err.message);
    process.exit(1);
  });
}

start();
