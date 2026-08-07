/**
 * Query parameters sent by Meta WhatsApp Cloud API for GET Webhook Verification.
 * Reference: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/components#verification-requests
 */
export interface WhatsAppWebhookVerificationQuery {
  'hub.mode'?: string;
  'hub.verify_token'?: string;
  'hub.challenge'?: string;
}

/**
 * Valid WhatsApp Cloud API message status types.
 */
export type WhatsAppStatusType = 'sent' | 'delivered' | 'read' | 'failed';

/**
 * Error detail object contained in Meta WhatsApp Webhook payloads.
 */
export interface WhatsAppWebhookError {
  code: number;
  title: string;
  message?: string;
  error_data?: {
    details?: string;
  };
}

/**
 * Metadata identifying the phone number receiving the event.
 */
export interface WhatsAppWebhookMetadata {
  display_phone_number: string;
  phone_number_id: string;
}

/**
 * Contact details for incoming messages.
 */
export interface WhatsAppWebhookContact {
  wa_id: string;
  profile: {
    name: string;
  };
}

/**
 * Status event object (sent, delivered, read, failed) sent by Meta WhatsApp Cloud API.
 */
export interface WhatsAppWebhookStatus {
  id: string; // WAMID (WhatsApp Message ID)
  status: WhatsAppStatusType;
  timestamp: string;
  recipient_id: string; // Recipient phone number
  conversation?: {
    id: string;
    expiration_timestamp?: string;
    origin?: {
      type: string;
    };
  };
  pricing?: {
    billable: boolean;
    pricing_model: string;
    category: string;
  };
  errors?: WhatsAppWebhookError[];
}

/**
 * Incoming message object (text, button, location, media) sent by Meta WhatsApp Cloud API.
 */
export interface WhatsAppWebhookMessage {
  from: string; // Sender phone number
  id: string; // WAMID
  timestamp: string;
  type: 'text' | 'image' | 'document' | 'audio' | 'video' | 'sticker' | 'location' | 'contacts' | 'interactive' | 'button' | 'unknown';
  text?: {
    body: string;
  };
  button?: {
    text: string;
    payload: string;
  };
  interactive?: {
    type: string;
    button_reply?: { id: string; title: string };
    list_reply?: { id: string; title: string; description?: string };
  };
  context?: {
    id: string;
    from?: string;
  };
  errors?: WhatsAppWebhookError[];
}

/**
 * Change value object containing messages or status updates.
 */
export interface WhatsAppWebhookValue {
  messaging_product: 'whatsapp' | string;
  metadata: WhatsAppWebhookMetadata;
  contacts?: WhatsAppWebhookContact[];
  messages?: WhatsAppWebhookMessage[];
  statuses?: WhatsAppWebhookStatus[];
}

/**
 * Individual change object inside a Meta entry.
 */
export interface WhatsAppWebhookChange {
  field: 'messages' | string;
  value: WhatsAppWebhookValue;
}

/**
 * Individual entry inside a Meta Webhook payload.
 */
export interface WhatsAppWebhookEntry {
  id: string; // WABA ID (WhatsApp Business Account ID)
  changes: WhatsAppWebhookChange[];
}

/**
 * Main Webhook Payload sent by Meta WhatsApp Cloud API for POST requests.
 * Reference: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payloads
 */
export interface WhatsAppWebhookPayload {
  object: 'whatsapp_business_account' | string;
  entry: WhatsAppWebhookEntry[];
}
