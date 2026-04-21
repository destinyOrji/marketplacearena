const User = require('../../models/User');
const Client = require('../../models/Client');
const Appointment = require('../../models/Appointment');

// Get all patients with pagination and filters
exports.getPatients = async (req, res) => {
    try {
        const { page = 1, page_size = 10, search, status } = req.query;
        const skip = (page - 1) * page_size;

        // Build query
        let userQuery = { role: 'client' };
        if (search) {
            userQuery.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        if (status) {
            userQuery.status = status;
        }

        // Get users with client profiles
        const users = await User.find(userQuery)
            .skip(skip)
            .limit(parseInt(page_size))
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(userQuery);

        // Get client profiles for these users
        const userIds = users.map(user => user._id);
        const clients = await Client.find({ user: { $in: userIds } });
        const clientMap = clients.reduce((map, client) => {
            map[client.user.toString()] = client;
            return map;
        }, {});

        // Combine user and client data
        const patients = users.map(user => {
            const client = clientMap[user._id.toString()];
            return {
                id: user._id,
                userid: user.userid,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: client?.phone || '',
                dateOfBirth: client?.dateOfBirth || null,
                gender: client?.gender || '',
                bloodGroup: client?.bloodGroup || '',
                status: user.status,
                emailVerified: user.emailVerified,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin,
                totalAppointments: client?.totalAppointments || 0
            };
        });

        res.json({
            statuscode: 0,
            status: 'success',
            message: 'Patients retrieved successfully',
            data: patients,
            pagination: {
                page: parseInt(page),
                page_size: parseInt(page_size),
                total,
                total_pages: Math.ceil(total / page_size)
            }
        });

    } catch (error) {
        console.error('Get patients error:', error);
        res.status(500).json({
            statuscode: 1,
            status: 'error',
            message: 'Failed to get patients',
            error: error.message
        });
    }
};

// Get patient by ID
exports.getPatientById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ statuscode: 1, status: 'error', message: 'Invalid patient ID format' });
        }

        const user = await User.findById(id);
        if (!user || user.role !== 'client') {
            return res.status(404).json({
                statuscode: 1,
                status: 'error',
                message: 'Patient not found'
            });
        }

        const client = await Client.findOne({ user: id });

        const patient = {
            id: user._id,
            userid: user.userid,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: client?.phone || '',
            dateOfBirth: client?.dateOfBirth || null,
            gender: client?.gender || '',
            bloodGroup: client?.bloodGroup || '',
            maritalStatus: client?.maritalStatus || '',
            address: client?.address || {},
            emergencyContact: client?.emergencyContact || {},
            medicalHistory: client?.medicalHistory || [],
            allergies: client?.allergies || [],
            currentMedications: client?.currentMedications || [],
            insurance: client?.insurance || {},
            healthMetrics: client?.healthMetrics || {},
            status: user.status,
            emailVerified: user.emailVerified,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
            totalAppointments: client?.totalAppointments || 0,
            totalConsultations: client?.totalConsultations || 0,
            lastAppointment: client?.lastAppointment || null
        };

        res.json({
            statuscode: 0,
            status: 'success',
            data: patient
        });

    } catch (error) {
        console.error('Get patient by ID error:', error);
        res.status(500).json({
            statuscode: 1,
            status: 'error',
            message: 'Failed to get patient details',
            error: error.message
        });
    }
};

// Update patient
exports.updatePatient = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const user = await User.findById(id);
        if (!user || user.role !== 'client') {
            return res.status(404).json({
                statuscode: 1,
                status: 'error',
                message: 'Patient not found'
            });
        }

        // Update user fields
        const userFields = ['firstName', 'lastName', 'email', 'status'];
        const userUpdate = {};
        userFields.forEach(field => {
            if (updateData[field] !== undefined) {
                userUpdate[field] = updateData[field];
            }
        });

        if (Object.keys(userUpdate).length > 0) {
            await User.findByIdAndUpdate(id, userUpdate);
        }

        // Update client fields
        const clientFields = ['phone', 'dateOfBirth', 'gender', 'bloodGroup', 'maritalStatus', 'address', 'emergencyContact'];
        const clientUpdate = {};
        clientFields.forEach(field => {
            if (updateData[field] !== undefined) {
                clientUpdate[field] = updateData[field];
            }
        });

        if (Object.keys(clientUpdate).length > 0) {
            await Client.findOneAndUpdate({ user: id }, clientUpdate, { upsert: true });
        }

        res.json({
            statuscode: 0,
            status: 'success',
            message: 'Patient updated successfully'
        });

    } catch (error) {
        console.error('Update patient error:', error);
        res.status(500).json({
            statuscode: 1,
            status: 'error',
            message: 'Failed to update patient',
            error: error.message
        });
    }
};

// Delete patient
exports.deletePatient = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user || user.role !== 'client') {
            return res.status(404).json({
                statuscode: 1,
                status: 'error',
                message: 'Patient not found'
            });
        }

        // Delete client profile
        await Client.findOneAndDelete({ user: id });
        
        // Delete user
        await User.findByIdAndDelete(id);

        res.json({
            statuscode: 0,
            status: 'success',
            message: 'Patient deleted successfully'
        });

    } catch (error) {
        console.error('Delete patient error:', error);
        res.status(500).json({
            statuscode: 1,
            status: 'error',
            message: 'Failed to delete patient',
            error: error.message
        });
    }
};

// Get patient appointments
exports.getPatientAppointments = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, start_date, end_date } = req.query;

        const client = await Client.findOne({ user: id });
        if (!client) {
            return res.status(404).json({
                statuscode: 1,
                status: 'error',
                message: 'Patient not found'
            });
        }

        let query = { client: client._id };
        if (status) query.status = status;
        if (start_date || end_date) {
            query.scheduledDate = {};
            if (start_date) query.scheduledDate.$gte = new Date(start_date);
            if (end_date) query.scheduledDate.$lte = new Date(end_date);
        }

        const appointments = await Appointment.find(query)
            .populate('professional', 'user')
            .populate('hospital', 'hospitalName')
            .sort({ scheduledDate: -1 });

        res.json({
            statuscode: 0,
            status: 'success',
            data: appointments
        });

    } catch (error) {
        console.error('Get patient appointments error:', error);
        res.status(500).json({
            statuscode: 1,
            status: 'error',
            message: 'Failed to get patient appointments',
            error: error.message
        });
    }
};

// Get patient medical records
exports.getPatientMedicalRecords = async (req, res) => {
    try {
        const { id } = req.params;

        const client = await Client.findOne({ user: id });
        if (!client) {
            return res.status(404).json({
                statuscode: 1,
                status: 'error',
                message: 'Patient not found'
            });
        }

        // For now, return medical history from client profile
        // In a full implementation, you'd have a separate MedicalRecord model
        const records = client.medicalHistory || [];

        res.json({
            statuscode: 0,
            status: 'success',
            data: records
        });

    } catch (error) {
        console.error('Get patient medical records error:', error);
        res.status(500).json({
            statuscode: 1,
            status: 'error',
            message: 'Failed to get patient medical records',
            error: error.message
        });
    }
};

// Get patient emergency bookings
exports.getPatientEmergencyBookings = async (req, res) => {
    try {
        const { id } = req.params;

        // This would be implemented when you have emergency booking model
        const bookings = [];

        res.json({
            statuscode: 0,
            status: 'success',
            data: bookings
        });

    } catch (error) {
        console.error('Get patient emergency bookings error:', error);
        res.status(500).json({
            statuscode: 1,
            status: 'error',
            message: 'Failed to get patient emergency bookings',
            error: error.message
        });
    }
};