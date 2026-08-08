// Set environment variables before any imports to ensure they are captured by config evaluation
process.env.META_WHATSAPP_ACCESS_TOKEN = 'env_token_abc';
process.env.META_WHATSAPP_PHONE_NUMBER_ID = 'env_phone_id_123';
process.env.META_WHATSAPP_API_VERSION = 'v25.0';

import { MetaWhatsAppProvider, WHATSAPP_TEMPLATES } from '../infrastructure/services/providers/meta-whatsapp.provider';
import { generateClientWhatsAppOtpTemplate } from '../constants/templates/auth/client-whatsapp-otp.template';
import { generateTicketWhatsAppTemplate } from '../constants/templates/booking-confirmation/whatsapp.template';
import { generateCancelBookingWhatsAppTemplate } from '../constants/templates/booking-cancellation/whatsapp.template';
import { generateApproveEventWhatsAppTemplate } from '../constants/templates/event-approval/whatsapp.template';
import { generateEventDeclineWhatsAppTemplate } from '../constants/templates/event-decline/whatsapp.template';
import { generateHostPayoutWhatsAppTemplate } from '../constants/templates/host-payout/whatsapp.template';
import { generateKycApprovedWhatsAppTemplate, generateKycRejectedWhatsAppTemplate } from '../constants/templates/kyc-review/whatsapp.template';
import { generateEditRequestApprovedWhatsAppTemplate } from '../constants/templates/edit-request-approval/whatsapp.template';
import { generateRefundApprovedWhatsAppTemplate, generateRefundDeclinedWhatsAppTemplate } from '../constants/templates/refund-decision/whatsapp.template';
import { WinstonLoggerService } from '../infrastructure/logger/winston.logger';
import { NodeCryptoService } from '../infrastructure/security/node.crypto';
import { CommunicationGateway } from '../infrastructure/services/comms.gateway';
import { EmailCommunicationService } from '../infrastructure/services/comms/email.communication';
import { SmsCommunicationService } from '../infrastructure/services/comms/sms.communication';
import { WhatsAppCommunicationService } from '../infrastructure/services/comms/whatsapp.communication';

// Mock Config Repo
class MockConfigRepository {
  async findIntegration() {
    return {
      isActive: true,
      credentials: 'encrypted_creds_here'
    };
  }
}

// Mock other providers
const mockSmsProvider = {
  lastSmsSent: '',
  async sendSms(to: string, body: string) {
    this.lastSmsSent = body;
    return { success: true };
  }
};
const mockEmailProvider = {
  async sendEmail() {
    return { success: true };
  }
};
const mockPaymentGateway = {} as any;

// Global Fetch Mock setup
const originalFetch = global.fetch;
let lastRequestUrl = '';
let lastRequestInit: any = null;
let mockResponseData: any = { messages: [{ id: 'mock_wamid_123' }] };
let mockResponseStatus = 200;

global.fetch = (async (url: any, init: any) => {
  lastRequestUrl = String(url);
  lastRequestInit = init;
  return {
    ok: mockResponseStatus >= 200 && mockResponseStatus < 300,
    status: mockResponseStatus,
    headers: {
      get: (name: string) => name === 'x-fb-trace-id' ? 'mock_trace_id_999' : null
    },
    json: async () => mockResponseData
  } as any;
}) as any;

const logger = new WinstonLoggerService();
const cryptoService = new NodeCryptoService();
const configRepo = new MockConfigRepository() as any;

const provider = new MetaWhatsAppProvider(configRepo, cryptoService, logger);

const emailService = new EmailCommunicationService(mockEmailProvider as any);
const smsService = new SmsCommunicationService(mockSmsProvider as any);
const whatsappService = new WhatsAppCommunicationService(provider);
const gateway = new CommunicationGateway(emailService, smsService, whatsappService, mockPaymentGateway);

