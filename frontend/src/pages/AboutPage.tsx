import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/footer';
import hero1 from '../hero-image/hero-1.jpg';
import solution1 from '../solution-image/solution-1.jpg';
import solution2 from '../solution-image/solution-2.jpg';
import solution3 from '../solution-image/solution-3.jpg';

function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
              About Us
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 max-w-3xl mx-auto">
              Transforming healthcare delivery across Nigeria through innovative technology and dedicated service
            </p>
          </div>
        </div>

        {/* Mission Section */}
        <div className="bg-white py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                  Transforming Care Through Connection
                </h2>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  Health Market Arena is Nigeria's leading digital healthcare platform, connecting patients, 
                  healthcare professionals, hospitals, and emergency services in one seamless ecosystem.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  We believe that quality healthcare should be accessible to everyone, everywhere. Our platform 
                  bridges the gap between healthcare providers and those who need care, making it easier, faster, 
                  and more efficient to access medical services across Nigeria.
                </p>
              </div>
              <div className="relative">
                <img
                  src={hero1}
                  alt="Healthcare professionals"
                  className="rounded-2xl shadow-2xl w-full h-96 object-cover"
                />
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 bg-gray-50 rounded-2xl p-8 sm:p-12">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">1000+</div>
                <div className="text-gray-600 font-medium">Verified Professionals</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-green-500 mb-2">50+</div>
                <div className="text-gray-600 font-medium">Partner Hospitals</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-purple-600 mb-2">10K+</div>
                <div className="text-gray-600 font-medium">Happy Patients</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-red-500 mb-2">24/7</div>
                <div className="text-gray-600 font-medium">Emergency Support</div>
              </div>
            </div>
          </div>
        </div>

        {/* Our Vision & Mission */}
        <div className="bg-gray-50 py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
                <p className="text-gray-600 leading-relaxed">
                  To be Africa's most trusted healthcare platform, where every Nigerian has instant access 
                  to quality medical care, and healthcare professionals thrive in a connected ecosystem.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
                <p className="text-gray-600 leading-relaxed">
                  To revolutionize healthcare delivery in Nigeria by connecting patients, professionals, 
                  and facilities through innovative technology, making quality healthcare accessible, 
                  affordable, and efficient for all.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Join Us in Transforming Healthcare
            </h2>
            <p className="text-lg text-blue-100 mb-8">
              Be part of Nigeria's healthcare revolution.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/auth/register"
                className="inline-flex items-center justify-center bg-white text-blue-900 hover:bg-gray-100 font-semibold px-8 py-4 rounded-lg transition-colors duration-200 shadow-lg"
              >
                Get Started
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-900 font-semibold px-8 py-4 rounded-lg transition-colors duration-200"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default AboutPage;
