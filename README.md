# Applied AI Scheduler

Two Claude Skills — **Scheduler** and **Ping** — wired together with a Vercel cron job that POSTs to a webhook every day at midnight UTC.

* **Live Vercel URL:** https://ai-scheduler-nu.vercel.app  
* **Manual Trigger:** https://ai-scheduler-nu.vercel.app/api/cron  
* **Webhook Target:** https://webhook.site/0120f7d4-1fe2-4665-9449-c18cda53c93b

---

## 📂 Repository Structure

```text
├── scheduler/SKILL.md   # Manages cron jobs across different Skills
├── ping/SKILL.md        # POSTs a payload (name + timestamp) to a webhook
├── api/cron.js          # Vercel serverless function (the cron handler)
├── vercel.json          # Vercel cron config (runs daily)
└── index.html           # Simple landing page
```

---

## 🚀 Setup

1. Install the [Vercel CLI](https://vercel.com/docs/cli): `npm i -g vercel`
2. Link and deploy your project:
   ```bash
   vercel link
   vercel deploy --prod
   ```
3. To test immediately without waiting for midnight, run:
   ```bash
   curl -s https://ai-scheduler-nu.vercel.app/api/cron
   ```

---

## 🧠 Design Decisions

* **Scheduler is a pure orchestrator:** The Scheduler only manages jobs (`create`, `pause`, `delete`, etc.). It never does the actual work. You can add new Skills without changing the Scheduler at all.
* **Ping uses standard HTTP:** Instead of a custom `send_ping` tool, the Ping Skill uses a generic `http_request` tool. This works out-of-the-box with most MCP servers.
* **Dual-mode Skills:** Every Skill knows its context. If a human is present (Interactive), it asks for missing fields. If triggered by a cron job (Automated), it executes immediately without asking.
* **Structured Output:** In automated mode, Skills return pure JSON. This allows the Scheduler to pass data from one Skill directly into another.
* **Simple & Serverless:** The backend is a single, zero-dependency vanilla JavaScript file (`api/cron.js`). No build steps, no frameworks, no headaches.
* **Strict Guardrails:** The Ping Skill enforces HTTPS and a strict payload schema. The Scheduler requires explicit confirmation before deleting a job.

---

## 🔗 Composability

Here is how the Scheduler could compose with other tools like **HubSpot** and **Slack**:

1. **Friday Pipeline Digest:** Every Friday, the HubSpot Skill pulls updated deals. The Scheduler pipes that data into the Slack Skill, which posts a summary to `#sales`.
2. **Stale Deal Nudge:** The HubSpot Skill finds deals stuck for 14+ days. The Scheduler tells the Slack Skill to DM the owner of each deal.
3. **Health Ping Alerts:** The Ping Skill hits an internal server. If it fails, the Scheduler tells the Slack Skill to alert the `#on-call` channel.

### 3 Rules for Universal Skill Compatibility
To ensure any Skill works seamlessly in both Claude.ai (interactive) and the Scheduler (automated) without modification, they must follow three rules:

1. **Dual-Mode Behavior:** The Skill must define two separate paths: one that prompts humans for missing info, and one that reads strictly from predefined parameters.
2. **Strict Parameter Contracts:** Every Skill must define its required parameters clearly in a table. The Scheduler's `create_job` tool relies on this strict schema to know exactly what data to collect upfront.
3. **JSON Output for Chaining:** When running automatically, Skills must return structured JSON (`{ "status": "success", "data": ... }`). Text responses break automations; JSON allows data to be passed between Skills effortlessly.
