# Fatima Azhar

Content creation portfolio for Fatima Azhar. React frontend, Express API, MongoDB when it is running, and a local file store when it is not.

## Run

```bash
npm install
npm install --prefix server
npm install --prefix client
npm run dev
```

Open http://localhost:5175

## Vercel

Import the GitHub repo. The build settings are in `vercel.json`. In the Vercel project, add `MONGO_URI` (the Atlas connection string). Add `SMTP_*`, `MAIL_FROM`, `MAIL_TO`, `GHL_*`, and `SLACK_WEBHOOK_URL` when you have them. Do not commit `server/.env`.

The API listens on http://localhost:5001. A meeting is saved locally first, then the same request is sent three ways: a confirmation email to the client, a contact in GoHighLevel, and a message in Slack. Until the values in `server/.env` are filled in, the form still succeeds.

Paste one GoHighLevel option:

- `GHL_WEBHOOK_URL` from a workflow inbound webhook, or
- `GHL_API_KEY` plus `GHL_LOCATION_ID`

Paste the Slack incoming webhook in `SLACK_WEBHOOK_URL`.

For the client email, paste `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and `MAIL_FROM`. `MAIL_TO` is the agency inbox that receives a copy and is used as the reply address.

Restart the server after saving `.env`. `GET /api/health` shows `"email": true`, `"ghl": true`, and `"slack": true` once those values are present.

Photos are from Unsplash and Pexels.
