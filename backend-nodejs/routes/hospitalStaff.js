/**
 * Hospital Staff Management Routes
 * /api/hospitals/staff/*
 *
 * Hospitals can add professional staff (manually or via Excel), view all staff,
 * and remove staff (staff account stays on the platform — only the hospital link
 * is severed).
 *
 * Flow when adding a professional:
 *   1. Hospital submits first/last name, email, professionalType, phone, department
 *   2. Backend creates User (role=professional) + Professional profile linked to the hospital
 *   3. A temporary password is generated and sent by email with a "Complete Registration" link
 *   4. Professional logs in, sees their profile pre-filled, completes it
 *
 * Excel columns (download template at GET /staff/template):
 *   firstName | lastName | email | phone | professionalType | specialization | licenseNumber | department
 */

const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const XLSX     = require('xlsx');
const crypto   = require('crypto');

const { protect }     = require('../middleware/auth');
const User            = require('../models/User');
const Professional    = require('../models/Professional');
const Hospital        = require('../models/Hospital');
const { sendEmail }   = require('../services/emailService');

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://healthmarketarena.com';

// In-memory multer for Excel uploads (no disk write)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// ── Allowed professional types (mirrors model enum) ──────────────────────────
const PROF_TYPES = [
    'doctor','nurse','pharmacist','dentist','physiotherapist','radiologist',
    'laboratory scientist','optometrist','dietitian','psychologist','surgeon',
    'cardiologist','dermatologist','pediatrician','gynecologist',
    'technician','therapist','other',
];

// ── Helper: generate a random temp password ───────────────────────────────────
const tempPassword = () => crypto.randomBytes(5).toString('hex') + 'Hma1!';

// ── Helper: send invite email to new staff member ────────────────────────────
const sendInviteEmail = async ({ email, firstName, password, hospitalName }) => {
    const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:auto;padding:32px 24px;background:#fff;border-radius:12px;border:1px solid #e5e7eb;">
      <div style="text-align:center;margin-bottom:24px;">
        <span style="font-size:18px;font-weight:700;color:#2563EB;">Health Market Arena</span>
      </div>
      <h2 style="color:#111827;font-size:20px;margin:0 0 12px;">You've been added as a staff member</h2>
      <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 20px;">
        Hi <strong>${firstName}</strong>,<br/><br/>
        <strong>${hospitalName}</strong> has added you as a professional on Health Market Arena.
        Your account has been created — log in with the credentials below, then you will be prompted to <strong>create a new password</strong> and complete your profile.
      </p>

      <!-- Credentials box -->
      <div style="background:#F0F4FF;border:1px solid #BFDBFE;border-radius:8px;padding:20px 24px;margin:0 0 20px;">
        <p style="margin:0 0 8px;color:#1e40af;font-size:14px;font-weight:600;">Your login credentials</p>
        <p style="margin:0 0 6px;font-size:14px;color:#374151;">📧 Email: <strong>${email}</strong></p>
        <p style="margin:0;font-size:14px;color:#374151;">🔑 Temporary password: <strong style="font-family:monospace;font-size:16px;letter-spacing:2px;background:#dbeafe;padding:2px 8px;border-radius:4px;">${password}</strong></p>
      </div>

      <!-- Steps -->
      <div style="background:#F9FAFB;border-radius:8px;padding:16px 20px;margin:0 0 24px;border-left:4px solid #2563EB;">
        <p style="margin:0 0 8px;color:#111827;font-size:14px;font-weight:600;">What to do next:</p>
        <ol style="margin:0;padding-left:20px;color:#374151;font-size:14px;line-height:2;">
          <li>Click the button below to go to the login page</li>
          <li>Enter your email and the temporary password above</li>
          <li>You will be prompted to create a new password</li>
          <li>Complete your professional profile</li>
        </ol>
      </div>

      <a href="${FRONTEND_URL}/auth/login"
         style="display:inline-block;background:#2563EB;color:#fff;text-decoration:none;padding:14px 36px;border-radius:8px;font-weight:700;font-size:15px;">
        Log In & Set Your Password →
      </a>

      <p style="margin:24px 0 0;font-size:13px;color:#9CA3AF;">
        This temporary password expires after first use. If you did not expect this email, contact
        <a href="mailto:support@healthmarketarena.com" style="color:#2563EB;">support@healthmarketarena.com</a>
      </p>
    </div>`;

    await sendEmail({
        to:      email,
        subject: `You've been added to ${hospitalName} — Set your password`,
        html,
        text: `Hi ${firstName},\n\n${hospitalName} has added you as a professional on Health Market Arena.\n\nLogin: ${FRONTEND_URL}/auth/login\nEmail: ${email}\nTemporary password: ${password}\n\nAfter login you will be asked to create a new password.\n\nHealth Market Arena`,
    });
};

