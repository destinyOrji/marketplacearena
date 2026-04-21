const User = require('../../models/User');
const Hospital = require('../../models/Hospital');

// Get all hospitals with pagination and filters
exports.getHospitals = async (req, res) => {
    try {
        const { page = 1, page_size = 10, search, facility_type, verification_status } = req.query;
        const skip = (page - 1) * page_size;

        let query = {};
        if (facility_type) query.hospitalType = facility_type;
        if (verification_status === 'verified') query.isVerified = true;
        else if (verification_status === 'pending') query.isVerified = false;

        const hospitals = await Hospital.find(query)
            .populate('user')
            .skip(skip)
            .limit(parseInt(page_size))
            .sort({ createdAt: -1 });

        const total = await Hospital.countDocuments(query);

        const result = hospitals.map(hospital => ({
            id: hospital._id,
            user: hospital.user,
            hospitalName: hospital.hospitalName,
            registrationNumber: hospital.registrationNumber,
            hospitalType: hospital.hospitalType,
            phone: hospital.phone,
            email: hospital.email,
            address: hospital.address,
            isVerified: hospital.isVerified,
            totalBeds: hospital.totalBeds,
            availableBeds: hospital.availableBeds,
            emergencyServices: hospital.emergencyServices,
            averageRating: hospital.averageRating,
            createdAt: hospital.createdAt
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
        console.error('Get hospitals error:', error);
        res.status(500).json({
            statuscode: 1,
            status: 'error',
            message: 'Failed to get hospitals',
            error: error.message
        });
    }
};

// Get hospital by ID
exports.getHospitalById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ statuscode: 1, status: 'error', message: 'Invalid hospital ID format' });
        }

        const hospital = await Hospital.findById(id).populate('user');
        if (!hospital) {
            return res.status(404).json({
                statuscode: 1,
                status: 'error',
                message: 'Hospital not found'
            });
        }

        res.json({
            statuscode: 0,
            status: 'success',
            data: hospital
        });

    } catch (error) {
        console.error('Get hospital by ID error:', error);
        res.status(500).json({
            statuscode: 1,
            status: 'error',
            message: 'Failed to get hospital details',
            error: error.message
        });
    }
};

// Update hospital
exports.updateHospital = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        await Hospital.findByIdAndUpdate(id, updateData);

        res.json({
            statuscode: 0,
            status: 'success',
            message: 'Hospital updated successfully'
        });

    } catch (error) {
        console.error('Update hospital error:', error);
        res.status(500).json({
            statuscode: 1,
            status: 'error',
            message: 'Failed to update hospital',
            error: error.message
        });
    }
};

// Delete hospital
exports.deleteHospital = async (req, res) => {
    try {
        const { id } = req.params;

        const hospital = await Hospital.findById(id);
        if (!hospital) {
            return res.status(404).json({
                statuscode: 1,
                status: 'error',
                message: 'Hospital not found'
            });
        }

        await Hospital.findByIdAndDelete(id);
        await User.findByIdAndDelete(hospital.user);

        res.json({
            statuscode: 0,
            status: 'success',
            message: 'Hospital deleted successfully'
        });

    } catch (error) {
        console.error('Delete hospital error:', error);
        res.status(500).json({
            statuscode: 1,
            status: 'error',
            message: 'Failed to delete hospital',
            error: error.message
        });
    }
};

// Placeholder methods for other hospital operations
exports.getHospitalVacancies = async (req, res) => {
    res.json({ statuscode: 0, status: 'success', data: [] });
};

exports.toggleVacancyStatus = async (req, res) => {
    res.json({ statuscode: 0, status: 'success', message: 'Vacancy status updated' });
};

exports.getHospitalApplications = async (req, res) => {
    res.json({ statuscode: 0, status: 'success', data: [] });
};

exports.getHospitalSubscription = async (req, res) => {
    res.json({ statuscode: 0, status: 'success', data: null });
};

exports.updateHospitalSubscription = async (req, res) => {
    res.json({ statuscode: 0, status: 'success', message: 'Subscription updated' });
};

exports.getPendingVerifications = async (req, res) => {
    try {
        const pending = await Hospital.find({ isVerified: false })
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

exports.getHospitalDocuments = async (req, res) => {
    res.json({ statuscode: 0, status: 'success', data: [] });
};

exports.verifyHospital = async (req, res) => {
    try {
        const { id } = req.params;

        await Hospital.findByIdAndUpdate(id, {
            isVerified: true,
            verificationDate: new Date(),
            verifiedBy: req.user._id
        });

        res.json({
            statuscode: 0,
            status: 'success',
            message: 'Hospital verified successfully'
        });

    } catch (error) {
        res.status(500).json({
            statuscode: 1,
            status: 'error',
            message: 'Failed to verify hospital',
            error: error.message
        });
    }
};

exports.rejectHospital = async (req, res) => {
    res.json({
        statuscode: 0,
        status: 'success',
        message: 'Hospital verification rejected'
    });
};