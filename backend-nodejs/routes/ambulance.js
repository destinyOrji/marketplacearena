const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Ambulance = require('../models/Ambulance');

// Dashboard stats
router.get('/dashboard-stats', protect, async (req, res) => {
    try {
        const ambulance = await Ambulance.findOne({ user: req.user._id });

        res.json({
            success: true,
            data: {
                totalBookings: ambulance ? ambulance.totalBookings : 0,
                completedBookings: ambulance ? ambulance.completedBookings : 0,
                activeVehicles: ambulance ? ambulance.vehicles.filter(v => v.isActive).length : 0,
                totalVehicles: ambulance ? ambulance.vehicles.length : 0,
                averageRating: ambulance ? ambulance.averageRating : 0,
                totalReviews: ambulance ? ambulance.totalReviews : 0,
                averageResponseTime: ambulance ? ambulance.averageResponseTime : 0,
                isVerified: ambulance ? ambulance.isVerified : false,
                isAvailable: ambulance ? ambulance.isAvailable : false,
            }
        });
    } catch (error) {
        console.error('Error fetching ambulance stats:', error);
        res.json({ success: true, data: {} });
    }
});

// Get ambulance profile
router.get('/profile', protect, async (req, res) => {
    try {
        const ambulance = await Ambulance.findOne({ user: req.user._id }).populate('user', '-password');
        if (!ambulance) {
            return res.status(404).json({ success: false, message: 'Ambulance profile not found' });
        }
        res.json({ success: true, data: ambulance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update ambulance profile
router.put('/profile/update', protect, async (req, res) => {
    try {
        const ambulance = await Ambulance.findOneAndUpdate(
            { user: req.user._id },
            { $set: req.body },
            { new: true }
        );
        
        if (!ambulance) {
            return res.status(404).json({ success: false, message: 'Ambulance provider not found' });
        }
        
        res.json({ success: true, data: ambulance, message: 'Profile updated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Bookings Management
router.get('/bookings', protect, async (req, res) => {
    try {
        const EmergencyBooking = require('../models/EmergencyBooking');
        const ambulance = await Ambulance.findOne({ user: req.user._id });
        
        if (!ambulance) {
            return res.json({ success: true, data: [] });
        }

        const bookings = await EmergencyBooking.find({ provider: ambulance._id })
            .populate({
                path: 'client',
                populate: {
                    path: 'user',
                    select: 'firstName lastName email phone'
                }
            })
            .sort({ createdAt: -1 });

        res.json({ success: true, data: bookings });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.json({ success: true, data: [] });
    }
});

router.put('/bookings/:id/accept', protect, async (req, res) => {
    try {
        const EmergencyBooking = require('../models/EmergencyBooking');
        
        const booking = await EmergencyBooking.findByIdAndUpdate(
            req.params.id,
            { 
                status: 'accepted',
                acceptedAt: new Date()
            },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        res.json({ 
            success: true, 
            data: booking,
            message: 'Booking accepted successfully' 
        });
    } catch (error) {
        console.error('Error accepting booking:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/bookings/:id/complete', protect, async (req, res) => {
    try {
        const EmergencyBooking = require('../models/EmergencyBooking');
        
        const booking = await EmergencyBooking.findByIdAndUpdate(
            req.params.id,
            { 
                status: 'completed',
                completedAt: new Date()
            },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        // Update ambulance stats
        const ambulance = await Ambulance.findOne({ user: req.user._id });
        if (ambulance) {
            ambulance.completedBookings += 1;
            await ambulance.save();
        }

        res.json({ 
            success: true, 
            data: booking,
            message: 'Booking completed successfully' 
        });
    } catch (error) {
        console.error('Error completing booking:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/bookings/:id/cancel', protect, async (req, res) => {
    try {
        const EmergencyBooking = require('../models/EmergencyBooking');
        
        const booking = await EmergencyBooking.findByIdAndUpdate(
            req.params.id,
            { 
                status: 'cancelled',
                cancelledAt: new Date(),
                cancellationReason: req.body.reason || 'Cancelled by provider'
            },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        res.json({ 
            success: true, 
            data: booking,
            message: 'Booking cancelled' 
        });
    } catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Fleet/Vehicle Management
router.get('/vehicles', protect, async (req, res) => {
    try {
        const ambulance = await Ambulance.findOne({ user: req.user._id });
        
        if (!ambulance) {
            return res.json({ success: true, data: [] });
        }

        res.json({ success: true, data: ambulance.vehicles || [] });
    } catch (error) {
        console.error('Error fetching vehicles:', error);
        res.json({ success: true, data: [] });
    }
});

router.post('/vehicles/create', protect, async (req, res) => {
    try {
        const ambulance = await Ambulance.findOne({ user: req.user._id });
        
        if (!ambulance) {
            return res.status(404).json({ success: false, message: 'Ambulance provider not found' });
        }

        const newVehicle = {
            ...req.body,
            isActive: req.body.isActive !== undefined ? req.body.isActive : true
        };

        ambulance.vehicles.push(newVehicle);
        await ambulance.save();

        const createdVehicle = ambulance.vehicles[ambulance.vehicles.length - 1];

        res.status(201).json({ 
            success: true, 
            data: createdVehicle,
            message: 'Vehicle added successfully' 
        });
    } catch (error) {
        console.error('Error adding vehicle:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/vehicles/:id/update', protect, async (req, res) => {
    try {
        const ambulance = await Ambulance.findOne({ user: req.user._id });
        
        if (!ambulance) {
            return res.status(404).json({ success: false, message: 'Ambulance provider not found' });
        }

        const vehicle = ambulance.vehicles.id(req.params.id);
        if (!vehicle) {
            return res.status(404).json({ success: false, message: 'Vehicle not found' });
        }

        Object.assign(vehicle, req.body);
        await ambulance.save();

        res.json({ 
            success: true, 
            data: vehicle,
            message: 'Vehicle updated successfully' 
        });
    } catch (error) {
        console.error('Error updating vehicle:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/vehicles/:id/delete', protect, async (req, res) => {
    try {
        const ambulance = await Ambulance.findOne({ user: req.user._id });
        
        if (!ambulance) {
            return res.status(404).json({ success: false, message: 'Ambulance provider not found' });
        }

        ambulance.vehicles.pull(req.params.id);
        await ambulance.save();

        res.json({ 
            success: true, 
            message: 'Vehicle deleted successfully' 
        });
    } catch (error) {
        console.error('Error deleting vehicle:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Staff Management
router.get('/staff', protect, async (req, res) => {
    try {
        const ambulance = await Ambulance.findOne({ user: req.user._id });
        
        if (!ambulance) {
            return res.json({ success: true, data: [] });
        }

        res.json({ success: true, data: ambulance.staff || [] });
    } catch (error) {
        console.error('Error fetching staff:', error);
        res.json({ success: true, data: [] });
    }
});

router.post('/staff/add', protect, async (req, res) => {
    try {
        const ambulance = await Ambulance.findOne({ user: req.user._id });
        
        if (!ambulance) {
            return res.status(404).json({ success: false, message: 'Ambulance provider not found' });
        }

        ambulance.staff.push(req.body);
        await ambulance.save();

        res.status(201).json({ 
            success: true, 
            data: ambulance.staff,
            message: 'Staff member added successfully' 
        });
    } catch (error) {
        console.error('Error adding staff:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Equipment Management (vehicles have equipment arrays)
router.get('/equipment', protect, async (req, res) => {
    try {
        const ambulance = await Ambulance.findOne({ user: req.user._id });
        
        if (!ambulance) {
            return res.json({ success: true, data: [] });
        }

        // Flatten equipment from all vehicles
        const allEquipment = [];
        ambulance.vehicles.forEach((vehicle, vIndex) => {
            if (vehicle.equipment && Array.isArray(vehicle.equipment)) {
                vehicle.equipment.forEach((item, eIndex) => {
                    allEquipment.push({
                        id: `${vehicle._id}-${eIndex}`,
                        vehicleId: vehicle._id,
                        name: item,
                        status: 'operational',
                        quantity: 1
                    });
                });
            }
        });

        res.json({ success: true, data: allEquipment });
    } catch (error) {
        console.error('Error fetching equipment:', error);
        res.json({ success: true, data: [] });
    }
});

router.post('/equipment/create', protect, async (req, res) => {
    try {
        const ambulance = await Ambulance.findOne({ user: req.user._id });
        
        if (!ambulance) {
            return res.status(404).json({ success: false, message: 'Ambulance provider not found' });
        }

        const { name, vehicleId } = req.body;
        
        // Add equipment to specific vehicle or first vehicle
        const vehicle = vehicleId 
            ? ambulance.vehicles.id(vehicleId)
            : ambulance.vehicles[0];

        if (!vehicle) {
            return res.status(404).json({ success: false, message: 'Vehicle not found' });
        }

        if (!vehicle.equipment) {
            vehicle.equipment = [];
        }

        vehicle.equipment.push(name);
        await ambulance.save();

        const newEquipment = {
            id: `${vehicle._id}-${vehicle.equipment.length - 1}`,
            vehicleId: vehicle._id,
            name: name,
            status: 'operational',
            quantity: 1
        };

        res.status(201).json({ 
            success: true, 
            data: newEquipment,
            message: 'Equipment added successfully' 
        });
    } catch (error) {
        console.error('Error adding equipment:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Services Management
router.get('/services', protect, async (req, res) => {
    try {
        const ambulance = await Ambulance.findOne({ user: req.user._id });
        
        if (!ambulance) {
            return res.json({ success: true, data: [] });
        }

        res.json({ success: true, data: ambulance.services || [] });
    } catch (error) {
        console.error('Error fetching services:', error);
        res.json({ success: true, data: [] });
    }
});

router.post('/services/add', protect, async (req, res) => {
    try {
        const ambulance = await Ambulance.findOne({ user: req.user._id });
        
        if (!ambulance) {
            return res.status(404).json({ success: false, message: 'Ambulance provider not found' });
        }

        ambulance.services.push(req.body);
        await ambulance.save();

        res.status(201).json({ 
            success: true, 
            data: ambulance.services,
            message: 'Service added successfully' 
        });
    } catch (error) {
        console.error('Error adding service:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Settings
router.get('/settings', protect, async (req, res) => {
    try {
        const ambulance = await Ambulance.findOne({ user: req.user._id });
        
        if (!ambulance) {
            return res.status(404).json({ success: false, message: 'Ambulance provider not found' });
        }

        res.json({ 
            success: true, 
            data: {
                isAvailable: ambulance.isAvailable,
                operatingHours: ambulance.operatingHours || {},
                coverageAreas: ambulance.coverageAreas || []
            }
        });
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/settings/update', protect, async (req, res) => {
    try {
        const ambulance = await Ambulance.findOneAndUpdate(
            { user: req.user._id },
            { $set: req.body },
            { new: true }
        );

        if (!ambulance) {
            return res.status(404).json({ success: false, message: 'Ambulance provider not found' });
        }

        res.json({ 
            success: true, 
            data: ambulance,
            message: 'Settings updated successfully' 
        });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Coverage Areas Management
router.get('/coverage-area', protect, async (req, res) => {
    try {
        const ambulance = await Ambulance.findOne({ user: req.user._id });
        
        if (!ambulance) {
            return res.json({ success: true, data: [] });
        }

        // Transform coverageAreas to match frontend format
        const coverageZones = (ambulance.coverageAreas || []).map((area, index) => ({
            id: area._id || `area-${index}`,
            name: `${area.city}, ${area.state}`,
            city: area.city,
            state: area.state,
            radius: area.radius * 1000, // Convert km to meters
            serviceTypes: ['ambulance', 'paramedic'], // Default service types
            isActive: true,
            boundaries: []
        }));

        res.json({ success: true, data: coverageZones });
    } catch (error) {
        console.error('Error fetching coverage areas:', error);
        res.json({ success: true, data: [] });
    }
});

router.post('/coverage-area/create', protect, async (req, res) => {
    try {
        const ambulance = await Ambulance.findOne({ user: req.user._id });
        
        if (!ambulance) {
            return res.status(404).json({ success: false, message: 'Ambulance provider not found' });
        }

        const { name, radius, serviceTypes, isActive } = req.body;
        
        // Parse city and state from name (e.g., "New York, NY")
        const [city, state] = name.split(',').map(s => s.trim());

        const newArea = {
            city: city || name,
            state: state || '',
            radius: (radius || 5000) / 1000 // Convert meters to km
        };

        ambulance.coverageAreas.push(newArea);
        await ambulance.save();

        // Return the newly created area in the expected format
        const createdArea = ambulance.coverageAreas[ambulance.coverageAreas.length - 1];
        const responseData = {
            id: createdArea._id,
            name: `${createdArea.city}, ${createdArea.state}`,
            city: createdArea.city,
            state: createdArea.state,
            radius: createdArea.radius * 1000,
            serviceTypes: serviceTypes || ['ambulance', 'paramedic'],
            isActive: isActive !== undefined ? isActive : true,
            boundaries: []
        };

        res.status(201).json({ 
            success: true, 
            data: responseData,
            message: 'Coverage area added successfully' 
        });
    } catch (error) {
        console.error('Error adding coverage area:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/coverage-area/:id/update', protect, async (req, res) => {
    try {
        const ambulance = await Ambulance.findOne({ user: req.user._id });
        
        if (!ambulance) {
            return res.status(404).json({ success: false, message: 'Ambulance provider not found' });
        }

        const area = ambulance.coverageAreas.id(req.params.id);
        if (!area) {
            return res.status(404).json({ success: false, message: 'Coverage area not found' });
        }

        const { name, radius, serviceTypes, isActive } = req.body;
        
        if (name) {
            const [city, state] = name.split(',').map(s => s.trim());
            area.city = city || name;
            area.state = state || '';
        }
        
        if (radius !== undefined) {
            area.radius = radius / 1000; // Convert meters to km
        }

        await ambulance.save();

        const responseData = {
            id: area._id,
            name: `${area.city}, ${area.state}`,
            city: area.city,
            state: area.state,
            radius: area.radius * 1000,
            serviceTypes: serviceTypes || ['ambulance', 'paramedic'],
            isActive: isActive !== undefined ? isActive : true,
            boundaries: []
        };

        res.json({ 
            success: true, 
            data: responseData,
            message: 'Coverage area updated successfully' 
        });
    } catch (error) {
        console.error('Error updating coverage area:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/coverage-area/:id/delete', protect, async (req, res) => {
    try {
        const ambulance = await Ambulance.findOne({ user: req.user._id });
        
        if (!ambulance) {
            return res.status(404).json({ success: false, message: 'Ambulance provider not found' });
        }

        ambulance.coverageAreas.pull(req.params.id);
        await ambulance.save();

        res.json({ 
            success: true, 
            message: 'Coverage area deleted successfully' 
        });
    } catch (error) {
        console.error('Error deleting coverage area:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
