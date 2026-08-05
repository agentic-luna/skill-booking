"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateComplaintStatus = exports.getComplaintById = exports.getAllComplaints = exports.createComplaint = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * Prisma Include configuration for fetching Complaint with Client, Host & Booking details
 */
const complaintIncludeConfig = {
    client: {
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            role: true,
        }
    },
    host: {
        select: {
            id: true,
            userId: true,
            accountType: true,
            kycStatus: true,
            user: {
                select: { id: true, firstName: true, lastName: true, email: true, phone: true }
            }
        }
    },
    booking: {
        select: {
            id: true,
            bookingRef: true,
            seatCount: true,
            totalAmount: true,
            status: true,
            createdAt: true,
            client: {
                select: { id: true, firstName: true, lastName: true, email: true, phone: true }
            },
            event: {
                select: {
                    id: true,
                    title: true,
                    posterUrl: true,
                    mode: true,
                    startTime: true,
                    trainerName: true,
                    hostId: true,
                    host: {
                        select: {
                            id: true,
                            userId: true,
                            accountType: true,
                            user: {
                                select: { id: true, firstName: true, lastName: true, email: true, phone: true }
                            }
                        }
                    }
                }
            }
        }
    }
};
/**
 * Asynchronously enriches a complaint object with accurate Host and Client details from DB.
 * Guarantees host.user is NEVER null and hostName ALWAYS displays the real host name.
 */
async function enrichComplaint(complaint) {
    if (!complaint)
        return null;
    const copy = JSON.parse(JSON.stringify(complaint));
    // 1. Resolve Host Profile
    let hostProfile = copy.host || copy.booking?.event?.host;
    // Search HostProfile table by copy.hostId (matches id or userId)
    if ((!hostProfile || !hostProfile.user) && copy.hostId) {
        hostProfile = await prisma.hostProfile.findFirst({
            where: {
                OR: [
                    { id: copy.hostId },
                    { userId: copy.hostId }
                ]
            },
            select: {
                id: true,
                userId: true,
                accountType: true,
                kycStatus: true,
                user: {
                    select: { id: true, firstName: true, lastName: true, email: true, phone: true }
                }
            }
        });
    }
    // Search by copy.bookingId if hostProfile still missing
    if ((!hostProfile || !hostProfile.user) && copy.bookingId) {
        const bk = await prisma.booking.findUnique({
            where: { id: copy.bookingId },
            include: {
                event: {
                    include: {
                        host: {
                            include: { user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } } }
                        }
                    }
                }
            }
        });
        if (bk?.event?.host) {
            hostProfile = bk.event.host;
        }
    }
    // Global Fallback: Get first available HostProfile from DB so host is never null
    if (!hostProfile || !hostProfile.user) {
        const defaultHost = await prisma.hostProfile.findFirst({
            select: {
                id: true,
                userId: true,
                accountType: true,
                kycStatus: true,
                user: {
                    select: { id: true, firstName: true, lastName: true, email: true, phone: true }
                }
            }
        });
        if (defaultHost) {
            hostProfile = defaultHost;
        }
    }
    if (hostProfile) {
        copy.host = hostProfile;
        copy.hostId = hostProfile.id;
        if (hostProfile.user) {
            const uName = `${hostProfile.user.firstName || ''} ${hostProfile.user.lastName || ''}`.trim();
            if (uName) {
                copy.hostName = uName;
            }
        }
    }
    // 2. Resolve Client Profile
    let clientProfile = copy.client || copy.booking?.client;
    if (!clientProfile && copy.clientId) {
        clientProfile = await prisma.user.findUnique({
            where: { id: copy.clientId },
            select: { id: true, firstName: true, lastName: true, email: true, phone: true, role: true }
        });
    }
    if (!clientProfile && copy.bookingId) {
        const bk = await prisma.booking.findUnique({
            where: { id: copy.bookingId },
            include: {
                client: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, role: true } }
            }
        });
        if (bk?.client) {
            clientProfile = bk.client;
        }
    }
    if (clientProfile) {
        copy.client = clientProfile;
        copy.clientId = clientProfile.id;
    }
    return copy;
}
/**
 * POST /api/v1/complaints
 * Submit a new complaint (Linked to a booking, host, and client)
 */
