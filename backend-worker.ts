
/**
 * GIM-CORE OMNICHANNEL BACKEND
 * Deploy this on Cloudflare Workers
 */

// Define D1Database interface for types
interface D1Database {
  prepare(query: string): {
    bind(...args: any[]): {
      run(): Promise<any>;
    };
  };
}

export interface Env {
  DB: D1Database;
  META_VERIFY_TOKEN: string; // توضع في Cloudflare Dashboard -> Settings -> Variables
  META_ACCESS_TOKEN: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // 1. التحقق من Webhook (Meta Verification)
    // هذا الجزء خاص بتفعيل الربط لأول مرة في Meta Developer Portal
    if (request.method === "GET" && url.pathname === "/webhook") {
      const mode = url.searchParams.get("hub.mode");
      const token = url.searchParams.get("hub.verify_token");
      const challenge = url.searchParams.get("hub.challenge");

      if (mode === "subscribe" && token === env.META_VERIFY_TOKEN) {
        return new Response(challenge, { status: 200 });
      }
      return new Response("Forbidden", { status: 403 });
    }

    // 2. استقبال الرسائل (Webhook Entry Point)
    if (request.method === "POST" && url.pathname === "/webhook") {
      const body: any = await request.json();

      // معالجة رسائل واتساب (WhatsApp Business API)
      if (body.object === "whatsapp_business_account") {
        const entry = body.entry?.[0];
        const changes = entry?.changes?.[0]?.value;
        const message = changes?.messages?.[0];
        const contact = changes?.contacts?.[0];

        if (message) {
          await this.saveSocialMessage(env, {
            external_id: message.id,
            sender_name: contact?.profile?.name || "WhatsApp User",
            sender_phone: message.from,
            content: message.text?.body || "[Media/Other]",
            source: "WhatsApp"
          });
        }
      }

      // معالجة رسائل فيسبوك وإنستغرام (Messenger / IG)
      if (body.object === "page" || body.object === "instagram") {
        const messaging = body.entry?.[0]?.messaging?.[0];
        const senderId = messaging?.sender?.id;
        const text = messaging?.message?.text;

        if (text) {
          await this.saveSocialMessage(env, {
            external_id: messaging.message.mid,
            sender_name: `User_${senderId}`,
            sender_phone: senderId,
            content: text,
            source: body.object === "page" ? "Facebook" : "Instagram"
          });
        }
      }

      return new Response("EVENT_RECEIVED", { status: 200 });
    }

    return new Response("Not Found", { status: 404 });
  },

  async saveSocialMessage(env: Env, msg: any) {
    // إدخال الرسالة في قاعدة البيانات D1
    // سيقوم النظام في لوحة التحكم بسحب هذه البيانات وعرضها كـ Leads
    await env.DB.prepare(
      "INSERT INTO social_messages (external_id, sender_name, sender_phone, content, source, status) VALUES (?, ?, ?, ?, ?, 'New')"
    ).bind(msg.external_id, msg.sender_name, msg.sender_phone, msg.content, msg.source).run();
  }
};
