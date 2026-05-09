const User = require('../../models/User');
const GymPhysio = require('../../models/GymPhysio');
const Service = require('../../models/Service');
const Appointment = require('../../models/Appointment');

exports.getGymPhysios = async (req, res) => {
    try {
        const { page = 1, page_size = 10, search, verification_status } = req.query;
        const skip = (page - 1) * page_size;

        let query = {};
        if (verification_status === 'verified') query.isVerified = true;
        else if (verification_status === 'pending') query.isVerified = false;

        const list = await GymPhysio.find(query)
            .populate('user', '-password')
            .skip(skip).limit(parseInt(page_size)).sort({ createdAt: -1 });

        const total = await GymPhysio.countDocuments(query);

        res.json({
            statuscode: 0, status: 'success',
            data: list,
            pagination: { page: parseInt(page), page_size: parseInt(page_size), total, total_pages: Math.ceil(total / page_size) }
        });
    } catch (error) {
        res.status(500).json({ statuscode: 1, status: 'error', message: error.message });
    }
};

exports.getGymPhysioById = async (req, res) => {
    try {
        const item = await GymPhysio.findById(req.params.id).populate('user', '-password');
        if (!item) return res.status(404).json({ statuscode: 1, status: 'error', message: 'Not found' });
        res.json({ statuscode: 0, status: 'success', data: item });
    } catch (error) {
        res.status(500).json({ statuscode: 1, status: 'error', message: error.message });
    }
};

exports.verifyGymPhysio = async (req, res) => {
    try {
        const item = await GymPhysio.findByIdAndUpdate(req.params.id,
            { isVerified: true, verificationDate: new Date(), verifiedBy: req.user._id },
            { new: true }
        );
        if (!item) return res.status(404).json({ statuscode: 1, status: 'error', message: 'Not found' });
        await User.findByIdAndUpdate(item.user, { verificationStatus: 'verified', isVerified: true });
        res.json({ statuscode: 0, status: 'success', message: 'Gym/Physio verified successfully', data: item });
    } catch (error) {
        res.status(500).json({ statuscode: 1, status: 'error', message: error.message });
    }
};

exports.rejectGymPhysio = async (req, res) => {
    try {
        const item = await GymPhysio.findByIdAndUpdate(req.params.id,
            { isVerified: false },
            { new: true }
        );
        if (!item) return res.status(404).json({ statuscode: 1, status: 'error', message: 'Not found' });
        await User.findByIdAndUpdate(item.user, { verificationStatus: 'rejected' });
        res.json({ statuscode: 0, status: 'success', message: 'Gym/Physio rejected', data: item });
    } catch (error) {
        res.status(500).json({ statuscode: 1, status: 'error', message: error.message });
    }
};

exports.updateGymPhysio = async (req, res) => {
    try {
        const item = await GymPhysio.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        if (!item) return res.status(404).json({ statuscode: 1, status: 'error', message: 'Not found' });
        res.json({ statuscode: 0, status: 'success', message: 'Updated successfully', data: item });
    } catch (error) {
        res.status(500).json({ statuscode: 1, status: 'error', message: error.message });
    }
};

exports.deleteGymPhysio = async (req, res) => {
    try {
        const item = await GymPhysio.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ statuscode: 1, status: 'error', message: 'Not found' });
        res.json({ statuscode: 0, status: 'success', message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ statuscode: 1, status: 'error', message: error.message });
    }
};

exports.getPendingVerifications = async (req, res) => {
    try {
        const list = await GymPhysio.find({ isVerified: false }).populate('user', '-password').sort({ createdAt: -1 });
        res.json({ statuscode: 0, status: 'success', data: list });
    } catch (error) {
        res.status(500).json({ statuscode: 1, status: 'error', message: error.message });
    }
};

// Get services for a gym/physio provider
exports.getGymPhysioServices = async (req, res) => {
    try {
        const item = await GymPhysio.findById(req.params.id);
        if (!item) return res.status(404).json({ statuscode: 1, status: 'error', message: 'Not found' });

        const services = await Service.find({ gymPhysio: item._id }).sort({ createdAt: -1 });
        res.json({ statuscode: 0, status: 'success', data: services });
    } catch (error) {
        res.status(500).json({ statuscode: 1, status: 'error', message: error.message });
    }
};

// Toggle service status for a gym/physio provider
exports.toggleGymPhysioServiceStatus = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const { is_active } = req.body;

        const service = await Service.findByIdAndUpdate(
            serviceId,
            { status: is_active ? 'active' : 'inactive' },
            { new: true }
        );
        if (!service) return res.status(404).json({ statuscode: 1, status: 'error', message: 'Service not found' });
        res.json({ statuscode: 0, status: 'success', message: 'Service status updated', data: service });
    } catch (error) {
        res.status(500).json({ statuscode: 1, status: 'error', message: error.message });
    }
};

// Get appointments for a gym/physio provider
exports.getGymPhysioAppointments = async (req, res) => {
    try {
        const item = await GymPhysio.findById(req.params.id);
        if (!item) return res.status(404).json({ statuscode: 1, status: 'error', message: 'Not found' });

        const { status } = req.query;
        const query = { gymPhysio: item._id };
        if (status) query.status = status;

        const appointments = await Appointment.find(query)
            .populate({ path: 'client', populate: { path: 'user', select: 'firstName lastName email' } })
            .populate('service', 'title price')
            .sort({ scheduledDate: -1 });

        const data = appointments.map(apt => ({
            id: apt._id,
            date: apt.scheduledDate,
            time: apt.scheduledTime,
            status: apt.status,
            type: apt.appointmentMode,
            patient: {
                name: apt.client?.user
                    ? `${apt.client.user.firstName} ${apt.client.user.lastName}`.trim()
                    : 'Patient',
                email: apt.client?.user?.email || '',
            },
            service: apt.service ? { title: apt.service.title, price: apt.service.price } : null,
            payment: { amount: apt.consultationFee || 0, status: apt.paymentStatus },
        }));

        res.json({ statuscode: 0, status: 'success', data });
    } catch (error) {
        res.status(500).json({ statuscode: 1, status: 'error', message: error.message });
    }
};

// Get earnings for a gym/physio provider
exports.getGymPhysioEarnings = async (req, res) => {
    try {
        const item = await GymPhysio.findById(req.params.id);
        if (!item) return res.status(404).json({ statuscode: 1, status: 'error', message: 'Not found' });

        const appointments = await Appointment.find({ gymPhysio: item._id, status: 'completed' })
            .populate('service', 'title price')
            .sort({ updatedAt: -1 });

        const totalEarnings = appointments.reduce((sum, apt) => sum + (apt.consultationFee || apt.service?.price || 0), 0);
        const platformFees = Math.round(totalEarnings * 0.1);
        const netEarnings = totalEarnings - platformFees;

        const data = {
            totalEarnings,
            platformFees,
            netEarnings,
            completedAppointments: appointments.length,
            appointments: appointments.map(apt => ({
                id: apt._id,
                date: apt.scheduledDate,
                service: apt.service?.title || 'Session',
                amount: apt.consultationFee || apt.service?.price || 0,
                status: apt.paymentStatus,
            })),
        };

        res.json({ statuscode: 0, status: 'success', data });
    } catch (error) {
        res.status(500).json({ statuscode: 1, status: 'error', message: error.message });
    }
};
