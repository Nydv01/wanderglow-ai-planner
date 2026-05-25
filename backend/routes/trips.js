// backend/routes/trips.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('./auth');

// Get all trips for the authenticated user
router.get('/', authenticateToken, (req, res) => {
  try {
    const userTrips = db.trips.findByUserId(req.user.id);
    res.json(userTrips);
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({ error: 'Failed to fetch saved trips.' });
  }
});

// Save a new trip
router.post('/', authenticateToken, (req, res) => {
  const { destination, duration, interests, budget, mood, startDate, endDate, totalBudgetEstimate, itinerary, flights, hotels, selectedFlight, selectedHotel } = req.body;

  if (!destination || !duration || !itinerary) {
    return res.status(400).json({ error: 'Missing required trip parameters.' });
  }

  try {
    const newTrip = db.trips.create({
      userId: req.user.id,
      destination,
      duration: parseInt(duration),
      interests: interests || [],
      budget: budget || 'moderate',
      mood: mood || 'relax',
      startDate: startDate || '',
      endDate: endDate || '',
      totalBudgetEstimate: totalBudgetEstimate || 0,
      itinerary: itinerary || [],
      flights: flights || [],
      hotels: hotels || [],
      selectedFlight: selectedFlight || null,
      selectedHotel: selectedHotel || null
    });

    res.status(201).json(newTrip);
  } catch (error) {
    console.error('Error saving trip:', error);
    res.status(500).json({ error: 'Failed to save trip.' });
  }
});

// Get a specific saved trip
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const trip = db.trips.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    // Verify ownership
    if (trip.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to view this trip.' });
    }

    res.json(trip);
  } catch (error) {
    console.error('Error fetching trip details:', error);
    res.status(500).json({ error: 'Failed to fetch trip details.' });
  }
});

// Update a saved trip
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const trip = db.trips.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    // Verify ownership
    if (trip.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to update this trip.' });
    }

    // Pick fields to update
    const { destination, startDate, endDate, totalBudgetEstimate, itinerary, isShared, flights, hotels, selectedFlight, selectedHotel } = req.body;
    const updateData = {};
    if (destination !== undefined) updateData.destination = destination;
    if (startDate !== undefined) updateData.startDate = startDate;
    if (endDate !== undefined) updateData.endDate = endDate;
    if (totalBudgetEstimate !== undefined) updateData.totalBudgetEstimate = totalBudgetEstimate;
    if (itinerary !== undefined) updateData.itinerary = itinerary;
    if (isShared !== undefined) updateData.isShared = isShared;
    if (flights !== undefined) updateData.flights = flights;
    if (hotels !== undefined) updateData.hotels = hotels;
    if (selectedFlight !== undefined) updateData.selectedFlight = selectedFlight;
    if (selectedHotel !== undefined) updateData.selectedHotel = selectedHotel;

    const updatedTrip = db.trips.update(req.params.id, updateData);
    res.json(updatedTrip);
  } catch (error) {
    console.error('Error updating trip:', error);
    res.status(500).json({ error: 'Failed to update trip.' });
  }
});

// Delete a saved trip
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const trip = db.trips.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    // Verify ownership
    if (trip.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to delete this trip.' });
    }

    db.trips.delete(req.params.id);
    res.json({ message: 'Trip deleted successfully.' });
  } catch (error) {
    console.error('Error deleting trip:', error);
    res.status(500).json({ error: 'Failed to delete trip.' });
  }
});

// Toggle share trip (Public status)
router.post('/share/:id', authenticateToken, (req, res) => {
  try {
    const trip = db.trips.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    // Verify ownership
    if (trip.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to modify sharing.' });
    }

    const { isShared } = req.body;
    const updatedTrip = db.trips.update(req.params.id, { isShared: !!isShared });
    res.json({ id: updatedTrip.id, isShared: updatedTrip.isShared });
  } catch (error) {
    console.error('Error sharing trip:', error);
    res.status(500).json({ error: 'Failed to update sharing status.' });
  }
});

// Fetch a shared trip publicly (NO authentication needed)
router.get('/share/:id', (req, res) => {
  try {
    const trip = db.trips.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found.' });
    }

    if (!trip.isShared) {
      return res.status(403).json({ error: 'This trip is not shared publicly.' });
    }

    // Return the trip with public fields (hide userId just in case)
    const { userId, ...publicTripData } = trip;
    res.json(publicTripData);
  } catch (error) {
    console.error('Error fetching public trip:', error);
    res.status(500).json({ error: 'Failed to fetch shared trip.' });
  }
});

module.exports = router;
