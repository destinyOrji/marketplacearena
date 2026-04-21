import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/footer';
import partner1 from '../partner-image/partner-1.png';
import partner2 from '../partner-image/partner-2.png';
import partner3 from '../partner-image/partner-3.png';
import partner4 from '../partner-image/partner-4.png';
import partner5 from '../partner-image/partner-5.png';
import partner6 from '../partner-image/partner-6.png';
import health1 from '../healthCare-image/health-1.jpg';
import health2 from '../healthCare-image/health-2.jpg';
import health3 from '../healthCare-image/health-3.jpg';
import health4 from '../healthCare-image/health-4.jpg';
import hero1 from '../hero-image/hero-1.jpg';
import hero2 from '../hero-image/hero2.jpg';
import hero3 from '../hero-image/hero-3.jpg';
import hero4 from '../hero-image/hero-4.jpg';
import solution1 from '../solution-image/solution-1.jpg';
import solution2 from '../solution-image/solution-2.jpg';
import solution3 from '../solution-image/solution-3.jpg';
import solution4 from '../solution-image/solution-4.jpg';
import test1 from '../testimonial-image/test-1.jpg';
import test2 from '../testimonial-image/test-2.jpg';
import test3 from '../testimonial-image/test-3.jpg';
import goImage from '../HealthCareGo-image/go.png';

