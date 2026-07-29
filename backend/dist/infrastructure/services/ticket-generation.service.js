"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketGenerationService = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const qrcode_1 = __importDefault(require("qrcode"));
class TicketGenerationService {
    /**
     * Generates a beautifully formatted PDF Invoice (BookMySkill Green Theme)
     */
    async generateInvoicePdf(booking, hostHeader) {
        return new Promise(async (resolve, reject) => {
            try {
                const doc = new pdfkit_1.default({ margin: 50 });
                const chunks = [];
                doc.on('data', (chunk) => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', (err) => reject(err));
                const client = booking.client || {};
                const event = booking.event || {};
                const host = event.host?.user || {};
                const venueName = event.mode === 'ONLINE' ? 'Online Live Stream' : (event.venueDetails?.address || 'Physical Venue');
                // Draw BookMySkill Premium Emerald Header Accent
                doc.rect(0, 0, 612, 15).fill('#064e3b');
                // Branding
                doc.moveDown(1);
                doc.fillColor('#064e3b').font('Helvetica-Bold').fontSize(22).text('BOOKMYSKILL', 50, 40);
                doc.fillColor('#4b5563').font('Helvetica').fontSize(10).text('Live Workshops & Enterprise Skill-Training', 50, 65);
                // Invoice Text
                doc.fillColor('#111827').font('Helvetica-Bold').fontSize(24).text('INVOICE', 400, 40, { align: 'right' });
                doc.fillColor('#4b5563').font('Helvetica').fontSize(9).text(`Ref: ${booking.bookingRef}`, 400, 68, { align: 'right' });
                doc.text(`Date: ${new Date(booking.createdAt).toLocaleDateString()}`, 400, 80, { align: 'right' });
                // Divider
                doc.moveTo(50, 105).lineTo(562, 105).strokeColor('#e5e7eb').lineWidth(1).stroke();
                // 2 Column Layout (Billing vs Event Info)
                const colY = 125;
                // Billing details
                doc.fillColor('#064e3b').font('Helvetica-Bold').fontSize(12).text('BILL TO:', 50, colY);
                doc.fillColor('#1f2937').font('Helvetica-Bold').fontSize(10).text(`${client.firstName} ${client.lastName}`, 50, colY + 18);
                doc.font('Helvetica').fillColor('#4b5563').fontSize(9);
                doc.text(`Email: ${client.email}`, 50, colY + 32);
                doc.text(`Phone: ${client.phone}`, 50, colY + 44);
                // Booking details
                doc.fillColor('#064e3b').font('Helvetica-Bold').fontSize(12).text('WORKSHOP DETAILS:', 300, colY);
                doc.fillColor('#1f2937').font('Helvetica-Bold').fontSize(10).text(event.title, 300, colY + 18);
                doc.font('Helvetica').fillColor('#4b5563').fontSize(9);
                doc.text(`Trainer: ${host.firstName || 'Platform'} ${host.lastName || 'Host'}`, 300, colY + 32);
                doc.text(`Schedule: ${new Date(event.startTime).toLocaleString()}`, 300, colY + 44);
                doc.text(`Venue: ${venueName}`, 300, colY + 56);
                // Divider
                doc.moveTo(50, 205).lineTo(562, 205).strokeColor('#e5e7eb').stroke();
                // Table Header
                const tableY = 225;
                doc.fillColor('#064e3b').font('Helvetica-Bold').fontSize(10);
                doc.text('Item Description', 50, tableY);
                doc.text('Quantity', 320, tableY, { width: 60, align: 'center' });
                doc.text('Unit Price', 400, tableY, { width: 80, align: 'right' });
                doc.text('Total (INR)', 490, tableY, { width: 72, align: 'right' });
                // Table Row
                const rowY = 245;
                doc.fillColor('#1f2937').font('Helvetica').fontSize(9.5);
                doc.text(`Admission Ticket - ${event.title}`, 50, rowY, { width: 250 });
                doc.text(String(booking.seatCount), 320, rowY, { width: 60, align: 'center' });
                const unitPrice = booking.totalAmount / booking.seatCount;
                doc.text(`${unitPrice.toFixed(2)}`, 400, rowY, { width: 80, align: 'right' });
                doc.text(`${booking.totalAmount.toFixed(2)}`, 490, rowY, { width: 72, align: 'right' });
                // Divider
                doc.moveTo(50, 275).lineTo(562, 275).strokeColor('#e5e7eb').stroke();
                // Totals & Status
                const summaryY = 295;
                // Payment status box
                doc.roundedRect(50, summaryY, 150, 50, 8).strokeColor(booking.status === 'CONFIRMED' ? '#10b981' : '#ef4444').lineWidth(1.5).stroke();
                doc.fillColor(booking.status === 'CONFIRMED' ? '#047857' : '#b91c1c').font('Helvetica-Bold').fontSize(11).text('PAYMENT STATUS', 65, summaryY + 12);
                doc.fontSize(13).text(booking.status, 65, summaryY + 28);
                // Price calculations
                doc.fillColor('#4b5563').font('Helvetica').fontSize(10).text('Subtotal:', 380, summaryY, { width: 100, align: 'right' });
                doc.fillColor('#1f2937').font('Helvetica-Bold').text(`${booking.totalAmount.toFixed(2)} INR`, 490, summaryY, { width: 72, align: 'right' });
                doc.fillColor('#4b5563').font('Helvetica').fontSize(10).text('Taxes & Fees:', 380, summaryY + 16, { width: 100, align: 'right' });
                doc.fillColor('#1f2937').font('Helvetica-Bold').text('0.00 INR', 490, summaryY + 16, { width: 72, align: 'right' });
                doc.fillColor('#064e3b').font('Helvetica-Bold').fontSize(12).text('Total Paid:', 380, summaryY + 36, { width: 100, align: 'right' });
                doc.fillColor('#064e3b').text(`${booking.totalAmount.toFixed(2)} INR`, 490, summaryY + 36, { width: 72, align: 'right' });
                // Divider
                doc.moveTo(50, 365).lineTo(562, 365).strokeColor('#e5e7eb').lineWidth(1).stroke();
                // Verification QR Code section
                const qrY = 385;
                doc.fillColor('#064e3b').font('Helvetica-Bold').fontSize(11).text('INVOICE VERIFICATION', 50, qrY);
                doc.fillColor('#6b7280').font('Helvetica').fontSize(8.5).text('Scan the QR code to verify the details and legitimacy of this transaction receipt online.', 50, qrY + 16, { width: 330 });
                doc.text('BookMySkill Engine - Secure Cryptographic Signatures.', 50, qrY + 44);
                // Generate QR code buffer pointing to the absolute verification endpoint URL
                const verificationUrl = `http://${hostHeader}/api/v1/bookings/${booking.id}/verify`;
                const qrBuffer = await qrcode_1.default.toBuffer(verificationUrl, { errorCorrectionLevel: 'M', margin: 1, width: 100 });
                doc.image(qrBuffer, 462, qrY - 10, { width: 100, height: 100 });
                // Footer note
                doc.fillColor('#9ca3af').fontSize(8).text('If you have questions about this invoice, please contact support@bookmyskill.com.', 50, 520, { align: 'center' });
                doc.end();
            }
            catch (err) {
                reject(err);
            }
        });
    }
    /**
     * Generates a premium green themed PDF Admission Ticket (BookMySkill Green Theme)
     */
    async generateTicketPdf(booking, hostHeader) {
        return new Promise(async (resolve, reject) => {
            try {
                const doc = new pdfkit_1.default({ margin: 0, size: [400, 600] });
                const chunks = [];
                doc.on('data', (chunk) => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', (err) => reject(err));
                const client = booking.client || {};
                const event = booking.event || {};
                const host = event.host?.user || {};
                const venueName = event.mode === 'ONLINE' ? 'Online Live Stream' : (event.venueDetails?.address || 'Physical Venue');
                const formattedDate = new Date(event.startTime).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
                const formattedTime = new Date(event.startTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
                // Draw Premium Green Gradient Top Header Block
                const grad = doc.linearGradient(0, 0, 400, 180);
                grad.stop(0, '#064e3b').stop(1, '#10b981');
                doc.rect(0, 0, 400, 180).fill(grad);
                // Header Content
                doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(10).text('B O O K M Y S K I L L   A D M I S S I O N', 30, 25, { characterSpacing: 1.2 });
                doc.fontSize(20).text(event.title.toUpperCase(), 30, 50, { width: 340, lineGap: 4 });
                doc.font('Helvetica').fontSize(11).fillColor('#d1fae5').text(event.category?.toUpperCase() || 'WORKSHOP', 30, doc.y + 4);
                // Draw Rounded Ticket Cutout Divider
                const cutY = 180;
                doc.rect(0, cutY, 400, 420).fill('#ffffff');
                // Dashed Ticket Tear Line
                doc.strokeColor('#e5e7eb').lineWidth(2.5);
                let dashX = 25;
                while (dashX < 375) {
                    doc.moveTo(dashX, cutY).lineTo(dashX + 8, cutY).stroke();
                    dashX += 16;
                }
                // Circular ticket cutouts on edges
                doc.circle(0, cutY, 12).fill('#f3f4f6');
                doc.circle(400, cutY, 12).fill('#f3f4f6');
                // Ticket Details Body
                doc.fillColor('#064e3b').font('Helvetica-Bold').fontSize(12).text('ATTENDEE', 30, cutY + 25);
                doc.fillColor('#111827').font('Helvetica-Bold').fontSize(18).text(`${client.firstName} ${client.lastName}`.toUpperCase(), 30, cutY + 42);
                doc.fillColor('#4b5563').font('Helvetica').fontSize(10).text('TICKET HOLDER / WORKSHOP ATTENDEE', 30, cutY + 62);
                // 2x2 Metadata Grid
                const gridY = cutY + 88;
                // Col 1 Row 1
                doc.fillColor('#4b5563').font('Helvetica').fontSize(9).text('DATE', 30, gridY);
                doc.fillColor('#111827').font('Helvetica-Bold').fontSize(12).text(formattedDate, 30, gridY + 14);
                // Col 2 Row 1
                doc.fillColor('#4b5563').font('Helvetica').fontSize(9).text('TIME', 200, gridY);
                doc.fillColor('#111827').font('Helvetica-Bold').fontSize(12).text(formattedTime, 200, gridY + 14);
                // Col 1 Row 2
                doc.fillColor('#4b5563').font('Helvetica').fontSize(9).text('TRAINER / INSTRUCTOR', 30, gridY + 44);
                doc.fillColor('#111827').font('Helvetica-Bold').fontSize(12).text(`${host.firstName || 'Platform'} ${host.lastName || 'Host'}`, 30, gridY + 58);
                // Col 2 Row 2
                doc.fillColor('#4b5563').font('Helvetica').fontSize(9).text('SEATS ALLOCATED', 200, gridY + 44);
                doc.fillColor('#111827').font('Helvetica-Bold').fontSize(12).text(`${booking.seatCount} SEAT(S)`, 200, gridY + 58);
                // Col 1 Row 3 (Venue)
                doc.fillColor('#4b5563').font('Helvetica').fontSize(9).text('VENUE / MEETING ROOM', 30, gridY + 88);
                doc.fillColor('#111827').font('Helvetica-Bold').fontSize(10.5).text(venueName, 30, gridY + 102, { width: 340 });
                // QR Code centered at the bottom
                const qrCenterY = gridY + 144;
                const verificationUrl = `http://${hostHeader}/api/v1/bookings/${booking.id}/verify`;
                const qrBuffer = await qrcode_1.default.toBuffer(verificationUrl, { errorCorrectionLevel: 'H', margin: 1, width: 110, color: { dark: '#064e3b', light: '#ffffff' } });
                doc.image(qrBuffer, 145, qrCenterY, { width: 110, height: 110 });
                // Ticket ID label vertical text or clean horizontal
                doc.fillColor('#9ca3af').font('Helvetica').fontSize(8.5).text(`TICKET ID: ${booking.id}`, 0, 564, { align: 'center' });
                doc.end();
            }
            catch (err) {
                reject(err);
            }
        });
    }
    /**
     * Generates a stunning vector SVG representation of the Admission Ticket card (BookMySkill Green Theme)
     */
    async generateTicketSvg(booking, hostHeader) {
        const client = booking.client || {};
        const event = booking.event || {};
        const host = event.host?.user || {};
        const venueName = event.mode === 'ONLINE' ? 'Online Live Stream' : (event.venueDetails?.address || 'Physical Venue');
        const formattedDate = new Date(event.startTime).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
        const formattedTime = new Date(event.startTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
        // Generate QR code data URL (PNG format) with green pixels and white background for SVG embedding
        const verificationUrl = `http://${hostHeader}/api/v1/bookings/${booking.id}/verify`;
        const qrDataUrl = await qrcode_1.default.toDataURL(verificationUrl, {
            errorCorrectionLevel: 'H',
            margin: 1,
            width: 250,
            color: { dark: '#064e3b', light: '#ffffff' }
        });
        // Render beautiful vector SVG layout
        return `
<svg width="400" height="600" viewBox="0 0 400 600" fill="none" xmlns="http://www.w3.org/2000/svg" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <defs>
    <!-- Background Linear Gradient -->
    <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#064e3b" />
      <stop offset="100%" stop-color="#10b981" />
    </linearGradient>
    <clipPath id="ticketClip">
      <rect width="400" height="600" rx="20" />
    </clipPath>
  </defs>

  <g clip-path="url(#ticketClip)">
    <!-- Base card shadow background -->
    <rect width="400" height="600" fill="#ffffff" />

    <!-- Top Gradient Header Block -->
    <path d="M0 0 H400 V180 H0 Z" fill="url(#greenGrad)" />

    <!-- Header Text Content -->
    <text x="30" y="35" fill="#d1fae5" font-size="9" font-weight="800" letter-spacing="1.2">B O O K M Y S K I L L   A D M I S S I O N</text>
    <text x="30" y="70" fill="#ffffff" font-size="20" font-weight="900" width="340">${event.title.toUpperCase()}</text>
    <text x="30" y="145" fill="#a7f3d0" font-size="11" font-weight="700" letter-spacing="1">${(event.category || 'Workshop').toUpperCase()}</text>

    <!-- Ticket tear tear-line separator (dashed lines) -->
    <line x1="20" y1="180" x2="380" y2="180" stroke="#e5e7eb" stroke-width="2" stroke-dasharray="6,6" />
    
    <!-- Cutout half-circles on left and right edges -->
    <circle cx="0" cy="180" r="10" fill="#f3f4f6" />
    <circle cx="400" cy="180" r="10" fill="#f3f4f6" />

    <!-- Card details body -->
    <text x="30" y="215" fill="#064e3b" font-size="11" font-weight="800" letter-spacing="0.5">ATTENDEE</text>
    <text x="30" y="240" fill="#111827" font-size="18" font-weight="800">${(client.firstName + ' ' + client.lastName).toUpperCase()}</text>
    <text x="30" y="258" fill="#6b7280" font-size="9.5" font-weight="600">TICKET HOLDER / WORKSHOP ATTENDEE</text>

    <!-- Grid Column 1 -->
    <g transform="translate(30, 290)">
      <text x="0" y="0" fill="#6b7280" font-size="9" font-weight="600">DATE</text>
      <text x="0" y="16" fill="#111827" font-size="12.5" font-weight="800">${formattedDate}</text>

      <text x="0" y="48" fill="#6b7280" font-size="9" font-weight="600">TRAINER / INSTRUCTOR</text>
      <text x="0" y="64" fill="#111827" font-size="12.5" font-weight="800">${host.firstName || 'Platform'} ${host.lastName || 'Host'}</text>

      <text x="0" y="96" fill="#6b7280" font-size="9" font-weight="600">VENUE / MEETING ROOM</text>
      <text x="0" y="112" fill="#111827" font-size="11" font-weight="800">${venueName}</text>
    </g>

    <!-- Grid Column 2 -->
    <g transform="translate(210, 290)">
      <text x="0" y="0" fill="#6b7280" font-size="9" font-weight="600">TIME</text>
      <text x="0" y="16" fill="#111827" font-size="12.5" font-weight="800">${formattedTime}</text>

      <text x="0" y="48" fill="#6b7280" font-size="9" font-weight="600">SEATS ALLOCATED</text>
      <text x="0" y="64" fill="#111827" font-size="12.5" font-weight="800">${booking.seatCount} SEAT(S)</text>
    </g>

    <!-- Center QR Code placement (embedded base64 PNG) -->
    <image href="${qrDataUrl}" x="145" y="435" width="110" height="110" />

    <!-- Footer Ticket ID label -->
    <text x="200" y="570" fill="#9ca3af" font-size="8.5" font-weight="600" text-anchor="middle">TICKET ID: ${booking.id}</text>
  </g>
</svg>
`.trim();
    }
}
exports.TicketGenerationService = TicketGenerationService;
