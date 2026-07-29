import { Mediator } from '../application/common/mediator';

// Repositories
import { PrismaUserRepository } from '../infrastructure/database/repositories/user.repository';
import { PrismaEventRepository } from '../infrastructure/database/repositories/event.repository';
import { PrismaBookingRepository } from '../infrastructure/database/repositories/booking.repository';
import { PrismaLedgerRepository } from '../infrastructure/database/repositories/ledger.repository';
import { PrismaConfigRepository } from '../infrastructure/database/repositories/config.repository';
import { PrismaNotificationRepository } from '../infrastructure/database/repositories/notification.repository';
import { PrismaEventReviewRepository } from '../infrastructure/database/repositories/event-review.repository';
import { PrismaBoostedEventRepository } from '../infrastructure/database/repositories/boosted-event.repository';
import { PrismaWishlistRepository } from '../infrastructure/database/repositories/wishlist.repository';
import { PrismaEventLikeRepository } from '../infrastructure/database/repositories/event-like.repository';

// Services & Providers
import { WinstonLoggerService } from '../infrastructure/logger/winston.logger';
import { RedisCacheService } from '../infrastructure/cache/redis.cache';
import { BullQueueService } from '../infrastructure/queue/bull.queue';
import { NodeCryptoService } from '../infrastructure/security/node.crypto';

import { SendGridEmailProvider } from '../infrastructure/services/providers/sendgrid.provider';
import { TwilioSmsProvider } from '../infrastructure/services/providers/twilio.provider';
import { MetaWhatsAppProvider } from '../infrastructure/services/providers/meta-whatsapp.provider';
import { RazorpayPaymentGatewayProvider } from '../infrastructure/services/providers/razorpay.provider';

import { EmailCommunicationService } from '../infrastructure/services/comms/email.communication';
import { SmsCommunicationService } from '../infrastructure/services/comms/sms.communication';
import { WhatsAppCommunicationService } from '../infrastructure/services/comms/whatsapp.communication';
import { CommunicationGateway } from '../infrastructure/services/comms.gateway';
import { TicketGenerationService } from '../infrastructure/services/ticket-generation.service';

// Handlers
import { SignupCommandHandler } from '../application/use-cases/auth/signup';
import { LoginCommandHandler } from '../application/use-cases/auth/login';
import { RefreshTokenCommandHandler } from '../application/use-cases/auth/refresh';
import { LogoutCommandHandler } from '../application/use-cases/auth/logout';
import { GetProfileQueryHandler } from '../application/use-cases/auth/get-profile';
import { SendOtpCommandHandler } from '../application/use-cases/auth/send-otp';
import { VerifyOtpCommandHandler } from '../application/use-cases/auth/verify-otp';
import { SendForgotPasswordOtpCommandHandler } from '../application/use-cases/auth/send-forgot-password-otp';
import { VerifyForgotPasswordOtpCommandHandler } from '../application/use-cases/auth/verify-forgot-password-otp';
import { ResetPasswordCommandHandler } from '../application/use-cases/auth/reset-password';
import { ClientSendOtpCommandHandler } from '../application/use-cases/auth/client/send-otp';
import { ClientVerifyOtpCommandHandler } from '../application/use-cases/auth/client/verify-otp';
import { ClientSignupCommandHandler } from '../application/use-cases/auth/client/signup';
import { ClientSendEmailVerificationCommandHandler } from '../application/use-cases/auth/client/send-email-verification';
import { ClientVerifyEmailMagicLinkCommandHandler } from '../application/use-cases/auth/client/verify-email-magic-link';


import { SubmitKycCommandHandler } from '../application/use-cases/hosts/submit-kyc';
import { SubmitBankDetailsCommandHandler } from '../application/use-cases/hosts/submit-bank-details';
import { GetHostDashboardQueryHandler } from '../application/use-cases/hosts/get-dashboard';

import { SearchEventsQueryHandler } from '../application/use-cases/events/search-events';
import { GetEventDetailsQueryHandler } from '../application/use-cases/events/get-event-details';
import { CreateEventCommandHandler } from '../application/use-cases/events/create-event';
import { ApproveEventCommandHandler } from '../application/use-cases/events/approve-event';

