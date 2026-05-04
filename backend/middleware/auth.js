import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
  const { token } = req.headers;
  
  if (!token) {
    return res.status(401).json({ success: false, message: "Not Authorized. Please login again." });
  }
  
  // Validate token format
  if (typeof token !== 'string' || token.trim().length === 0) {
    return res.status(401).json({ success: false, message: "Invalid token format" });
  }
  
  try {
    const token_decode = jwt.verify(token.trim(), process.env.JWT_SECRET);
    
    // Validate token payload
    if (!token_decode.id || typeof token_decode.id !== 'string') {
      return res.status(401).json({ success: false, message: "Invalid token payload" });
    }
    
    req.body.userId = token_decode.id;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: "Token expired. Please login again." });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: "Invalid token. Please login again." });
    }
    
    if (error.name === 'NotBeforeError') {
      return res.status(401).json({ success: false, message: "Token not yet valid. Please login again." });
    }
    
    return res.status(500).json({ success: false, message: "Authentication error" });
  }
};

export default authMiddleware;
