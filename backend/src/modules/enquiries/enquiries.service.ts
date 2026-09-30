import { db } from '../../db/database.js';
import { config } from '../../config/index.js';
import { notificationService } from '../../services/notification/whatsapp.service.js';
import { Enquiry, EnquiryType, EnquiryStatus } from '../../types/index.js';

export interface CreateEnquiryInput {
  propertyId: string;
  buyerName: string;
  phone: string;
  whatsapp?: string;
  enquiryType: EnquiryType;
  visitDate?: string;
  visitTimeSlot?: string;
  notes?: string;
  preferredLanguage?: 'en' | 'te';
}

export class EnquiriesService {
  /**
   * Calculate dynamic lead score (0-100)
   */
  calculateLeadScore(input: CreateEnquiryInput): number {
    let score = 30; // base score

    // Urgency based on intent
    if (input.enquiryType === 'SITE_VISIT') {
      score += 40; // Highest intent
    } else if (input.enquiryType === 'CALL') {
      score += 30;
    } else {
      score += 15;
    }

    // Contact completeness
    if (input.whatsapp && input.whatsapp.length >= 10) {
      score += 15;
    }

    // Detailed notes or specific time slot booked
    if (input.visitTimeSlot || (input.notes && input.notes.length > 20)) {
      score += 15;
    }

    return Math.min(100, Math.max(10, score));
  }

  /**
   * Submit new buyer enquiry, score lead, auto-assign agent, and fire notifications
   */
  async submitEnquiry(input: CreateEnquiryInput): Promise<Enquiry> {
    const property = await db.findPropertyById(input.propertyId);
    if (!property) {
      throw new Error(`Property with id ${input.propertyId} not found`);
    }

    // Auto-assign to an active agent or admin
    const users = await db.listUsers();
    const agents = users.filter((u) => u.isActive && (u.role === 'AGENT' || u.role === 'ADMIN'));
    const assignedAgent = agents.length > 0 ? agents[0] : null;

    const leadScore = this.calculateLeadScore(input);

    const slotTiming =
      input.visitDate && input.visitTimeSlot
        ? `${input.visitDate} • ${input.visitTimeSlot}`
        : input.visitDate || input.visitTimeSlot || undefined;

    const combinedNotes = [
      input.notes,
      slotTiming ? `[Booked Slot Timing: ${slotTiming}]` : '',
    ]
      .filter(Boolean)
      .join(' | ');

    const enquiry = await db.createEnquiry({
      propertyId: input.propertyId,
      buyerName: input.buyerName,
      phone: input.phone,
      whatsapp: input.whatsapp || input.phone,
      enquiryType: input.enquiryType,
      status: input.enquiryType === 'SITE_VISIT' && slotTiming ? 'SITE_VISIT_SCHEDULED' : (assignedAgent ? 'ASSIGNED' : 'NEW'),
      assignedTo: assignedAgent?.id,
      leadScore,
      notes: combinedNotes || undefined,
      preferredLanguage: input.preferredLanguage || 'en',
    });

    const agentName = assignedAgent?.name || 'Suresh Reddy';
    const agentPhone = assignedAgent?.phone || '9876543210';
    const lang = input.preferredLanguage || 'en';
    const baseUrl = config.frontendUrl.replace(/\/$/, '');
    const propertyUrl = `${baseUrl}/${lang}/properties/${property.id}`;
    const dashboardUrl = `${baseUrl}/dashboard/enquiries/${enquiry.id}`;

    // 1. Send WhatsApp notification to buyer
    if (input.enquiryType === 'SITE_VISIT' && slotTiming) {
      const mapLink =
        property.location?.latitude && property.location?.longitude
          ? `https://maps.google.com/?q=${property.location.latitude},${property.location.longitude}`
          : `https://maps.google.com/?q=${encodeURIComponent(`${property.location.village}, ${property.location.mandal}, ${property.location.district}`)}`;

      await notificationService.sendWhatsApp({
        to: enquiry.whatsapp || enquiry.phone,
        template: 'site_visit_slot_booked',
        language: lang,
        variables: {
          buyer_name: enquiry.buyerName,
          property_title: property.titleEn,
          property_ref: property.id.slice(0, 8).toUpperCase(),
          property_url: propertyUrl,
          slot_timing: slotTiming,
          map_link: mapLink,
          agent_name: agentName,
          agent_phone: agentPhone,
        },
      });

      // 2. Send WhatsApp alert to assigned agent / lead team
      const agentRecipient = assignedAgent?.whatsapp || assignedAgent?.phone || '9876543210';
      await notificationService.sendWhatsApp({
        to: agentRecipient,
        template: 'agent_slot_booked_alert',
        language: 'en',
        variables: {
          buyer_name: enquiry.buyerName,
          buyer_phone: enquiry.phone,
          slot_timing: slotTiming,
          property_title: property.titleEn,
          property_url: propertyUrl,
          lead_score: enquiry.leadScore.toString(),
          dashboard_url: dashboardUrl,
        },
      });
    } else {
      await notificationService.sendWhatsApp({
        to: enquiry.whatsapp || enquiry.phone,
        template: 'buyer_enquiry_acknowledgement',
        language: lang,
        variables: {
          buyer_name: enquiry.buyerName,
          property_title: property.titleEn,
          property_ref: property.id.slice(0, 8).toUpperCase(),
          property_url: propertyUrl,
          agent_name: agentName,
          agent_phone: agentPhone,
        },
      });

      // Send WhatsApp alert to assigned agent
      if (assignedAgent) {
        await notificationService.sendWhatsApp({
          to: assignedAgent.whatsapp || assignedAgent.phone,
          template: 'agent_lead_assigned',
          language: 'en',
          variables: {
            buyer_name: enquiry.buyerName,
            buyer_phone: enquiry.phone,
            enquiry_type: enquiry.enquiryType,
            property_title: property.titleEn,
            property_url: propertyUrl,
            location: `${property.location.village}, ${property.location.mandal}`,
            lead_score: enquiry.leadScore.toString(),
            dashboard_url: dashboardUrl,
          },
        });
      }
    }

    return enquiry;
  }

