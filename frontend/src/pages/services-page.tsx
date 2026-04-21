import Navbar from '../components/Navbar';
import Footer from '../components/footer';
import solution1 from '../solution-image/solution-1.jpg';
import solution2 from '../solution-image/solution-2.jpg';
import solution3 from '../solution-image/solution-3.jpg';
import solution4 from '../solution-image/solution-4.jpg';
import feature1 from './services-images/features-image/feature-1.jpg';
import feature2 from './services-images/features-image/feature-2.jpg';
import feature3 from './services-images/features-image/feature-3.jpg';
import feature4 from './services-images/features-image/feature-4.jpg';
import feature5 from './services-images/features-image/feature-5.jpg';
import feature6 from './services-images/features-image/feature-6.png';
import feature7 from './services-images/features-image/feature-7.jpg';
import feature8 from './services-images/features-image/feature-8.jpg';

function ServicesPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            {/* Hero Section */}
            <main className="flex-1">
                <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
                        <div className="text-center">
                            {/* Page Title */}
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8">
                                Our Services
                            </h1>

                            {/* Page Description */}
                            <p className="text-base sm:text-lg md:text-xl text-blue-100 max-w-4xl mx-auto leading-relaxed px-4">
                                From telemedicine to emergency services, we provide a complete ecosystem of healthcare solutions designed
                                for the Nigerian market.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Four Paths Section */}
                <div className="bg-gray-50 py-12 sm:py-16 lg:py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Section Header */}
                        <div className="text-center mb-12">
                            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Solutions</p>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                Four paths to better healthcare
                            </h2>
                            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
                                Discover tailored healthcare solutions for every need in Nigeria.
                            </p>
                        </div>

                        {/* Cards Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Card 1: Patients */}
                            <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={solution1}
                                        alt="Patient receiving care"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">Patients</h3>
                                    </div>
                                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                                        Your healthcare journey starts here
                                    </h4>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Access medical services with ease and confidence.
                                    </p>
                                    <ul className="space-y-2 mb-6">
                                        <li className="flex items-start text-sm text-gray-700">
                                            <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            Online Consultations
                                        </li>
                                        <li className="flex items-start text-sm text-gray-700">
                                            <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            Emergency Booking
                                        </li>
                                        <li className="flex items-start text-sm text-gray-700">
                                            <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            Health Records
                                        </li>
                                        <li className="flex items-start text-sm text-gray-700">
                                            <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            Prescription Management
                                        </li>
                                    </ul>
                                    <a 
                                        href="/auth/register"
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-between transition-colors duration-200"
                                    >
                                        <span>Join as a Patient</span>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </a>
                                </div>
                            </div>

                            {/* Card 2: Professionals */}
                            <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={solution2}
                                        alt="Healthcare professionals"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">Professionals</h3>
                                    </div>
                                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                                        Expand your medical career
                                    </h4>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Find flexible job opportunities and grow professionally.
                                    </p>
                                    <ul className="space-y-2 mb-6">
                                        <li className="flex items-start text-sm text-gray-700">
                                            <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            Job Opportunities
                                        </li>
                                        <li className="flex items-start text-sm text-gray-700">
                                            <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            Flexible Schedule
                                        </li>
                                        <li className="flex items-start text-sm text-gray-700">
                                            <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            Secure Payments
                                        </li>
                                        <li className="flex items-start text-sm text-gray-700">
                                            <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            Professional Network
                                        </li>
                                    </ul>
                                    <a 
                                        href="/auth/register/professional"
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-between transition-colors duration-200"
                                    >
                                        <span>Join as a Professional</span>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </a>
                                </div>
                            </div>

                            {/* Card 3: Hospitals */}
                            <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={solution3}
                                        alt="Hospital facility"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">Hospitals</h3>
                                    </div>
                                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                                        Streamline your medical staffing
                                    </h4>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Recruit top healthcare talent efficiently and effectively.
                                    </p>
                                    <ul className="space-y-2 mb-6">
                                        <li className="flex items-start text-sm text-gray-700">
                                            <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            Staff Recruitment
                                        </li>
                                        <li className="flex items-start text-sm text-gray-700">
                                            <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            Verified Professionals
                                        </li>
                                        <li className="flex items-start text-sm text-gray-700">
                                            <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            Bulk Hiring
                                        </li>
                                        <li className="flex items-start text-sm text-gray-700">
                                            <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            Management Tools
                                        </li>
                                    </ul>
                                    <a 
                                        href="/auth/register?type=hospital"
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-between transition-colors duration-200"
                                    >
                                        <span>Register Hospital</span>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </a>
                                </div>
                            </div>

                            {/* Card 4: Ambulance */}
                            <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={solution4}
                                        alt="Ambulance service"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">Ambulance</h3>
                                    </div>
                                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                                        Emergency services at your call
                                    </h4>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Rapid response and reliable medical transportation.
                                    </p>
                                    <ul className="space-y-2 mb-6">
                                        <li className="flex items-start text-sm text-gray-700">
                                            <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            Real-Time Bookings
                                        </li>
                                        <li className="flex items-start text-sm text-gray-700">
                                            <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            GPS Tracking
                                        </li>
                                        <li className="flex items-start text-sm text-gray-700">
                                            <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            Emergency Response
                                        </li>
                                        <li className="flex items-start text-sm text-gray-700">
                                            <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            Revenue Growth
                                        </li>
                                    </ul>
                                    <a 
                                        href="/auth/register?type=ambulance"
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-between transition-colors duration-200"
                                    >
                                        <span>Register Ambulance</span>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="bg-white py-12 sm:py-16 lg:py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Section Header */}
                        <div className="text-center mb-12">
                            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Features</p>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                Comprehensive healthcare solutions
                            </h2>
                            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
                                We provide integrated medical services across multiple platforms. Technology meets healthcare for better outcomes.
                            </p>
                        </div>

                        {/* Top Row - 4 Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                            {/* Feature 1: Telemedicine consultations */}
                            <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={feature1}
                                        alt="Telemedicine consultations"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="p-6 text-center">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        Telemedicine consultations
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Connect with doctors remotely, receive professional medical advice without leaving your home.
                                    </p>
                                </div>
                            </div>

                            {/* Feature 2: Emergency ambulance booking */}
                            <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={feature2}
                                        alt="Emergency ambulance booking"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="p-6 text-center">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        Emergency ambulance booking
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Rapid response and reliable transportation during critical medical situations.
                                    </p>
                                </div>
                            </div>

                            {/* Feature 3: Location - Based Services */}
                            <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={feature3}
                                        alt="Location-Based Services"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="p-6 text-center">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        Location - Based Services
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Find nearby healthcare services and facilities.
                                    </p>
                                </div>
                            </div>

                            {/* Feature 4: Job placement services */}
                            <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={feature4}
                                        alt="Job placement services"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="p-6 text-center">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        Job placement services
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Bridge the gap between healthcare professionals and medical institutions seeking talent.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Row - 4 Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Feature 5: Digital Prescription */}
                            <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={feature5}
                                        alt="Digital Prescription"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="p-6 text-center">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        Digital Prescription
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Secure digital prescription management and medication tracking.
                                    </p>
                                </div>
                            </div>

                            {/* Feature 6: Verified Professionals */}
                            <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={feature6}
                                        alt="Verified Professionals"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="p-6 text-center">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        Verified Professionals
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        All healthcare providers are thoroughly vetted and verified.
                                    </p>
                                </div>
                            </div>

                            {/* Feature 7: 24/7 Support */}
                            <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={feature7}
                                        alt="24/7 Support"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="p-6 text-center">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        24/7 Support
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Round-the-clock customer support and emergency assistance.
                                    </p>
                                </div>
                            </div>

                            {/* Feature 8: Home medical services */}
                            <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={feature8}
                                        alt="Home medical services"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="p-6 text-center">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        Home medical services
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Receive specialized medical care in the comfort of your personal space.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Get Started Button */}
                        <div className="text-center mt-12">
                            <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl">
                                <span>Get Started</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Join Us Section */}
                <div className="bg-gray-100 py-16 sm:py-20 lg:py-24">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                            Join Us in Transforming Healthcare
                        </h2>
                        <p className="text-base sm:text-lg text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
                            Be part of the solution. Whether you're a patient seeking care, a healthcare professional, or a healthcare facility, join our growing community committed to better healthcare for all Nigerians.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <a 
                                href="/auth/register"
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                            >
                                Sign up as a Patient
                            </a>
                            <a 
                                href="/auth/register/professional"
                                className="bg-white hover:bg-gray-50 text-blue-600 font-semibold py-3 px-8 rounded-lg border-2 border-blue-600 transition-colors duration-200 shadow-md hover:shadow-lg"
                            >
                                Join as a Professional
                            </a>
                        </div>
                    </div>
                </div>

               
            </main>

            <Footer />
        </div>
    );
}

export default ServicesPage;
