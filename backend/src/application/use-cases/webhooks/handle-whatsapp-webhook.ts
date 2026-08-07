import { IRequest, IRequestHandler } from '../../common/mediator';
import { ILoggerService } from '../../services/logger.service';
import {
  WhatsAppWebhookPayload,
  WhatsAppWebhookStatus,
  WhatsAppWebhookMessage,
} from '../../dtos/whatsapp-webhook.dto';

export class HandleWhatsAppWebhookCommand implements IRequest<{ success: boolean; processedEvents: number }> {
  readonly __tag = 'HandleWhatsAppWebhookCommand';
  constructor(public readonly payload: WhatsAppWebhookPayload) {}
}

export class HandleWhatsAppWebhookCommandHandler
  implements IRequestHandler<HandleWhatsAppWebhookCommand, { success: boolean; processedEvents: number }>
{
  constructor(private logger: ILoggerService) {}

  async handle(command: HandleWhatsAppWebhookCommand): Promise<{ success: boolean; processedEvents: number }> {
    const { payload } = command;
    let processedEvents = 0;

    // Validate if the webhook payload is from a WhatsApp Business Account
    if (!payload || payload.object !== 'whatsapp_business_account' || !Array.isArray(payload.entry)) {
      this.logger.warn('[WhatsApp Webhook] Unrecognized webhook object or missing entries', { payloadObject: payload?.object });
      return { success: true, processedEvents: 0 };
    }

    for (const entry of payload.entry) {
      const wabaId = entry.id; // WhatsApp Business Account ID

      if (!Array.isArray(entry.changes)) continue;

      for (const change of entry.changes) {
        if (change.field !== 'messages' || !change.value) continue;

        const value = change.value;
        const metadata = value.metadata;

        // 1. Process Status Events (sent, delivered, read, failed)
        if (Array.isArray(value.statuses) && value.statuses.length > 0) {
          for (const statusObj of value.statuses) {
            this.logStatusEvent(wabaId, metadata?.phone_number_id, statusObj);
            processedEvents++;

            // TODO: [Future WhatsApp Integration]
            // - Look up notification record in DB by WAMID (statusObj.id).
            // - Update notification delivery status (SENT -> DELIVERED -> READ or FAILED).
            // - If statusObj.status === 'failed', record failure reason from statusObj.errors.
            // - Trigger any failure alerts or retry queues if necessary.
          }
        }

        // 2. Process Incoming Messages (text, button responses, interactive lists)
        if (Array.isArray(value.messages) && value.messages.length > 0) {
          for (const messageObj of value.messages) {
            const contact = value.contacts?.find((c) => c.wa_id === messageObj.from);
            this.logIncomingMessage(wabaId, metadata?.phone_number_id, messageObj, contact?.profile?.name);
            processedEvents++;

            // TODO: [Future WhatsApp Integration]
            // - Process customer reply (e.g. "CONFIRM", "CANCEL", button clicks for event bookings).
            // - Match sender phone number (messageObj.from) to existing User/Client profile in DB.
            // - Trigger automated AI customer support or bot workflow handler.
          }
        }
      }
    }

    return { success: true, processedEvents };
  }

  /**
   * Parses and logs message status events (sent, delivered, read, failed).
   */
  private logStatusEvent(
    wabaId: string,
    phoneNumberId: string,
    statusObj: WhatsAppWebhookStatus
  ): void {
    const { id: wamid, status, recipient_id, timestamp, errors } = statusObj;

    const logDetails: Record<string, any> = {
      wabaId,
      phoneNumberId,
      wamid,
      recipientId: recipient_id,
      status,
      timestamp: timestamp ? new Date(Number(timestamp) * 1000).toISOString() : new Date().toISOString(),
    };

    if (errors && errors.length > 0) {
      logDetails.errors = errors.map((e) => ({
        code: e.code,
        title: e.title,
        message: e.message || e.error_data?.details,
      }));
    }

    switch (status) {
      case 'sent':
        this.logger.info(`[WhatsApp Webhook] Message SENT | WAMID: ${wamid} | To: ${recipient_id}`, logDetails);
        break;

      case 'delivered':
        this.logger.info(`[WhatsApp Webhook] Message DELIVERED | WAMID: ${wamid} | To: ${recipient_id}`, logDetails);
        break;

      case 'read':
        this.logger.info(`[WhatsApp Webhook] Message READ | WAMID: ${wamid} | By: ${recipient_id}`, logDetails);
        break;

      case 'failed':
        this.logger.error(`[WhatsApp Webhook] Message FAILED | WAMID: ${wamid} | Recipient: ${recipient_id}`, logDetails);
        break;

      default:
        this.logger.info(`[WhatsApp Webhook] Message STATUS UPDATE (${status}) | WAMID: ${wamid}`, logDetails);
        break;
    }
  }

  /**
   * Parses and logs incoming user messages.
   */
  private logIncomingMessage(
    wabaId: string,
    phoneNumberId: string,
    messageObj: WhatsAppWebhookMessage,
    senderName?: string
  ): void {
    const { from, id: wamid, type, text, button, interactive } = messageObj;

    let bodySummary = '';
    if (type === 'text' && text?.body) {
      bodySummary = text.body;
    } else if (type === 'button' && button) {
      bodySummary = `Button: ${button.text} (Payload: ${button.payload})`;
    } else if (type === 'interactive' && interactive) {
      bodySummary = `Interactive: ${interactive.type}`;
    } else {
      bodySummary = `Type: ${type}`;
    }

    this.logger.info(
      `[WhatsApp Webhook] Incoming Message Received | From: ${senderName ? `${senderName} (${from})` : from} | Type: ${type} | Body: "${bodySummary}" | WAMID: ${wamid}`,
      {
        wabaId,
        phoneNumberId,
        sender: from,
        senderName,
        wamid,
        type,
      }
    );
  }
}