import { CheckoutCommandHandler } from '../application/use-cases/bookings/checkout';
import { CancelBookingCommandHandler } from '../application/use-cases/bookings/cancel-booking';
import { GetMyBookingsQueryHandler } from '../application/use-cases/bookings/get-my-bookings';
import { ConfirmBookingPaymentCommandHandler } from '../application/use-cases/bookings/confirm-booking-payment';

import { HandlePaymentWebhookCommandHandler } from '../application/use-cases/webhooks/handle-payment-webhook';

import { GetConfigsQueryHandler } from '../application/use-cases/admin/get-configs';
import { UpdateConfigCommandHandler } from '../application/use-cases/admin/update-config';
import { GetTemplatesQueryHandler } from '../application/use-cases/admin/get-templates';
import { UpdateTemplateCommandHandler } from '../application/use-cases/admin/update-template';
import { BroadcastNotificationCommandHandler } from '../application/use-cases/admin/broadcast-notification';
import { GetLedgerQueryHandler } from '../application/use-cases/admin/get-ledger';
import { PayoutHostCommandHandler } from '../application/use-cases/admin/payout-host';
import { AdminLoginCommandHandler } from '../application/use-cases/admin/admin-login';
import { GetPendingKycHostsQueryHandler, GetAllHostsQueryHandler, ReviewKycCommandHandler } from '../application/use-cases/admin/review-kyc';

import { GetUserNotificationsQueryHandler } from '../application/use-cases/notifications/get-user-notifications';
import { MarkNotificationReadCommandHandler } from '../application/use-cases/notifications/mark-notification-read';

import { CreateEventReviewCommandHandler } from '../application/use-cases/reviews/create-review';
import { GetEventReviewsQueryHandler } from '../application/use-cases/reviews/get-reviews';

import { AddToWishlistCommandHandler, RemoveFromWishlistCommandHandler, GetUserWishlistQueryHandler } from '../application/use-cases/wishlist/manage-wishlist';
import { ToggleEventLikeCommandHandler, GetUserLikedEventsQueryHandler } from '../application/use-cases/likes/manage-event-likes';

import { BoostEventCommandHandler } from '../application/use-cases/boosted-events/boost-event';
import { GetBoostedEventsQueryHandler } from '../application/use-cases/boosted-events/get-boosted-events';
import { RequestBoostCommandHandler } from '../application/use-cases/boosted-events/request-boost';
import { UpdateBoostStatusCommandHandler } from '../application/use-cases/boosted-events/update-boost-status';
import { GetBoostRequestsQueryHandler } from '../application/use-cases/boosted-events/get-boost-requests';
import { VerifyBoostPaymentCommandHandler } from '../application/use-cases/boosted-events/verify-boost-payment';
import { GetBoostPricingQueryHandler } from '../application/use-cases/boosted-events/get-boost-pricing';
import { SetupTwilioCommandHandler } from '../application/use-cases/integrations/setup-twilio';
import { SetupSendgridCommandHandler } from '../application/use-cases/integrations/setup-sendgrid';
import { SetupMetaWaCommandHandler } from '../application/use-cases/integrations/setup-meta-wa';
import { SetupRazorpayCommandHandler } from '../application/use-cases/integrations/setup-razorpay';

// 1. Initialize core logger & database repositories
const logger = new WinstonLoggerService();
const userRepo = new PrismaUserRepository();
const eventRepo = new PrismaEventRepository();
const bookingRepo = new PrismaBookingRepository();
const ledgerRepo = new PrismaLedgerRepository();
const configRepo = new PrismaConfigRepository();
const notificationRepo = new PrismaNotificationRepository();
const reviewRepo = new PrismaEventReviewRepository();
const boostedRepo = new PrismaBoostedEventRepository();
const wishlistRepo = new PrismaWishlistRepository();
const eventLikeRepo = new PrismaEventLikeRepository();

// 2. Initialize infrastructure services & provider abstractions
const cacheService = new RedisCacheService();
const queueService = new BullQueueService();
const cryptoService = new NodeCryptoService();

const sendGridProvider = new SendGridEmailProvider(configRepo, cryptoService, logger);
const twilioProvider = new TwilioSmsProvider(configRepo, cryptoService, logger);
const metaWaProvider = new MetaWhatsAppProvider(configRepo, cryptoService, logger);
const paymentGatewayProvider = new RazorpayPaymentGatewayProvider(configRepo, cryptoService, logger);

