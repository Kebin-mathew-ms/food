import { Router } from 'express';
import { prisma } from '../config/database.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import { successResponse } from '../helpers/response.helper.js';
import { HTTP_STATUS } from '../utils/httpStatus.js';

const router = Router();

router.get('/global', authMiddleware, async (req, res, next) => {
  try {
    const search = req.query.query || '';
    if (!search || search.length < 2) {
      return successResponse(res, HTTP_STATUS.OK, 'Search query too short.', {
        users: [],
        donations: [],
        complaints: [],
      });
    }

    const [users, donations, complaints] = await Promise.all([
      // 1. Match Users
      prisma.users.findMany({
        where: {
          deleted_at: null,
          OR: [
            { full_name: { contains: search } },
            { email: { contains: search } },
          ],
        },
        select: { id: true, full_name: true, email: true, role: true },
        take: 5,
      }),

      // 2. Match Donations
      prisma.food_donations.findMany({
        where: {
          deleted_at: null,
          OR: [
            { food_name: { contains: search } },
            { food_category: { contains: search } },
          ],
        },
        select: { id: true, food_name: true, food_category: true, status: true },
        take: 5,
      }),

      // 3. Match Complaints
      prisma.complaints.findMany({
        where: {
          deleted_at: null,
          OR: [
            { subject: { contains: search } },
            { description: { contains: search } },
          ],
        },
        select: { id: true, subject: true, status: true },
        take: 5,
      }),
    ]);

    return successResponse(res, HTTP_STATUS.OK, 'Global search results retrieved.', {
      users,
      donations,
      complaints,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
