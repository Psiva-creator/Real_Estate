import { config } from '../../config/index.js';

export interface NotificationPayload {
  to: string;
  template:
    | 'buyer_enquiry_acknowledgement'
    | 'agent_lead_assigned'
    | 'site_visit_scheduled'
    | 'seller_listing_verified'
    | 'site_visit_slot_booked'
    | 'agent_slot_booked_alert';
  language?: 'en' | 'te';
  variables: Record<string, string>;
}

export interface DispatchedNotification {
  id: string;
  to: string;
  template: string;
  language: string;
  renderedText: string;
  provider: string;
  status: 'SENT' | 'SIMULATED' | 'FAILED';
  timestamp: string;
}

const TEMPLATES: Record<string, { en: string; te: string }> = {
  buyer_enquiry_acknowledgement: {
    en: 'Hello {{buyer_name}}, thank you for your interest in {{property_title}} (Ref: #{{property_ref}}).\n\n🔗 View Property: {{property_url}}\n\nOur assigned advisor {{agent_name}} (+91-{{agent_phone}}) will contact you within 30 minutes with complete legal verification details. - Telangana Realty Hub',
    te: 'నమస్కారం {{buyer_name}} గారు, {{property_title}} (Ref: #{{property_ref}}) పట్ల ఆసక్తి చూపించినందుకు ధన్యవాదాలు.\n\n🔗 ప్రాపర్టీ వివరాలు: {{property_url}}\n\nమా అడ్వైజర్ {{agent_name}} (+91-{{agent_phone}}) 30 నిమిషాల్లో మిమ్మల్ని సంప్రదించి చట్టపరమైన వివరాలు తెలియజేస్తారు. - తెలంగాణ రియల్టీ హబ్',
  },
  site_visit_slot_booked: {
    en: '🏡 *Site Visit Slot Confirmed!*\n\nHello {{buyer_name}}, your site visit for *{{property_title}}* (Ref: #{{property_ref}}) is confirmed for *{{slot_timing}}*.\n\n🔗 *View Booked Property Page:*\n{{property_url}}\n\n📍 *Site Directions & Map Link:*\n{{map_link}}\n\n👤 *Assigned Field Advisor:* {{agent_name}} (+91-{{agent_phone}})\nPlease carry a valid ID. - Telangana Realty Hub',
    te: '🏡 *సైట్ విజిట్ స్లాట్ బుకింగ్ నిర్ధారించబడింది!*\n\nనమస్కారం {{buyer_name}} గారు, *{{property_title}}* (Ref: #{{property_ref}}) కోసం మీ సైట్ విజిట్ స్లాట్ *{{slot_timing}}* సమయానికి ఖరారైంది.\n\n🔗 *మీరు బుక్ చేసిన ప్రాపర్టీ పేజీని ఇక్కడ చూడండి:*\n{{property_url}}\n\n📍 *సైట్ లొకేషన్ & మ్యాప్ లింక్:*\n{{map_link}}\n\n👤 *ఫీల్డ్ అడ్వైజర్:* {{agent_name}} (+91-{{agent_phone}})\nదయచేసి గుర్తింపు కార్డు వెంట తీసుకురండి. - తెలంగాణ రియల్టీ హబ్',
  },
  agent_lead_assigned: {
    en: '🚨 NEW LEAD: {{buyer_name}} (Phone: {{buyer_phone}}) submitted a {{enquiry_type}} request for property {{property_title}} located in {{location}}. Lead Score: {{lead_score}}. Open Team Dashboard to initiate contact: {{dashboard_url}}',
    te: '🚨 కొత్త లీడ్: {{buyer_name}} (ఫోన్: {{buyer_phone}}) {{location}} లోని {{property_title}} ప్రాపర్టీ కోసం {{enquiry_type}} కోరారు. లీడ్ స్కోర్: {{lead_score}}. డాష్‌బోర్డ్: {{dashboard_url}}',
  },
  agent_slot_booked_alert: {
    en: '🚨 *NEW SITE VISIT SLOT BOOKED*\n\nBuyer: {{buyer_name}} (Phone: {{buyer_phone}})\nProperty: {{property_title}}\nBooked Slot: {{slot_timing}}\nLead Score: {{lead_score}}\n\n🔗 Property: {{property_url}}\n📋 CRM Dashboard: {{dashboard_url}}',
    te: '🚨 *కొత్త సైట్ విజిట్ స్లాట్ బుకింగ్*\n\nకస్టమర్: {{buyer_name}} (ఫోన్: {{buyer_phone}})\nప్రాపర్టీ: {{property_title}}\nస్లాట్ సమయం: {{slot_timing}}\nలీడ్ స్కోర్: {{lead_score}}\n\n🔗 ప్రాపర్టీ: {{property_url}}\n📋 డాష్‌బోర్డ్: {{dashboard_url}}',
  },
  site_visit_scheduled: {
    en: 'Hi {{buyer_name}}, your site visit for {{property_title}} is scheduled for {{visit_date_time}}. Meeting point & coordinates: {{map_link}}. Advisor {{agent_name}} (+91-{{agent_phone}}) will accompany you. Please carry valid ID.',
    te: '{{buyer_name}} గారు, {{property_title}} కోసం మీ సైట్ విజిట్ {{visit_date_time}} సమయానికి నిర్ణయించబడింది. లొకేషన్ వివరాలు: {{map_link}}. మా ప్రతినిధి {{agent_name}} (+91-{{agent_phone}}) మీకు సహాయం చేస్తారు.',
  },
  seller_listing_verified: {
    en: 'Dear {{seller_name}}, all 13 documents for your property {{property_title}} have been verified by our legal team. Your listing is now LIVE to active buyers. Track enquiries on your seller portal: {{seller_portal_url}}',
    te: '{{seller_name}} గారు, మీ ప్రాపర్టీ {{property_title}} కి సంబంధించిన 13 డాక్యుమెంట్ల పరిశీలన పూర్తయింది. మీ లిస్టింగ్ ఇప్పుడు లైవ్‌లోకి వచ్చింది: {{seller_portal_url}}',
  },
};