function assert(condition: any, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failed] ${message}`);
  }
}

async function runTests() {
  console.log('==================================================');
  console.log('   STARTING META WHATSAPP PROVIDER TEST SUITE     ');
  console.log('==================================================\n');

  try {
    // --------------------------------------------------
    // Test 1: Phone number normalization
    // --------------------------------------------------
    console.log('[Test] Normalizing recipient phone numbers...');
    mockResponseStatus = 200;
    mockResponseData = { messages: [{ id: 'wamid_phone_norm_1' }] };
    
    await provider.sendWhatsAppMessage('+91 98765-43210', 'Hello Normal text');
    assert(lastRequestUrl.includes('/v25.0/env_phone_id_123/messages'), `Incorrect API URL path components: ${lastRequestUrl}`);
    const normPayload = JSON.parse(lastRequestInit.body);
    assert(normPayload.to === '919876543210', `Expected normalized phone 919876543210, got ${normPayload.to}`);
    console.log('✔ Normalized phone number format correctly');

    // --------------------------------------------------
    // Test 2: Raw / Free-form text reply flow
    // --------------------------------------------------
    console.log('[Test] Verification of free-form raw text message...');
    await provider.sendWhatsAppMessage('1234567890', 'Plain raw customer service text');
    const rawPayload = JSON.parse(lastRequestInit.body);
    assert(rawPayload.type === 'text', 'Expected type to be text for raw message');
    assert(rawPayload.text.body === 'Plain raw customer service text', 'Incorrect text body');
    console.log('✔ Raw text message sent correctly');

    // --------------------------------------------------
    // Test 3: OTP Authentication template check
    // --------------------------------------------------
    console.log('[Test] Client OTP Template unavailability check...');
    const otpJson = generateClientWhatsAppOtpTemplate({ otp: '998877', expiresInMinutes: 10 });
    try {
      await provider.sendWhatsAppMessage('1234567890', otpJson);
      assert(false, 'Should have thrown error on OTP template');
    } catch (e: any) {
      assert(e.message === 'WHATSAPP_OTP_TEMPLATE_UNAVAILABLE', `Expected WHATSAPP_OTP_TEMPLATE_UNAVAILABLE error, got ${e.message}`);
    }
    console.log('✔ OTP template correctly blocked at provider layer');

    // --------------------------------------------------
    // Test 4: SMS Fallback for OTP
    // --------------------------------------------------
    console.log('[Test] SMS Gateway payload fallback verification...');
    mockSmsProvider.lastSmsSent = '';
    
    // Simulate send-otp workflow
    try {
      await gateway.sendWhatsApp('1234567890', otpJson);
    } catch (err) {
      // Fallback
      await gateway.sendSMS('1234567890', otpJson);
    }
    assert(mockSmsProvider.lastSmsSent.includes('Your WhatsApp verification OTP code is:'), 'SMS content did not fallback to plain text OTP message');
    assert(!mockSmsProvider.lastSmsSent.startsWith('{'), 'SMS content contains raw JSON string');
    console.log('✔ SMS Fallback correctly parsed and delivered plain text message');

    // --------------------------------------------------
    // Test 5: Booking Confirmation (IMAGE Header + 9 parameters)
    // --------------------------------------------------
    console.log('[Test] Booking Confirmation Template mapping...');
    const confirmJson = generateTicketWhatsAppTemplate({
      bookingId: 'booking_id_123',
      trainerName: 'John Trainer',
      userName: 'Jane Doe',
      eventTitle: 'Masterclass',
      bookingRef: 'REF9988',
      formattedDate: 'Aug 10',
      formattedTime: '10:00 AM',
      seatCount: 2,
      totalAmount: 1500.50,
      venueInfo: 'Online',
      ticketDownloadUrl: 'https://images.com/ticket.png',
      verifyUrl: 'https://web.com/verify/REF9988'
    });

    await provider.sendWhatsAppMessage('1234567890', confirmJson);
    const confirmPayload = JSON.parse(lastRequestInit.body);
    assert(confirmPayload.type === 'template', 'Expected template payload type');
    assert(confirmPayload.template.name === 'booking_confirmation', 'Incorrect template name');
    
    const bodyComp = confirmPayload.template.components.find((c: any) => c.type === 'body');
    const headerComp = confirmPayload.template.components.find((c: any) => c.type === 'header');

    assert(bodyComp && bodyComp.parameters.length === 9, `Expected 9 body parameters, got ${bodyComp?.parameters.length}`);
    assert(headerComp && headerComp.parameters[0].image.link === 'https://images.com/ticket.png', 'Header image link not correctly mapped');
    assert(bodyComp.parameters[0].text === 'Jane Doe', 'Parameter {{1}} incorrect');
    assert(bodyComp.parameters[1].text === 'Masterclass', 'Parameter {{2}} incorrect');
    assert(bodyComp.parameters[2].text === 'REF9988', 'Parameter {{3}} incorrect');
    assert(bodyComp.parameters[4].text === 'Aug 10 at 10:00 AM', `Parameter {{5}} date/time incorrect: ${bodyComp.parameters[4].text}`);
    assert(bodyComp.parameters[5].text === '2', 'Parameter {{6}} incorrect');
    assert(bodyComp.parameters[6].text === '1500.50', 'Parameter {{7}} incorrect');
    assert(bodyComp.parameters[8].text === 'https://web.com/verify/REF9988', 'Parameter {{9}} incorrect');
    console.log('✔ Booking Confirmation mapped correctly with 9 parameters and IMAGE header');

    // --------------------------------------------------
    // Test 6: Booking Cancellation (9 parameters)
    // --------------------------------------------------
    console.log('[Test] Booking Cancellation Template mapping...');
    const cancelJson = generateCancelBookingWhatsAppTemplate({
      bookingId: 'booking_id_123',
      userName: 'Jane Doe',
      eventTitle: 'Masterclass',
      bookingRef: 'REF9988',
      seatCount: 2,
      totalAmount: 1500.50,
      refundAmount: 750.25,
      refundPercentage: 50,
      cancellationReason: 'Personal Reason'
    });

    await provider.sendWhatsAppMessage('1234567890', cancelJson);
    const cancelPayload = JSON.parse(lastRequestInit.body);
    const cancelBodyComp = cancelPayload.template.components.find((c: any) => c.type === 'body');
    assert(cancelPayload.template.name === 'booking_cancellation', 'Incorrect template name');
    assert(cancelBodyComp && cancelBodyComp.parameters.length === 9, `Expected 9 body parameters, got ${cancelBodyComp?.parameters.length}`);
    assert(cancelBodyComp.parameters[4].text === '2', 'Parameter {{5}} incorrect');
    assert(cancelBodyComp.parameters[6].text === '750.25', 'Parameter {{7}} incorrect');
    assert(cancelBodyComp.parameters[7].text === '50', 'Parameter {{8}} incorrect');
    assert(cancelBodyComp.parameters[8].text === 'Personal Reason', 'Parameter {{9}} incorrect');
    console.log('✔ Booking Cancellation mapped correctly with 9 parameters');

    // --------------------------------------------------
    // Test 7: Event Approval (9 parameters)
    // --------------------------------------------------
    console.log('[Test] Event Approval Template mapping...');
    const approveJson = generateApproveEventWhatsAppTemplate({
      eventId: 'event_id_123',
      hostName: 'John Host',
      eventTitle: 'NestJS Class',
      category: 'Tech',
      formattedStartTime: 'Saturday 10 AM',
      mode: 'ONLINE',
      price: 500,
      totalSeats: 50,
      commissionValue: 15,
      commissionType: 'PERCENTAGE'
    });

    await provider.sendWhatsAppMessage('1234567890', approveJson);
    const approvePayload = JSON.parse(lastRequestInit.body);
    const approveBodyComp = approvePayload.template.components.find((c: any) => c.type === 'body');
    assert(approvePayload.template.name === 'event_approval', 'Incorrect template');
    assert(approveBodyComp && approveBodyComp.parameters.length === 9, `Expected 9 parameters, got ${approveBodyComp?.parameters.length}`);
    assert(approveBodyComp.parameters[8].text === '15%', 'Commission mapping incorrect');
    console.log('✔ Event Approval mapped correctly with 9 parameters');

    // --------------------------------------------------
    // Test 8: Event Decline (3 parameters)
    // --------------------------------------------------
    console.log('[Test] Event Decline Template mapping...');
    const declineJson = generateEventDeclineWhatsAppTemplate({
      hostName: 'John Host',
      eventTitle: 'Bad Class',
      reason: 'Violates policies'
    });

    await provider.sendWhatsAppMessage('1234567890', declineJson);
    const declinePayload = JSON.parse(lastRequestInit.body);
    const declineBodyComp = declinePayload.template.components.find((c: any) => c.type === 'body');
    assert(declinePayload.template.name === 'event_decline', 'Incorrect template');
    assert(declineBodyComp && declineBodyComp.parameters.length === 3, 'Expected 3 parameters');
    assert(declineBodyComp.parameters[2].text === 'Violates policies', 'Decline reason mapping incorrect');
    console.log('✔ Event Decline mapped correctly with 3 parameters');

    // --------------------------------------------------
    // Test 9: Host Payout Released (3 parameters)
    // --------------------------------------------------
    console.log('[Test] Host Payout Released Template mapping...');
    const payoutJson = generateHostPayoutWhatsAppTemplate({
      hostName: 'John Host',
      amount: 2500.00,
      payoutId: 'PAY12345',
      transactionsPaid: 5,
      bankName: 'Luna Bank',
      eventTitle: 'NestJS Class'
    });

    await provider.sendWhatsAppMessage('1234567890', payoutJson);
    const payoutPayload = JSON.parse(lastRequestInit.body);
    const payoutBodyComp = payoutPayload.template.components.find((c: any) => c.type === 'body');
    assert(payoutPayload.template.name === 'host_payout_released', 'Incorrect template');
    assert(payoutBodyComp && payoutBodyComp.parameters.length === 3, 'Expected 3 parameters');
    assert(payoutBodyComp.parameters[1].text === 'NestJS Class', 'Incorrect event title mapped');
    assert(payoutBodyComp.parameters[2].text === '2500.00', 'Incorrect payout amount mapped');
    console.log('✔ Host Payout Released mapped correctly with 3 parameters');

    // --------------------------------------------------
    // Test 10: KYC Approved (1 parameter) & Rejected (2 parameters)
    // --------------------------------------------------
    console.log('[Test] KYC Approved/Rejected templates mapping...');
    const kycApproveJson = generateKycApprovedWhatsAppTemplate({ hostName: 'John Host', status: 'APPROVED' });
    await provider.sendWhatsAppMessage('1234567890', kycApproveJson);
    const kycAppPayload = JSON.parse(lastRequestInit.body);
    const kycAppBody = kycAppPayload.template.components.find((c: any) => c.type === 'body');
    assert(kycAppPayload.template.name === 'kyc_approved', 'Incorrect name');
    assert(kycAppBody && kycAppBody.parameters.length === 1, 'Expected 1 parameter');

    const kycRejectJson = generateKycRejectedWhatsAppTemplate({ hostName: 'John Host', status: 'REJECTED', rejectionReason: 'Blurred Gov ID' });
    await provider.sendWhatsAppMessage('1234567890', kycRejectJson);
    const kycRejPayload = JSON.parse(lastRequestInit.body);
    const kycRejBody = kycRejPayload.template.components.find((c: any) => c.type === 'body');
    assert(kycRejPayload.template.name === 'kyc_rejected', 'Incorrect name');
    assert(kycRejBody && kycRejBody.parameters.length === 2, 'Expected 2 parameters');
    assert(kycRejBody.parameters[1].text === 'Blurred Gov ID', 'KYC rejection reason incorrect');
    console.log('✔ KYC templates mapped correctly');

    // --------------------------------------------------
    // Test 11: Edit Request Approved (2 parameters)
    // --------------------------------------------------
    console.log('[Test] Edit Request Approved Template mapping...');
    const editApprovedJson = generateEditRequestApprovedWhatsAppTemplate({ eventId: 'event_id_123', hostName: 'John Host', eventTitle: 'NestJS Class' });
    await provider.sendWhatsAppMessage('1234567890', editApprovedJson);
    const editPayload = JSON.parse(lastRequestInit.body);
    const editBodyComp = editPayload.template.components.find((c: any) => c.type === 'body');
    assert(editPayload.template.name === 'edit_request_approved', 'Incorrect name');
    assert(editBodyComp && editBodyComp.parameters.length === 2, 'Expected 2 parameters');
    console.log('✔ Edit Request Approved template mapped correctly');

    // --------------------------------------------------
    // Test 12: Refund Approved & Declined (4 parameters)
    // --------------------------------------------------
    console.log('[Test] Refund Approved/Declined templates mapping...');
    const refundApproveJson = generateRefundApprovedWhatsAppTemplate({
      clientName: 'Jane Client',
      eventTitle: 'Masterclass',
      bookingId: 'BOOKING12345678',
      refundAmount: 499.00,
      status: 'APPROVED'
    });
    await provider.sendWhatsAppMessage('1234567890', refundApproveJson);
    const refundAppPayload = JSON.parse(lastRequestInit.body);
    const refundAppBody = refundAppPayload.template.components.find((c: any) => c.type === 'body');
    assert(refundAppPayload.template.name === 'refund_approved', 'Incorrect name');
    assert(refundAppBody && refundAppBody.parameters.length === 4, 'Expected 4 parameters');
    assert(refundAppBody.parameters[2].text === 'BOOKING1', 'Booking Reference sliced to 8 chars check');
    assert(refundAppBody.parameters[3].text === '499.00', 'Refund amount mapped check');

    const refundDeclineJson = generateRefundDeclinedWhatsAppTemplate({
      clientName: 'Jane Client',
      eventTitle: 'Masterclass',
      bookingId: 'BOOKING12345678',
      status: 'DECLINED',
      reason: 'Past 48h limit'
    });
    await provider.sendWhatsAppMessage('1234567890', refundDeclineJson);
    const refundRejPayload = JSON.parse(lastRequestInit.body);
    const refundRejBody = refundRejPayload.template.components.find((c: any) => c.type === 'body');
    assert(refundRejPayload.template.name === 'refund_declined', 'Incorrect name');
    assert(refundRejBody && refundRejBody.parameters.length === 4, 'Expected 4 parameters');
    assert(refundRejBody.parameters[3].text === 'Past 48h limit', 'Refund decline reason mapping check');
    console.log('✔ Refund templates mapped correctly');

    // --------------------------------------------------
    // Test 13: Parameter validation errors
    // --------------------------------------------------
    console.log('[Test] Parameter count and validation verification...');
    
    // Parameter mismatch
    const badParamCountJson = JSON.stringify({
      templateName: 'event_decline',
      parameters: ['John Host'] // needs 3
    });
    try {
      await provider.sendWhatsAppMessage('1234567890', badParamCountJson);
      assert(false, 'Should throw on parameter count mismatch');
    } catch (e: any) {
      assert(e.message === 'INVALID_PARAMETER_COUNT', `Expected INVALID_PARAMETER_COUNT, got ${e.message}`);
    }

    // Null parameter check
    const badParamFormatJson = JSON.stringify({
      templateName: 'event_decline',
      parameters: ['John Host', 'Bad Class', null]
    });
    try {
      await provider.sendWhatsAppMessage('1234567890', badParamFormatJson);
      assert(false, 'Should throw on null parameter');
    } catch (e: any) {
      assert(e.message === 'INVALID_PARAMETER_FORMAT', `Expected INVALID_PARAMETER_FORMAT, got ${e.message}`);
    }
    console.log('✔ Invalid parameter validations throwing errors correctly');

    // --------------------------------------------------
    // Test 14: Meta API error codes mapping
    // --------------------------------------------------
    console.log('[Test] Meta API HTTP Error mapping verification...');
    
    // Expired token check (190)
    mockResponseStatus = 401;
    mockResponseData = { error: { message: 'Invalid token', code: 190 } };
    try {
      await provider.sendWhatsAppMessage('1234567890', confirmJson);
      assert(false, 'Should throw on 401 response code 190');
    } catch (e: any) {
      assert(e.message === 'INVALID_ACCESS_TOKEN', `Expected INVALID_ACCESS_TOKEN, got ${e.message}`);
    }

    // Rate Limit (130429)
    mockResponseStatus = 429;
    mockResponseData = { error: { message: 'Rate limit exceeded', code: 130429 } };
    try {
      await provider.sendWhatsAppMessage('1234567890', confirmJson);
      assert(false, 'Should throw on rate limit');
    } catch (e: any) {
      assert(e.message === 'RATE_LIMIT_EXCEEDED', `Expected RATE_LIMIT_EXCEEDED, got ${e.message}`);
    }

    // Template not found (132007)
    mockResponseStatus = 404;
    mockResponseData = { error: { message: 'Template not found', code: 132007 } };
    try {
      await provider.sendWhatsAppMessage('1234567890', confirmJson);
      assert(false, 'Should throw on template not found');
    } catch (e: any) {
      assert(e.message === 'TEMPLATE_NOT_FOUND', `Expected TEMPLATE_NOT_FOUND, got ${e.message}`);
    }
    console.log('✔ Meta HTTP errors translated and mapped correctly');

    console.log('\n==================================================');
    console.log('   ALL WHATSAPP PROVIDER TESTS PASSED SUCCESS!    ');
    console.log('==================================================\n');

  } catch (error: any) {
    console.error('\n❌ WHATSAPP UNIT TESTS FAILED!');
    console.error('Error Details:', error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  } finally {
    global.fetch = originalFetch;
  }
}

runTests();
