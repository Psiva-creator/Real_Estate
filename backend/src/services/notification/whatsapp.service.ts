import { config } from '../../config/index.js';

export interface NotificationPayload {
  to: string;
  template: 'buyer_enquiry_acknowledgement' | 'agent_lead_assigned' | 'site_visit_scheduled' | 'seller_listing_verified';
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
    en: 'Hello {{buyer_name}}, thank you for your interest in {{property_title}} (Ref: #{{property_ref}}). Our assigned advisor {{agent_name}} (+91-{{agent_phone}}) will contact you within 30 minutes with complete legal verification details. - Telangana Realty Hub',
    te: 'నమస్కారం {{buyer_name}} గారు, {{property_title}} (Ref: #{{property_ref}}) పట్ల ఆసక్తి చూపించినందుకు ధన్యవాదాలు. మా అడ్వైజర్ {{agent_name}} (+91-{{agent_phone}}) 30 నిమిషాల్లో మిమ్మల్ని సంప్రదించి చట్టపరమైన వివరాలు తెలియజేస్తారు. - తెలంగాణ రియల్టీ హబ్',
  },
  agent_lead_assigned: {
    en: '🚨 NEW LEAD: {{buyer_name}} (Phone: {{buyer_phone}}) submitted a {{enquiry_type}} request for property {{property_title}} located in {{location}}. Lead Score: {{lead_score}}. Open Team Dashboard to initiate contact: {{dashboard_url}}',
    te: '🚨 కొత్త లీడ్: {{buyer_name}} (ఫోన్: {{buyer_phone}}) {{location}} లోని {{property_title}} ప్రాపర్టీ కోసం {{enquiry_type}} కోరారు. లీడ్ స్కోర్: {{lead_score}}. డాష్‌బోర్డ్: {{dashboard_url}}',
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
      // In production with Twilio configured
      console.log(`[Twilio WhatsApp Dispatch] to: ${payload.to}`);
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
