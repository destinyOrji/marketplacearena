import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/footer';

function CompliancePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-teal-900 to-teal-700 text-white py-16 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
              Regulatory Compliance
            </h1>
            <p className="text-lg sm:text-xl text-teal-100">
              Our commitment to healthcare standards and regulations
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white py-16 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Introduction */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Commitment to Compliance</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                At Health Market Arena, we are committed to maintaining the highest standards of regulatory compliance 
                in the healthcare industry. We adhere to all applicable Nigerian healthcare laws, regulations, and 
                international best practices to ensure the safety, privacy, and quality of care for all users.
              </p>
            </div>

            {/* Regulatory Framework */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">1. Regulatory Framework</h2>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">1.1 Nigerian Healthcare Regulations</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Our platform operates in full compliance with:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4 mb-6">
                <li>National Health Act 2014</li>
                <li>Medical and Dental Practitioners Act</li>
                <li>Nursing and Midwifery Act</li>
                <li>Pharmacy Council of Nigeria regulations</li>
                <li>Federal Ministry of Health guidelines</li>
                <li>State health ministry requirements</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">1.2 Data Protection</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                We comply with:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Nigeria Data Protection Regulation (NDPR) 2019</li>
                <li>International data protection standards</li>
                <li>Healthcare data security best practices</li>
              </ul>
            </div>

            {/* Professional Verification */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">2. Professional Verification Standards</h2>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">2.1 Healthcare Professionals</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                All healthcare professionals on our platform must provide:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4 mb-6">
                <li>Valid professional license from relevant regulatory body</li>
                <li>Current practicing certificate</li>
                <li>Professional indemnity insurance</li>
                <li>Educational credentials and certifications</li>
                <li>Continuous professional development records</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">2.2 Healthcare Facilities</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Hospitals and clinics must demonstrate:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4 mb-6">
                <li>Valid operating license from state health ministry</li>
                <li>Facility accreditation certificates</li>
                <li>Compliance with health and safety standards</li>
                <li>Quality assurance programs</li>
                <li>Emergency preparedness protocols</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">2.3 Ambulance Services</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Ambulance providers must have:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Valid ambulance service license</li>
                <li>Vehicle registration and inspection certificates</li>
                <li>Certified emergency medical technicians</li>
                <li>Proper medical equipment and supplies</li>
                <li>Insurance coverage for emergency transport</li>
              </ul>
            </div>

            {/* Data Security */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">3. Data Security and Privacy</h2>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">3.1 Patient Data Protection</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                We implement comprehensive measures to protect patient data:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4 mb-6">
                <li>End-to-end encryption for all sensitive data</li>
                <li>Secure data storage with regular backups</li>
                <li>Access controls and authentication protocols</li>
                <li>Regular security audits and penetration testing</li>
                <li>Incident response and breach notification procedures</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">3.2 Medical Records Management</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Our electronic health records system complies with:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Medical records confidentiality requirements</li>
                <li>Patient consent management protocols</li>
                <li>Data retention and disposal policies</li>
                <li>Audit trail requirements for record access</li>
              </ul>
            </div>

            {/* Quality Assurance */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">4. Quality Assurance</h2>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">4.1 Service Quality Standards</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                We maintain quality through:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4 mb-6">
                <li>Regular performance monitoring and evaluation</li>
                <li>Patient feedback and satisfaction surveys</li>
                <li>Complaint handling and resolution procedures</li>
                <li>Continuous improvement programs</li>
                <li>Provider performance reviews</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">4.2 Clinical Governance</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Our clinical governance framework includes:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Clinical practice guidelines and protocols</li>
                <li>Adverse event reporting and management</li>
                <li>Risk management procedures</li>
                <li>Clinical audit programs</li>
              </ul>
            </div>

            {/* Ethical Standards */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">5. Ethical Standards</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                All healthcare providers on our platform must adhere to:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Professional codes of conduct and ethics</li>
                <li>Patient rights and dignity principles</li>
                <li>Informed consent requirements</li>
                <li>Confidentiality and privacy obligations</li>
                <li>Non-discrimination policies</li>
                <li>Conflict of interest disclosure</li>
              </ul>
            </div>

            {/* Monitoring and Enforcement */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">6. Monitoring and Enforcement</h2>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">6.1 Compliance Monitoring</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                We conduct regular compliance monitoring through:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4 mb-6">
                <li>Periodic credential verification</li>
                <li>License renewal tracking</li>
                <li>Quality assurance audits</li>
                <li>User complaint investigation</li>
                <li>Regulatory compliance reviews</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">6.2 Enforcement Actions</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Non-compliance may result in:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Warning notices and corrective action requirements</li>
                <li>Temporary suspension of platform access</li>
                <li>Permanent removal from the platform</li>
                <li>Reporting to relevant regulatory authorities</li>
              </ul>
            </div>

            {/* Reporting and Transparency */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">7. Reporting and Transparency</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We are committed to transparency in our compliance efforts:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Annual compliance reports</li>
                <li>Incident disclosure when required</li>
                <li>Cooperation with regulatory investigations</li>
                <li>Public disclosure of compliance policies</li>
              </ul>
            </div>

            {/* Continuous Improvement */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">8. Continuous Improvement</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We continuously update our compliance programs to:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Adapt to changing regulations</li>
                <li>Incorporate industry best practices</li>
                <li>Address emerging risks and challenges</li>
                <li>Enhance patient safety and care quality</li>
                <li>Improve operational efficiency</li>
              </ul>
            </div>

            {/* Contact Information */}
            <div className="bg-teal-50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Compliance Inquiries</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                For questions about our compliance programs or to report compliance concerns:
              </p>
              <div className="space-y-2 text-gray-600">
                <p className="font-semibold">Compliance Office</p>
                <p>Email: compliance@healthmarketarena.com</p>
                <p>Phone: +234 (0) 800 123 4567</p>
                <p>Address: Port Harcourt, Rivers State, Nigeria</p>
              </div>
              <div className="mt-6 p-4 bg-white rounded-lg border-l-4 border-teal-600">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Whistleblower Protection:</span> We protect individuals who report 
                  compliance violations in good faith from retaliation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default CompliancePage;
