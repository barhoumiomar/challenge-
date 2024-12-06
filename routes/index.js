const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    res.redirect('/users/login');
};

router.get('/', async (req, res) => {
    try {
        const events = await Event.find().sort({ date: 'asc' }).populate('organizer', 'name');
        res.render('index', { events });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Dashboard route
router.get('/dashboard', isAuthenticated, async (req, res) => {
    try {
        const userEvents = await Event.find({
            $or: [
                { organizer: req.session.user._id },
                { 'attendees.user': req.session.user._id }
            ]
        }).populate('organizer', 'name');

        res.render('dashboard', {
            myEvents: userEvents.filter(event => event.organizer._id.toString() === req.session.user._id.toString()),
            attendingEvents: userEvents.filter(event => event.attendees.some(attendee => 
                attendee.user.toString() === req.session.user._id.toString()
            ))
        });
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error loading dashboard');
        res.redirect('/');
    }
});

module.exports = router;