// ── Helper: create one staff member ──────────────────────────────────────────
const createStaffMember = async ({ firstName, lastName, email, phone, professionalType, specialization, licenseNumber, department }, hospital) => {
    const normalEmail = email.toLowerCase().trim();

    // Check if user already exists
    let user = await User.findOne({ email: normalEmail });
    let isExisting = !!user;

    const password = tempPassword();

    if (!user) {
        // Create new user — do NOT pre-hash; the User model pre('save') hook hashes it
        user = await User.create({
            firstName:    firstName.trim(),
            lastName:     lastName.trim(),
            email:        normalEmail,
            password:     password,          // plain text — model hook hashes it
            role:         'professional',
            status:       'active',
            isActive:     true,
            emailVerified:      true,
            mustChangePassword: true,
        });
    }

    // Check if professional profile already exists
    let professional = await Professional.findOne({ user: user._id });
    if (!professional) {
        professional = await Professional.create({
            user:               user._id,
            professionalType:   PROF_TYPES.includes(professionalType?.toLowerCase())
                                    ? professionalType.toLowerCase()
                                    : 'other',
            specialization:     specialization || '',
            licenseNumber:      licenseNumber  || '',
            phone:              phone          || '',
            hospital:           hospital._id,
            addedByHospital:    hospital._id,
            isHospitalStaff:    true,
            hospitalDepartment: department || '',
            isVerified:         false,
        });
    } else {
        // Link existing professional to this hospital
        await Professional.findByIdAndUpdate(professional._id, {
            hospital:           hospital._id,
            addedByHospital:    hospital._id,
            isHospitalStaff:    true,
            hospitalDepartment: department || professional.hospitalDepartment || '',
        });
    }

    // Send invite email (only for new users)
    if (!isExisting) {
        await sendInviteEmail({
            email:        normalEmail,
            firstName:    firstName.trim(),
            password,
            hospitalName: hospital.hospitalName || 'Your Hospital',
        }).catch(e => console.error('Staff invite email failed:', e.message));
    }

    return { professional, user, isExisting };
};

