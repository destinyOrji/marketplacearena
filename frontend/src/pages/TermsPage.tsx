import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/footer';

function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-indigo-900 to-indigo-700 text-white py-16 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
              Terms of Service
            </h1>
            <p className="text-lg sm:text-xl text-indigo-100">
              Last updated: March 31, 2026
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white py-16 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Introduction */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                By accessing or using Health Market Arena ("Platform"), you agree to be bound by these Terms of Service 
                ("Terms"). If you disagree with any part of these terms, you may not access the Platform.
              </p>
              <p className="text-gray-600 leading-relaxed">
                These Terms apply to all visitors, users, and others who access or use the Platform, including but not 
                limited to patients, healthcare professionals, hospitals, and ambulance service providers.
              </p>
            </div>

            {/* Use of Platform */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">2. Use of Platform</h2>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">2.1 Eligibility</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                You must be at least 18 years old to use this Platform. By using the Platform, you represent and warrant 
                that you meet this age requirement.
              </p>

              <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">2.2 Account Registration</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                To access certain features of the Platform, you must register for an account. You agree to:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4 mb-4">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your password and account</li>
                <li>Accept responsibility for all activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">2.3 Prohibited Activities</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                You agree not to engage in any of the following prohibited activities:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Violating any applicable laws or regulations</li>
                <li>Infringing on intellectual property rights</li>
                <li>Transmitting harmful code or malware</li>
                <li>Impersonating another person or entity</li>
                <li>Harassing, threatening, or abusing other users</li>
                <li>Collecting user information without consent</li>
                <li>Using the Platform for unauthorized commercial purposes</li>
              </ul>
            </div>

            {/* Healthcare Services */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">3. Healthcare Services</h2>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">3.1 Platform Role</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Health Market Arena is a technology platform that connects patients with healthcare professionals, 
                hospitals, and ambulance services. We do not provide medical services directly and are not responsible 
                for the quality of care provided by healthcare professionals or facilities on the Platform.
              </p>

              <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">3.2 Medical Disclaimer</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                The Platform does not provide medical advice. All content is for informational purposes only and should 
                not be considered a substitute for professional medical advice, diagnosis, or treatment. Always seek the 
                advice of your physician or qualified healthcare provider with any questions regarding a medical condition.
              </p>

              <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">3.3 Emergency Services</h3>
              <p className="text-gray-600 leading-relaxed">
                In case of a medical emergency, call your local emergency number immediately. Do not rely solely on the 
                Platform for emergency medical assistance.
              </p>
            </div>

            {/* Professional Verification */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">4. Professional Verification</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                While we make reasonable efforts to verify the credentials of healthcare professionals, hospitals, and 
                ambulance services on our Platform, we do not guarantee the accuracy, completeness, or validity of such 
                information. Users are encouraged to independently verify credentials before engaging services.
              </p>
            </div>

            {/* Payment Terms */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">5. Payment Terms</h2>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">5.1 Fees</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Certain services on the Platform may require payment. You agree to pay all applicable fees as described 
                at the time of transaction. All fees are non-refundable unless otherwise stated.
              </p>

              <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">5.2 Payment Processing</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Payments are processed through secure third-party payment processors. By providing payment information, 
                you authorize us to charge the applicable fees to your payment method.
              </p>

              <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">5.3 Cancellation and Refunds</h3>
              <p className="text-gray-600 leading-relaxed">
                Cancellation and refund policies vary by service type and provider. Please review the specific 
                cancellation policy before booking any service.
              </p>
            </div>

            {/* Intellectual Property */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">6. Intellectual Property</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                The Platform and its original content, features, and functionality are owned by Health Market Arena and 
                are protected by international copyright, trademark, patent, trade secret, and other intellectual 
                property laws.
              </p>
              <p className="text-gray-600 leading-relaxed">
                You may not reproduce, distribute, modify, create derivative works of, publicly display, or exploit any 
                content from the Platform without our prior written permission.
              </p>
            </div>

            {/* Limitation of Liability */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">7. Limitation of Liability</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                To the maximum extent permitted by law, Health Market Arena shall not be liable for any indirect, 
                incidental, special, consequential, or punitive damages, including but not limited to loss of profits, 
                data, use, goodwill, or other intangible losses resulting from:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Your access to or use of (or inability to access or use) the Platform</li>
                <li>Any conduct or content of any third party on the Platform</li>
                <li>Any content obtained from the Platform</li>
                <li>Unauthorized access, use, or alteration of your transmissions or content</li>
              </ul>
            </div>

            {/* Termination */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">8. Termination</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We may terminate or suspend your account and access to the Platform immediately, without prior notice or 
                liability, for any reason, including if you breach these Terms.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Upon termination, your right to use the Platform will immediately cease. All provisions of these Terms 
                that by their nature should survive termination shall survive, including ownership provisions, warranty 
                disclaimers, indemnity, and limitations of liability.
              </p>
            </div>

            {/* Governing Law */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">9. Governing Law</h2>
              <p className="text-gray-600 leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the Federal Republic of 
                Nigeria, without regard to its conflict of law provisions. Any disputes arising from these Terms shall 
                be resolved in the courts of Nigeria.
              </p>
            </div>

            {/* Changes to Terms */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">10. Changes to Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                We reserve the right to modify or replace these Terms at any time. We will provide notice of any material 
                changes by posting the new Terms on this page and updating the "Last updated" date. Your continued use of 
                the Platform after any changes constitutes acceptance of the new Terms.
              </p>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="space-y-2 text-gray-600">
                <p>Email: legal@healthmarketarena.ng</p>
                <p>Phone: +234 (0) 800 123 4567</p>
                <p>Address: Lagos, Nigeria</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default TermsPage;
