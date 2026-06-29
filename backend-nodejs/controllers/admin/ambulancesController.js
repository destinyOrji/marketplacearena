const User = require('../../models/User');
const Ambulance = require('../../models/Ambulance');

// Get all ambulance providers with pagination and filters
exports.getProviders = async (req, res) => {
    try {
        const { page = 1, page_size = 10, search, service_type, verification_status } = req.query;
        const skip = (page - 1) * page_size;

        let query = {};
        if (service_type) query.serviceType = service_type;
        if (verification_status === 'verified') query.isVerified = true;
        else if (verification_status === 'pending') query.isVerified = false;

        const providers = await Ambulance.find(query)
            .populate('user')
            .skip(skip)
            .limit(parseInt(page_size))
            .sort({ createdAt: -1 });

        const total = await Ambulance.countDocuments(query);

        const result = providers.map(provider => ({
            id: provider._id,
            user: provider.user,
            serviceName: provider.serviceName,
            registrationNumber: provider.registrationNumber,
            serviceType: provider.serviceType,
            phone: provider.phone,
            emergencyNumber: provider.emergencyNumber,
            baseAddress: provider.baseAddress,
            isVerified: provider.isVerified,
            isAvailable: provider.isAvailable,
            averageResponseTime: provider.averageResponseTime,
            averageRating: provider.averageRating,
            totalBookings: provider.totalBookings,
            createdAt: provider.createdAt
        }));

        res.json({
            statuscode: 0,
            status: 'success',
            data: result,
            pagination: {
                page: parseInt(page),
                page_size: parseInt(page_size),
                total,
                total_pages: Math.ceil(total / page_size)
            }
        });

    } catch (error) {
        console.error('Get ambulance providers error:', error);
        res.status(500).json({
            statuscode: 1,
            status: 'error',
            message: 'Failed to get ambulance providers',
            error: error.message
        });
    }
};

// Get provider by ID
exports.getProviderById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ statuscode: 1, status: 'error', message: 'Invalid provider ID format' });
        }

        const provider = await Ambulance.findById(id).populate('user');
        if (!provider) {
            return res.status(404).json({
                statuscode: 1,
                status: 'error',
                message: 'Ambulance provider not found'
            });
        }

        res.json({
            statuscode: 0,
            status: 'success',
            data: provider
        });

    } catch (error) {
        console.error('Get ambulance provider by ID error:', error);
        res.status(500).json({
            statuscode: 1,
            status: 'error',
            message: 'Failed to get ambulance provider details',
            error: error.message
        });
    }
};

// Update provider
exports.updateProvider = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        await Ambulance.findByIdAndUpdate(id, updateData);

        res.json({
            statuscode: 0,
            status: 'success',
            message: 'Ambulance provider updated successfully'
        });

    } catch (error) {
        console.error('Update ambulance provider error:', error);
        res.status(500).json({
            statuscode: 1,
            status: 'error',
            message: 'Failed to update ambulance provider',
            error: error.message
        });
    }
};

// Delete provider
exports.deleteProvider = async (req, res) => {
    try {
        const { id } = req.params;

        const provider = await Ambulance.findById(id);
        if (!provider) {
            return res.status(404).json({
                statuscode: 1,
                status: 'error',
                message: 'Ambulance provider not found'
            });
        }

        await Ambulance.findByIdAndDelete(id);
        await User.findByIdAndDelete(provider.user);

        res.json({
            statuscode: 0,
            status: 'success',
            message: 'Ambulance provider deleted successfully'
        });

    } catch (error) {
        console.error('Delete ambulance provider error:', error);
        res.status(500).json({
            statuscode: 1,
            status: 'error',
            message: 'Failed to delete ambulance provider',
            error: error.message
        });
    }
};

// Placeholder methods for other ambulance operations
exports.getEmergencyBookings = async (req, res) => {
    try {
        const EmergencyBooking = require('../../models/EmergencyBooking');
        const { page = 1, page_size = 20 } = req.query;
        const skip = (page - 1) * page_size;

        const bookings = await EmergencyBooking.find()
            .populate({ path: 'client', populate: { path: 'user', select: 'firstName lastName email' } })
            .populate('provider', 'serviceName phone emergencyNumber')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(page_size));

        const total = await EmergencyBooking.countDocuments();

        res.json({
            statuscode: 0, status: 'success',
            data: bookings,
            pagination: { page: parseInt(page), page_size: parseInt(page_size), total, total_pages: Math.ceil(total / page_size) }
        });
    } catch (error) {
        res.json({ statuscode: 0, status: 'success', data: [], pagination: { total: 0 } });
    }
};

