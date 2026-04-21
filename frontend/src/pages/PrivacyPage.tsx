import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/footer';

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-900 to-purple-700 text-white py-16 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
              Privacy Policy
            </h1>
            <p className="text-lg sm:text-xl text-purple-100">
              Last updated: March 31, 2026
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white py-16 sm:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose prose-lg max-w-none">
              {/* Introduction */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Introduction</h2>
                <p className="text-gray-600 leading-relaxed">
                  At Marketplace Health, we take your privacy seriously. This Privacy Policy explains how we collect, 
                  use, disclose, and safeguard your information when you use our platform. Please read this privacy 
                  policy carefully. If you do not agree with the terms of this privacy policy, please do not access the platform.
                </p>
              </div>

              {/* Information We Collect */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Information We Collect</h2>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">Personal Information</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We collect personal information that you voluntarily provide to us when you register on the platform, 
                  including:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Name, email address, and contact information</li>
                  <li>Professional credentials and licenses (for healthcare professionals)</li>
                  <li>Medical history and health records (for patients)</li>
                  <li>Payment and billing information</li>
                  <li>Profile photos and other uploaded content</li>
                </ul>

                <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">Automatically Collected Information</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  When you access our platform, we automatically collect certain information, including:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Device information (IP address, browser type, operating system)</li>
                  <li>Usage data (pages visited, time spent, features used)</li>
                  <li>Location data (with your permission)</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>

              {/* How We Use Your Information */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We use the information we collect to:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Provide, operate, and maintain our platform</li>
                  <li>Process your transactions and manage your account</li>
                  <li>Connect patients with healthcare professionals</li>
                  <li>Facilitate appointments and consultations</li>
                  <li>Send you updates, notifications, and marketing communications</li>
                  <li>Improve our services and develop new features</li>
                  <li>Ensure platform security and prevent fraud</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </div>

              {/* Information Sharing */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Information Sharing and Disclosure</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We may share your information in the following circumstances:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li><strong>With Healthcare Providers:</strong> To facilitate your medical care and appointments</li>
                  <li><strong>With Service Providers:</strong> Third-party vendors who assist in operating our platform</li>
                  <li><strong>For Legal Compliance:</strong> When required by law or to protect our rights</li>
                  <li><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or asset sales</li>
                  <li><strong>With Your Consent:</strong> When you explicitly authorize us to share your information</li>
                </ul>
              </div>

              {/* Data Security */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Data Security</h2>
                <p className="text-gray-600 leading-relaxed">
                  We implement appropriate technical and organizational security measures to protect your personal 
                  information. This includes encryption, secure servers, access controls, and regular security audits. 
                  However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
                </p>
              </div>

              {/* Your Rights */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Privacy Rights</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  You have the following rights regarding your personal information:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li><strong>Access:</strong> Request a copy of your personal data</li>
                  <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                  <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                  <li><strong>Data Portability:</strong> Receive your data in a portable format</li>
                </ul>
              </div>

              {/* Contact */}
              <div className="bg-purple-50 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  If you have questions about this Privacy Policy or wish to exercise your privacy rights, please contact us:
                </p>
                <div className="space-y-2 text-gray-600">
                  <p><strong>Email:</strong> privacy@marketplacehealth.ng</p>
                  <p><strong>Phone:</strong> +234 (0) 800 123 4567</p>
                  <p><strong>Address:</strong> Lagos, Nigeria</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default PrivacyPage;
