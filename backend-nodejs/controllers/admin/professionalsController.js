const User = require('../../models/User');
const Professional = require('../../models/Professional');
const Service = require('../../models/Service');
const Appointment = require('../../models/Appointment');

// Get all professionals with pagination and filters
exports.getProfessionals = async (req, res) => {
    try {
        const { page = 1, page_size = 10, search, professional_type, verification_status } = req.query;
        const skip = (page - 1) * page_size;

        // Build query for users
        let userQuery = { role: 'professional' };
        if (search) {
            userQuery.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Build query for professionals
        let professionalQuery = {};
        if (professional_type) {
            professionalQuery.professionalType = professional_type;
        }
        if (verification_status === 'verified') {
            professionalQuery.isVerified = true;
        } else if (verification_status === 'pending') {
            professionalQuery.isVerified = false;
        }

        // Get professionals with user data
        const professionals = await Professional.find(professionalQuery)
            .populate('user')
            .skip(skip)
            .limit(parseInt(page_size))
            .sort({ createdAt: -1 });

        // Filter by user search criteria
        let filteredProfessionals = professionals;
        if (search) {
            filteredProfessionals = professionals.filter(prof => {
                const user = prof.user;
                return user.firstName.toLowerCase().includes(search.toLowerCase()) ||
                       user.lastName.toLowerCase().includes(search.toLowerCase()) ||
                       user.email.toLowerCase().includes(search.toLowerCase());
            });
        }

        const total = await Professional.countDocuments(professionalQuery);

        const result = filteredProfessionals.map(prof => ({
            id: prof._id,
            user: {
                id: prof.user._id,
                userid: prof.user.userid,
                firstName: prof.user.firstName,
                lastName: prof.user.lastName,
                email: prof.user.email,
                status: prof.user.status,
                emailVerified: prof.user.emailVerified,
                createdAt: prof.user.createdAt
            },
            professionalType: prof.professionalType,
            licenseNumber: prof.licenseNumber,
            specialization: prof.specialization,
            yearsOfExperience: prof.yearsOfExperience,
            phone: prof.phone,
            isVerified: prof.isVerified,
            isAvailable: prof.isAvailable,
            averageRating: prof.averageRating,
            totalReviews: prof.totalReviews,
            totalAppointments: prof.totalAppointments,
            completedAppointments: prof.completedAppointments,
            createdAt: prof.createdAt
        }));

        res.json({
            statuscode: 0,
            status: 'success',
            message: 'Professionals retrieved successfully',
            data: result,
            pagination: {
                page: parseInt(page),
                page_size: parseInt(page_size),
                total,
                total_pages: Math.ceil(total / page_size)
            }
        });

    } catch (error) {
        console.error('Get professionals error:', error);
        res.status(500).json({
            statuscode: 1,
            status: 'error',
            message: 'Failed to get professionals',
            error: error.message
        });
    }
};

// Get professional by ID
exports.getProfessionalById = async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log('=== Get Professional By ID ===');
        console.log('Requested ID:', id);
        console.log('ID type:', typeof id);
        console.log('ID length:', id?.length);

        // Validate ObjectId format
        if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
            console.log('Invalid ID format');
            return res.status(400).json({ 
                statuscode: 1, 
                status: 'error', 
                message: `Invalid professional ID format. Received: ${id}` 
            });
        }

        const professional = await Professional.findById(id).populate('user');
        console.log('Professional found:', professional ? 'Yes' : 'No');
        
        if (!professional) {
            return res.status(404).json({
                statuscode: 1,
                status: 'error',
                message: 'Professional not found'
            });
        }

        const result = {
            id: professional._id,
            user: {
                id: professional.user._id,
                userid: professional.user.userid,
                firstName: professional.user.firstName,
                lastName: professional.user.lastName,
                email: professional.user.email,
                status: professional.user.status,
                emailVerified: professional.user.emailVerified,
                createdAt: professional.user.createdAt,
                lastLogin: professional.user.lastLogin
            },
            professionalType: professional.professionalType,
            licenseNumber: professional.licenseNumber,
            specialization: professional.specialization,
            yearsOfExperience: professional.yearsOfExperience,
            qualifications: professional.qualifications,
            certifications: professional.certifications,
            skills: professional.skills,
            bio: professional.bio,
            phone: professional.phone,
            address: professional.address,
            city: professional.city,
            state: professional.state,
            country: professional.country,
            isVerified: professional.isVerified,
            verificationDate: professional.verificationDate,
            isAvailable: professional.isAvailable,
            consultationFee: professional.consultationFee,
            currency: professional.currency,
            averageRating: professional.averageRating,
            totalReviews: professional.totalReviews,
            totalAppointments: professional.totalAppointments,
            completedAppointments: professional.completedAppointments,
            createdAt: professional.createdAt,
            updatedAt: professional.updatedAt
        };

        res.json({
            statuscode: 0,
            status: 'success',
            data: result
        });

    } catch (error) {
        console.error('Get professional by ID error:', error);
        res.status(500).json({
            statuscode: 1,
            status: 'error',
            message: 'Failed to get professional details',
            error: error.message
        });
    }
};