  /**
   * Assign enquiry to agent
   */
  async assignToAgent(enquiryId: string, agentId: string): Promise<Enquiry> {
    const enquiry = await db.findEnquiryById(enquiryId);
    if (!enquiry) {
      throw new Error(`Enquiry ${enquiryId} not found`);
    }

    const agent = await db.findUserById(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    const updated = await db.updateEnquiry(enquiryId, {
      assignedTo: agentId,
      status: enquiry.status === 'NEW' ? 'ASSIGNED' : enquiry.status,
    });

    return updated!;
  }

  /**
   * Update enquiry pipeline status
   */
  async updateStatus(
    enquiryId: string,
    status: EnquiryStatus,
    notes?: string,
    followUpDate?: string
  ): Promise<Enquiry> {
    const enquiry = await db.findEnquiryById(enquiryId);
    if (!enquiry) {
      throw new Error(`Enquiry ${enquiryId} not found`);
    }

    const updated = await db.updateEnquiry(enquiryId, {
      status,
      notes: notes ? `${enquiry.notes || ''}\n[Update]: ${notes}` : enquiry.notes,
      followUpDate: followUpDate || enquiry.followUpDate,
    });

    return updated!;
  }

  /**
   * Schedule site visit and send confirmed notification
   */
  async scheduleSiteVisit(
    enquiryId: string,
    visitDateTime: string,
    meetingPoint?: string
  ): Promise<Enquiry> {
    const enquiry = await db.findEnquiryById(enquiryId);
    if (!enquiry) {
      throw new Error(`Enquiry ${enquiryId} not found`);
    }

    const property = await db.findPropertyById(enquiry.propertyId);
    const agent = enquiry.assignedTo ? await db.findUserById(enquiry.assignedTo) : null;

    const updated = await db.updateEnquiry(enquiryId, {
      status: 'SITE_VISIT_SCHEDULED',
      followUpDate: visitDateTime,
    });

    const mapLink =
      meetingPoint ||
      `https://maps.google.com/?q=${property?.location.latitude || 17.4},${property?.location.longitude || 78.4}`;

    await notificationService.sendWhatsApp({
      to: enquiry.whatsapp || enquiry.phone,
      template: 'site_visit_scheduled',
      language: enquiry.preferredLanguage || 'en',
      variables: {
        buyer_name: enquiry.buyerName,
        property_title: property?.titleEn || 'Property',
        visit_date_time: visitDateTime,
        map_link: mapLink,
        agent_name: agent?.name || 'Assigned Property Advisor',
        agent_phone: agent?.phone || '9876543210',
      },
    });

    return updated!;
  }

  async listEnquiries(filter?: { status?: string; assignedTo?: string; propertyId?: string }): Promise<Enquiry[]> {
    return db.listEnquiries(filter);
  }

  async getEnquiryById(id: string): Promise<Enquiry | null> {
    return db.findEnquiryById(id);
  }
}

export const enquiriesService = new EnquiriesService();
