import jwt from 'jsonwebtoken';
const isAuthenticated = (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.id = decoded.userId;
        next();
    } catch (err) {
        console.log("Authentication error", err);
        return res.status(500).json({
            success: false,
            message: "Failed to authenticate user"
        });
    }
}
export default isAuthenticated;