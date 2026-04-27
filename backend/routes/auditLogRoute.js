import express from 'express';
import { getAuditLogs } from '../controllers/auditLogController.js';
import authMiddleware from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';

const auditLogRouter = express.Router();

// Only admin should be able to view audit logs
auditLogRouter.get('/list', adminAuth, getAuditLogs);

export default auditLogRouter;
