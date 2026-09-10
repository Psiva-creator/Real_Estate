import { Request, Response } from 'express';
import { AuthRequest } from '../../middleware/auth.js';
import { enquiriesService } from './enquiries.service.js';

export class EnquiriesController {
  /**
   * Submit enquiry (Public endpoint for buyers: Call, Visit, Question)
   */
  async submitEnquiry(req: Request, res: Response) {
    try {
      const { propertyId, buyerName, phone, whatsapp, enquiryType, notes, preferredLanguage } = req.body;

      if (!propertyId || !buyerName || !phone) {
        return res.status(400).json({ error: 'propertyId, buyerName, and phone are required' });
      }

      if (enquiryType && !['CALL', 'SITE_VISIT', 'QUESTION'].includes(enquiryType)) {
        return res.status(400).json({ error: 'enquiryType must be CALL, SITE_VISIT, or QUESTION' });
      }

      const enquiry = await enquiriesService.submitEnquiry({
        propertyId,
        buyerName,
        phone,
        whatsapp,
        enquiryType: enquiryType || 'CALL',
        notes,
        preferredLanguage: preferredLanguage || 'en',
      });

      return res.status(201).json({
        message: 'Enquiry submitted successfully. Our brokerage team has received your request and dispatched an advisor.',
        enquiry,
      });
    } catch (err) {
      return res.status(400).json({ error: (err as Error).message });
    }
  }

  /**
   * List enquiries (Team back-office endpoint)
   */
  async listEnquiries(req: AuthRequest, res: Response) {
    try {
      const { status, assignedTo, propertyId } = req.query;
      const enquiries = await enquiriesService.listEnquiries({
        status: status as string,
        assignedTo: assignedTo as string,
        propertyId: propertyId as string,
      });
      return res.json({ enquiries, count: enquiries.length });
    } catch (err) {
      return res.status(500).json({ error: (err as Error).message });
    }
  }

  /**
   * Get single enquiry
   */
  async getEnquiry(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const enquiry = await enquiriesService.getEnquiryById(id);
      if (!enquiry) {
        return res.status(404).json({ error: 'Enquiry not found' });
      }
      return res.json({ enquiry });
    } catch (err) {
      return res.status(500).json({ error: (err as Error).message });
    }
  }

  /**
   * Assign enquiry to agent
   */
  async assignEnquiry(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { agentId } = req.body;

      if (!agentId) {
        return res.status(400).json({ error: 'agentId is required' });
      }

      const updated = await enquiriesService.assignToAgent(id, agentId);
      return res.json({ message: 'Enquiry assigned successfully', enquiry: updated });
    } catch (err) {
      return res.status(400).json({ error: (err as Error).message });
    }
  }

  /**
   * Update enquiry pipeline status
   */
  async updateStatus(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status, notes, followUpDate } = req.body;

      const validStatuses = [
        'NEW',
        'ASSIGNED',
        'CONTACTED',
        'SITE_VISIT_SCHEDULED',
        'IN_NEGOTIATION',
        'DEAL_CLOSED',
        'DROPPED',
      ];

      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        });
      }

      const updated = await enquiriesService.updateStatus(id, status, notes, followUpDate);
      return res.json({ message: 'Enquiry status updated', enquiry: updated });
    } catch (err) {
      return res.status(400).json({ error: (err as Error).message });
    }
  }

  /**
   * Schedule site visit
   */
  async scheduleSiteVisit(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { visitDateTime, meetingPoint } = req.body;

      if (!visitDateTime) {
        return res.status(400).json({ error: 'visitDateTime is required' });
      }

      const updated = await enquiriesService.scheduleSiteVisit(id, visitDateTime, meetingPoint);
      return res.json({
        message: 'Site visit scheduled and confirmed via WhatsApp to buyer and assigned agent',
        enquiry: updated,
      });
    } catch (err) {
      return res.status(400).json({ error: (err as Error).message });
    }
  }
}

export const enquiriesController = new EnquiriesController();
