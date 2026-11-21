
// Verify if the user is logged in before performing creating, updating, or deleting Building Category Code

export const verifyLogin = (req, res, next) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({
            message: "Access denied. Please log in first."
        });
    }

    next();
};
