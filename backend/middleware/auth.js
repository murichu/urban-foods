import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
  let token = req.headers.token;
  
  // Check for Authorization header (Standard Bearer Token)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }
  
  if (!token) {
    return res.status(401).json({ success: false, message: "Not Authorized. Please login again." });
  }
  
  try {
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = token_decode.id;
    req.body = req.body || {};
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
    
    return res.status(500).json({ success: false, message: "Authentication error" });
  }
};

export default authMiddleware;
