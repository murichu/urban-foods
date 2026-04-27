import jwt from "jsonwebtoken";

const adminAuth = async (req, res, next) => {
    const { token } = req.headers;
    if (!token) {
        return res.json({ success: false, message: "Not Authorized Login Again" });
    }
    try {
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        if (!token_decode.isAdmin) {
            return res.json({ success: false, message: "Not Authorized Login Again" });
        }
        next();
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}

export default adminAuth;
