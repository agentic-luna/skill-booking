"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commsService = exports.whatsappService = exports.smsService = exports.emailService = exports.paymentGatewayProvider = exports.metaWaProvider = exports.twilioProvider = exports.sendGridProvider = exports.cryptoService = exports.queueService = exports.cacheService = exports.boostedRepo = exports.reviewRepo = exports.notificationRepo = exports.configRepo = exports.ledgerRepo = exports.bookingRepo = exports.eventRepo = exports.userRepo = exports.logger = exports.mediator = void 0;
const mediator_1 = require("../application/common/mediator");
// Repositories
const user_repository_1 = require("../infrastructure/database/repositories/user.repository");
const event_repository_1 = require("../infrastructure/database/repositories/event.repository");
const booking_repository_1 = require("../infrastructure/database/repositories/booking.repository");
const ledger_repository_1 = require("../infrastructure/database/repositories/ledger.repository");
const config_repository_1 = require("../infrastructure/database/repositories/config.repository");
const notification_repository_1 = require("../infrastructure/database/repositories/notification.repository");
const event_review_repository_1 = require("../infrastructure/database/repositories/event-review.repository");
const boosted_event_repository_1 = require("../infrastructure/database/repositories/boosted-event.repository");
// Services & Providers
const winston_logger_1 = require("../infrastructure/logger/winston.logger");
const redis_cache_1 = require("../infrastructure/cache/redis.cache");
const bull_queue_1 = require("../infrastructure/queue/bull.queue");
const node_crypto_1 = require("../infrastructure/security/node.crypto");
const sendgrid_provider_1 = require("../infrastructure/services/providers/sendgrid.provider");
const twilio_provider_1 = require("../infrastructure/services/providers/twilio.provider");
const meta_whatsapp_provider_1 = require("../infrastructure/services/providers/meta-whatsapp.provider");
const razorpay_provider_1 = require("../infrastructure/services/providers/razorpay.provider");
const email_communication_1 = require("../infrastructure/services/comms/email.communication");
const sms_communication_1 = require("../infrastructure/services/comms/sms.communication");
const whatsapp_communication_1 = require("../infrastructure/services/comms/whatsapp.communication");
const comms_gateway_1 = require("../infrastructure/services/comms.gateway");
// Handlers
const signup_1 = require("../application/use-cases/auth/signup");
const login_1 = require("../application/use-cases/auth/login");
const refresh_1 = require("../application/use-cases/auth/refresh");
const logout_1 = require("../application/use-cases/auth/logout");
const get_profile_1 = require("../application/use-cases/auth/get-profile");
const send_otp_1 = require("../application/use-cases/auth/send-otp");
const verify_otp_1 = require("../application/use-cases/auth/verify-otp");
const submit_kyc_1 = require("../application/use-cases/hosts/submit-kyc");
const submit_bank_details_1 = require("../application/use-cases/hosts/submit-bank-details");
const get_dashboard_1 = require("../application/use-cases/hosts/get-dashboard");
const search_events_1 = require("../application/use-cases/events/search-events");
const get_event_details_1 = require("../application/use-cases/events/get-event-details");
const create_event_1 = require("../application/use-cases/events/create-event");
const approve_event_1 = require("../application/use-cases/events/approve-event");
const checkout_1 = require("../application/use-cases/bookings/checkout");
const cancel_booking_1 = require("../application/use-cases/bookings/cancel-booking");
const handle_payment_webhook_1 = require("../application/use-cases/webhooks/handle-payment-webhook");
const get_configs_1 = require("../application/use-cases/admin/get-configs");
const update_config_1 = require("../application/use-cases/admin/update-config");
const get_templates_1 = require("../application/use-cases/admin/get-templates");
const update_template_1 = require("../application/use-cases/admin/update-template");
const broadcast_notification_1 = require("../application/use-cases/admin/broadcast-notification");
const get_ledger_1 = require("../application/use-cases/admin/get-ledger");
const payout_host_1 = require("../application/use-cases/admin/payout-host");
const get_user_notifications_1 = require("../application/use-cases/notifications/get-user-notifications");
const mark_notification_read_1 = require("../application/use-cases/notifications/mark-notification-read");
const create_review_1 = require("../application/use-cases/reviews/create-review");
const get_reviews_1 = require("../application/use-cases/reviews/get-reviews");
const boost_event_1 = require("../application/use-cases/boosted-events/boost-event");
const get_boosted_events_1 = require("../application/use-cases/boosted-events/get-boosted-events");
const setup_twilio_1 = require("../application/use-cases/integrations/setup-twilio");
const setup_sendgrid_1 = require("../application/use-cases/integrations/setup-sendgrid");
const setup_meta_wa_1 = require("../application/use-cases/integrations/setup-meta-wa");
const setup_razorpay_1 = require("../application/use-cases/integrations/setup-razorpay");
// 1. Initialize core logger & database repositories
const logger = new winston_logger_1.WinstonLoggerService();
exports.logger = logger;
const userRepo = new user_repository_1.PrismaUserRepository();
exports.userRepo = userRepo;
const eventRepo = new event_repository_1.PrismaEventRepository();
exports.eventRepo = eventRepo;
const bookingRepo = new booking_repository_1.PrismaBookingRepository();
exports.bookingRepo = bookingRepo;
const ledgerRepo = new ledger_repository_1.PrismaLedgerRepository();
exports.ledgerRepo = ledgerRepo;
const configRepo = new config_repository_1.PrismaConfigRepository();
exports.configRepo = configRepo;
const notificationRepo = new notification_repository_1.PrismaNotificationRepository();
exports.notificationRepo = notificationRepo;
const reviewRepo = new event_review_repository_1.PrismaEventReviewRepository();
exports.reviewRepo = reviewRepo;
const boostedRepo = new boosted_event_repository_1.PrismaBoostedEventRepository();
exports.boostedRepo = boostedRepo;
// 2. Initialize infrastructure services & provider abstractions
const cacheService = new redis_cache_1.RedisCacheService();
exports.cacheService = cacheService;
const queueService = new bull_queue_1.BullQueueService();
exports.queueService = queueService;
const cryptoService = new node_crypto_1.NodeCryptoService();
exports.cryptoService = cryptoService;
const sendGridProvider = new sendgrid_provider_1.SendGridEmailProvider(configRepo, cryptoService, logger);
exports.sendGridProvider = sendGridProvider;
const twilioProvider = new twilio_provider_1.TwilioSmsProvider(configRepo, cryptoService, logger);
exports.twilioProvider = twilioProvider;
const metaWaProvider = new meta_whatsapp_provider_1.MetaWhatsAppProvider(configRepo, cryptoService, logger);
exports.metaWaProvider = metaWaProvider;
const paymentGatewayProvider = new razorpay_provider_1.RazorpayPaymentGatewayProvider(configRepo, cryptoService, logger);
exports.paymentGatewayProvider = paymentGatewayProvider;
const emailService = new email_communication_1.EmailCommunicationService(sendGridProvider);
exports.emailService = emailService;
const smsService = new sms_communication_1.SmsCommunicationService(twilioProvider);
exports.smsService = smsService;
const whatsappService = new whatsapp_communication_1.WhatsAppCommunicationService(metaWaProvider);
exports.whatsappService = whatsappService;
const commsService = new comms_gateway_1.CommunicationGateway(emailService, smsService, whatsappService, paymentGatewayProvider);
exports.commsService = commsService;
// 3. Initialize mediator bus
const mediator = new mediator_1.Mediator();
exports.mediator = mediator;
// 4. Register Auth handlers
mediator.register('SignupCommand', new signup_1.SignupCommandHandler(userRepo, cacheService));
mediator.register('LoginCommand', new login_1.LoginCommandHandler(userRepo, cacheService));
mediator.register('RefreshTokenCommand', new refresh_1.RefreshTokenCommandHandler(userRepo, cacheService));
mediator.register('LogoutCommand', new logout_1.LogoutCommandHandler(cacheService));
mediator.register('GetProfileQuery', new get_profile_1.GetProfileQueryHandler(userRepo));
mediator.register('SendOtpCommand', new send_otp_1.SendOtpCommandHandler(cacheService, commsService, userRepo, logger));
mediator.register('VerifyOtpCommand', new verify_otp_1.VerifyOtpCommandHandler(cacheService, logger));
// 5. Register Host handlers
mediator.register('SubmitKycCommand', new submit_kyc_1.SubmitKycCommandHandler(userRepo));
mediator.register('SubmitBankDetailsCommand', new submit_bank_details_1.SubmitBankDetailsCommandHandler(userRepo, cryptoService));
mediator.register('GetHostDashboardQuery', new get_dashboard_1.GetHostDashboardQueryHandler(eventRepo, ledgerRepo));
// 6. Register Event handlers
mediator.register('SearchEventsQuery', new search_events_1.SearchEventsQueryHandler(eventRepo, cacheService));
mediator.register('GetEventDetailsQuery', new get_event_details_1.GetEventDetailsQueryHandler(eventRepo));
mediator.register('CreateEventCommand', new create_event_1.CreateEventCommandHandler(eventRepo, userRepo, cacheService));
mediator.register('ApproveEventCommand', new approve_event_1.ApproveEventCommandHandler(eventRepo, cacheService));
// 7. Register Booking handlers
mediator.register('CheckoutCommand', new checkout_1.CheckoutCommandHandler(eventRepo, bookingRepo, cacheService, commsService));
mediator.register('CancelBookingCommand', new cancel_booking_1.CancelBookingCommandHandler(bookingRepo, eventRepo, configRepo, ledgerRepo, paymentGatewayProvider));
// 8. Register Webhook handlers
mediator.register('HandlePaymentWebhookCommand', new handle_payment_webhook_1.HandlePaymentWebhookCommandHandler(bookingRepo, ledgerRepo, configRepo, notificationRepo, queueService));
// 9. Register Admin handlers
mediator.register('GetConfigsQuery', new get_configs_1.GetConfigsQueryHandler(configRepo, cryptoService));
mediator.register('UpdateConfigCommand', new update_config_1.UpdateConfigCommandHandler(configRepo, cryptoService, cacheService));
mediator.register('GetTemplatesQuery', new get_templates_1.GetTemplatesQueryHandler(configRepo));
mediator.register('UpdateTemplateCommand', new update_template_1.UpdateTemplateCommandHandler(configRepo));
mediator.register('BroadcastNotificationCommand', new broadcast_notification_1.BroadcastNotificationCommandHandler(notificationRepo, userRepo, queueService));
mediator.register('GetLedgerQuery', new get_ledger_1.GetLedgerQueryHandler(ledgerRepo));
mediator.register('PayoutHostCommand', new payout_host_1.PayoutHostCommandHandler(userRepo, ledgerRepo, cryptoService, commsService));
// 10. Register Notification handlers
mediator.register('GetUserNotificationsQuery', new get_user_notifications_1.GetUserNotificationsQueryHandler(notificationRepo));
mediator.register('MarkNotificationReadCommand', new mark_notification_read_1.MarkNotificationReadCommandHandler(notificationRepo));
// 11. Register Review handlers
mediator.register('CreateEventReviewCommand', new create_review_1.CreateEventReviewCommandHandler(reviewRepo, bookingRepo, eventRepo, userRepo));
mediator.register('GetEventReviewsQuery', new get_reviews_1.GetEventReviewsQueryHandler(reviewRepo));
// 12. Register Boosted Event handlers
mediator.register('BoostEventCommand', new boost_event_1.BoostEventCommandHandler(boostedRepo, eventRepo));
mediator.register('GetBoostedEventsQuery', new get_boosted_events_1.GetBoostedEventsQueryHandler(boostedRepo));
// Integrations
mediator.register('SetupTwilioCommand', new setup_twilio_1.SetupTwilioCommandHandler(configRepo, cryptoService, cacheService));
mediator.register('SetupSendgridCommand', new setup_sendgrid_1.SetupSendgridCommandHandler(configRepo, cryptoService, cacheService));
mediator.register('SetupMetaWaCommand', new setup_meta_wa_1.SetupMetaWaCommandHandler(configRepo, cryptoService, cacheService));
mediator.register('SetupRazorpayCommand', new setup_razorpay_1.SetupRazorpayCommandHandler(configRepo, cryptoService, cacheService));