exports.getProviderVehicles = async (req, res) => {
    try {
        const { id } = req.params;
        const provider = await Ambulance.findById(id);
        
        res.json({
            statuscode: 0,
            status: 'success',
            data: provider?.vehicles || []
        });

    } catch (error) {
        res.status(500).json({
            statuscode: 1,
            status: 'error',
            message: 'Failed to get provider vehicles',
            error: error.message
        });
    }
};

exports.toggleVehicleStatus = async (req, res) => {
    try {
        const { id, vehicleId } = req.params;
        const { is_active } = req.body;

        const provider = await Ambulance.findById(id);
        if (!provider) return res.status(404).json({ statuscode: 1, status: 'error', message: 'Provider not found' });

        const vehicle = provider.vehicles.id(vehicleId);
        if (!vehicle) return res.status(404).json({ statuscode: 1, status: 'error', message: 'Vehicle not found' });

        vehicle.isActive = is_active !== undefined ? is_active : !vehicle.isActive;
        await provider.save();

        res.json({ statuscode: 0, status: 'success', message: 'Vehicle status updated', data: vehicle });
    } catch (error) {
        res.status(500).json({ statuscode: 1, status: 'error', message: error.message });
    }
};

exports.getProviderAvailability = async (req, res) => {
    try {
        const providers = await Ambulance.find({ isAvailable: true })
            .select('serviceName serviceType isAvailable baseAddress')
            .limit(20);

        res.json({
            statuscode: 0,
            status: 'success',
            data: providers
        });

    } catch (error) {
        res.status(500).json({
            statuscode: 1,
            status: 'error',
            message: 'Failed to get provider availability',
            error: error.message
        });
    }
};

exports.getPendingVerifications = async (req, res) => {
    try {
        const pending = await Ambulance.find({ isVerified: false })
            .populate('user')
            .sort({ createdAt: -1 });

        res.json({
            statuscode: 0,
            status: 'success',
            data: pending
        });

    } catch (error) {
        res.status(500).json({
            statuscode: 1,
            status: 'error',
            message: 'Failed to get pending verifications',
            error: error.message
        });
    }
};

exports.getProviderDocuments = async (req, res) => {
    res.json({ statuscode: 0, status: 'success', data: [] });
};

exports.verifyProvider = async (req, res) => {
    try {
        const { id } = req.params;
        const provider = await Ambulance.findByIdAndUpdate(id, {
            isVerified: true, verificationDate: new Date(), verifiedBy: req.user._id
        }, { new: true });
        if (!provider) return res.status(404).json({ statuscode: 1, status: 'error', message: 'Provider not found' });

        // Sync to User model
        await User.findByIdAndUpdate(provider.user, {
            isVerified: true, verificationStatus: 'verified', status: 'active'
        });

        res.json({ statuscode: 0, status: 'success', message: 'Ambulance provider verified successfully' });
    } catch (error) {
        res.status(500).json({ statuscode: 1, status: 'error', message: 'Failed to verify ambulance provider', error: error.message });
    }
};

exports.rejectProvider = async (req, res) => {
    try {
        const provider = await Ambulance.findById(req.params.id);
        if (!provider) return res.status(404).json({ statuscode: 1, status: 'error', message: 'Provider not found' });

        await Ambulance.findByIdAndUpdate(req.params.id, { isVerified: false });
        await User.findByIdAndUpdate(provider.user, { verificationStatus: 'rejected', status: 'inactive' });

        res.json({ statuscode: 0, status: 'success', message: 'Ambulance provider verification rejected' });
    } catch (error) {
        res.status(500).json({ statuscode: 1, status: 'error', message: error.message });
    }
};

