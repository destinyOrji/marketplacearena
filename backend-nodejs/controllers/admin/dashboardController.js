const User = require('../../models/User');
const Professional = require('../../models/Professional');
const Hospital = require('../../models/Hospital');
const Ambulance = require('../../models/Ambulance');
const Client = require('../../models/Client');
const Appointment = require('../../models/Appointment');
const GymPhysio = require('../../models/GymPhysio');

// Get dashboard statistics
exports.getStats = async (req, res) => {
    try {
        const [
            totalUsers, totalPatients, totalProfessionals,
            totalHospitals, totalAmbulances, totalGymPhysio,
            pendingProfessionals, pendingHospitals, pendingAmbulances, pendingGymPhysio,
            totalAppointments, todayAppointments, recentRegistrations
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: 'client' }),
            User.countDocuments({ role: 'professional' }),
            User.countDocuments({ role: 'hospital' }),
            User.countDocuments({ role: 'ambulance' }),
            User.countDocuments({ role: 'gym-physio' }),
            Professional.countDocuments({ isVerified: false }),
            Hospital.countDocuments({ isVerified: false }),
            Ambulance.countDocuments({ isVerified: false }),
            GymPhysio.countDocuments({ isVerified: false }),
            Appointment.countDocuments(),
            Appointment.countDocuments({
                scheduledDate: {
                    $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    $lt: new Date(new Date().setHours(23, 59, 59, 999))
                }
            }),
            User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } })
        ]);

        res.json({
            statuscode: 0,
            status: 'success',
            data: {
                totalUsers,
                totalPatients,
                totalProfessionals,
                totalHospitals,
                totalAmbulances,
                totalGymPhysio,
                pendingVerifications: {
                    professionals: pendingProfessionals,
                    hospitals: pendingHospitals,
                    ambulances: pendingAmbulances,
                    gymPhysio: pendingGymPhysio,
                    total: pendingProfessionals + pendingHospitals + pendingAmbulances + pendingGymPhysio
                },
                appointments: {
                    total: totalAppointments,
                    today: todayAppointments
                },
                recentRegistrations
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ statuscode: 1, status: 'error', message: 'Failed to get dashboard stats', error: error.message });
    }
};

// Get registration trends
exports.getRegistrationTrends = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        
        let startDate = start_date ? new Date(start_date) : new Date();
        startDate.setDate(startDate.getDate() - 30); // Default to last 30 days
        
        let endDate = end_date ? new Date(end_date) : new Date();

        const trends = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        role: "$role"
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: "$_id.date",
                    registrations: {
                        $push: {
                            role: "$_id.role",
                            count: "$count"
                        }
                    },
                    total: { $sum: "$count" }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        res.json({
            statuscode: 0,
            status: 'success',
            data: trends
        });

    } catch (error) {
        console.error('Get registration trends error:', error);
        res.status(500).json({
            statuscode: 1,
            status: 'error',
            message: 'Failed to get registration trends',
            error: error.message
        });
    }
};

// Get appointment statistics
exports.getAppointmentStats = async (req, res) => {
    try {
        const stats = await Appointment.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            statuscode: 0,
            status: 'success',
            data: stats
        });

    } catch (error) {
        console.error('Get appointment stats error:', error);
        res.status(500).json({
            statuscode: 1,
            status: 'error',
            message: 'Failed to get appointment stats',
            error: error.message
        });
    }
};

// Get emergency statistics
exports.getEmergencyStats = async (req, res) => {
    try {
        // This would be implemented when you have emergency booking model
        const stats = [
            { status: 'pending', count: 0 },
            { status: 'in_progress', count: 0 },
            { status: 'completed', count: 0 },
            { status: 'cancelled', count: 0 }
        ];

        res.json({
            statuscode: 0,
            status: 'success',
            data: stats
        });

    } catch (error) {
        console.error('Get emergency stats error:', error);
        res.status(500).json({
            statuscode: 1,
            status: 'error',
            message: 'Failed to get emergency stats',
            error: error.message
        });
    }
};

// Get revenue distribution
exports.getRevenueDistribution = async (req, res) => {
    try {
        // This would be implemented when you have payment/billing models
        const distribution = [
            { category: 'Consultations', amount: 0 },
            { category: 'Emergency Services', amount: 0 },
            { category: 'Subscriptions', amount: 0 }
        ];

        res.json({
            statuscode: 0,
            status: 'success',
            data: distribution
        });

    } catch (error) {
        console.error('Get revenue distribution error:', error);
        res.status(500).json({
            statuscode: 1,
            status: 'error',
            message: 'Failed to get revenue distribution',
            error: error.message
        });
    }
};

// Get recent activities
exports.getRecentActivities = async (req, res) => {
    try {
        // Get recent user registrations
        const recentUsers = await User.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .select('firstName lastName email role createdAt');

        const activities = recentUsers.map(user => ({
            id: user._id,
            type: 'registration',
            description: `New ${user.role} registered: ${user.firstName} ${user.lastName}`,
            user: {
                name: `${user.firstName} ${user.lastName}`,
                email: user.email,
                role: user.role
            },
            timestamp: user.createdAt
        }));

        res.json({
            statuscode: 0,
            status: 'success',
            data: activities
        });

    } catch (error) {
        console.error('Get recent activities error:', error);
        res.status(500).json({
            statuscode: 1,
            status: 'error',
            message: 'Failed to get recent activities',
            error: error.message
        });
    }
};