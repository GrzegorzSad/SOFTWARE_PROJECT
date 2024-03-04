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

function loggedIn(){
    return function(req, res, next){
        const loggedIn = (req.session.userId !== undefined)
        if (loggedIn === true){
            next();
        } else {
            res.redirect('/users/login')
        }
    }
}
// Make checkRole globally available by attaching it to app.locals
module.exports = {
    checkRole: checkRole,
    loggedIn: loggedIn
};