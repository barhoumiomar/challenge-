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

// Show create event form
router.get('/create', isAuthenticated, (req, res) => {
    res.render('create-event');
});

// Create event
router.post('/create', isAuthenticated, async (req, res) => {
    try {
        const { title, description, location, date, category } = req.body;
        const newEvent = new Event({
            title,
            description,
            location,
            date,
            category,
            organizer: req.session.user._id
        });
        await newEvent.save();
        req.flash('success_msg', 'Event created successfully');
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error creating event');
        res.redirect('/events/create');
    }
});

// Get all events
router.get('/', async (req, res) => {
    try {
        const events = await Event.find().populate('organizer', 'name');
        res.json(events);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Get single event
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate('organizer', 'name');
        if (!event) {
            req.flash('error_msg', 'Event not found');
            return res.redirect('/dashboard');
        }
        res.render('event-details', { event });
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error loading event');
        res.redirect('/dashboard');
    }
});

// RSVP to event
router.post('/:id/rsvp', isAuthenticated, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        const { status } = req.body;
        
        // Check if user already RSVP'd
        const attendeeIndex = event.attendees.findIndex(
            attendee => attendee.user.toString() === req.session.user._id.toString()
        );

        if (attendeeIndex > -1) {
            event.attendees[attendeeIndex].status = status;
        } else {
            event.attendees.push({
                user: req.session.user._id,
                status
            });
        }

        await event.save();
        req.flash('success_msg', 'RSVP updated successfully');
        res.redirect(`/events/${req.params.id}`);
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error updating RSVP');
        res.redirect('/dashboard');
    }
});

// Book tickets
router.post('/:id/book', isAuthenticated, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        const { ticketQuantity } = req.body;
        const quantity = parseInt(ticketQuantity);

        // Check if enough tickets are available
        if (event.tickets.soldQuantity + quantity > event.tickets.totalQuantity) {
            req.flash('error_msg', 'Not enough tickets available');
            return res.redirect(`/events/${req.params.id}`);
        }

        // Update event tickets count
        event.tickets.soldQuantity += quantity;

        // Add or update attendee
        const attendeeIndex = event.attendees.findIndex(
            attendee => attendee.user.toString() === req.session.user._id.toString()
        );

        if (attendeeIndex > -1) {
            event.attendees[attendeeIndex].ticketQuantity += quantity;
            event.attendees[attendeeIndex].status = 'confirmed';
        } else {
            event.attendees.push({
                user: req.session.user._id,
                status: 'confirmed',
                ticketQuantity: quantity
            });
        }

        await event.save();
        req.flash('success_msg', `Successfully booked ${quantity} ticket(s)`);
        res.redirect(`/events/${req.params.id}`);
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error booking tickets');
        res.redirect(`/events/${req.params.id}`);
    }
});

// Delete event
router.post('/:id/delete', isAuthenticated, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        
        // Check if user is the organizer
        if (event.organizer.toString() !== req.session.user._id.toString()) {
            req.flash('error_msg', 'Not authorized to delete this event');
            return res.redirect('/dashboard');
        }

        await Event.findByIdAndDelete(req.params.id);
        req.flash('success_msg', 'Event deleted successfully');
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error deleting event');
        res.redirect('/dashboard');
    }
});

module.exports = router;