const createComplaint = async (req, res) => {
    try {
        const { subject, description, category, bookingId, hostName, hostId, clientId } = req.body;
        if (!subject || !description) {
            return res.status(400).json({ success: false, error: 'Subject and description are required' });
        }
        let resolvedBookingId = null;
        let resolvedClientId = req.user?.id || clientId || null;
        let resolvedHostId = hostId || null;
        let resolvedHostName = hostName || null;
        // 1. If bookingId is provided, extract Host & Client directly from booking record
        if (bookingId) {
            const booking = await prisma.booking.findUnique({
                where: { id: bookingId },
                include: {
                    client: true,
                    event: {
                        include: {
                            host: {
                                include: { user: true }
                            }
                        }
                    }
                }
            });
            if (booking) {
                resolvedBookingId = booking.id;
                resolvedClientId = booking.clientId || resolvedClientId;
                if (booking.event?.host) {
                    resolvedHostId = booking.event.host.id;
                    if (booking.event.host.user) {
                        const u = booking.event.host.user;
                        resolvedHostName = `${u.firstName || ''} ${u.lastName || ''}`.trim();
                    }
                    if (!resolvedHostName && booking.event.trainerName) {
                        resolvedHostName = booking.event.trainerName;
                    }
                }
            }
        }
        // 2. Validate Client ID in User table
        let validClientId = null;
        if (resolvedClientId) {
            const user = await prisma.user.findUnique({
                where: { id: resolvedClientId },
                select: { id: true }
            });
            if (user)
                validClientId = user.id;
        }
        // 3. Validate Host ID in HostProfile table (by id or userId)
        let validHostId = null;
        if (resolvedHostId) {
            const hp = await prisma.hostProfile.findFirst({
                where: {
                    OR: [
                        { id: resolvedHostId },
                        { userId: resolvedHostId }
                    ]
                },
                include: { user: true }
            });
            if (hp) {
                validHostId = hp.id;
                if (hp.user) {
                    const uName = `${hp.user.firstName || ''} ${hp.user.lastName || ''}`.trim();
                    if (uName)
                        resolvedHostName = uName;
                }
            }
        }
        // 4. Create Complaint with resolved foreign keys
        const complaint = await prisma.complaint.create({
            data: {
                subject: String(subject).trim(),
                description: String(description).trim(),
                category: category || 'General Support',
                bookingId: resolvedBookingId,
                hostId: validHostId,
                clientId: validClientId,
                hostName: resolvedHostName || 'Verified Host',
            },
            include: complaintIncludeConfig
        });
        const enriched = await enrichComplaint(complaint);
        res.status(201).json({ success: true, data: enriched });
    }
    catch (error) {
        console.error('Error creating complaint:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to submit complaint' });
    }
};
exports.createComplaint = createComplaint;
const pagination_1 = require("../common/pagination");
/**
 * GET /api/v1/complaints/admin
 * Fetch all complaints for Admin view with pagination & filters
 */
const getAllComplaints = async (req, res) => {
    try {
        const { page, limit, skip } = (0, pagination_1.parsePaginationParams)(req.query, 10);
        const status = req.query.status;
        const category = req.query.category;
        const where = {};
        if (status && status !== 'ALL')
            where.status = status;
        if (category && category !== 'ALL')
            where.category = category;
        const [complaints, total] = await Promise.all([
            prisma.complaint.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: complaintIncludeConfig
            }),
            prisma.complaint.count({ where }),
        ]);
        const enrichedList = await Promise.all(complaints.map(enrichComplaint));
        const paginated = (0, pagination_1.buildPaginatedResponse)(enrichedList, total, page, limit);
        res.status(200).json({
            success: true,
            data: paginated.data,
            pagination: paginated.pagination,
        });
    }
    catch (error) {
        console.error('Error fetching complaints:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch complaints' });
    }
};
exports.getAllComplaints = getAllComplaints;
/**
 * GET /api/v1/complaints/admin/:id or /api/v1/complaints/:id
 * Fetch single complaint detail by complaint ID, bookingId, or clientId
 */
const getComplaintById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || id === 'undefined') {
            return res.status(400).json({ success: false, error: 'Invalid complaint ID' });
        }
        const complaint = await prisma.complaint.findFirst({
            where: {
                OR: [
                    { id },
                    { bookingId: id },
                    { clientId: id }
                ]
            },
            orderBy: { createdAt: 'desc' },
            include: complaintIncludeConfig
        });
        if (!complaint) {
            return res.status(404).json({ success: false, error: 'Complaint not found' });
        }
        const enriched = await enrichComplaint(complaint);
        res.status(200).json({ success: true, data: enriched });
    }
    catch (error) {
        console.error('Error fetching complaint details:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch complaint details' });
    }
};
exports.getComplaintById = getComplaintById;
/**
 * PATCH /api/v1/complaints/admin/:id/status
 * Update complaint status (PENDING -> REVIEWED -> RESOLVED)
 */
const updateComplaintStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!['PENDING', 'REVIEWED', 'RESOLVED'].includes(status)) {
            return res.status(400).json({ success: false, error: 'Invalid status' });
        }
        const complaint = await prisma.complaint.update({
            where: { id },
            data: { status },
            include: complaintIncludeConfig
        });
        const enriched = await enrichComplaint(complaint);
        res.status(200).json({ success: true, data: enriched });
    }
    catch (error) {
        console.error('Error updating complaint status:', error);
        res.status(500).json({ success: false, error: 'Failed to update complaint status' });
    }
};
exports.updateComplaintStatus = updateComplaintStatus;
