import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createComplaint = async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error('Error creating complaint:', error);
    res.status(500).json({ success: false, error: 'Failed to submit complaint' });
  }
};

export const getAllComplaints = async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch complaints' });
  }
};

export const updateComplaintStatus = async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error('Error updating complaint:', error);
    res.status(500).json({ success: false, error: 'Failed to update complaint' });
  }
};
