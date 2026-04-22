const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    userid: {
        type: String,
        unique: true,
        required: true,
        default: () => Date.now().toString()
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    userAlias: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        enum: ['super_admin', 'admin', 'client', 'professional', 'hospital', 'ambulance', 'gym-physio'],
        default: 'client'
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isStaff: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    
    // Verification fields
    verificationToken: String,
    emailVerified: {
        type: Boolean,
        default: false
    },
    phoneVerified: {
        type: Boolean,
        default: false
    },
    otpCode: String,
    otpExpiresAt: Date,
    
    // Password reset fields
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    // Refresh token storage
    refreshToken: {
        type: String,
        default: null
    },
    refreshTokenExpiry: {
        type: Date,
        default: null
    },
    
    // Profile fields
    phone: {
        type: String,
        trim: true
    },
    address: String,
    city: String,
    state: String,
    country: String,
    dateOfBirth: Date,
    gender: {
        type: String,
        enum: ['male', 'female', 'other']
    },
    
    // Organization fields
    department: {
        type: String,
        default: 'all'
    },
    division: {
        type: String,
        default: 'all'
    },
    staffId: {
        type: String,
        default: 'CINALL'
    },
    
    // Metadata
    lastLogin: Date,
    loginCount: {
        type: Number,
        default: 0
    },
    
    // Documents
    documentsUploaded: {
        type: Boolean,
        default: false
    },
    verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function(doc, ret) {
            delete ret.password;
            delete ret.__v;
            return ret;
        }
    }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Generate user alias
userSchema.pre('save', function(next) {
    if (!this.userAlias) {
        this.userAlias = `${this.firstName} ${this.lastName}`.trim();
    }
    next();
});

// Update login info
userSchema.methods.updateLoginInfo = function() {
    this.lastLogin = new Date();
    this.loginCount += 1;
    return this.save();
};

module.exports = mongoose.model('User', userSchema);