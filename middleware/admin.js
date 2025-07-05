export const adminMiddleware = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        res.status(403);
        throw new Error("Access denied. Admins only.");
    }
    next();
}