function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('doctor');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Hero images slideshow
  const heroImages = [hero1, hero2, hero3, hero4];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [heroImages.length]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
      if (window.innerWidth < 640) {
        setShowSearchInput(true); // Always show search input on mobile
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1">
        <div className="bg-gradient-to-br from-blue-800 via-blue-900 to-blue-950 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-32">
            <div className="text-center">
              {/* Hero Title */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 sm:mb-8 px-2">
                Your one-stop<br className="hidden sm:block" />
                <span className="sm:hidden"> </span>marketplace for<br className="hidden sm:block" />
                <span className="sm:hidden"> </span>healthcare in Nigeria
              </h1>

              {/* Hero Subtitle */}
              <p className="text-base sm:text-lg md:text-xl text-blue-100 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
                Connect with trusted medical professionals and services across Nigeria. Fast, reliable, and
                comprehensive healthcare at your fingertips.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12 sm:mb-16 px-4">
                <a
                  href="/auth/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-center"
                >
                  Sign up as a Patient
                </a>
                <a
                  href="/auth/register/professional"
                  className="bg-white text-blue-900 hover:bg-gray-50 px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-center"
                >
                  Join as a Professional
                </a>
              </div>

              {/* Search Section */}
              <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 text-left">
                    What do you need?
                  </h2>

                  {/* Mobile-First Search Bar with Tabs */}
                  <div className="space-y-4">
                    {/* Mobile Tab Selection */}
                    <div className="block sm:hidden">
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <button
                          onClick={() => setActiveTab('doctor')}
                          className={`px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${activeTab === 'doctor'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                          Find Doctor
                        </button>
                        <button
                          onClick={() => setActiveTab('appointment')}
                          className={`px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${activeTab === 'appointment'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                          Book Appointment
                        </button>
                        <button
                          onClick={() => setActiveTab('ambulance')}
                          className={`px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${activeTab === 'ambulance'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                          Call Ambulance
                        </button>
                      </div>
                    </div>

                    {/* Search Input Container */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                      {/* Search Input with Tabs for Desktop */}
                      <div className="flex-1 bg-gray-100 rounded-xl p-2 flex items-center min-h-[48px]">
                        {/* Search Icon */}
                        <button
                          onClick={() => setShowSearchInput(!showSearchInput)}
                          className="pl-2 pr-3 hover:bg-gray-200 rounded-lg p-2 transition-colors duration-200 flex-shrink-0"
                        >
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </button>

                        {/* Search Input Field (always shown on mobile, conditionally on desktop) */}
                        {(showSearchInput || isMobile) && (
                          <input
                            type="text"
                            placeholder={
                              activeTab === 'doctor' ? 'Search for doctors...' :
                                activeTab === 'appointment' ? 'Search for appointments...' :
                                  'Search for ambulance services...'
                            }
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 px-3 py-2 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900 min-h-[40px]"
                            autoFocus={showSearchInput && !isMobile}
                          />
                        )}

                        {/* Desktop Tab Buttons (hidden when search input is shown or on mobile) */}
                        {!showSearchInput && (
                          <div className="hidden sm:flex flex-1 gap-1">
                            <button
                              onClick={() => setActiveTab('doctor')}
                              className={`px-3 md:px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap ${activeTab === 'doctor'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                                }`}
                            >
                              Find a Doctor
                            </button>
                            <div className="w-px bg-gray-300 mx-1"></div>
                            <button
                              onClick={() => setActiveTab('appointment')}
                              className={`px-3 md:px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap ${activeTab === 'appointment'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                                }`}
                            >
                              Book Appointment
                            </button>
                            <div className="w-px bg-gray-300 mx-1"></div>
                            <button
                              onClick={() => setActiveTab('ambulance')}
                              className={`px-3 md:px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap ${activeTab === 'ambulance'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                                }`}
                            >
                              Call Ambulance
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Search Button */}
                      <button
                        onClick={() => {
                          if (searchQuery.trim()) {
                            // Save search query and redirect to login
                            localStorage.setItem('pendingSearch', JSON.stringify({
                              query: searchQuery,
                              type: activeTab
                            }));
                            navigate('/login');
                          } else {
                            setShowSearchInput(true);
                          }
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl min-h-[48px] flex items-center justify-center"
                      >
                        <span className="sm:hidden">search</span>
                        <span className="hidden sm:inline">Search</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Medical Facility Section with Statistics */}
              <div className="mt-12 sm:mt-16 max-w-4xl mx-auto px-4">
                <div className="relative">
                  {/* Main Medical Facility Image with Slideshow */}
                  <div className="relative rounded-2xl overflow-visible shadow-2xl">
                    <div className="relative w-full h-[60vh] sm:h-[70vh] md:h-[80vh] lg:h-[95vh] rounded-2xl overflow-hidden">
                      {heroImages.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Modern medical facility ${index + 1}`}
                          className={`absolute inset-0 w-full h-full object-cover rounded-2xl transition-opacity duration-1000 ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                            }`}
                        />
                      ))}

                      {/* Slideshow Indicators */}
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        {heroImages.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${index === currentImageIndex
                              ? 'bg-white shadow-lg'
                              : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                              }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Statistics Cards - Mobile Responsive */}
                  {/* 1000+ Verified Doctors */}
                  <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-8 md:-top-6 md:-right-12">
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-6 text-center min-w-[100px] sm:min-w-[140px]">
                      <div className="text-lg sm:text-2xl md:text-3xl font-bold text-blue-600 mb-1">1000+</div>
                      <div className="text-xs sm:text-sm md:text-base text-gray-600 font-medium">Verified Doctors</div>
                    </div>
                  </div>

                  {/* 50+ Partner Hospitals */}
                  <div className="absolute -bottom-2 -left-2 sm:-bottom-4 sm:-left-8 md:-bottom-6 md:-left-12">
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-6 text-center min-w-[100px] sm:min-w-[140px]">
                      <div className="text-lg sm:text-2xl md:text-3xl font-bold text-blue-600 mb-1">50+</div>
                      <div className="text-xs sm:text-sm md:text-base text-gray-600 font-medium">Partner Hospitals</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Partners & Collaborators Section */}
        <div className="bg-gray-100 py-12 sm:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {/* Section Title */}
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-8 sm:mb-12">
                Our Partners & Collaborators
              </h2>

              {/* Partner Logos Grid - Mobile Optimized */}
              <div className="flex justify-center items-center gap-3 sm:gap-4 md:gap-6 lg:gap-8 overflow-x-auto pb-4">
                {/* Partner Logo 1 */}
                <div className="flex items-center justify-center p-2 flex-shrink-0">
                  <img
                    src={partner1}
                    alt="Partner 2"
                    className="h-8 sm:h-10 md:h-12 lg:h-16 w-auto object-contain"
                  />
                </div>

                {/* Partner Logo 2 */}
                <div className="flex items-center justify-center p-2 flex-shrink-0">
                  <img
                    src={partner2}
                    alt="Partner 1"
                    className="h-8 sm:h-10 md:h-12 lg:h-16 w-auto object-contain"
                  />
                </div>

                {/* Partner Logo 3 */}
                <div className="flex items-center justify-center p-2 flex-shrink-0">
                  <img
                    src={partner3}
                    alt="Partner 3"
                    className="h-8 sm:h-10 md:h-12 lg:h-16 w-auto object-contain"
                  />
                </div>

                {/* Partner Logo 4 */}
                <div className="flex items-center justify-center p-2 flex-shrink-0">
                  <img
                    src={partner4}
                    alt="Partner 4"
                    className="h-8 sm:h-10 md:h-12 lg:h-16 w-auto object-contain"
                  />
                </div>

                {/* Partner Logo 5 */}
                <div className="flex items-center justify-center p-2 flex-shrink-0">
                  <img
                    src={partner5}
                    alt="Partner 5"
                    className="h-8 sm:h-10 md:h-12 lg:h-16 w-auto object-contain"
                  />
                </div>

                {/* Partner Logo 6 */}
                <div className="flex items-center justify-center p-2 flex-shrink-0">
                  <img
                    src={partner6}
                    alt="Partner 6"
                    className="h-8 sm:h-10 md:h-12 lg:h-16 w-auto object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comprehensive Healthcare Solutions Section */}
        <div className="bg-white py-12 sm:py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              {/* Features Label */}
              <div className="text-sm font-medium text-gray-500 mb-4">Features</div>

              {/* Section Title */}
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
                Comprehensive healthcare<br className="hidden sm:block" />
                <span className="sm:hidden"> </span>solutions
              </h2>

              {/* Section Description */}
              <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
                We provide integrated medical services across multiple platforms. Technology meets
                healthcare for better outcomes.
              </p>
            </div>

            {/* Services Grid - Mobile Optimized */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
              {/* Telemedicine consultations */}
              <div className="text-center">
                <div className="mb-4 sm:mb-6">
                  <img
                    src={health1}
                    alt="Telemedicine consultations"
                    className="w-full h-40 sm:h-48 object-cover rounded-2xl"
                  />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                  Telemedicine<br />consultations
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed px-2">
                  Connect with doctors remotely, receive professional medical advice without leaving your home.
                </p>
              </div>

              {/* Emergency ambulance booking */}
              <div className="text-center">
                <div className="mb-4 sm:mb-6">
                  <img
                    src={health2}
                    alt="Emergency ambulance booking"
                    className="w-full h-40 sm:h-48 object-cover rounded-2xl"
                  />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                  Emergency ambulance<br />booking
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed px-2">
                  Rapid response and reliable transportation during critical medical situations.
                </p>
              </div>

              {/* Location-Based Services */}
              <div className="text-center">
                <div className="mb-4 sm:mb-6">
                  <img
                    src={health3}
                    alt="Location-Based Services"
                    className="w-full h-40 sm:h-48 object-cover rounded-2xl"
                  />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                  Location-Based<br />Services
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed px-2">
                  Find nearby healthcare services and facilities.
                </p>
              </div>

              {/* Job placement services */}
              <div className="text-center">
                <div className="mb-4 sm:mb-6">
                  <img
                    src={health4}
                    alt="Job placement services"
                    className="w-full h-40 sm:h-48 object-cover rounded-2xl"
                  />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                  Job placement<br />services
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed px-2">
                  Bridge the gap between healthcare professionals and medical institutions seeking talent.
                </p>
              </div>
            </div>

            {/* Explore Services Button */}
            <div className="text-center">
              <a
                href="/services"
                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 rounded-full font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Explore Services
                <svg className="ml-2 w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        {/* Four Paths to Better Healthcare Section */}
        <div className="bg-gray-50 py-12 sm:py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              {/* Solutions Label */}
              <div className="text-sm font-medium text-gray-500 mb-4">Solutions</div>

              {/* Section Title */}
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
                Four paths to better healthcare
              </h2>

              {/* Section Description */}
              <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
                Discover tailored healthcare solutions for every need in Nigeria.
              </p>
            </div>

            {/* Four Paths Grid - Mobile Optimized */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-12 sm:mb-16">
              {/* Patients Card */}
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200">
                <div className="mb-4 sm:mb-6">
                  <img
                    src={solution2}
                    alt="Patients"
                    className="w-full h-32 sm:h-40 object-cover rounded-xl"
                  />
                </div>
                <div className="flex items-center mb-3 sm:mb-4">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                    <svg className="w-3 h-3 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">Patients</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4 sm:mb-6 leading-relaxed">
                  Access medical services with ease and confidence.
                </p>
                <a
                  href="/auth/register"
                  className="inline-flex items-center justify-between w-full bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-200 text-sm sm:text-base"
                >
                  Join as a Patient
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>

              {/* Professionals Card */}
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200">
                <div className="mb-4 sm:mb-6">
                  <img
                    src={solution3}
                    alt="Professionals"
                    className="w-full h-32 sm:h-40 object-cover rounded-xl"
                  />
                </div>
                <div className="flex items-center mb-3 sm:mb-4">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                    <svg className="w-3 h-3 sm:w-5 sm:h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">Professionals</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4 sm:mb-6 leading-relaxed">
                  Find flexible job opportunities and grow professionally.
                </p>
                <a
                  href="/auth/register/professional"
                  className="inline-flex items-center justify-between w-full bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-200 text-sm sm:text-base"
                >
                  Join as a Professional
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>

              {/* Hospitals Card */}
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200">
                <div className="mb-4 sm:mb-6">
                  <img
                    src={solution1}
                    alt="Hospitals"
                    className="w-full h-32 sm:h-40 object-cover rounded-xl"
                  />
                </div>
                <div className="flex items-center mb-3 sm:mb-4">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-100 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                    <svg className="w-3 h-3 sm:w-5 sm:h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">Hospitals</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4 sm:mb-6 leading-relaxed">
                  Recruit top healthcare talent efficiently and effectively.
                </p>
                <a
                  href="/auth/register?type=hospital"
                  className="inline-flex items-center justify-between w-full bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-200 text-sm sm:text-base"
                >
                  Register Hospital
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>

              {/* Ambulance Card */}
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200">
                <div className="mb-4 sm:mb-6">
                  <img
                    src={solution4}
                    alt="Ambulance"
                    className="w-full h-32 sm:h-40 object-cover rounded-xl"
                  />
                </div>
                <div className="flex items-center mb-3 sm:mb-4">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                    <svg className="w-3 h-3 sm:w-5 sm:h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">Ambulance</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4 sm:mb-6 leading-relaxed">
                  Rapid response and reliable medical transportation.
                </p>
                <a
                  href="/auth/register?type=ambulance"
                  className="inline-flex items-center justify-between w-full bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-200 text-sm sm:text-base"
                >
                  Register Ambulance
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Statistics Section - Mobile Optimized */}
            <div className="bg-gray-200 rounded-2xl py-8 sm:py-12 px-4 sm:px-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 text-center">
                <div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600 mb-1 sm:mb-2">1000+</div>
                  <div className="text-gray-600 font-medium text-xs sm:text-sm md:text-base">Verified Healthcare Professionals</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-500 mb-1 sm:mb-2">50+</div>
                  <div className="text-gray-600 font-medium text-xs sm:text-sm md:text-base">Partner Hospitals</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-600 mb-1 sm:mb-2">10K+</div>
                  <div className="text-gray-600 font-medium text-xs sm:text-sm md:text-base">Happy Patients</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-red-500 mb-1 sm:mb-2">24/7</div>
                  <div className="text-gray-600 font-medium text-xs sm:text-sm md:text-base">Emergency Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Testimonials Section */}
        <div className="bg-white py-12 sm:py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              {/* Testimonials Label */}
              <div className="text-sm font-medium text-gray-500 mb-4">Testimonials</div>

              {/* Section Title */}
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
                Trusted by leading healthcare organizations
              </h2>

              {/* Section Description */}
              <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
                See what our community has to say about their experience with Health Market Arena
              </p>
            </div>

            {/* Testimonials Grid - Mobile Optimized */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {/* Testimonial 1 */}
              <div className="text-left">
                {/* Star Rating */}
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-gray-700 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                  Health Market Arena saved my life during an emergency. Their ambulance service was quick and professional.
                </p>

                {/* User Info */}
                <div className="flex items-center">
                  <img
                    src={test1}
                    alt="Adebayo Okonkwo"
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover mr-3 sm:mr-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">Adebayo Okonkwo</div>
                    <div className="text-gray-600 text-xs sm:text-sm">Patient, Lagos</div>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="text-left">
                {/* Star Rating */}
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-gray-700 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                  Finding a specialist was always difficult. Now, I can book consultations easily and get quality care.
                </p>

                {/* User Info */}
                <div className="flex items-center">
                  <img
                    src={test2}
                    alt="Chioma Eze"
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover mr-3 sm:mr-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">Chioma Eze</div>
                    <div className="text-gray-600 text-xs sm:text-sm">Patient, Abuja</div>
                  </div>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="text-left">
                {/* Star Rating */}
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-gray-700 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                  As a hospital administrator, this platform has simplified our recruitment process dramatically.
                </p>

                {/* User Info */}
                <div className="flex items-center">
                  <img
                    src={test3}
                    alt="Dr. Emma Nwosu"
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover mr-3 sm:mr-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">Dr. Emma Nwosu</div>
                    <div className="text-gray-600 text-xs sm:text-sm">Hospital Director, Port Harcourt</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>        {
/* FAQ Section */}
        <div className="bg-white py-12 sm:py-16 lg:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              {/* FAQ Label */}
              <div className="text-sm font-medium text-gray-500 mb-4">FAQ</div>

              {/* Section Title */}
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
                Frequently Asked Questions
              </h2>

              {/* Section Description */}
              <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
                Have questions about how Health Market Arena works? We've put together some common
                questions and clear answers to help you understand our platform.
              </p>
            </div>

            {/* FAQ Items - Mobile Optimized */}
            <div className="space-y-3 sm:space-y-4 mb-12 sm:mb-16">
              {/* FAQ Item 1 */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => {
                    const content = document.getElementById('faq-1');
                    const icon = document.getElementById('icon-1');
                    if (content && icon) {
                      content.classList.toggle('hidden');
                      icon.classList.toggle('rotate-45');
                    }
                  }}
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 text-left flex justify-between items-center hover:bg-gray-50 focus:outline-none"
                >
                  <span className="font-semibold text-gray-900 text-sm sm:text-base pr-4">What is Health Market Arena?</span>
                  <svg id="icon-1" className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 transform transition-transform duration-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
                <div id="faq-1" className="hidden px-4 sm:px-6 pb-3 sm:pb-4">
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                    Health Market Arena is a digital platform that connects patients, healthcare professionals,
                    hospitals, and ambulance services across Nigeria. It helps users book consultations, find
                    medical help, and access healthcare faster and easier.
                  </p>
                </div>
              </div>

              {/* FAQ Item 2 */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => {
                    const content = document.getElementById('faq-2');
                    const icon = document.getElementById('icon-2');
                    if (content && icon) {
                      content.classList.toggle('hidden');
                      icon.classList.toggle('rotate-45');
                    }
                  }}
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 text-left flex justify-between items-center hover:bg-gray-50 focus:outline-none"
                >
                  <span className="font-semibold text-gray-900 text-sm sm:text-base pr-4">How do I book a doctor or healthcare service?</span>
                  <svg id="icon-2" className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 transform transition-transform duration-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
                <div id="faq-2" className="hidden px-4 sm:px-6 pb-3 sm:pb-4">
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                    Simply create an account, search for the professional or service you need, choose a date and
                    time, and confirm your booking. You'll get instant updates and payment confirmation once
                    your booking is complete.
                  </p>
                </div>
              </div>

              {/* FAQ Item 3 */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => {
                    const content = document.getElementById('faq-3');
                    const icon = document.getElementById('icon-3');
                    if (content && icon) {
                      content.classList.toggle('hidden');
                      icon.classList.toggle('rotate-45');
                    }
                  }}
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 text-left flex justify-between items-center hover:bg-gray-50 focus:outline-none"
                >
                  <span className="font-semibold text-gray-900 text-sm sm:text-base pr-4">Can healthcare professionals and hospitals also register?</span>
                  <svg id="icon-3" className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 transform transition-transform duration-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
                <div id="faq-3" className="hidden px-4 sm:px-6 pb-3 sm:pb-4">
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                    Yes. Health Market Arena supports both individuals and institutions. Professionals can create
                    profiles, offer services, and apply for jobs, while hospitals can post vacancies and hire
                    verified staff.
                  </p>
                </div>
              </div>

              {/* FAQ Item 4 */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => {
                    const content = document.getElementById('faq-4');
                    const icon = document.getElementById('icon-4');
                    if (content && icon) {
                      content.classList.toggle('hidden');
                      icon.classList.toggle('rotate-45');
                    }
                  }}
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 text-left flex justify-between items-center hover:bg-gray-50 focus:outline-none"
                >
                  <span className="font-semibold text-gray-900 text-sm sm:text-base pr-4">What services can I access on the platform?</span>
                  <svg id="icon-4" className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 transform transition-transform duration-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
                <div id="faq-4" className="hidden px-4 sm:px-6 pb-3 sm:pb-4">
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                    You can book online consultations, emergency ambulances, home medical care, and follow-up
                    treatments. Hospitals and health workers can also use the platform for recruitment and
                    job placement.
                  </p>
                </div>
              </div>

              {/* FAQ Item 5 */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => {
                    const content = document.getElementById('faq-5');
                    const icon = document.getElementById('icon-5');
                    if (content && icon) {
                      content.classList.toggle('hidden');
                      icon.classList.toggle('rotate-45');
                    }
                  }}
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 text-left flex justify-between items-center hover:bg-gray-50 focus:outline-none"
                >
                  <span className="font-semibold text-gray-900 text-sm sm:text-base pr-4">Is my information safe on Health Market Arena?</span>
                  <svg id="icon-5" className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 transform transition-transform duration-200 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
                <div id="faq-5" className="hidden px-4 sm:px-6 pb-3 sm:pb-4">
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                    Absolutely. We use strict data protection and encryption standards to keep all medical and
                    personal information secure and confidential.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Section - Mobile Optimized */}
            <div className="text-center bg-gray-50 rounded-2xl py-8 sm:py-12 px-4 sm:px-8">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                Need more information?
              </h3>
              <p className="text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto text-sm sm:text-base">
                Our Support team is ready to help you with any additional questions
              </p>
              <a
                href="/contact"
                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                Contact Our Team
              </a>
            </div>
          </div>
        </div>
        {/* Healthcare on the Go Section */}
        <div className="bg-gray-100 py-12 sm:py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              {/* Section Title */}
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
                Healthcare on the go
              </h2>

              {/* Section Description */}
              <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-6 sm:mb-8 px-4">
                Get instant access to healthcare services. Book consultations, find doctors, and manage your
                health records on the go.
              </p>

              {/* CTA Buttons - Mobile Optimized */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 px-4">
                <a
                  href="/auth/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 rounded-lg text-base sm:text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl text-center"
                >
                  Sign up as a Patient
                </a>
                <a
                  href="/auth/register/professional"
                  className="bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50 px-6 sm:px-8 py-3 rounded-lg text-base sm:text-lg font-semibold transition-all duration-200 text-center"
                >
                  Join as a Professional
                </a>
              </div>
            </div>

            {/* Healthcare Image with Digital Icons - Mobile Optimized */}
            <div className="relative mx-auto w-full max-w-4xl px-2 sm:px-0">
              <div className="relative h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-screen">
                <img
                  src={goImage}
                  alt="Healthcare on the go - Digital healthcare services"
                  className="w-full h-full object-cover rounded-2xl"
                />

                {/* Digital Healthcare Icons Overlay - Mobile Responsive */}
                <div className="absolute inset-0">
                  {/* Patient Icon - Top Center */}
                  <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-500 bg-opacity-90 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>

                  {/* Medical Cross Icon - Bottom Left */}
                  <div className="absolute bottom-1/3 left-1/4 transform -translate-x-1/2 translate-y-1/2">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 bg-blue-500 bg-opacity-90 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                      <svg className="w-5 h-5 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                  </div>

                  {/* Ambulance Icon - Bottom Right */}
                  <div className="absolute bottom-1/3 right-1/4 transform translate-x-1/2 translate-y-1/2">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 bg-blue-500 bg-opacity-90 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                      <svg className="w-5 h-5 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                    </div>
                  </div>

                  {/* Connecting Lines - Hidden on very small screens */}
                  <div className="hidden sm:block absolute top-1/3 left-1/2 transform -translate-x-1/2">
                    <div className="w-24 sm:w-32 h-px bg-blue-400 opacity-60 transform rotate-45"></div>
                  </div>
                  <div className="hidden sm:block absolute top-1/3 right-1/2 transform translate-x-1/2">
                    <div className="w-24 sm:w-32 h-px bg-blue-400 opacity-60 transform -rotate-45"></div>
                  </div>
                  <div className="hidden sm:block absolute bottom-1/2 left-1/3 transform translate-y-1/2">
                    <div className="w-16 sm:w-24 h-px bg-blue-400 opacity-60"></div>
                  </div>
                  <div className="hidden sm:block absolute bottom-1/2 right-1/3 transform translate-y-1/2">
                    <div className="w-16 sm:w-24 h-px bg-blue-400 opacity-60"></div>
                  </div>
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

export default HomePage;
