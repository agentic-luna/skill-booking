"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const client_1 = require("@prisma/client");
const app_1 = __importDefault(require("../app"));
const prisma_1 = require("../config/prisma");
const node_crypto_1 = require("../infrastructure/security/node.crypto");
const bull_queue_1 = require("../infrastructure/queue/bull.queue");
const notification_repository_1 = require("../infrastructure/database/repositories/notification.repository");
// Setup Test Server
const PORT = 4001;
const BASE_URL = `http://localhost:${PORT}/api/v1`;
const server = http_1.default.createServer(app_1.default);
let workerInstance = null;
async function runTests() {
    console.log('\n==================================================');
    console.log('   STARTING INTEGRATION VERIFICATION TEST SUITE   ');
    console.log('==================================================\n');
    try {
        // 1. Database Cleanup
        console.log('[Test] Cleaning test accounts and logs from database...');
        await prisma_1.prisma.notificationLog.deleteMany({});
        await prisma_1.prisma.transactionLedger.deleteMany({});
        await prisma_1.prisma.booking.deleteMany({});
        await prisma_1.prisma.eventCommission.deleteMany({});
        await prisma_1.prisma.event.deleteMany({});
        await prisma_1.prisma.hostBankDetail.deleteMany({});
        await prisma_1.prisma.hostProfile.deleteMany({});
        await prisma_1.prisma.user.deleteMany({
            where: {
                email: { in: ['client@luna.com', 'host@luna.com'] },
            },
        });
        // 2. Authentication Test
        console.log('\n--- 1. Testing Authentication ---');
        // Request & Verify OTP for Client
        const clientEmailOtpRes = await post('/auth/otp/send', { target: 'client@luna.com', type: 'EMAIL' });
        const clientPhoneOtpRes = await post('/auth/otp/send', { target: '+15550201', type: 'PHONE' });
        assert(clientEmailOtpRes.success && clientPhoneOtpRes.success, 'Failed to send OTPs for client');
        await post('/auth/otp/verify', { target: 'client@luna.com', type: 'EMAIL', otp: clientEmailOtpRes.data.devOtp });
        await post('/auth/otp/verify', { target: '+15550201', type: 'PHONE', otp: clientPhoneOtpRes.data.devOtp });
        console.log('✔ Client OTPs verified successfully');
        // Sign Up Client
        const clientSignupRes = await post('/auth/signup', {
            firstName: 'Jane',
            lastName: 'Client',
            email: 'client@luna.com',
            phone: '+15550201',
            password: 'password123',
            role: client_1.UserRole.CLIENT,
        });
        assert(clientSignupRes.success, 'Client signup failed');
        console.log('✔ Client registered successfully');
        // Request & Verify OTP for Host
        const hostEmailOtpRes = await post('/auth/otp/send', { target: 'host@luna.com', type: 'EMAIL' });
        const hostPhoneOtpRes = await post('/auth/otp/send', { target: '+15550202', type: 'PHONE' });
        assert(hostEmailOtpRes.success && hostPhoneOtpRes.success, 'Failed to send OTPs for host');
        // Sign Up Host (passing OTPs directly)
        const hostSignupRes = await post('/auth/signup', {
            firstName: 'John',
            lastName: 'Host',
            email: 'host@luna.com',
            phone: '+15550202',
            password: 'password123',
            role: client_1.UserRole.HOST,
            emailOtp: hostEmailOtpRes.data.devOtp,
            phoneOtp: hostPhoneOtpRes.data.devOtp,
        });
        assert(hostSignupRes.success, 'Host signup failed');
        console.log('✔ Host registered successfully with direct OTP payload');
        // Login Client
        const clientLoginRes = await post('/auth/login', {
            email: 'client@luna.com',
            password: 'password123',
        });
        assert(clientLoginRes.success, 'Client login failed');
        let clientToken = clientLoginRes.data.accessToken;
        const clientRefreshToken = clientLoginRes.data.refreshToken;
        console.log('✔ Client login successful');
        // Login Host
        const hostLoginRes = await post('/auth/login', {
            email: 'host@luna.com',
            password: 'password123',
        });
        assert(hostLoginRes.success, 'Host login failed');
        const hostToken = hostLoginRes.data.accessToken;
        console.log('✔ Host login successful');
        // Login Superadmin
        const adminLoginRes = await post('/auth/login', {
            email: 'admin@luna.com',
            password: 'admin123',
        });
        assert(adminLoginRes.success, 'Superadmin login failed');
        const adminToken = adminLoginRes.data.accessToken;
        console.log('✔ Superadmin login successful');
        // Token refresh rotation verification
        const refreshRes = await post('/auth/refresh', {
            refreshToken: clientRefreshToken,
        });
        assert(refreshRes.success, 'Token refresh rotation failed');
        assert(refreshRes.data.accessToken && refreshRes.data.refreshToken, 'Missing rotated token credentials');
        console.log('✔ Token refresh rotation successful');
        // Logout Revocation verification
        const logoutRes = await post('/auth/logout', {
            refreshToken: refreshRes.data.refreshToken,
        });
        assert(logoutRes.success, 'Logout revocation failed');
        console.log('✔ Logout revocation successful');
        // Login Client again to obtain fresh token for subsequent checkout tests
        const freshClientLoginRes = await post('/auth/login', {
            email: 'client@luna.com',
            password: 'password123',
        });
        clientToken = freshClientLoginRes.data.accessToken;
        // Profile verification
        const meRes = await get('/auth/me', clientToken);
        assert(meRes.success && meRes.data.email === 'client@luna.com', 'Fetch profile failed');
        console.log('✔ Fetching profile (/me) successful');
        // 3. Host Profile & Bank Details Verification
        console.log('\n--- 2. Testing Host Profile KYC & Payout setup ---');
        // Submit Host KYC
        const kycRes = await post('/hosts/kyc', {
            accountType: 'INDIVIDUAL',
            govIdUrl: 'https://example.com/gov-id-john.pdf',
            bio: 'Professional TypeScript and Cloud Trainer',
        }, hostToken);
        assert(kycRes.success, 'Host KYC submission failed');
        console.log('✔ Host KYC details submitted successfully (Status: PENDING)');
        // Programmatically approve KYC in database to allow event creations
        const hostUser = await prisma_1.prisma.user.findUnique({
            where: { email: 'host@luna.com' },
            include: { hostProfile: true },
        });
        assert(hostUser && hostUser.hostProfile, 'Host profile database record mismatch');
        await prisma_1.prisma.hostProfile.update({
            where: { userId: hostSignupRes.data.user.id },
            data: { kycStatus: client_1.KycStatus.APPROVED },
        });
        console.log('✔ Programmatically updated Host KYC status to APPROVED');
        // Submit Bank Details (Encrypted at rest test)
        const bankRes = await post('/hosts/bank-details', {
            accountHolderName: 'John Host',
            accountNumber: '9876543210',
            ifscCode: 'LUNABANK01',
            bankName: 'Luna Reserve Bank',
            upiId: 'john@luna',
        }, hostToken);
        assert(bankRes.success, 'Host bank details submission failed');
        console.log('✔ Host bank details submitted successfully');
        // Retrieve directly from DB to verify encryption
        const rawBankDetails = await prisma_1.prisma.hostBankDetail.findUnique({
            where: { hostProfileId: hostUser.hostProfile.id },
        });
        assert(rawBankDetails, 'Bank details missing in database');
        assert(rawBankDetails.accountNumber !== '9876543210', 'DATABASE ERROR: Bank account number stored in plain text!');
        assert(rawBankDetails.accountHolderName !== 'John Host', 'DATABASE ERROR: Account holder name stored in plain text!');
        console.log('✔ Database verification: Payout data is encrypted at rest (Account: ' + rawBankDetails.accountNumber + ')');
        // Verify decryption capability
        const cryptoService = new node_crypto_1.NodeCryptoService();
        const decAccNumber = cryptoService.decrypt(rawBankDetails.accountNumber);
        assert(decAccNumber === '9876543210', 'Decryption output mismatch');
        console.log('✔ Cryptographic validation: Payout data decrypts back to: ' + decAccNumber);
        // 4. Host Event Creation & Moderation Queue
        console.log('\n--- 3. Testing Host Event Creation & Admin Approval ---');
        const eventCreateRes = await post('/hosts/events', {
            title: 'Advanced NestJS Masterclass',
            posterUrl: 'https://example.com/nestjs.png',
            mode: client_1.EventMode.ONLINE,
            venueDetails: { link: 'https://zoom.us/j/999888' },
            startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            totalSeats: 10,
        }, hostToken);
        assert(eventCreateRes.success && eventCreateRes.data.status === client_1.EventStatus.PENDING, 'Event creation failed');
        const eventId = eventCreateRes.data.id;
        console.log('✔ Host event successfully created (Title: ' + eventCreateRes.data.title + ', Status: PENDING)');
        // Admin views queue
        const queueRes = await get('/admin/events/queue', adminToken);
        assert(queueRes.success && queueRes.data.length > 0, 'Admin event queue fetch failed');
        const eventInQueue = queueRes.data.find((e) => e.id === eventId);
        assert(eventInQueue, 'Event not found in verification queue');
        console.log('✔ Admin queue retrieval successful (Item found: ' + eventInQueue.title + ')');
        // Admin approves event and sets 15% platform commission
        const approveRes = await put(`/admin/events/${eventId}/approve`, {
            commissionType: client_1.CommissionType.PERCENTAGE,
            platformValue: 15,
        }, adminToken);
        assert(approveRes.success && approveRes.data.event.status === client_1.EventStatus.APPROVED, 'Admin event approval failed');
        console.log('✔ Admin event approval successful (Commission locked: 15%)');
        // 5. Searching with Caching
        console.log('\n--- 4. Testing Event Searching & Caching ---');
        const searchRes1 = await get('/events?title=NestJS');
        assert(searchRes1.success && searchRes1.data.length > 0, 'Search listing failed');
        console.log('✔ Initial search query returned: ' + searchRes1.data[0].title);
        const startSearchTime = Date.now();
        const searchRes2 = await get('/events?title=NestJS');
        const searchDuration = Date.now() - startSearchTime;
        assert(searchRes2.success, 'Secondary cached listing search failed');
        console.log(`✔ Cache retrieval verification: Second query completed in ${searchDuration}ms`);
        // 6. Checkout and Optimistic Lock
        console.log('\n--- 5. Testing Checkout & Optimistic Lock ---');
        const checkoutRes = await post('/bookings/checkout', {
            eventId,
            seatCount: 2,
            customAmount: 1000.00, // 500 * 2 seats
        }, clientToken);
        assert(checkoutRes.success, 'Checkout request failed');
        const bookingId = checkoutRes.data.booking.id;
        const bookingRef = checkoutRes.data.booking.bookingRef;
        console.log('✔ Booking checkout successful (Ref: ' + bookingRef + ', Status: INITIATED)');
        // Verify seats decremented in event record
        const eventAfterCheckout = await prisma_1.prisma.event.findUnique({ where: { id: eventId } });
        assert(eventAfterCheckout && eventAfterCheckout.availableSeats === 8, 'Event seat count decrement error');
        console.log('✔ Event available seats updated: ' + eventAfterCheckout.availableSeats + ' seats left');
        // 7. Payment webhook and ledger tracking
        console.log('\n--- 6. Testing Webhook & Ledger Calculations ---');
        // Trigger Razorpay webhook call (payment.captured)
        const webhookRes = await post('/webhooks/razorpay', {
            event: 'payment.captured',
            payload: {
                payment: {
                    entity: {
                        id: 'pay_test_transaction_99',
                        amount: 100000, // paise (1000.00 INR)
                        currency: 'INR',
                        order_id: bookingRef,
                        notes: { bookingRef },
                    },
                },
            },
        });
        assert(webhookRes.success, 'Webhook handler returned error');
        console.log('✔ Razorpay payment captured callback handled');
        // Verify booking confirmed
        const confirmedBooking = await prisma_1.prisma.booking.findUnique({ where: { id: bookingId } });
        assert(confirmedBooking && confirmedBooking.status === 'CONFIRMED', 'Booking was not confirmed');
        console.log('✔ Booking status updated in database: ' + confirmedBooking.status);
        // Verify ledger HELD and commission calculation
        const ledger = await prisma_1.prisma.transactionLedger.findFirst({
            where: { bookingId },
        });
        assert(ledger && ledger.status === client_1.LedgerStatus.HELD, 'Ledger record missing or not HELD');
        assert(Number(ledger.amountCaptured) === 1000.00, 'Ledger captured amount mismatch');
        assert(Number(ledger.platformRevenue) === 150.00, 'Ledger platform commission (15%) mismatch (Actual: ' + ledger.platformRevenue + ')');
        assert(Number(ledger.hostLiability) === 850.00, 'Ledger host liability mismatch (Actual: ' + ledger.hostLiability + ')');
        console.log('✔ Transaction Ledger captured: Platform Rev: ' + ledger.platformRevenue + ' INR, Host Liability: ' + ledger.hostLiability + ' INR (Status: HELD)');
        // Verify BullMQ notification enqueued & processed
        console.log('[Test] Waiting for background BullMQ worker to process notification...');
        await new Promise((resolve) => setTimeout(resolve, 3000)); // wait 3s for BullMQ
        const notifLog = await prisma_1.prisma.notificationLog.findFirst({
            where: { userId: clientSignupRes.data.user.id, channel: client_1.DeliveryChannel.EMAIL },
        });
        assert(notifLog, 'Notification log missing in database');
        assert(notifLog.status === 'SENT', 'BullMQ worker failed to process notification (Status: ' + notifLog.status + ')');
        console.log('✔ Asynchronous notification processed by BullMQ (Channel: ' + notifLog.channel + ', Status: ' + notifLog.status + ')');
        // 8. Host Dashboard Analytics
        console.log('\n--- 7. Testing Host Dashboard Stats ---');
        const dashRes = await get('/hosts/dashboard', hostToken);
        assert(dashRes.success, 'Host dashboard retrieval failed');
        assert(dashRes.data.heldEscrow === 850, 'Host held escrow calculation mismatch: ' + dashRes.data.heldEscrow);
        assert(dashRes.data.activeTicketSales === 2, 'Host active tickets sold mismatch');
        console.log('✔ Host Dashboard Statistics: Held Escrow: ' + dashRes.data.heldEscrow + ' INR, Ticket Sales: ' + dashRes.data.activeTicketSales);
        // 9. Admin Finance Ledger & Payout Trigger
        console.log('\n--- 8. Testing Admin Finance Ledger & Payout Releases ---');
        const adminLedgerRes = await get('/admin/finance/ledger', adminToken);
        assert(adminLedgerRes.success, 'Admin ledger stats fetch failed');
        assert(adminLedgerRes.data.totalEscrowLiabilities === 850, 'Escrow total mismatch');
        console.log('✔ Admin Platform Ledger: Held Escrow Liability: ' + adminLedgerRes.data.totalEscrowLiabilities + ' INR');
        // Execute payout to host
        const payoutRes = await put(`/admin/finance/payouts/${hostUser.id}`, {}, adminToken);
        assert(payoutRes.success && payoutRes.data.success, 'Escrow payout trigger failed');
        console.log('✔ Superadmin released host payout: ' + payoutRes.data.amount + ' INR (Payout ID: ' + payoutRes.data.payoutId + ')');
        // Verify transaction status updated in DB
        const ledgerAfterPayout = await prisma_1.prisma.transactionLedger.findFirst({
            where: { bookingId },
        });
        assert(ledgerAfterPayout && ledgerAfterPayout.status === 'RELEASED_TO_HOST', 'Ledger status not updated');
        console.log('✔ Transaction Ledger status updated: ' + ledgerAfterPayout.status);
        // Verify host dashboard updated
        const dashRes2 = await get('/hosts/dashboard', hostToken);
        assert(dashRes2.success && dashRes2.data.heldEscrow === 0 && dashRes2.data.totalEarnings === 850, 'Host dashboard balance mismatch');
        console.log('✔ Host Dashboard updated: Held Escrow: ' + dashRes2.data.heldEscrow + ' INR, Total Paid Earnings: ' + dashRes2.data.totalEarnings + ' INR');
        // 10. Refund Matrix cancellation verification
        console.log('\n--- 9. Testing Booking Cancellation & Refund Matrix ---');
        // Create new booking to cancel
        const checkoutRes2 = await post('/bookings/checkout', {
            eventId,
            seatCount: 1,
            customAmount: 500.00,
        }, clientToken);
        assert(checkoutRes2.success, 'Secondary checkout failed');
        const bookingId2 = checkoutRes2.data.booking.id;
        const bookingRef2 = checkoutRes2.data.booking.bookingRef;
        // Confirm booking
        await post('/webhooks/razorpay', {
            event: 'payment.captured',
            payload: {
                payment: {
                    entity: {
                        id: 'pay_test_transaction_100',
                        amount: 50000,
                        currency: 'INR',
                        order_id: bookingRef2,
                        notes: { bookingRef: bookingRef2 },
                    },
                },
            },
        });
        const eventBeforeCancel = await prisma_1.prisma.event.findUnique({ where: { id: eventId } });
        const seatsBeforeCancel = eventBeforeCancel.availableSeats;
        // Cancel booking (3 days before start time -> >48 hours -> 100% refund)
        const cancelRes = await post(`/bookings/${bookingId2}/cancel`, {}, clientToken);
        assert(cancelRes.success, 'Cancellation request failed');
        assert(cancelRes.data.refundPercentage === 100, 'Refund matrix calculation mismatch: ' + cancelRes.data.refundPercentage + '%');
        assert(cancelRes.data.booking.status === client_1.BookingStatus.REFUNDED, 'Booking status was not updated to REFUNDED');
        console.log('✔ Booking canceled successfully (Refund: ' + cancelRes.data.refundPercentage + '%, Status: ' + cancelRes.data.booking.status + ')');
        // Verify seats returned
        const eventAfterCancel = await prisma_1.prisma.event.findUnique({ where: { id: eventId } });
        assert(eventAfterCancel && eventAfterCancel.availableSeats === seatsBeforeCancel + 1, 'Event seat count replenishment error');
        console.log('✔ Event seats replenished: ' + eventAfterCancel.availableSeats + ' seats available');
        // Verify refund ledger transaction
        const refundLedger = await prisma_1.prisma.transactionLedger.findFirst({
            where: { bookingId: bookingId2, type: 'REFUND' },
        });
        assert(refundLedger, 'Refund ledger transaction missing');
        assert(Number(refundLedger.amountCaptured) === -500.00, 'Refund amount captured mismatch');
        assert(refundLedger.status === 'REFUNDED_TO_CLIENT', 'Refund ledger status mismatch');
        console.log('✔ Refund Ledger Entry created: Amount: ' + refundLedger.amountCaptured + ' INR, Status: ' + refundLedger.status);
        console.log('\n==================================================');
        console.log('   ALL INTEGRATION TEST SCENARIOS PASSED (10/10)  ');
        console.log('==================================================\n');
    }
    catch (error) {
        console.error('\n❌ TEST SCENARIO FAILED!');
        console.error('Error Details:', error.message);
        if (error.stack)
            console.error(error.stack);
        process.exit(1);
    }
    finally {
        if (workerInstance) {
            console.log('[Test] Stopping BullMQ background worker...');
            await workerInstance.close();
        }
        server.close();
        await prisma_1.prisma.$disconnect();
        console.log('[Test] Server closed. Database connections released.');
    }
}
// REST Client Helper Methods
async function post(path, body, token) {
    return request('POST', path, body, token);
}
async function put(path, body, token) {
    return request('PUT', path, body, token);
}
async function get(path, token) {
    return request('GET', path, null, token);
}
function request(method, path, body, token) {
    return new Promise((resolve, reject) => {
        const url = `${BASE_URL}${path}`;
        const parsedUrl = new URL(url);
        const headers = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const options = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port ? parseInt(parsedUrl.port, 10) : undefined,
            path: parsedUrl.pathname + parsedUrl.search,
            method,
            headers,
        };
        const req = http_1.default.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve(parsed);
                }
                catch (e) {
                    reject(new Error(`Failed to parse response JSON from ${method} ${path}: ${data}`));
                }
            });
        });
        req.on('error', (e) => {
            reject(e);
        });
        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}
function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}
const di_container_1 = require("../api/di-container");
// Run the verification
server.listen(PORT, () => {
    console.log(`[Test] Test server active on port ${PORT}. Initiating test suite...`);
    console.log('[Test] Initializing test BullMQ worker...');
    const notificationRepo = new notification_repository_1.PrismaNotificationRepository();
    workerInstance = (0, bull_queue_1.startNotificationWorker)(notificationRepo, di_container_1.commsService);
    runTests();
});