// Get earnings for a specific ambulance provider
exports.getProviderEarnings = async (req, res) => {
    try {
        const EmergencyBooking = require('../../models/EmergencyBooking');
        const ambulance = await Ambulance.findById(req.params.id);
        if (!ambulance) return res.status(404).json({ statuscode: 1, status: 'error', message: 'Provider not found' });

        const bookings = await EmergencyBooking.find({ provider: ambulance._id, status: 'completed' })
            .populate({ path: 'client', populate: { path: 'user', select: 'firstName lastName' } })
            .sort({ createdAt: -1 });

        const totalEarnings = bookings.reduce((sum, b) => sum + (b.totalCost || 0), 0);
        const platformFees = Math.round(totalEarnings * 0.10);
        const netEarnings = totalEarnings - platformFees;

        res.json({
            statuscode: 0, status: 'success',
            data: {
                totalEarnings, platformFees, netEarnings,
                completedBookings: bookings.length,
                bookings: bookings.map(b => ({
                    id: b._id,
                    date: b.createdAt,
                    client: b.client?.user ? `${b.client.user.firstName} ${b.client.user.lastName}` : 'Client',
                    emergencyType: b.emergencyType || 'Emergency',
                    amount: b.totalCost || 0,
                    status: b.status,
                }))
            }
        });
    } catch (error) {
        res.status(500).json({ statuscode: 1, status: 'error', message: error.message });
    }
};

// Get aggregate patient payment data (total platform payments from patients)
exports.getPatientPaymentStats = async (req, res) => {
    try {
        const paidApts = await require('../../models/Appointment').find({ paymentStatus: 'paid' })
            .populate({ path: 'client', populate: { path: 'user', select: 'firstName lastName email' } })
            .sort({ updatedAt: -1 });

        const totalRevenue = paidApts.reduce((sum, a) => sum + (a.consultationFee || 0), 0);
        const platformFees = Math.round(totalRevenue * 0.10);

        // Group by patient
        const patientMap = {};
        paidApts.forEach(apt => {
            const clientId = apt.client?._id?.toString() || 'unknown';
            const name = apt.client?.user ? `${apt.client.user.firstName} ${apt.client.user.lastName}` : 'Patient';
            const email = apt.client?.user?.email || '';
            if (!patientMap[clientId]) {
                patientMap[clientId] = { id: clientId, name, email, totalPaid: 0, appointments: 0 };
            }
            patientMap[clientId].totalPaid += apt.consultationFee || 0;
            patientMap[clientId].appointments += 1;
        });

        const patients = Object.values(patientMap).sort((a, b) => b.totalPaid - a.totalPaid);

        res.json({
            statuscode: 0, status: 'success',
            data: { totalRevenue, platformFees, totalTransactions: paidApts.length, patients }
        });
    } catch (error) {
        res.status(500).json({ statuscode: 1, status: 'error', message: error.message });
    }
};

// Aggregate all ambulance earnings (for AllAmbulanceEarnings page)
exports.getAllAmbulanceEarnings = async (req, res) => {
    try {
        const EmergencyBooking = require('../../models/EmergencyBooking');
        const providers = await Ambulance.find().select('_id serviceName serviceType').lean();

        const rows = await Promise.all(providers.map(async (p) => {
            const bookings = await EmergencyBooking.find({ provider: p._id, status: 'completed' });
            const totalEarnings = bookings.reduce((sum, b) => sum + (b.totalCost || 0), 0);
            const platformFees = Math.round(totalEarnings * 0.10);
            return {
                id: p._id,
                name: p.serviceName || '—',
                type: p.serviceType || '—',
                completedBookings: bookings.length,
                totalEarnings,
                platformFees,
                netEarnings: totalEarnings - platformFees,
            };
        }));

        rows.sort((a, b) => b.totalEarnings - a.totalEarnings);

        const totalRevenue = rows.reduce((s, r) => s + r.totalEarnings, 0);
        const totalFees = rows.reduce((s, r) => s + r.platformFees, 0);

        res.json({
            statuscode: 0, status: 'success',
            data: { providers: rows, totalRevenue, totalFees, netRevenue: totalRevenue - totalFees }
        });
    } catch (error) {
        res.status(500).json({ statuscode: 1, status: 'error', message: error.message });
    }
};
