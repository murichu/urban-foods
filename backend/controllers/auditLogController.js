import auditLogModel from '../models/auditLogModel.js';
import logger from '../config/logger.js';

/**
 * Fetch all audit logs with pagination and filtering
 */
export const getAuditLogs = async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    action, 
    entity, 
    status, 
    userId,
    startDate,
    endDate 
  } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  const filter = {};
  if (action) filter.action = action;
  if (entity) filter.entity = entity;
  if (status) filter.status = status;
  if (userId) filter.userId = userId;
  
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  try {
    const logs = await auditLogModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const total = await auditLogModel.countDocuments(filter);

    res.json({
      success: true,
      data: logs,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
      }
    });
  } catch (error) {
    logger.error(`Error fetching audit logs: ${error.message}`);
    res.status(500).json({ success: false, message: 'Error fetching audit logs' });
  }
};

/**
 * Create a new audit log entry (Utility function, not a route handler)
 */
export const createAuditLog = async (logData) => {
  try {
    // List of sensitive fields to mask or remove
    const sensitiveFields = [
      'password', 'token', 'accessToken', 'refreshToken', 
      'mpesaStkPushCallbackUrl', 'mpesaShortCode', 'mpesaStoreNumber',
      'mpesaConsumerKey', 'mpesaConsumerSecret', 'mpesaPassKey',
      'cvv', 'card_number', 'account_number'
    ];

    const sanitize = (obj) => {
      if (!obj || typeof obj !== 'object') return obj;
      
      const newObj = Array.isArray(obj) ? [] : {};
      
      for (const [key, value] of Object.entries(obj)) {
        if (sensitiveFields.includes(key)) {
          newObj[key] = '********';
        } else if (typeof value === 'object' && value !== null) {
          newObj[key] = sanitize(value);
        } else {
          newObj[key] = value;
        }
      }
      return newObj;
    };

    const sanitizedLogData = sanitize(logData);

    const newLog = new auditLogModel(sanitizedLogData);
    await newLog.save();
    return true;
  } catch (error) {
    logger.error(`Failed to create audit log: ${error.message}`);
    return false;
  }
};
