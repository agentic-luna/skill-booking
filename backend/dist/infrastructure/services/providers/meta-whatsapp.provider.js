"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaWhatsAppProvider = exports.WHATSAPP_TEMPLATES = void 0;
const client_1 = require("@prisma/client");
const environment_1 = require("../../../config/environment");
exports.WHATSAPP_TEMPLATES = {
    BOOKING_CONFIRMATION: {
        name: 'booking_confirmation',
        language: 'en',
        parameterCount: 9,
    },
    BOOKING_CANCELLATION: {
        name: 'booking_cancellation',
        language: 'en',
        parameterCount: 9,
    },
    EVENT_APPROVAL: {
        name: 'event_approval',
        language: 'en',
        parameterCount: 9,
    },
    EVENT_DECLINE: {
        name: 'event_decline',
        language: 'en',
        parameterCount: 3,
    },
    HOST_PAYOUT_RELEASED: {
        name: 'host_payout_released',
        language: 'en',
        parameterCount: 3,
    },
    KYC_APPROVED: {
        name: 'kyc_approved',
        language: 'en',
        parameterCount: 1,
    },
    KYC_REJECTED: {
        name: 'kyc_rejected',
        language: 'en',
        parameterCount: 2,
    },
    EDIT_REQUEST_APPROVED: {
        name: 'edit_request_approved',
        language: 'en',
        parameterCount: 2,
    },
    REFUND_APPROVED: {
        name: 'refund_approved',
        language: 'en',
        parameterCount: 4,
    },
    REFUND_DECLINED: {
        name: 'refund_declined',
        language: 'en',
        parameterCount: 4,
    },
};
class MetaWhatsAppProvider {
    configRepo;
    cryptoService;
    logger;
    constructor(configRepo, cryptoService, logger) {
        this.configRepo = configRepo;
        this.cryptoService = cryptoService;
        this.logger = logger;
    }
    maskPhone(phone) {
        if (!phone)
            return '';
        if (phone.length <= 4)
            return '****';
        return `${phone.substring(0, 3)}****${phone.substring(phone.length - 4)}`;
    }
    async sendWhatsAppMessage(to, message) {
        // 1. Resolve Meta credentials with environment variables taking priority
        let accessToken = environment_1.env.META_WHATSAPP_ACCESS_TOKEN;
        let phoneNumberId = environment_1.env.META_WHATSAPP_PHONE_NUMBER_ID;
        let apiVersion = environment_1.env.META_WHATSAPP_API_VERSION || 'v20.0';
        // Database fallback if env variables are not present
        if (!accessToken || !phoneNumberId) {
            const config = await this.configRepo.findIntegration(client_1.IntegrationService.META_WA);
            if (config && config.isActive) {
                try {
                    const creds = this.cryptoService.decryptCredentials(config.credentials);
                    accessToken = accessToken || creds?.accessToken;
                    phoneNumberId = phoneNumberId || creds?.phoneNumberId;
                    apiVersion = apiVersion || creds?.apiVersion || 'v20.0';
                }
                catch (e) {
                    this.logger.error('[MetaWhatsAppProvider] Error decrypting DB integration credentials', { error: e.message || e });
                }
            }
        }
        // Normalizing the recipient phone number to digits-only
        const recipientPhone = to.replace(/[^\d]/g, '');
        if (!recipientPhone) {
            this.logger.error('[MetaWhatsAppProvider] Recipient phone number is empty or invalid after normalization');
            throw new Error('INVALID_PHONE_NUMBER');
        }
        // 2. Parse payload if JSON
        let isJson = false;
        let templateName = '';
        let parameters = [];
        let headerImage = '';
        let plainTextMessage = message;
        try {
            if (message.trim().startsWith('{')) {
                const parsed = JSON.parse(message);
                if (parsed && typeof parsed === 'object' && parsed.templateName) {
                    templateName = parsed.templateName;
                    parameters = parsed.parameters || [];
                    headerImage = parsed.headerImage || '';
                    plainTextMessage = parsed.text || message;
                    isJson = true;
                }
            }
        }
        catch {
            // Ignore JSON parse failure, treat as raw text
        }
        // 3. OTP verification restriction checking
        if (isJson && templateName === 'client_whatsapp_otp') {
            this.logger.error('[MetaWhatsAppProvider] WhatsApp OTP template is currently unavailable (client_whatsapp_otp)');
            throw new Error('WHATSAPP_OTP_TEMPLATE_UNAVAILABLE');
        }
        // 4. Construct payload
        let payload;
        if (isJson) {
            // Find matching template in configurations
            const templateKey = Object.keys(exports.WHATSAPP_TEMPLATES).find((key) => exports.WHATSAPP_TEMPLATES[key].name === templateName);
            if (!templateKey) {
                this.logger.error(`[MetaWhatsAppProvider] Template not found in internal mapping: ${templateName}`);
                throw new Error('TEMPLATE_NOT_FOUND');
            }
            const config = exports.WHATSAPP_TEMPLATES[templateKey];
            // Validate parameter count
            if (parameters.length !== config.parameterCount) {
                this.logger.error(`[MetaWhatsAppProvider] Invalid parameter count for template ${config.name}. Expected ${config.parameterCount}, got ${parameters.length}`);
                throw new Error('INVALID_PARAMETER_COUNT');
            }
            // Validate no parameter is undefined/null/empty
            for (let i = 0; i < parameters.length; i++) {
                if (parameters[i] === undefined || parameters[i] === null || String(parameters[i]).trim() === '') {
                    this.logger.error(`[MetaWhatsAppProvider] Parameter at index ${i} for template ${config.name} is null, undefined, or empty`);
                    throw new Error('INVALID_PARAMETER_FORMAT');
                }
            }
            const formattedParams = parameters.map((p) => ({
                type: 'text',
                text: String(p),
            }));
            const components = [
                {
                    type: 'body',
                    parameters: formattedParams,
                },
            ];
            // Special Header Image for booking_confirmation
            if (config.name === 'booking_confirmation') {
                if (!headerImage || !headerImage.startsWith('http')) {
                    this.logger.error(`[MetaWhatsAppProvider] booking_confirmation template requires a valid headerImage link but got: ${headerImage}`);
                    throw new Error('INVALID_PARAMETER_FORMAT');
                }
                components.push({
                    type: 'header',
                    parameters: [
                        {
                            type: 'image',
                            image: {
                                link: headerImage,
                            },
                        },
                    ],
                });
            }
            payload = {
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: recipientPhone,
                type: 'template',
                template: {
                    name: config.name,
                    language: {
                        code: config.language,
                    },
                    components,
                },
            };
        }
        else {
            // Raw/free-form text message payload
            payload = {
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: recipientPhone,
                type: 'text',
                text: {
                    preview_url: false,
                    body: plainTextMessage,
                },
            };
        }
        // Mock mode execution if configurations are missing
        if (!accessToken || !phoneNumberId) {
            this.logger.warn(`[Mock Meta WA] Active credentials not found. Mock WhatsApp sent to: ${this.maskPhone(recipientPhone)} | Body: ${plainTextMessage}`);
            return {
                success: true,
                messageId: `mock_wamid_${Math.random().toString(36).substring(2, 10)}`,
            };
        }
        // 5. Send real Meta Cloud API HTTP request
        try {
            const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            const data = (await response.json());
            const correlationId = data?.fbtrace_id || response.headers.get('x-fb-trace-id') || 'unknown';
            if (response.ok && data?.messages?.[0]?.id) {
                const messageId = data.messages[0].id;
                this.logger.info(`[MetaWhatsAppProvider] WhatsApp message sent successfully to ${this.maskPhone(recipientPhone)} | Template: ${templateName || 'FREE_TEXT'} | WAMID: ${messageId}`);
                return {
                    success: true,
                    messageId,
                };
            }
            // Handle Meta API failures and map error codes cleanly
            const metaError = data?.error || {};
            const errorCode = metaError.code;
            const errorSubcode = metaError.error_subcode;
            const errorMsg = metaError.message || metaError.error_user_msg || 'Unknown Meta Cloud API Error';
            this.logger.error('[MetaWhatsAppProvider] Meta WhatsApp Cloud API request failed', {
                status: response.status,
                templateName,
                recipient: this.maskPhone(recipientPhone),
                errorCode,
                errorSubcode,
                errorMsg,
                correlationId,
            });
            // Expose Meta API errors as clean thrown exceptions to trigger queue failures/retries correctly
            if (errorCode === 190) {
                throw new Error('INVALID_ACCESS_TOKEN');
            }
            else if (errorCode === 132007) {
                throw new Error('TEMPLATE_NOT_FOUND');
            }
            else if (errorCode === 132012 || errorCode === 132015) {
                throw new Error('TEMPLATE_TRANSLATION_NOT_FOUND');
            }
            else if (errorCode === 132001 || errorSubcode === 132001) {
                throw new Error('TEMPLATE_NOT_APPROVED');
            }
            else if (errorCode === 130429 || errorCode === 131056) {
                throw new Error('RATE_LIMIT_EXCEEDED');
            }
            else if (errorCode === 131009) {
                throw new Error('INVALID_PHONE_NUMBER');
            }
            else {
                throw new Error(errorMsg);
            }
        }
        catch (e) {
            // Suppress raw graph authorization keys inside logged trace frames
            const cleanErrorMsg = e.message ? e.message.replace(accessToken, '***') : String(e);
            this.logger.error('[MetaWhatsAppProvider] Error sending Meta WhatsApp message', { error: cleanErrorMsg });
            throw e;
        }
    }
}
exports.MetaWhatsAppProvider = MetaWhatsAppProvider;