// Update professional
exports.updateProfessional = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const professional = await Professional.findById(id);
        if (!professional) {
            return res.status(404).json({
                statuscode: 1,
                status: 'error',
                message: 'Professional not found'
            });
        }

        // Update user fields if provided
        const userFields = ['firstName', 'lastName', 'email', 'status'];
        const userUpdate = {};
        userFields.forEach(field => {
            if (updateData[field] !== undefined) {
                userUpdate[field] = updateData[field];
            }
        });

        if (Object.keys(userUpdate).length > 0) {
            await User.findByIdAndUpdate(professional.user, userUpdate);
        }

        // Update professional fields
        const professionalFields = [
            'professionalType', 'licenseNumber', 'specialization', 'yearsOfExperience',
            'qualifications', 'certifications', 'skills', 'bio', 'phone', 'address',
            'city', 'state', 'country', 'isAvailable', 'consultationFee'
        ];
        const professionalUpdate = {};
        professionalFields.forEach(field => {
            if (updateData[field] !== undefined) {
                professionalUpdate[field] = updateData[field];
            }
        });

        if (Object.keys(professionalUpdate).length > 0) {
            await Professional.findByIdAndUpdate(id, professionalUpdate);
        }

        res.json({
            statuscode: 0,
            status: 'success',
            message: 'Professional updated successfully'
        });

    } catch (error) {
        console.error('Update professional error:', error);
        res.status(500).json({
            statuscode: 1,
            status: 'error',
            message: 'Failed to update professional',
            error: error.message
        });
    }
};

// Delete professional
exports.deleteProfessional = async (req, res) => {
    try {
        const { id } = req.params;

        const professional = await Professional.findById(id);
        if (!professional) {
            return res.status(404).json({
                statuscode: 1,
                status: 'error',
                message: 'Professional not found'
            });
        }

        // Delete professional profile
        await Professional.findByIdAndDelete(id);
        
        // Delete user
        await User.findByIdAndDelete(professional.user);

        res.json({
            statuscode: 0,
            status: 'success',
            message: 'Professional deleted successfully'
        });

    } catch (error) {
        console.error('Delete professional error:', error);
        res.status(500).json({
            statuscode: 1,
            status: 'error',
            message: 'Failed to delete professional',
            error: error.message
        });
    }
};

// Get professional services (placeholder)
exports.getProfessionalServices = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the professional
        const professional = await Professional.findById(id);
        if (!professional) {
            return res.status(404).json({
                statuscode: 1,
                status: 'error',
                message: 'Professional not found'
            });
        }

        // Get all services for this professional
        const services = await Service.find({ professional: id })
            .sort({ createdAt: -1 });

        res.json({
            statuscode: 0,
            status: 'success',
            data: services
        });

    } catch (error) {
        console.error('Get professional services error:', error);
        res.status(500).json({
            statuscode: 1,
            status: 'error',
            message: 'Failed to get professional services',
            error: error.message
        });
    }
};

// Toggle service status
exports.toggleServiceStatus = async (req, res) => {
    try {
        const { id, serviceId } = req.params;
        const { is_active } = req.body;

        // Find the service
        const service = await Service.findOne({ 
            _id: serviceId, 
            professional: id 
        });

        if (!service) {
            return res.status(404).json({
                statuscode: 1,
                status: 'error',
                message: 'Service not found'
            });
        }

        // Update service status
        service.status = is_active ? 'active' : 'inactive';
        await service.save();

        res.json({
            statuscode: 0,
            status: 'success',
            message: 'Service status updated successfully',
            data: service
        });

    } catch (error) {
        console.error('Toggle service status error:', error);
        res.status(500).json({
            statuscode: 1,
            status: 'error',
            message: 'Failed to toggle service status',
            error: error.message
        });
    }
};

