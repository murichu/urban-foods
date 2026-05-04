# Backend Security Documentation

## 🔒 Security Measures Implemented

This document outlines the comprehensive security measures implemented in the backend API.

### 1. Environment Variable Validation

**Startup Validation:**
- Validates all required environment variables on startup
- Enforces minimum JWT_SECRET length (32 characters)
- Prevents application from starting with insecure configuration

```javascript
const requiredEnvVars = ['JWT_SECRET', 'MONGOOSE_DB', 'MPESA_CONSUMER_KEY', 'MPESA_CONSUMER_SECRET'];
```

### 2. HTTP Security Headers (Helmet.js)

**Content Security Policy (CSP):**
- Restricts script sources to prevent XSS attacks
- Controls image, font, and media sources
- Blocks framing attacks with frameSrc: 'none'

**Additional Headers:**
- **HSTS**: Forces HTTPS with 1-year max-age, includes subdomains, preload enabled
- **X-Frame-Options**: DENY - prevents clickjacking
- **X-Content-Type-Options**: NOSNIFF - prevents MIME sniffing
- **X-XSS-Protection**: Enables browser XSS filter
- **Referrer-Policy**: strict-origin-when-cross-origin
- **Cross-Origin policies**: All enabled for maximum protection

### 3. Rate Limiting

**General API Limit:**
- 100 requests per hour per IP
- Standard headers enabled for monitoring

**Authentication Endpoints:**
- 5 requests per 15 minutes (brute force protection)

**Payment Endpoints:**
- 10 requests per 15 minutes (fraud prevention)

### 4. Input Validation & Sanitization

**NoSQL Injection Prevention:**
- express-mongo-sanitize with dot notation disabled
- Replaces dangerous characters with underscores

**XSS Protection:**
- xss-clean middleware sanitizes all user input
- HTML entity encoding for special characters

**HTTP Parameter Pollution:**
- hpp middleware prevents parameter array injection
- Whitelist allows specific multi-value parameters

**Body Parser:**
- 10MB size limit on all requests
- Strict mode: only accepts arrays and objects
- URL-encoded data properly handled

### 5. Authentication Security

**JWT Token Generation:**
- Algorithm explicitly set to HS256
- Minimum password requirements:
  - 10+ characters
  - At least one letter, number, and special character
  - Common password detection and rejection
- 12 salt rounds for bcrypt hashing
- Token expiration: 7 days (configurable)

**JWT Token Validation:**
- Token format validation
- Token payload structure verification
- Handles expired, invalid, and not-yet-valid tokens
- Trims whitespace from tokens before verification

### 6. CORS Configuration

**Strict Origin Control:**
- Whitelist-based origin validation
- Dynamic origin checking with callback
- Allows requests without origin (mobile apps)
- Pattern matching for subdomains

**Security Settings:**
- Credentials: true (for cookies/auth)
- Specific allowed methods and headers
- Exposed headers for rate limit monitoring
- 24-hour preflight cache

### 7. File Upload Security

**File Type Validation:**
- Strict MIME type checking (JPEG, PNG, WebP only)
- Extension-to-MIME type matching verification
- Automatic deletion of invalid files

**Size Limits:**
- Maximum 5MB per file
- Empty file detection and rejection

**Filename Sanitization:**
- Removes special characters to prevent directory traversal
- Only alphanumeric, dots, underscores, and hyphens allowed

### 8. Payment Security (M-Pesa)

**Callback Validation:**
- Structure validation for callback data
- Required field verification
- Metadata integrity checks (minimum 5 fields)
- M-Pesa receipt number validation

**Duplicate Prevention:**
- Checks payment status before processing
- Prevents double-payment processing

**Transaction Validation:**
- Phone number format validation (Kenyan numbers)
- Amount validation (positive numbers only)
- Order ID format validation (ObjectId)

### 9. Error Handling

**Secure Error Responses:**
- No stack traces exposed to clients
- Generic error messages for production
- Detailed logging server-side only
- Consistent error response format

**404 Handler:**
- Custom handler for unknown routes
- Prevents information leakage

### 10. Graceful Shutdown

**Process Management:**
- SIGTERM signal handling
- Unhandled rejection catching
- Clean connection closing
- Proper exit codes

### 11. Database Security

**Model-Level Protection:**
- Schema validation
- Unique constraints on emails
- Automatic timestamps for audit trails

**Query Security:**
- ObjectId format validation
- Existence checks before operations
- Sanitized search queries

## 🛡️ Security Checklist

### Required Environment Variables
- [x] JWT_SECRET (min 32 characters)
- [x] MONGOOSE_DB
- [x] MPESA_CONSUMER_KEY
- [x] MPESA_CONSUMER_SECRET
- [x] ALLOWED_ORIGINS (recommended)
- [x] NODE_ENV

### Password Requirements
- [x] Minimum 10 characters
- [x] At least one uppercase/lowercase letter
- [x] At least one number
- [x] At least one special character (@$!%*?&)
- [x] Not a common password

### API Security
- [x] Rate limiting on all endpoints
- [x] Stricter limits on auth/payment endpoints
- [x] CORS properly configured
- [x] Security headers enabled
- [x] Input sanitization active

### File Upload Security
- [x] File type validation
- [x] Size limits enforced
- [x] Filename sanitization
- [x] Empty file detection

### Payment Security
- [x] Callback validation
- [x] Duplicate prevention
- [x] Transaction data validation
- [x] Phone number format checking

## 🚀 Production Recommendations

1. **Use Strong Secrets**: Generate cryptographically secure random strings for JWT_SECRET
2. **Enable HTTPS**: Always use HTTPS in production
3. **Monitor Logs**: Set up log monitoring for suspicious activity
4. **Regular Updates**: Keep dependencies updated for security patches
5. **Backup Strategy**: Implement regular database backups
6. **Environment Separation**: Use different configs for dev/staging/production
7. **API Keys**: Rotate M-Pesa API keys regularly
8. **Database Access**: Restrict MongoDB access to specific IPs

## 📝 Security Best Practices

### For Developers
- Never commit .env files to version control
- Use environment variables for all secrets
- Validate all user input
- Use prepared statements/ORM (mongoose handles this)
- Implement proper session management
- Log security events

### For Administrators
- Monitor rate limit violations
- Review failed authentication attempts
- Audit payment transactions
- Check for unusual patterns
- Regular security audits

## 🔍 Testing Security

### Manual Testing
```bash
# Test rate limiting
for i in {1..110}; do curl http://localhost:4000/api/foods; done

# Test XSS protection
curl -X POST http://localhost:4000/api/user/register \
  -H "Content-Type: application/json" \
  -d '{"name":"<script>alert(1)</script>","email":"test@test.com","password":"Test123!"}'

# Test SQL injection (should be sanitized)
curl http://localhost:4000/api/foods?id=\$gt
```

### Automated Testing
Consider implementing:
- OWASP ZAP scans
- Dependency vulnerability scanning (npm audit)
- Penetration testing
- Security code review tools

## 📞 Security Contact

For security concerns or vulnerabilities, please contact the development team immediately.

---

**Last Updated**: 2024  
**Version**: 2.0
