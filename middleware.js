function checkRole(role) {
    return function(req, res, next) {
        // Assuming you have the user object available in req.user
        const userRole = req.session.role;
        if (userRole === 'admin') {
            // User has the required role, proceed to the next middleware
            next();
        } else {
            // User does not have the required role, send an error response
            res.status(403).send('Forbidden');
        }
    };
}

// Make checkRole globally available by attaching it to app.locals
module.exports = {
    checkRole: checkRole
};