export class NotificationService {
  private sentHistory: DispatchedNotification[] = [];

  renderTemplate(templateName: string, lang: 'en' | 'te', variables: Record<string, string>): string {
    const tpl = TEMPLATES[templateName]?.[lang] || TEMPLATES[templateName]?.en || '';
    let rendered = tpl;
    for (const [key, value] of Object.entries(variables)) {
      rendered = rendered.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return rendered;
  }

  async sendWhatsApp(payload: NotificationPayload): Promise<DispatchedNotification> {
    const lang = payload.language || 'en';
    const text = this.renderTemplate(payload.template, lang, payload.variables);

    const record: DispatchedNotification = {
      id: `ntf-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      to: payload.to,
      template: payload.template,
      language: lang,
      renderedText: text,
      provider: config.notificationProvider,
      status: config.notificationProvider === 'mock' ? 'SIMULATED' : 'SENT',
      timestamp: new Date().toISOString(),
    };

    if (config.notificationProvider === 'mock') {
      console.log(`[WhatsApp Mock Dispatch] to: ${payload.to} | text: "${text}"`);
    } else if (config.notificationProvider === 'twilio') {
      if (!config.twilioAccountSid || !config.twilioAuthToken) {
        console.warn(`[Twilio WhatsApp Dispatch] Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN; falling back to simulated dispatch for ${payload.to}`);
        record.status = 'SIMULATED';
      } else {
        try {
          const toFormatted = payload.to.startsWith('whatsapp:') ? payload.to : `whatsapp:${payload.to}`;
          const fromFormatted = config.twilioWhatsAppNumber.startsWith('whatsapp:')
            ? config.twilioWhatsAppNumber
            : `whatsapp:${config.twilioWhatsAppNumber}`;

          const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${config.twilioAccountSid}/Messages.json`;
          const authHeader = 'Basic ' + Buffer.from(`${config.twilioAccountSid}:${config.twilioAuthToken}`).toString('base64');
          const bodyParams = new URLSearchParams({
            To: toFormatted,
            From: fromFormatted,
            Body: text,
          });

          const resp = await fetch(twilioUrl, {
            method: 'POST',
            headers: {
              'Authorization': authHeader,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: bodyParams.toString(),
          });

          if (!resp.ok) {
            const errBody = await resp.text();
            console.error(`[Twilio WhatsApp Dispatch Error] HTTP ${resp.status}: ${errBody}`);
            record.status = 'FAILED';
          } else {
            const data = await resp.json();
            console.log(`[Twilio WhatsApp Dispatched] SID: ${(data as any).sid} to: ${payload.to}`);
            record.status = 'SENT';
          }
        } catch (err: any) {
          console.error(`[Twilio WhatsApp Dispatch Exception] ${err?.message || err}`);
          record.status = 'FAILED';
        }
      }
    } else if (config.notificationProvider === 'wati') {
      if (!config.watiApiEndpoint || !config.watiAccessToken) {
        console.warn(`[WATI WhatsApp Dispatch] Missing WATI_API_ENDPOINT or WATI_ACCESS_TOKEN; falling back to simulated dispatch for ${payload.to}`);
        record.status = 'SIMULATED';
      } else {
        try {
          const cleanPhone = payload.to.replace(/^whatsapp:/, '').replace(/[^0-9]/g, '');
          const watiUrl = `${config.watiApiEndpoint.replace(/\/$/, '')}/api/v1/sendSessionMessage/${cleanPhone}?messageText=${encodeURIComponent(text)}`;

          const resp = await fetch(watiUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${config.watiAccessToken}`,
              'Content-Type': 'application/json',
            },
          });

          if (!resp.ok) {
            const errBody = await resp.text();
            console.error(`[WATI WhatsApp Dispatch Error] HTTP ${resp.status}: ${errBody}`);
            record.status = 'FAILED';
          } else {
            console.log(`[WATI WhatsApp Dispatched] to: ${payload.to}`);
            record.status = 'SENT';
          }
        } catch (err: any) {
          console.error(`[WATI WhatsApp Dispatch Exception] ${err?.message || err}`);
          record.status = 'FAILED';
        }
      }
    }

    this.sentHistory.push(record);
    return record;
  }

  getNotificationHistory(): DispatchedNotification[] {
    return [...this.sentHistory];
  }

  clearHistory(): void {
    this.sentHistory = [];
  }
}

export const notificationService = new NotificationService();
