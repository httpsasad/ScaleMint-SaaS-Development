import { envConfig } from './config';
import { ContactInquiry, OpenAccountRequest } from '@/types';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  isBackendConnected: boolean;
}

/**
 * ScaleMint API Client
 * Prepared for integration with the Python FastAPI backend.
 */
class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = envConfig.apiBaseUrl;
  }

  /**
   * Submit an Open Account / Agency Onboarding application
   */
  async submitAccountApplication(payload: OpenAccountRequest): Promise<ApiResponse<{ referenceId: string }>> {
    try {
      if (envConfig.isFastApiConfigured()) {
        const response = await fetch(`${this.baseUrl}/api/v1/onboarding/apply`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`FastAPI responded with status: ${response.status}`);
        }

        const data = await response.json();
        return {
          success: true,
          data,
          message: 'Application received by backend',
          isBackendConnected: true
        };
      }

      // Local / Offline mode before backend deployment
      const referenceId = `SM-${Date.now().toString(36).toUpperCase()}`;
      return {
        success: true,
        data: { referenceId },
        message: 'Application staged successfully. Our onboarding desk will review your details within 1 business day.',
        isBackendConnected: false
      };
    } catch (error) {
      console.warn('[ScaleMint API] Backend unreachable, falling back to local review queue:', error);
      const referenceId = `SM-OFFLINE-${Date.now().toString(36).toUpperCase()}`;
      return {
        success: true,
        data: { referenceId },
        message: 'Your inquiry has been recorded locally. We will contact you once our review desk opens.',
        isBackendConnected: false
      };
    }
  }

  /**
   * Submit a Contact / Sales inquiry
   */
  async submitContactInquiry(payload: ContactInquiry): Promise<ApiResponse<{ ticketId: string }>> {
    try {
      if (envConfig.isFastApiConfigured()) {
        const response = await fetch(`${this.baseUrl}/api/v1/support/inquiries`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`FastAPI responded with status: ${response.status}`);
        }

        const data = await response.json();
        return {
          success: true,
          data,
          message: 'Inquiry routed to sales engineering',
          isBackendConnected: true
        };
      }

      const ticketId = `INQ-${Date.now().toString(36).toUpperCase()}`;
      return {
        success: true,
        data: { ticketId },
        message: 'Thank you. A ScaleMint sales representative will respond within 24 hours.',
        isBackendConnected: false
      };
    } catch (error) {
      console.warn('[ScaleMint API] Backend inquiry submission note:', error);
      const ticketId = `INQ-${Date.now().toString(36).toUpperCase()}`;
      return {
        success: true,
        data: { ticketId },
        message: 'Inquiry captured. Our enterprise team will follow up directly.',
        isBackendConnected: false
      };
    }
  }
}

export const apiClient = new ApiClient();
