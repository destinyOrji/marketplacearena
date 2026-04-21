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
    res.json({ statuscode: 0, status: 'success', data: [] });
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
    res.json({ statuscode: 0, status: 'success', message: 'Vehicle status updated' });
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

        await Ambulance.findByIdAndUpdate(id, {
            isVerified: true,
            verificationDate: new Date(),
            verifiedBy: req.user._id
        });

        res.json({
            statuscode: 0,
            status: 'success',
            message: 'Ambulance provider verified successfully'
        });

    } catch (error) {
        res.status(500).json({
            statuscode: 1,
            status: 'error',
            message: 'Failed to verify ambulance provider',
            error: error.message
        });
    }
};

exports.rejectProvider = async (req, res) => {
    res.json({
        statuscode: 0,
        status: 'success',
        message: 'Ambulance provider verification rejected'
    });
};