const emailService = new EmailCommunicationService(sendGridProvider);
const smsService = new SmsCommunicationService(twilioProvider);
const whatsappService = new WhatsAppCommunicationService(metaWaProvider);

const commsService = new CommunicationGateway(
  emailService,
  smsService,
  whatsappService,
  paymentGatewayProvider
);

const ticketGenService = new TicketGenerationService();

// 3. Initialize mediator bus
const mediator = new Mediator();

// 4. Register Auth handlers
mediator.register('SignupCommand', new SignupCommandHandler(userRepo, cacheService));
mediator.register('LoginCommand', new LoginCommandHandler(userRepo, cacheService));
mediator.register('RefreshTokenCommand', new RefreshTokenCommandHandler(userRepo, cacheService));
mediator.register('LogoutCommand', new LogoutCommandHandler(cacheService));
mediator.register('GetProfileQuery', new GetProfileQueryHandler(userRepo));
mediator.register('SendOtpCommand', new SendOtpCommandHandler(cacheService, commsService, userRepo, logger));
mediator.register('VerifyOtpCommand', new VerifyOtpCommandHandler(cacheService, logger));
mediator.register('SendForgotPasswordOtpCommand', new SendForgotPasswordOtpCommandHandler(userRepo, cacheService, commsService, logger));
mediator.register('VerifyForgotPasswordOtpCommand', new VerifyForgotPasswordOtpCommandHandler(userRepo, cacheService, logger));
mediator.register('ResetPasswordCommand', new ResetPasswordCommandHandler(userRepo, cacheService, logger));
mediator.register('ClientSendOtpCommand', new ClientSendOtpCommandHandler(cacheService, commsService, userRepo, logger));
mediator.register('ClientVerifyOtpCommand', new ClientVerifyOtpCommandHandler(cacheService, logger));
mediator.register('ClientSignupCommand', new ClientSignupCommandHandler(userRepo, cacheService));
mediator.register('ClientSendEmailVerificationCommand', new ClientSendEmailVerificationCommandHandler(userRepo, cacheService, sendGridProvider));
mediator.register('ClientVerifyEmailMagicLinkCommand', new ClientVerifyEmailMagicLinkCommandHandler(userRepo, cacheService));


// 5. Register Host handlers
mediator.register('SubmitKycCommand', new SubmitKycCommandHandler(userRepo));
mediator.register('SubmitBankDetailsCommand', new SubmitBankDetailsCommandHandler(userRepo, cryptoService));
mediator.register('GetHostDashboardQuery', new GetHostDashboardQueryHandler(eventRepo, ledgerRepo));

// 6. Register Event handlers
mediator.register('SearchEventsQuery', new SearchEventsQueryHandler(eventRepo, cacheService));
mediator.register('GetEventDetailsQuery', new GetEventDetailsQueryHandler(eventRepo));
mediator.register('CreateEventCommand', new CreateEventCommandHandler(eventRepo, userRepo, cacheService, configRepo));
mediator.register('ApproveEventCommand', new ApproveEventCommandHandler(eventRepo, cacheService, configRepo));

// 7. Register Booking handlers
mediator.register('CheckoutCommand', new CheckoutCommandHandler(eventRepo, bookingRepo, cacheService, commsService));
mediator.register('CancelBookingCommand', new CancelBookingCommandHandler(bookingRepo, eventRepo, configRepo, ledgerRepo, paymentGatewayProvider));
mediator.register('GetMyBookingsQuery', new GetMyBookingsQueryHandler(bookingRepo));
mediator.register('ConfirmBookingPaymentCommand', new ConfirmBookingPaymentCommandHandler(bookingRepo, ledgerRepo, configRepo, notificationRepo, queueService));

// 8. Register Webhook handlers
mediator.register('HandlePaymentWebhookCommand', new HandlePaymentWebhookCommandHandler(bookingRepo, ledgerRepo, configRepo, notificationRepo, queueService));

