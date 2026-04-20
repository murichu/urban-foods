# Backend Security Improvements

This document outlines the security enhancements implemented in the backend.

## Security Middleware (server.js)

### 1. Helmet.js
- Sets secure HTTP headers
- Protects against well-known web vulnerabilities
- Prevents clickjacking, XSS, and MIME sniffing attacks

### 2. Rate Limiting
- **General API**: 100 requests per hour per IP
- **Authentication endpoints**: 5 requests per 15 minutes per IP
- Prevents brute force attacks and DDoS

### 3. Data Sanitization
- **express-mongo-sanitize**: Prevents NoSQL injection attacks
- **xss-clean**: Sanitizes user input to prevent XSS attacks
- **hpp**: Prevents HTTP Parameter Pollution attacks

### 4. CORS Configuration
- Restricts allowed origins to frontend URL
- Configures allowed methods and headers
- Enables credentials support for authenticated requests

### 5. Body Parser Limits
- Request body size limited to 10MB
- Prevents large payload attacks

### 6. Cookie Parser
- Secure cookie handling
- Prepared for session management

## Authentication & Authorization

### JWT Token Security (middleware/auth.js)
- Proper error handling for expired/invalid tokens
- Returns appropriate HTTP status codes (401 Unauthorized)
- Clear error messages without exposing sensitive information

### User Authentication (userController.js)
- **Password Requirements**:
  - Minimum 8 characters
  - Must contain at least one letter and one number
- **Enhanced Password Hashing**: bcrypt with salt rounds of 12
- **Input Validation**: Email format validation using validator library
- **Data Normalization**: Email converted to lowercase, trimmed whitespace
- **JWT Expiration**: Tokens expire after 7 days (configurable)
- **Secure Response**: Doesn't expose password hash in responses

## Input Validation

### Order Controller (orderController.js)
- Phone number validation (Kenyan format)
- Amount validation (positive numbers only)
- ObjectId format validation
- Required field checks
- Whitelist for sort fields to prevent injection
- Pagination limits (max 100 items per page)

### Cart Controller (cartController.js)
- User ID and Item ID validation
- ObjectId format validation
- User existence checks
- Proper error handling

### Food Controller (foodController.js)
- File upload security:
  - File type validation (JPEG, PNG, WebP only)
  - File size limit (5MB max)
  - Filename sanitization to prevent directory traversal
- Input validation for all required fields
- Price validation (positive numbers)
- Automatic cleanup of invalid uploads

## File Upload Security (routes/foodRoute.js)

### Multer Configuration
- File filter to accept only images
- File size limit: 5MB
- Single file upload only
- Sanitized filenames
- Unique suffix generation to prevent overwrites

## Database Security

### Query Protection
- MongoDB injection prevention via express-mongo-sanitize
- Parameterized queries through Mongoose ODM
- Input validation before database operations

## Error Handling

### Consistent Error Responses
- Generic error messages to users
- Detailed logging on server side
- Proper HTTP status codes
- No stack traces exposed to clients

## Best Practices Implemented

1. **Principle of Least Privilege**: Users can only access their own data
2. **Defense in Depth**: Multiple layers of security
3. **Fail Securely**: Errors don't expose sensitive information
4. **Input Validation**: All user input is validated and sanitized
5. **Secure Defaults**: Conservative security settings
6. **Logging**: Security events are logged for monitoring

## Environment Variables Required

Ensure these are set in your `.env` file:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRES_IN=7d

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173

# M-Pesa Configuration
MPESA_CONSUMER_KEY=your-consumer-key
MPESA_CONSUMER_SECRET=your-consumer-secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your-passkey
MPESA_CALLBACK_URL=http://localhost:5173

# Server Configuration
PORT=5000
```

## Security Checklist

- [x] HTTPS in production
- [x] Secure HTTP headers (Helmet)
- [x] Rate limiting
- [x] Input validation and sanitization
- [x] SQL/NoSQL injection prevention
- [x] XSS protection
- [x] CSRF protection (via token authentication)
- [x] Secure file uploads
- [x] Password hashing with bcrypt
- [x] JWT token expiration
- [x] Error handling without information leakage
- [x] CORS configuration
- [x] Request size limits
- [ ] Regular dependency updates (npm audit)
- [ ] Security headers testing
- [ ] Penetration testing

## Recommendations for Production

1. **Enable HTTPS**: Use SSL/TLS certificates
2. **Environment Variables**: Never commit `.env` files
3. **Regular Updates**: Keep dependencies updated
4. **Monitoring**: Implement security monitoring and alerting
5. **Backups**: Regular database backups
6. **Access Control**: Implement role-based access control if needed
7. **Audit Logs**: Log security-relevant events
8. **Security Testing**: Regular penetration testing and code reviews
