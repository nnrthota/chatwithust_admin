var express = require('express');
var router = express.Router();

// Get Homepage
router.get('/admin/dashboard',ensureAuthenticated, function (req, res) {
    res.render('dashboard');
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('error_msg','Please Provide admin details to login');
        res.redirect('/admin/login');
    }
}

module.exports = router;
