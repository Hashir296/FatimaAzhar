const nodemailer = require("nodemailer");

const SOURCE = "Fatima Azhar Agency";

function hasGhl() {
  return Boolean(process.env.GHL_WEBHOOK_URL || (process.env.GHL_API_KEY && process.env.GHL_LOCATION_ID));
}

function hasSlack() {
  return Boolean(process.env.SLACK_WEBHOOK_URL);
}

function hasMail() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.MAIL_FROM);
}

function integrationStatus() {
  return {
    ghl: hasGhl(),
    slack: hasSlack(),
    email: hasMail(),
  };
}

let transporter;

function mailer() {
  if (!hasMail()) return null;
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT) || 587;
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

async function postJson(url, body, headers = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", ...headers },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const text = await response.text();
    if (!response.ok) {
      throw new Error(`${response.status} ${text.slice(0, 180)}`);
    }
    return text;
  } finally {
    clearTimeout(timer);
  }
}

async function sendGhl(lead) {
  const tags = Array.isArray(lead.tags) ? lead.tags.filter(Boolean) : [];

  if (process.env.GHL_WEBHOOK_URL) {
    await postJson(process.env.GHL_WEBHOOK_URL, {
      firstName: lead.firstName || "",
      lastName: lead.lastName || "",
      name: [lead.firstName, lead.lastName].filter(Boolean).join(" "),
      email: lead.email,
      source: SOURCE,
      tags,
      social: lead.social || "",
      phone: lead.phone || "",
      interest: lead.interest || lead.service || "",
      service: lead.service || "",
      meetingDate: lead.meetingDate || "",
      meetingTime: lead.meetingTime || "",
      note: lead.note || "",
      type: lead.type,
    });
    return "webhook";
  }

  if (process.env.GHL_API_KEY && process.env.GHL_LOCATION_ID) {
    const payload = {
      locationId: process.env.GHL_LOCATION_ID,
      email: lead.email,
      source: SOURCE,
      tags,
    };
    if (lead.firstName) payload.firstName = lead.firstName;
    if (lead.lastName) payload.lastName = lead.lastName;
    if (lead.phone) payload.phone = lead.phone;

    const headers = {
      Authorization: `Bearer ${process.env.GHL_API_KEY}`,
      Version: "2021-07-28",
    };
    const raw = await postJson("https://services.leadconnectorhq.com/contacts/upsert", payload, headers);
    const contactId = readContactId(raw);
    if (contactId) {
      try {
        await postJson(`https://services.leadconnectorhq.com/contacts/${contactId}/notes`, { body: noteBody(lead) }, headers);
      } catch (err) {
        console.error("GoHighLevel note failed:", err.message);
      }
    }
    return "api";
  }

  return "skipped";
}

async function sendSlack(lead) {
  if (!process.env.SLACK_WEBHOOK_URL) return "skipped";

  const who = [lead.firstName, lead.lastName].filter(Boolean).join(" ") || lead.email;
  const title =
    lead.type === "newsletter" ? "New subscriber" : lead.type === "meeting" ? "New meeting request" : "New lead";
  const when = [lead.meetingDate, lead.meetingTime].filter(Boolean).join(" at ");
  const lines = [
    title,
    who,
    lead.email,
    lead.phone ? `Phone: ${lead.phone}` : "",
    lead.service ? `Service: ${lead.service}` : "",
    when ? `Call: ${when}` : "",
    lead.note ? `Note: ${lead.note}` : "",
    lead.interest && lead.interest !== lead.service ? `Interest: ${lead.interest}` : "",
    lead.social ? `Social: ${lead.social}` : "",
    `Source: ${SOURCE}`,
  ].filter(Boolean);

  await postJson(process.env.SLACK_WEBHOOK_URL, { text: lines.join("\n") });
  return "sent";
}

function readContactId(raw) {
  try {
    const data = JSON.parse(raw);
    return data.contact?.id || data.id || "";
  } catch {
    return "";
  }
}

