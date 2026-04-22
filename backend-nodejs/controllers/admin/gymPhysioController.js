const User = require('../../models/User');
const GymPhysio = require('../../models/GymPhysio');

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
