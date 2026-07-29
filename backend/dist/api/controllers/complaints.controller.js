"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateComplaintStatus = exports.getAllComplaints = exports.createComplaint = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createComplaint = async (req, res) => {
    try {
        const { subject, description, hostName, hostId, clientId } = req.body;
        if (!subject || !description) {
            return res.status(400).json({ success: false, error: 'Subject and description are required' });
        }
        const complaint = await prisma.complaint.create({
            data: {
                subject,
                description,
                hostName,
                hostId,
                clientId,
            },
        });
        res.status(201).json({ success: true, data: complaint });
    }
    catch (error) {
        console.error('Error creating complaint:', error);
        res.status(500).json({ success: false, error: 'Failed to submit complaint' });
    }
};
exports.createComplaint = createComplaint;
const getAllComplaints = async (req, res) => {
    try {
        const complaints = await prisma.complaint.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                client: {
                    select: { firstName: true, lastName: true, email: true },
                },
                host: {
                    select: { user: { select: { firstName: true, lastName: true, email: true } } },
                }
            }
        });
        res.status(200).json({ success: true, data: complaints });
    }
    catch (error) {
        console.error('Error fetching complaints:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch complaints' });
    }
};
exports.getAllComplaints = getAllComplaints;
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
        });
        res.status(200).json({ success: true, data: complaint });
    }
    catch (error) {
        console.error('Error updating complaint:', error);
        res.status(500).json({ success: false, error: 'Failed to update complaint' });
    }
};
exports.updateComplaintStatus = updateComplaintStatus;