// ── GET /staff ─────────────────────────────────────────────────────────────────
// List all staff linked to this hospital
router.get('/', protect, async (req, res) => {
    try {
        const hospital = await Hospital.findOne({ user: req.user._id });
        if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found' });

        const staff = await Professional.find({ addedByHospital: hospital._id })
            .populate('user', 'firstName lastName email status emailVerified createdAt')
            .sort({ createdAt: -1 });

        const list = staff.map(p => ({
            _id:              p._id,
            userId:           p.user?._id,
            firstName:        p.user?.firstName || '',
            lastName:         p.user?.lastName  || '',
            email:            p.user?.email     || '',
            professionalType: p.professionalType,
            specialization:   p.specialization,
            licenseNumber:    p.licenseNumber,
            phone:            p.phone,
            department:       p.hospitalDepartment || '',
            isVerified:       p.isVerified,
            profileComplete:  !!(p.specialization && p.phone && p.licenseNumber),
            accountStatus:    p.user?.status || 'active',
            emailVerified:    p.user?.emailVerified || false,
            addedAt:          p.createdAt,
        }));

        res.json({ success: true, data: list, total: list.length });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── POST /staff/add-manual ─────────────────────────────────────────────────────
// Add a single staff member
router.post('/add-manual', protect, async (req, res) => {
    try {
        const hospital = await Hospital.findOne({ user: req.user._id });
        if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found' });

        const { firstName, lastName, email, phone, professionalType, specialization, licenseNumber, department } = req.body;

        if (!firstName || !lastName || !email || !professionalType) {
            return res.status(400).json({ success: false, message: 'firstName, lastName, email and professionalType are required' });
        }

        const { professional, user, isExisting } = await createStaffMember(
            { firstName, lastName, email, phone, professionalType, specialization, licenseNumber, department },
            hospital
        );

        res.json({
            success: true,
            message: isExisting
                ? `${firstName} ${lastName} was already on the platform and has been linked to your hospital.`
                : `${firstName} ${lastName} has been added. An invitation email has been sent to ${email}.`,
            data: { professionalId: professional._id, userId: user._id, isExisting },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── POST /staff/add-bulk ───────────────────────────────────────────────────────
// Upload an Excel / CSV file with multiple staff
router.post('/add-bulk', protect, upload.single('file'), async (req, res) => {
    try {
        const hospital = await Hospital.findOne({ user: req.user._id });
        if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found' });

        if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

        // Parse workbook from buffer
        const wb   = XLSX.read(req.file.buffer, { type: 'buffer' });
        const ws   = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });

        if (!rows.length) return res.status(400).json({ success: false, message: 'File is empty or unreadable' });

        const results = { added: [], skipped: [], errors: [] };

        for (const row of rows) {
            const firstName      = (row.firstName      || row['First Name']      || '').toString().trim();
            const lastName       = (row.lastName       || row['Last Name']       || '').toString().trim();
            const email          = (row.email          || row['Email']           || '').toString().trim();
            const phone          = (row.phone          || row['Phone']           || '').toString().trim();
            const professionalType = (row.professionalType || row['Professional Type'] || 'other').toString().trim().toLowerCase();
            const specialization = (row.specialization || row['Specialization']  || '').toString().trim();
            const licenseNumber  = (row.licenseNumber  || row['License Number']  || '').toString().trim();
            const department     = (row.department     || row['Department']      || '').toString().trim();

            if (!firstName || !lastName || !email) {
                results.errors.push({ row: email || `Row ${rows.indexOf(row)+2}`, reason: 'Missing required fields (firstName, lastName, email)' });
                continue;
            }

            try {
                const { professional, isExisting } = await createStaffMember(
                    { firstName, lastName, email, phone, professionalType, specialization, licenseNumber, department },
                    hospital
                );
                (isExisting ? results.skipped : results.added).push({ email, name: `${firstName} ${lastName}` });
            } catch (rowErr) {
                results.errors.push({ row: email, reason: rowErr.message });
            }
        }

        res.json({
            success: true,
            message: `Processed ${rows.length} rows: ${results.added.length} added, ${results.skipped.length} linked (existing), ${results.errors.length} errors.`,
            data: results,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── DELETE /staff/:professionalId ──────────────────────────────────────────────
// Remove staff from hospital (does NOT delete the account — just unlinks)
router.delete('/:professionalId', protect, async (req, res) => {
    try {
        const hospital = await Hospital.findOne({ user: req.user._id });
        if (!hospital) return res.status(404).json({ success: false, message: 'Hospital not found' });

        const professional = await Professional.findOne({
            _id:             req.params.professionalId,
            addedByHospital: hospital._id,
        });

        if (!professional) {
            return res.status(404).json({ success: false, message: 'Staff member not found in your hospital' });
        }

        // Unlink — do NOT delete the User or Professional record
        await Professional.findByIdAndUpdate(professional._id, {
            $unset: { hospital: 1, addedByHospital: 1, hospitalDepartment: 1 },
            isHospitalStaff: false,
        });

        res.json({
            success: true,
            message: 'Staff member removed from your hospital. Their account and profile remain on the platform.',
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── GET /staff/template ────────────────────────────────────────────────────────
// Download a filled Excel template
router.get('/template', protect, (req, res) => {
    const wb = XLSX.utils.book_new();

    // Sample data rows so the hospital knows what to fill
    const data = [
        {
            'First Name':        'John',
            'Last Name':         'Doe',
            'Email':             'john.doe@example.com',
            'Phone':             '+2348012345678',
            'Professional Type': 'doctor',
            'Specialization':    'General Medicine',
            'License Number':    'MDCN-12345',
            'Department':        'General Medicine',
        },
        {
            'First Name':        'Jane',
            'Last Name':         'Smith',
            'Email':             'jane.smith@example.com',
            'Phone':             '+2348087654321',
            'Professional Type': 'nurse',
            'Specialization':    'Paediatric Nursing',
            'License Number':    'NMCN-67890',
            'Department':        'Paediatrics',
        },
    ];

    const ws = XLSX.utils.json_to_sheet(data);

    // Column widths
    ws['!cols'] = [
        { wch: 15 }, { wch: 15 }, { wch: 30 }, { wch: 18 },
        { wch: 20 }, { wch: 25 }, { wch: 18 }, { wch: 20 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Staff Template');

    // Add a "Valid Types" sheet so the hospital knows what values to use
    const typesSheet = XLSX.utils.aoa_to_sheet([
        ['Valid Professional Types'],
        ...PROF_TYPES.map(t => [t]),
    ]);
    XLSX.utils.book_append_sheet(wb, typesSheet, 'Valid Types');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="staff-template.xlsx"');
    res.send(buffer);
});

module.exports = router;