function whenLabel(lead) {
  return [lead.meetingDate, lead.meetingTime].filter(Boolean).join(" at ");
}

function noteBody(lead) {
  const when = whenLabel(lead);
  return [
    lead.type === "meeting" ? "Meeting request" : lead.type === "newsletter" ? "Newsletter signup" : "Lead",
    lead.service ? `Service: ${lead.service}` : "",
    when ? `Call: ${when}` : "",
    lead.phone ? `Phone: ${lead.phone}` : "",
    lead.note ? `Note: ${lead.note}` : "",
    `Source: ${SOURCE}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function clientMail(lead) {
  const name = lead.firstName || "there";
  if (lead.type === "meeting") {
    const when = whenLabel(lead);
    return {
      subject: "Your call with Fatima Azhar",
      text: [
        `Hi ${name},`,
        "",
        `Your ${lead.service || "agency"} call is requested${when ? ` for ${when}` : ""}.`,
        `We'll confirm this time on ${lead.email}${lead.phone ? ` and on ${lead.phone}` : ""}.`,
        lead.note ? `You wrote: ${lead.note}` : "",
        "",
        "Reply to this email if you need a different time.",
        "",
        "Fatima Azhar Agency",
        "Video editing, ads, and business growth",
      ]
        .filter((line) => line !== "")
        .join("\n"),
    };
  }

  if (lead.type === "newsletter") {
    return {
      subject: "You're on the list — Fatima Azhar",
      text: [
        "Hi,",
        "",
        "You're signed up for follow-ups from Fatima Azhar Agency.",
        "When there's something useful about video editing, ads, or growth, it will come to this inbox.",
        "",
        "Fatima Azhar Agency",
      ].join("\n"),
    };
  }

  return {
    subject: "We received your request — Fatima Azhar",
    text: [
      `Hi ${name},`,
      "",
      "We received your request and will reply on this email.",
      lead.interest ? `You asked about: ${lead.interest}` : "",
      "",
      "Fatima Azhar Agency",
    ]
      .filter(Boolean)
      .join("\n"),
  };
}

async function sendMail(lead) {
  const transport = mailer();
  if (!transport || !lead.email) return "skipped";

  const message = clientMail(lead);
  await transport.sendMail({
    from: process.env.MAIL_FROM,
    to: lead.email,
    replyTo: process.env.MAIL_TO || process.env.MAIL_FROM,
    subject: message.subject,
    text: message.text,
  });

  if (process.env.MAIL_TO && lead.type !== "newsletter") {
    const who = [lead.firstName, lead.lastName].filter(Boolean).join(" ") || lead.email;
    await transport.sendMail({
      from: process.env.MAIL_FROM,
      to: process.env.MAIL_TO,
      replyTo: lead.email,
      subject: lead.type === "meeting" ? `New call: ${who} — ${lead.service || "meeting"}` : `New lead: ${who}`,
      text: [who, lead.email, noteBody(lead)].filter(Boolean).join("\n"),
    });
  }

  return "sent";
}

let announced = false;

async function deliver(lead) {
  const result = { ghl: "skipped", slack: "skipped", email: "skipped" };

  try {
    result.email = await sendMail(lead);
  } catch (err) {
    result.email = "failed";
    console.error("Email delivery failed:", err.message);
  }

  try {
    result.ghl = await sendGhl(lead);
  } catch (err) {
    result.ghl = "failed";
    console.error("GoHighLevel delivery failed:", err.message);
  }

  try {
    result.slack = await sendSlack(lead);
  } catch (err) {
    result.slack = "failed";
    console.error("Slack delivery failed:", err.message);
  }

  if (!announced && (result.ghl === "skipped" || result.slack === "skipped" || result.email === "skipped")) {
    announced = true;
    console.log("Requests are saved locally. Add SMTP, GoHighLevel, and Slack keys in server/.env when you have them.");
  }

  return result;
}

module.exports = { deliver, integrationStatus };