// 9. Register Admin handlers
mediator.register('AdminLoginCommand', new AdminLoginCommandHandler(userRepo, cacheService));
mediator.register('GetPendingKycHostsQuery', new GetPendingKycHostsQueryHandler(userRepo, cryptoService));
mediator.register('GetAllHostsQuery', new GetAllHostsQueryHandler(userRepo, cryptoService));
mediator.register('ReviewKycCommand', new ReviewKycCommandHandler(userRepo, cryptoService));
mediator.register('GetConfigsQuery', new GetConfigsQueryHandler(configRepo, cryptoService));
mediator.register('UpdateConfigCommand', new UpdateConfigCommandHandler(configRepo, cryptoService, cacheService));
mediator.register('GetTemplatesQuery', new GetTemplatesQueryHandler(configRepo));
mediator.register('UpdateTemplateCommand', new UpdateTemplateCommandHandler(configRepo));
mediator.register('BroadcastNotificationCommand', new BroadcastNotificationCommandHandler(notificationRepo, userRepo, queueService));
mediator.register('GetLedgerQuery', new GetLedgerQueryHandler(ledgerRepo));
mediator.register('PayoutHostCommand', new PayoutHostCommandHandler(userRepo, ledgerRepo, cryptoService, commsService));

// 10. Register Notification handlers
mediator.register('GetUserNotificationsQuery', new GetUserNotificationsQueryHandler(notificationRepo));
mediator.register('MarkNotificationReadCommand', new MarkNotificationReadCommandHandler(notificationRepo));

// 11. Register Review handlers
mediator.register('CreateEventReviewCommand', new CreateEventReviewCommandHandler(reviewRepo, bookingRepo, eventRepo, userRepo));
mediator.register('GetEventReviewsQuery', new GetEventReviewsQueryHandler(reviewRepo));

// 12. Register Wishlist & Likes handlers
mediator.register('AddToWishlistCommand', new AddToWishlistCommandHandler(wishlistRepo, eventRepo));
mediator.register('RemoveFromWishlistCommand', new RemoveFromWishlistCommandHandler(wishlistRepo));
mediator.register('GetUserWishlistQuery', new GetUserWishlistQueryHandler(wishlistRepo));
mediator.register('ToggleEventLikeCommand', new ToggleEventLikeCommandHandler(eventLikeRepo, eventRepo));
mediator.register('GetUserLikedEventsQuery', new GetUserLikedEventsQueryHandler(eventLikeRepo));

// 12. Register Boosted Event handlers
mediator.register('BoostEventCommand', new BoostEventCommandHandler(boostedRepo, eventRepo));
mediator.register('GetBoostedEventsQuery', new GetBoostedEventsQueryHandler(boostedRepo));
mediator.register('RequestBoostCommand', new RequestBoostCommandHandler(boostedRepo, commsService, configRepo));
mediator.register('UpdateBoostStatusCommand', new UpdateBoostStatusCommandHandler(boostedRepo));
mediator.register('GetBoostRequestsQuery', new GetBoostRequestsQueryHandler(boostedRepo));
mediator.register('VerifyBoostPaymentCommand', new VerifyBoostPaymentCommandHandler(boostedRepo, configRepo));
mediator.register('GetBoostPricingQuery', new GetBoostPricingQueryHandler(configRepo));

// Integrations
mediator.register('SetupTwilioCommand', new SetupTwilioCommandHandler(configRepo, cryptoService, cacheService));
mediator.register('SetupSendgridCommand', new SetupSendgridCommandHandler(configRepo, cryptoService, cacheService));
mediator.register('SetupMetaWaCommand', new SetupMetaWaCommandHandler(configRepo, cryptoService, cacheService));
mediator.register('SetupRazorpayCommand', new SetupRazorpayCommandHandler(configRepo, cryptoService, cacheService));

export { mediator, logger };
export {
  userRepo,
  eventRepo,
  bookingRepo,
  ledgerRepo,
  configRepo,
  notificationRepo,
  reviewRepo,
  boostedRepo,
  wishlistRepo,
  eventLikeRepo,
  cacheService,
  queueService,
  cryptoService,
  sendGridProvider,
  twilioProvider,
  metaWaProvider,
  paymentGatewayProvider,
  emailService,
  smsService,
  whatsappService,
  commsService,
  ticketGenService,
};
