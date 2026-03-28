
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, "webhook_data.json");

// Load initial data from file if exists
let pendingLeads: any[] = [];
let webhookLogs: any[] = [];

try {
  if (fs.existsSync(DATA_FILE)) {
    const savedData = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    pendingLeads = savedData.pendingLeads || [];
    webhookLogs = savedData.webhookLogs || [];
    console.log("Loaded persisted webhook data.");
  }
} catch (e) {
  console.error("Failed to load persisted data:", e);
}

const savePersistedData = () => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ pendingLeads, webhookLogs }, null, 2));
  } catch (e) {
    console.error("Failed to save persisted data:", e);
  }
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // --- TEST ENDPOINT ---
  app.get("/api/webhooks/test", (req, res) => {
    res.json({ status: "Server is Ready", timestamp: new Date().toISOString() });
  });

  // --- WEBHOOK ENDPOINT (SCENARIO) ---
  // This is the URL the user would put in Google Forms / Typeform
  app.get("/api/webhooks/external-form", (req, res) => {
    res.send("<h1>GIM-OS Webhook is Active</h1><p>Please use <b>POST</b> method to send data from Google Forms.</p>");
  });

  app.post("/api/webhooks/external-form", (req, res) => {
    console.log("Webhook received request body:", JSON.stringify(req.body, null, 2));
    
    // Log EVERY attempt immediately
    webhookLogs.unshift({
      timestamp: new Date().toISOString(),
      status: "RECEIVED",
      payload: req.body
    });
    if (webhookLogs.length > 20) webhookLogs.pop();
    savePersistedData();

    // Support both the previous field names and the ones from the user's script
    let data = req.body;
    
    // Handle case where body might be a string (sometimes happens with certain content-types)
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) {
        console.error("Failed to parse string body:", data);
      }
    }
    
    // Helper to extract value from potentially nested Google Forms data
    const extract = (val: any) => {
      if (Array.isArray(val)) return val[0] || "";
      return val || "";
    };
    
    // Arabic field mapping for Google Forms (Resilient to Arrays)
    const name = extract(data.name || data["الاسم الكامل"] || data["الاسم"] || data.company || data["اسم الشركة"] || data["manager"]) || "Unknown Customer";
    const phone = extract(data.phone || data["رقم الهاتف"] || data["الهاتف"] || data["الجوال"]) || "0000000000";
    const email = extract(data.email || data["البريد الإلكتروني"]);
    const interest = extract(data.interest || data.service || data["الخدمة المطلوبة"] || data["الخدمة"]) || "General Inquiry";
    const source = extract(data.source) || "Google Form";
    const clientType = extract(data.clientType) || (data.type === "شركة" || data.company || data["اسم الشركة"] ? "Company" : "Individual");
    const managerName = extract(data.managerName || data.manager);
    const serviceSize = extract(data.serviceSize || data.size) || "صغير";
    const description = extract(data.description || data["وصف الطلب"]);
    const city = extract(data.city || data["المدينة"]);
    
    webhookLogs[0].payload = { name, phone, interest, source, raw: data };
    webhookLogs[0].status = "SUCCESS";

    const newLead = {
      id: crypto.randomUUID(),
      companyId: "GIM-GLOBAL",
      deviceId: "EXTERNAL-WEBHOOK",
      syncStatus: "synced",
      version: 1,
      name,
      phone,
      email,
      interest,
      source,
      clientType,
      managerName,
      serviceSize,
      description,
      city,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "New",
      priority: "NORMAL",
      category: "General",
      notes: [],
      conversionProbability: 50
    };

    pendingLeads.push(newLead);
    savePersistedData();
    console.log("Successfully added new lead to pending list. Total pending:", pendingLeads.length);
    
    res.json({ success: true, message: "Lead received successfully", id: newLead.id });
  });

  app.get("/api/webhooks/logs", (req, res) => {
    res.json(webhookLogs);
  });

  app.delete("/api/webhooks/logs", (req, res) => {
    webhookLogs = [];
    savePersistedData();
    res.json({ success: true });
  });

  // --- SYNC ENDPOINT FOR CLIENT ---
  app.get("/api/webhooks/pending", (req, res) => {
    res.json(pendingLeads);
  });

  app.delete("/api/webhooks/pending", (req, res) => {
    pendingLeads = [];
    savePersistedData();
    res.json({ success: true });
  });

  app.delete("/api/webhooks/pending/:id", (req, res) => {
    const { id } = req.params;
    pendingLeads = pendingLeads.filter(l => l.id !== id);
    savePersistedData();
    res.json({ success: true });
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
