import { db } from '../../db/database.js';
import { Owner, Property, User, DocumentType, PropertyDocument, BuyerFacingAdminDetails } from '../../types/index.js';
import { ALL_13_DOCS, MANDATORY_DOCS } from '../../middleware/security.js';
import { normalizePhoneNumber } from '../auth/auth.service.js';

export interface SellerPropertyWithVerification extends Omit<Property, 'discrepancyNotes' | 'adminDetails'> {
  adminDetails?: BuyerFacingAdminDetails | null;
  verificationStatus: {
    totalDocuments: number;
    verifiedDocuments: number;
    rejectedDocuments: number;
    uploadedDocuments: number;
    isFullyVerified: boolean;
    reviewStatus: 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';
    documentsChecklist: Array<{
      documentType: DocumentType;
      status: string;
      isVerified: boolean;
      hasFile: boolean;
      rejectionReason?: string;
      verifiedAt?: string;
      updatedAt?: string;
    }>;
  };
}

export class OwnersService {
  async getOwnerById(id: string): Promise<Owner | null> {
    return db.findOwnerById(id);
  }

  async getOwnerByUserId(userId: string): Promise<Owner | null> {
    return db.findOwnerByUserId(userId);
  }

  async resolveSellerOwner(user: User): Promise<Owner | null> {
    let owner = await db.findOwnerByUserId(user.id);
    if (!owner && user.phone) {
      owner = await db.findOwnerByPhone(user.phone);
    }
    if (!owner && user.email) {
      owner = await db.findOwnerByEmail(user.email);
    }
    if (owner && !owner.userId) {
      try {
        owner = await db.updateOwner(owner.id, { userId: user.id });
      } catch {
        // Ignore if update fails
      }
    }
    if (!owner && user.role === 'SELLER') {
      owner = await db.createOwner({
        userId: user.id,
        name: user.name,
        phone: user.phone,
        whatsapp: user.whatsapp || user.phone,
        email: user.email,
        propertiesCount: 0,
        dealsCompleted: 0,
        rating: 5.0,
      });
    }
    return owner;
  }

  async getOwnerProperties(ownerId: string, user?: User): Promise<SellerPropertyWithVerification[]> {
    const ownerIds = new Set<string>([ownerId]);

    if (user) {
      const allOwners = await db.listOwners();
      const normalizedUserPhone = user.phone ? normalizePhoneNumber(user.phone) : '';
      for (const o of allOwners) {
        if (o.userId && o.userId === user.id) {
          ownerIds.add(o.id);
        } else if (
          normalizedUserPhone &&
          o.phone &&
          normalizePhoneNumber(o.phone) === normalizedUserPhone
        ) {
          ownerIds.add(o.id);
        }
      }
    }

    const all = await db.listAllProperties();
    const sellerProps = all.filter((p) => ownerIds.has(p.sellerId));

    const enriched: SellerPropertyWithVerification[] = await Promise.all(
      sellerProps.map(async (p) => {
        const docs = await db.findDocumentsByPropertyId(p.id);
        const docMap = new Map<DocumentType, PropertyDocument>();
        for (const d of docs) {
          docMap.set(d.documentType, d);
        }

        const documentsChecklist = ALL_13_DOCS.map((docType) => {
          const doc = docMap.get(docType);
          const hasFile = Boolean(doc?.fileUrl && doc.fileUrl.trim() !== '');
          const rawStatus = doc?.status || 'PENDING';
          const effectiveStatus = rawStatus === 'PENDING' && hasFile ? 'UPLOADED' : rawStatus;
          const isVerified = effectiveStatus === 'VERIFIED';
          const isRejected = effectiveStatus === 'REJECTED';

          return {
            documentType: docType,
            status: effectiveStatus,
            isVerified,
            hasFile,
            rejectionReason: isRejected && doc?.rejectionReason ? doc.rejectionReason : undefined,
            verifiedAt: isVerified ? doc?.verifiedAt : undefined,
            updatedAt: doc?.updatedAt,
          };
        });

        const verifiedDocuments = documentsChecklist.filter((d) => d.status === 'VERIFIED').length;
        const rejectedDocuments = documentsChecklist.filter((d) => d.status === 'REJECTED').length;
        const uploadedDocuments = documentsChecklist.filter(
          (d) => d.status === 'UPLOADED' || d.status === 'VERIFIED'
        ).length;

        const mandatory = MANDATORY_DOCS[p.type] || [];
        const allMandatoryVerified =
          mandatory.length > 0 &&
          mandatory.every((reqType) => docMap.get(reqType)?.status === 'VERIFIED');
        const isFullyVerified =
          rejectedDocuments === 0 &&
          (allMandatoryVerified ||
            verifiedDocuments >= 13 ||
            p.status === 'VERIFIED' ||
            p.status === 'LIVE');

        const reviewStatus: 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' =
          rejectedDocuments > 0
            ? 'REJECTED'
            : isFullyVerified
            ? 'VERIFIED'
            : 'UNDER_REVIEW';

        // Strip internal staff notes (discrepancyNotes & adminDetails.internalNotes) so confidential staff notes are never exposed to seller
        const {
          discrepancyNotes: _discrepancyNotes,
          adminDetails: rawAdminDetails,
          ...sellerSafeProperty
        } = p;

        let safeAdminDetails: BuyerFacingAdminDetails | undefined = undefined;
        if (rawAdminDetails && typeof rawAdminDetails === 'object') {
          const { internalNotes: _internalNotes, ...restAdminDetails } = rawAdminDetails;
          safeAdminDetails = restAdminDetails;
        }

        return {
          ...sellerSafeProperty,
          ...(safeAdminDetails !== undefined ? { adminDetails: safeAdminDetails } : {}),
          verificationStatus: {
            totalDocuments: 13,
            verifiedDocuments,
            rejectedDocuments,
            uploadedDocuments,
            isFullyVerified,
            reviewStatus,
            documentsChecklist,
          },
        };
      })
    );

    return enriched;
  }

  async listAllOwners(): Promise<Owner[]> {
    return db.listOwners();
  }
}

export const ownersService = new OwnersService();