// Get professional applications (placeholder)
exports.getProfessionalApplications = async (req, res) => {
    try {
        const applications = [];

        res.json({
            statuscode: 0,
            status: 'success',
            data: applications
        });

    } catch (error) {
        console.error('Get professional applications error:', error);
        res.status(500).json({
            statuscode: 1,
            status: 'error',
            message: 'Failed to get professional applications',
            error: error.message
        });
    }
};

// Get professional schedules (placeholder)
exports.getProfessionalSchedules = async (req, res) => {
    try {
        const schedules = [];

        res.json({
            statuscode: 0,
            status: 'success',
            data: schedules
        });

    } catch (error) {
        console.error('Get professional schedules error:', error);
        res.status(500).json({
            statuscode: 1,
            status: 'error',
            message: 'Failed to get professional schedules',
            error: error.message
        });
    }
};

// Get professional earnings (placeholder)
exports.getProfessionalEarnings = async (req, res) => {
    try {
        const earnings = [];

        res.json({
            statuscode: 0,
            status: 'success',
            data: earnings
        });

    } catch (error) {
        console.error('Get professional earnings error:', error);
        res.status(500).json({
            statuscode: 1,
            status: 'error',
            message: 'Failed to get professional earnings',
            error: error.message
        });
    }
};

// Get pending verifications
exports.getPendingVerifications = async (req, res) => {
    try {
        const pendingProfessionals = await Professional.find({ isVerified: false })
            .populate('user', 'firstName lastName email createdAt')
            .sort({ createdAt: -1 });

        const result = pendingProfessionals.map(prof => ({
            id: prof._id,
            user: prof.user,
            professionalType: prof.professionalType,
            licenseNumber: prof.licenseNumber,
            specialization: prof.specialization,
            yearsOfExperience: prof.yearsOfExperience,
            phone: prof.phone,
            createdAt: prof.createdAt
        }));

        res.json({
            statuscode: 0,
            status: 'success',
            data: result
        });

    } catch (error) {
        console.error('Get pending verifications error:', error);
        res.status(500).json({
            statuscode: 1,
            status: 'error',
            message: 'Failed to get pending verifications',
            error: error.message
        });
    }
};

// Get professional documents (placeholder)
exports.getProfessionalDocuments = async (req, res) => {
    try {
        const documents = [];

        res.json({
            statuscode: 0,
            status: 'success',
            data: documents
        });

    } catch (error) {
        console.error('Get professional documents error:', error);
        res.status(500).json({
            statuscode: 1,
            status: 'error',
            message: 'Failed to get professional documents',
            error: error.message
        });
    }
};

// Verify professional
exports.verifyProfessional = async (req, res) => {
    try {
        const { id } = req.params;

        const professional = await Professional.findById(id);
        if (!professional) {
            return res.status(404).json({
                statuscode: 1,
                status: 'error',
                message: 'Professional not found'
            });
        }

        professional.isVerified = true;
        professional.verificationDate = new Date();
        professional.verifiedBy = req.user._id;
        await professional.save();

        res.json({
            statuscode: 0,
            status: 'success',
            message: 'Professional verified successfully'
        });

    } catch (error) {
        console.error('Verify professional error:', error);
        res.status(500).json({
            statuscode: 1,
            status: 'error',
            message: 'Failed to verify professional',
            error: error.message
        });
    }
};

// Reject professional
exports.rejectProfessional = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const professional = await Professional.findById(id);
        if (!professional) {
            return res.status(404).json({
                statuscode: 1,
                status: 'error',
                message: 'Professional not found'
            });
        }

        // In a full implementation, you might want to store rejection reason
        // and send notification to the professional

        res.json({
            statuscode: 0,
            status: 'success',
            message: 'Professional verification rejected'
        });

    } catch (error) {
        console.error('Reject professional error:', error);
        res.status(500).json({
            statuscode: 1,
            status: 'error',
            message: 'Failed to reject professional',
            error: error.message
        });
    }
};