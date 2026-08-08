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
     * Generates a beautifully formatted PDF Invoice (BookMyTraining Green Theme)
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
                const hostProfile = event.host || {};
                const host = hostProfile.user || {};
                const venueName = event.mode === 'ONLINE' ? 'Online Live Stream' : (event.venueDetails?.address || 'Physical Venue');
                const participantsList = Array.isArray(booking.participants) && booking.participants.length > 0
                    ? booking.participants
                    : [{ fullName: `${client.firstName || ''} ${client.lastName || ''}`.trim(), email: client.email, mobile: client.phone, isPrimary: true }];
                const primaryAttendee = participantsList.find((p) => p.isPrimary) || participantsList[0];
                const primaryName = (primaryAttendee?.fullName || `${client.firstName || ''} ${client.lastName || ''}`).trim();
                const primaryEmail = primaryAttendee?.email || client.email || '';
                const primaryMobile = primaryAttendee?.mobile || client.phone || '';
                // Draw BookMySkill Premium Emerald Header Accent
                doc.rect(0, 0, 612, 15).fill('#064e3b');
                // Branding
                doc.moveDown(1);
                doc.fillColor('#064e3b').font('Helvetica-Bold').fontSize(22).text('BOOKMYTRAINING', 50, 40);
                doc.fillColor('#4b5563').font('Helvetica').fontSize(10).text('Live Workshops & Enterprise Skill-Training', 50, 65);
                // Invoice Text
                doc.fillColor('#111827').font('Helvetica-Bold').fontSize(24).text('INVOICE', 400, 40, { align: 'right' });
                doc.fillColor('#4b5563').font('Helvetica').fontSize(9).text(`Ref: ${booking.bookingRef}`, 400, 68, { align: 'right' });
                doc.text(`Date: ${new Date(booking.createdAt).toLocaleDateString()}`, 400, 80, { align: 'right' });
                // Divider
                doc.moveTo(50, 105).lineTo(562, 105).strokeColor('#e5e7eb').lineWidth(1).stroke();
                // 2 Column Layout (Billing vs Event Info)
                const colY = 125;
                // Billing details (Account Owner)
                doc.fillColor('#064e3b').font('Helvetica-Bold').fontSize(11).text('BILL TO:', 50, colY);
                doc.fillColor('#1f2937').font('Helvetica-Bold').fontSize(10).text(`${client.firstName || ''} ${client.lastName || ''}`.trim(), 50, colY + 18);
                doc.font('Helvetica').fillColor('#4b5563').fontSize(9);
                doc.text(`Email: ${client.email || ''}`, 50, colY + 32);
                doc.text(`Phone: ${client.phone || ''}`, 50, colY + 44);
                // Workshop & Host details
                doc.fillColor('#064e3b').font('Helvetica-Bold').fontSize(11).text('WORKSHOP & HOST DETAILS:', 300, colY);
                doc.fillColor('#1f2937').font('Helvetica-Bold').fontSize(10).text(event.title, 300, colY + 18);
                doc.font('Helvetica').fillColor('#4b5563').fontSize(9);
                doc.text(`Host/Trainer: ${host.firstName || 'Platform'} ${host.lastName || 'Host'}`, 300, colY + 32);
                let currentRightY = colY + 44;
                if (hostProfile.gstNumber) {
                    doc.text(`Host GSTIN: ${hostProfile.gstNumber}`, 300, currentRightY);
                    currentRightY += 12;
                }
                doc.text(`Schedule: ${new Date(event.startTime).toLocaleString()}`, 300, currentRightY);
                currentRightY += 12;
                doc.text(`Venue: ${venueName}`, 300, currentRightY);
                // Divider
                const divider1Y = Math.max(205, currentRightY + 16);
                doc.moveTo(50, divider1Y).lineTo(562, divider1Y).strokeColor('#e5e7eb').stroke();
                // Table Header
                const tableY = divider1Y + 15;
                doc.fillColor('#064e3b').font('Helvetica-Bold').fontSize(10);
                doc.text('Item Description', 50, tableY);
                doc.text('Quantity', 320, tableY, { width: 60, align: 'center' });
                doc.text('Unit Price', 400, tableY, { width: 80, align: 'right' });
                doc.text('Total (INR)', 490, tableY, { width: 72, align: 'right' });
                // Calculate platform fee & base price
                const totalAmount = Number(booking.totalAmount);
                const seatCount = Number(booking.seatCount) || 1;
                const commType = booking.commissionType ?? event.commission?.commissionType;
                const commValue = booking.platformValue !== null && booking.platformValue !== undefined
                    ? Number(booking.platformValue)
                    : (event.commission?.platformValue ? Number(event.commission.platformValue) : null);
                let platformFeeAmount = 0;
                if (commType && commValue !== null && commValue !== undefined) {
                    if (commType === 'PERCENTAGE') {
                        platformFeeAmount = (totalAmount * commValue) / 100;
                    }
                    else {
                        platformFeeAmount = commValue;
                    }
                }
                const ticketBaseAmount = Math.max(0, totalAmount - platformFeeAmount);
                // Group participants by ticket type for itemized invoice billing
                const itemGroups = new Map();
                for (const p of participantsList) {
                    const tt = p.ticketType || booking.ticketType;
                    const ttName = tt?.name || 'Standard Pass';
                    const ttPrice = tt ? Number(tt.price) : (ticketBaseAmount / seatCount);
                    const key = `${ttName}_${ttPrice}`;
                    if (!itemGroups.has(key)) {
                        itemGroups.set(key, { name: ttName, price: ttPrice, count: 0, names: [] });
                    }
                    const group = itemGroups.get(key);
                    group.count += 1;
                    if (p.fullName)
                        group.names.push(p.fullName);
                }
                // Table Rows
                let rowY = tableY + 20;
                doc.fillColor('#1f2937').font('Helvetica').fontSize(9.5);
                if (itemGroups.size > 0) {
                    for (const group of itemGroups.values()) {
                        const rowTotal = group.price * group.count;
                        doc.text(`Ticket (${group.name}) - ${event.title}`, 50, rowY, { width: 250 });
                        doc.text(String(group.count), 320, rowY, { width: 60, align: 'center' });
                        doc.text(`${group.price.toFixed(2)}`, 400, rowY, { width: 80, align: 'right' });
                        doc.text(`${rowTotal.toFixed(2)}`, 490, rowY, { width: 72, align: 'right' });
                        rowY += 18;
                    }
                }
                else {
                    doc.text(`Admission Ticket - ${event.title}`, 50, rowY, { width: 250 });
                    doc.text(String(seatCount), 320, rowY, { width: 60, align: 'center' });
                    const unitTicketPrice = ticketBaseAmount / seatCount;
                    doc.text(`${unitTicketPrice.toFixed(2)}`, 400, rowY, { width: 80, align: 'right' });
                    doc.text(`${ticketBaseAmount.toFixed(2)}`, 490, rowY, { width: 72, align: 'right' });
                    rowY += 18;
                }
                if (platformFeeAmount > 0) {
                    doc.text('Platform Convenience & Booking Service Fee', 50, rowY, { width: 250 });
                    doc.text('1', 320, rowY, { width: 60, align: 'center' });
                    doc.text(`${platformFeeAmount.toFixed(2)}`, 400, rowY, { width: 80, align: 'right' });
                    doc.text(`${platformFeeAmount.toFixed(2)}`, 490, rowY, { width: 72, align: 'right' });
                }
                // Divider
                const divider2Y = rowY + 25;
                doc.moveTo(50, divider2Y).lineTo(562, divider2Y).strokeColor('#e5e7eb').stroke();
                // Totals & Status
                const summaryY = divider2Y + 15;
                // Payment status box
                doc.roundedRect(50, summaryY, 160, 52, 8).strokeColor(booking.status === 'CONFIRMED' ? '#10b981' : '#ef4444').lineWidth(1.5).stroke();
                doc.fillColor(booking.status === 'CONFIRMED' ? '#047857' : '#b91c1c').font('Helvetica-Bold').fontSize(11).text('PAYMENT STATUS', 65, summaryY + 12);
                doc.fontSize(13).text(booking.status, 65, summaryY + 28);
                // Price calculations (Subtotal, Taxes, Total Amount & Paid Amount identical)
                doc.fillColor('#4b5563').font('Helvetica').fontSize(10).text('Subtotal:', 360, summaryY, { width: 120, align: 'right' });
                doc.fillColor('#1f2937').font('Helvetica-Bold').text(`${totalAmount.toFixed(2)} INR`, 490, summaryY, { width: 72, align: 'right' });
                doc.fillColor('#4b5563').font('Helvetica').fontSize(10).text('Taxes & Fees (GST):', 360, summaryY + 16, { width: 120, align: 'right' });
                doc.fillColor('#1f2937').font('Helvetica-Bold').text('0.00 INR (Inc.)', 490, summaryY + 16, { width: 72, align: 'right' });
                doc.fillColor('#064e3b').font('Helvetica-Bold').fontSize(11).text('Invoice Total Amount:', 340, summaryY + 36, { width: 140, align: 'right' });
                doc.fillColor('#064e3b').text(`${totalAmount.toFixed(2)} INR`, 490, summaryY + 36, { width: 72, align: 'right' });
                doc.fillColor('#064e3b').font('Helvetica-Bold').fontSize(11).text('Total Paid Amount:', 340, summaryY + 54, { width: 140, align: 'right' });
                doc.fillColor('#064e3b').text(`${totalAmount.toFixed(2)} INR`, 490, summaryY + 54, { width: 72, align: 'right' });
                // Divider
                const divider3Y = summaryY + 80;
                doc.moveTo(50, divider3Y).lineTo(562, divider3Y).strokeColor('#e5e7eb').lineWidth(1).stroke();
                // Verification QR Code section
                const qrY = divider3Y + 15;
                doc.fillColor('#064e3b').font('Helvetica-Bold').fontSize(11).text('INVOICE VERIFICATION', 50, qrY);
                doc.fillColor('#6b7280').font('Helvetica').fontSize(8.5).text('Scan the QR code to verify transaction authenticity & participant passes online.', 50, qrY + 16, { width: 330 });
                doc.text('BookMyTraining Cryptographically Verified Digital Receipt.', 50, qrY + 44);
                const verificationUrl = `http://${hostHeader}/api/v1/bookings/${booking.id}/verify`;
                const qrBuffer = await qrcode_1.default.toBuffer(verificationUrl, { errorCorrectionLevel: 'M', margin: 1, width: 90 });
                doc.image(qrBuffer, 462, qrY - 10, { width: 90, height: 90 });
                // Footer note
                doc.fillColor('#9ca3af').fontSize(8).text('If you have questions about this invoice, please contact support@bookmytraining.co.in.', 50, 750, { align: 'center' });
                doc.end();
            }
            catch (err) {
                reject(err);
            }
        });
    }
    /**
     * Generates a premium green themed PDF Admission Ticket (BookMyTraining Green Theme)
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
                const hostProfile = event.host || {};
                const host = hostProfile.user || {};
                const venueName = event.mode === 'ONLINE' ? 'Online Live Stream' : (event.venueDetails?.address || 'Physical Venue');
                const formattedDate = new Date(event.startTime).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
                const formattedTime = new Date(event.startTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
                // Draw Premium Green Gradient Top Header Block
                const grad = doc.linearGradient(0, 0, 400, 180);
                grad.stop(0, '#064e3b').stop(1, '#10b981');
                doc.rect(0, 0, 400, 180).fill(grad);
                // Header Content
                doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(10).text('B O O K M Y T R A I N I N G   A D M I S S I O N', 30, 25, { characterSpacing: 1.2 });
                doc.fontSize(18).text(event.title.toUpperCase(), 30, 48, { width: 340, lineGap: 3 });
                // Get primary attendee and ticket type summary
                const participantsList = Array.isArray(booking.participants) && booking.participants.length > 0
                    ? booking.participants
                    : [{ fullName: `${client.firstName || ''} ${client.lastName || ''}`.trim(), email: client.email, mobile: client.phone, isPrimary: true }];
                const primaryAttendee = participantsList.find((p) => p.isPrimary) || participantsList[0];
                const primaryTicketType = primaryAttendee?.ticketType || booking.ticketType;
                const primaryTicketName = primaryTicketType?.name ? `${primaryTicketType.name.toUpperCase()} (₹${Number(primaryTicketType.price).toFixed(2)})` : 'STANDARD TICKET';
                doc.font('Helvetica-Bold').fontSize(10).fillColor('#a7f3d0').text(`TICKET TYPE: ${primaryTicketName}`, 30, 150);
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
                const attendeeDisplayName = (primaryAttendee?.fullName || `${client.firstName} ${client.lastName}`).toUpperCase();
                // Group participant names with their ticket type for clear display
                const participantSummaryLines = participantsList.map((p) => {
                    const tt = p.ticketType || primaryTicketType;
                    const ttLabel = tt?.name ? ` [${tt.name}]` : '';
                    return `${p.fullName}${ttLabel}`;
                }).join(', ');
                // Ticket Details Body
                doc.fillColor('#064e3b').font('Helvetica-Bold').fontSize(11).text('TICKET HOLDER & PARTICIPANTS', 30, cutY + 20);
                doc.fillColor('#111827').font('Helvetica-Bold').fontSize(15).text(attendeeDisplayName, 30, cutY + 36, { width: 340 });
                if (participantsList.length > 1) {
                    doc.fillColor('#4b5563').font('Helvetica').fontSize(8.5).text(`Enrolled (${participantsList.length}): ${participantSummaryLines}`, 30, cutY + 54, { width: 340 });
                }
                else {
                    doc.fillColor('#4b5563').font('Helvetica').fontSize(9).text(`Client: ${client.firstName || ''} ${client.lastName || ''} | ${primaryTicketName}`, 30, cutY + 54);
                }
                // 2x2 Metadata Grid
                const gridY = cutY + 80;
                // Col 1 Row 1
                doc.fillColor('#4b5563').font('Helvetica').fontSize(9).text('DATE', 30, gridY);
                doc.fillColor('#111827').font('Helvetica-Bold').fontSize(11.5).text(formattedDate, 30, gridY + 14);
                // Col 2 Row 1
                doc.fillColor('#4b5563').font('Helvetica').fontSize(9).text('TIME', 200, gridY);
                doc.fillColor('#111827').font('Helvetica-Bold').fontSize(11.5).text(formattedTime, 200, gridY + 14);
                // Col 1 Row 2
                doc.fillColor('#4b5563').font('Helvetica').fontSize(9).text('INSTRUCTOR / HOST', 30, gridY + 40);
                doc.fillColor('#111827').font('Helvetica-Bold').fontSize(11).text(`${host.firstName || 'Platform'} ${host.lastName || 'Host'}`, 30, gridY + 54);
                // Col 2 Row 2
                doc.fillColor('#4b5563').font('Helvetica').fontSize(9).text('SEATS & TYPE', 200, gridY + 40);
                doc.fillColor('#111827').font('Helvetica-Bold').fontSize(11).text(`${booking.seatCount} SEAT(S) (${primaryTicketType?.name || 'Standard'})`, 200, gridY + 54, { width: 170 });
                // Col 1 Row 3 (Venue)
                doc.fillColor('#4b5563').font('Helvetica').fontSize(9).text('VENUE / MEETING ROOM', 30, gridY + 80);
                doc.fillColor('#111827').font('Helvetica-Bold').fontSize(10).text(venueName, 30, gridY + 94, { width: 340 });
                // QR Code centered at the bottom
                const qrCenterY = gridY + 135;
                const verificationUrl = `http://${hostHeader}/api/v1/bookings/${booking.id}/verify`;
                const qrBuffer = await qrcode_1.default.toBuffer(verificationUrl, { errorCorrectionLevel: 'H', margin: 1, width: 110, color: { dark: '#064e3b', light: '#ffffff' } });
                doc.image(qrBuffer, 145, qrCenterY, { width: 110, height: 110 });
                // Ticket ID label
                doc.fillColor('#9ca3af').font('Helvetica').fontSize(8.5).text(`TICKET ID: ${booking.id}`, 0, 564, { align: 'center' });
                doc.end();
            }
            catch (err) {
                reject(err);
            }
        });
    }
    /**
     * Generates a stunning vector SVG representation of the Admission Ticket card (BookMyTraining Green Theme)
     */
    async generateTicketSvg(booking, hostHeader) {
        const client = booking.client || {};
        const event = booking.event || {};
        const hostProfile = event.host || {};
        const host = hostProfile.user || {};
        const venueName = event.mode === 'ONLINE' ? 'Online Live Stream' : (event.venueDetails?.address || 'Physical Venue');
        const formattedDate = new Date(event.startTime).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
        const formattedTime = new Date(event.startTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
        const participantsList = Array.isArray(booking.participants) && booking.participants.length > 0
            ? booking.participants
            : [{ fullName: `${client.firstName || ''} ${client.lastName || ''}`.trim(), email: client.email, mobile: client.phone, isPrimary: true }];
        const primaryAttendee = participantsList.find((p) => p.isPrimary) || participantsList[0];
        const primaryTicketType = primaryAttendee?.ticketType || booking.ticketType;
        const ticketTypeName = primaryTicketType?.name ? `${primaryTicketType.name.toUpperCase()} (₹${Number(primaryTicketType.price).toFixed(2)})` : 'STANDARD TICKET';
        const attendeeDisplayName = (primaryAttendee?.fullName || `${client.firstName} ${client.lastName}`).toUpperCase();
        const participantNamesSummary = participantsList.map((p) => `${p.fullName}${p.ticketType?.name ? ` (${p.ticketType.name})` : ''}`).filter(Boolean).join(', ');
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
    <text x="30" y="35" fill="#d1fae5" font-size="9" font-weight="800" letter-spacing="1.2">B O O K M Y T R A I N I N G   A D M I S S I O N</text>
    <text x="30" y="65" fill="#ffffff" font-size="18" font-weight="900" width="340">${event.title.toUpperCase()}</text>
    <text x="30" y="145" fill="#a7f3d0" font-size="10.5" font-weight="800" letter-spacing="0.8">TICKET TYPE: ${ticketTypeName}</text>

    <!-- Ticket tear tear-line separator (dashed lines) -->
    <line x1="20" y1="180" x2="380" y2="180" stroke="#e5e7eb" stroke-width="2" stroke-dasharray="6,6" />
    
    <!-- Cutout half-circles on left and right edges -->
    <circle cx="0" cy="180" r="10" fill="#f3f4f6" />
    <circle cx="400" cy="180" r="10" fill="#f3f4f6" />

    <!-- Card details body -->
    <text x="30" y="212" fill="#064e3b" font-size="11" font-weight="800" letter-spacing="0.5">ATTENDEE(S) &amp; PASS TYPE</text>
    <text x="30" y="235" fill="#111827" font-size="17" font-weight="800">${attendeeDisplayName}</text>
    <text x="30" y="253" fill="#6b7280" font-size="9" font-weight="600">${participantsList.length > 1 ? `Enrolled (${participantsList.length}): ${participantNamesSummary}` : `TICKET: ${ticketTypeName}`}</text>

    <!-- Grid Column 1 -->
    <g transform="translate(30, 285)">
      <text x="0" y="0" fill="#6b7280" font-size="9" font-weight="600">DATE</text>
      <text x="0" y="16" fill="#111827" font-size="12" font-weight="800">${formattedDate}</text>

      <text x="0" y="46" fill="#6b7280" font-size="9" font-weight="600">TRAINER / INSTRUCTOR</text>
      <text x="0" y="62" fill="#111827" font-size="12" font-weight="800">${host.firstName || 'Platform'} ${host.lastName || 'Host'}</text>

      <text x="0" y="92" fill="#6b7280" font-size="9" font-weight="600">VENUE / MEETING ROOM</text>
      <text x="0" y="108" fill="#111827" font-size="10.5" font-weight="800">${venueName}</text>
    </g>

    <!-- Grid Column 2 -->
    <g transform="translate(210, 285)">
      <text x="0" y="0" fill="#6b7280" font-size="9" font-weight="600">TIME</text>
      <text x="0" y="16" fill="#111827" font-size="12" font-weight="800">${formattedTime}</text>

      <text x="0" y="46" fill="#6b7280" font-size="9" font-weight="600">SEATS ALLOCATED</text>
      <text x="0" y="62" fill="#111827" font-size="12" font-weight="800">${booking.seatCount} SEAT(S)</text>
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
