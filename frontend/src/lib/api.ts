import { MockProperty, MOCK_PROPERTIES } from './mockData';

export type EnquiryType = 'SITE_VISIT' | 'CALL' | 'QUESTION';

export interface CreateEnquiryDTO {
  propertyId: string;
  propertyTitle: string;
  buyerName: string;
  phone: string;
  enquiryType: EnquiryType;
  preferredDate?: string;
  preferredTime?: string;
  callingWindow?: string;
  message?: string;
}

export interface EnquirySubmissionResult {
  success: boolean;
  referenceId: string;
  message?: string;
  timestamp: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

/**
 * Fetch property details by ID.
 * Uses real API when available and falls back gracefully to mockData.
 */
export async function getPropertyById(id: string): Promise<MockProperty | null> {
  if (API_BASE_URL && !API_BASE_URL.includes('localhost:4000')) {
    try {
      const res = await fetch(`${API_BASE_URL}/properties/${id}`, {
        headers: { 'Content-Type': 'application/json' },
        next: { revalidate: 60 },
      });
      if (res.ok) {
        return (await res.json()) as MockProperty;
      }
    } catch {
      // Fallback silently to mock data
    }
  }

  // Resilient mock fallback
  const found = MOCK_PROPERTIES.find((p) => p.id === id);
  return found || null;
}

/**
 * Submit a buyer enquiry (Site Visit, Callback, or Question).
 * Uses real API when available and provides a realistic local mock fallback.
 */
export async function submitEnquiry(data: CreateEnquiryDTO): Promise<EnquirySubmissionResult> {
  if (API_BASE_URL && !API_BASE_URL.includes('localhost:4000')) {
    try {
      const res = await fetch(`${API_BASE_URL}/enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        return (await res.json()) as EnquirySubmissionResult;
      }
    } catch {
      // Fallback silently to mock processing
    }
  }

  // Realistic simulated network latency
  await new Promise((resolve) => setTimeout(resolve, 350));

  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  const referenceId = `ENQ-HYD-${randomDigits}`;

  // Persist to browser localStorage for demo pipeline inspection if available
  if (typeof window !== 'undefined') {
    try {
      const existing = JSON.parse(localStorage.getItem('trh_mock_enquiries') || '[]');
      existing.unshift({
        id: referenceId,
        ...data,
        status: 'NEW',
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('trh_mock_enquiries', JSON.stringify(existing.slice(0, 50)));
    } catch {
      // Non-critical storage error
    }
  }

  return {
    success: true,
    referenceId,
    timestamp: new Date().toISOString(),
    message: 'Enquiry successfully registered with mediation desk.',
  };
}
