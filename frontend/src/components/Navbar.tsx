import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import logo from '../logo.png';

const Navbar: React.FC = () => {
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo and Brand */}
                    <div className="flex items-center">
                        <div className="flex-shrink-0 flex items-center">
                            <img
                                src={logo}
                                alt="Health Market Arena Logo"
                                className="w-8 h-8 mr-3 object-contain"
                            />
                            <span className="text-xl font-semibold text-blue-600">Health Market Arena</span>
                        </div>
                    </div>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-8">
                            <a
                                href="/"
                                className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${isActive('/')
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-700 hover:text-blue-600'
                                    }`}
                            >
                                Home
                            </a>
                            <a
                                href="/about"
                                className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${isActive('/about')
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-700 hover:text-blue-600'
                                    }`}
                            >
                                About
                            </a>
                            <a
                                href="/services"
                                className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${isActive('/services')
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-700 hover:text-blue-600'
                                    }`}
                            >
                                Services
                            </a>
                            <a
                                href="/contact"
                                className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${isActive('/contact')
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-700 hover:text-blue-600'
                                    }`}
                            >
                                Contact
                            </a>

                            {/* More Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsMoreOpen(!isMoreOpen)}
                                    className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium flex items-center transition-colors duration-200"
                                >
                                    More
                                    <svg
                                        className={`ml-1 h-4 w-4 transition-transform duration-200 ${isMoreOpen ? 'rotate-180' : ''}`}
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>

                                {isMoreOpen && (
                                    <>
                                        {/* Backdrop overlay */}
                                        <div
                                            className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm z-40"
                                            onClick={() => setIsMoreOpen(false)}
                                        ></div>

                                        {/* Dropdown content */}
                                        <div className="fixed left-1/2 top-20 transform -translate-x-1/2 bg-white rounded-2xl shadow-2xl py-8 z-50 border border-gray-100" style={{ width: 'min(80vw, 1200px)', maxHeight: '80vh', overflowY: 'auto' }}>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-8">
                                                {/* Quick links */}
                                                <div className="space-y-1">
                                                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                                                        <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full mr-3"></div>
                                                        Quick links
                                                    </h3>
                                                    <div className="space-y-2">
                                                        <a href="/professionals" className="group flex items-start space-x-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition-all duration-300 hover:shadow-md hover:scale-105 transform">
                                                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
                                                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                                </svg>
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-base font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-200">Professionals</p>
                                                                <p className="text-sm text-gray-500 group-hover:text-blue-600 transition-colors duration-200">Join our healthcare network</p>
                                                            </div>
                                                            <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-1" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </a>

                                                        <a href="/hospitals" className="group flex items-start space-x-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition-all duration-300 hover:shadow-md hover:scale-105 transform">
                                                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
                                                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" clipRule="evenodd" />
                                                                </svg>
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-base font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-200">Hospitals</p>
                                                                <p className="text-sm text-gray-500 group-hover:text-blue-600 transition-colors duration-200">Streamline your medical staffing</p>
                                                            </div>
                                                            <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-1" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </a>

                                                        <a href="/ambulance" className="group flex items-start space-x-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition-all duration-300 hover:shadow-md hover:scale-105 transform">
                                                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
                                                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                                                </svg>
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-base font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-200">Ambulance</p>
                                                                <p className="text-sm text-gray-500 group-hover:text-blue-600 transition-colors duration-200">Emergency services at your call</p>
                                                            </div>
                                                            <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-1" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </a>
                                                    </div>
                                                </div>

                                                {/* Resources */}
                                                <div className="space-y-1">
                                                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                                                        <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-green-600 rounded-full mr-3"></div>
                                                        Resources
                                                    </h3>
                                                    <div className="space-y-2">
                                                        <a href="/our-team" className="group flex items-start space-x-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 transition-all duration-300 hover:shadow-md hover:scale-105 transform">
                                                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
                                                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                                </svg>
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-base font-semibold text-gray-900 group-hover:text-green-700 transition-colors duration-200">Our Team</p>
                                                                <p className="text-sm text-gray-500 group-hover:text-green-600 transition-colors duration-200">Get to know our team</p>
                                                            </div>
                                                            <svg className="w-5 h-5 text-gray-400 group-hover:text-green-500 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-1" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </a>

                                                        <a href="/contact" className="group flex items-start space-x-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 transition-all duration-300 hover:shadow-md hover:scale-105 transform">
                                                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
                                                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                                                                </svg>
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-base font-semibold text-gray-900 group-hover:text-green-700 transition-colors duration-200">Contact</p>
                                                                <p className="text-sm text-gray-500 group-hover:text-green-600 transition-colors duration-200">Reach out to our team</p>
                                                            </div>
                                                            <svg className="w-5 h-5 text-gray-400 group-hover:text-green-500 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-1" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </a>
                                                    </div>
                                                </div>

                                                {/* Legal */}
                                                <div className="space-y-1">
                                                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                                                        <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full mr-3"></div>
                                                        Legal
                                                    </h3>
                                                    <div className="space-y-2">
                                                        <a href="/privacy" className="group flex items-start space-x-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 transition-all duration-300 hover:shadow-md hover:scale-105 transform">
                                                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
                                                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                                                </svg>
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-base font-semibold text-gray-900 group-hover:text-purple-700 transition-colors duration-200">Privacy</p>
                                                                <p className="text-sm text-gray-500 group-hover:text-purple-600 transition-colors duration-200">Read our privacy policy</p>
                                                            </div>
                                                            <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-500 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-1" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </a>

                                                        <a href="/terms" className="group flex items-start space-x-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 transition-all duration-300 hover:shadow-md hover:scale-105 transform">
                                                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
                                                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                                                </svg>
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-base font-semibold text-gray-900 group-hover:text-purple-700 transition-colors duration-200">Terms</p>
                                                                <p className="text-sm text-gray-500 group-hover:text-purple-600 transition-colors duration-200">Review service conditions</p>
                                                            </div>
                                                            <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-500 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-1" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </a>

                                                        <a href="/compliance" className="group flex items-start space-x-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 transition-all duration-300 hover:shadow-md hover:scale-105 transform">
                                                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
                                                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                </svg>
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-base font-semibold text-gray-900 group-hover:text-purple-700 transition-colors duration-200">Compliance</p>
                                                                <p className="text-sm text-gray-500 group-hover:text-purple-600 transition-colors duration-200">Our regulatory standards</p>
                                                            </div>
                                                            <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-500 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-1" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Desktop Auth Buttons */}
                    <div className="hidden md:block">
                        <div className="ml-4 flex items-center space-x-4">
                            <a href="/auth/login" className="text-gray-700 hover:text-blue-600 px-4 py-2 text-sm font-medium transition-colors duration-200">
                                Sign In
                            </a>
                            <a href="/auth/get-started" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 shadow-sm">
                                Get Started
                            </a>
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            type="button"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors duration-200"
                        >
                            <span className="sr-only">Open main menu</span>
                            {!isMobileMenuOpen ? (
                                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            ) : (
                                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
                        <a
                            href="/"
                            className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${isActive('/')
                                    ? 'text-blue-600 bg-blue-50'
                                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                                }`}
                        >
                            Home
                        </a>
                        <a
                            href="/about"
                            className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${isActive('/about')
                                    ? 'text-blue-600 bg-blue-50'
                                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                                }`}
                        >
                            About
                        </a>
                        <a
                            href="/services"
                            className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${isActive('/services')
                                    ? 'text-blue-600 bg-blue-50'
                                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                                }`}
                        >
                            Services
                        </a>
                        <a
                            href="/contact"
                            className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${isActive('/contact')
                                    ? 'text-blue-600 bg-blue-50'
                                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                                }`}
                        >
                            Contact
                        </a>

                        {/* Mobile More Section */}
                        <div className="pt-4">
                            <h3 className="text-sm font-semibold text-gray-900 px-3 mb-3 flex items-center">
                                <div className="w-1 h-4 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full mr-2"></div>
                                Quick Links
                            </h3>
                            <div className="space-y-1">
                                <a href="/professionals" className="group flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition-all duration-200">
                                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 group-hover:text-blue-700">Professionals</p>
                                        <p className="text-xs text-gray-500 group-hover:text-blue-600">Join our healthcare network</p>
                                    </div>
                                </a>

                                <a href="/hospitals" className="group flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition-all duration-200">
                                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 group-hover:text-blue-700">Hospitals</p>
                                        <p className="text-xs text-gray-500 group-hover:text-blue-600">Streamline your medical staffing</p>
                                    </div>
                                </a>

                                <a href="/ambulance" className="group flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition-all duration-200">
                                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 group-hover:text-blue-700">Ambulance</p>
                                        <p className="text-xs text-gray-500 group-hover:text-blue-600">Emergency services at your call</p>
                                    </div>
                                </a>
                            </div>
                        </div>

                        {/* Mobile Resources Section */}
                        <div className="pt-4">
                            <h3 className="text-sm font-semibold text-gray-900 px-3 mb-3 flex items-center">
                                <div className="w-1 h-4 bg-gradient-to-b from-green-500 to-green-600 rounded-full mr-2"></div>
                                Resources
                            </h3>
                            <div className="space-y-1">
                                <a href="/our-team" className="group flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 transition-all duration-200">
                                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 group-hover:text-green-700">Our Team</p>
                                        <p className="text-xs text-gray-500 group-hover:text-green-600">Get to know our team</p>
                                    </div>
                                </a>

                                <a href="/contact" className="group flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 transition-all duration-200">
                                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 group-hover:text-green-700">Contact</p>
                                        <p className="text-xs text-gray-500 group-hover:text-green-600">Reach out to our team</p>
                                    </div>
                                </a>
                            </div>
                        </div>

                        {/* Mobile Legal Section */}
                        <div className="pt-4">
                            <h3 className="text-sm font-semibold text-gray-900 px-3 mb-3 flex items-center">
                                <div className="w-1 h-4 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full mr-2"></div>
                                Legal
                            </h3>
                            <div className="space-y-1">
                                <a href="/privacy" className="group flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 transition-all duration-200">
                                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 group-hover:text-purple-700">Privacy</p>
                                        <p className="text-xs text-gray-500 group-hover:text-purple-600">Read our privacy policy</p>
                                    </div>
                                </a>

                                <a href="/terms" className="group flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 transition-all duration-200">
                                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 group-hover:text-purple-700">Terms</p>
                                        <p className="text-xs text-gray-500 group-hover:text-purple-600">Review service conditions</p>
                                    </div>
                                </a>

                                <a href="/compliance" className="group flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 transition-all duration-200">
                                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 group-hover:text-purple-700">Compliance</p>
                                        <p className="text-xs text-gray-500 group-hover:text-purple-600">Our regulatory standards</p>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Auth Buttons */}
                    <div className="pt-4 pb-3 border-t border-gray-200 bg-gray-50">
                        <div className="flex items-center px-5 space-y-3 flex-col">
                            <a href="/auth/login" className="w-full text-gray-700 hover:text-blue-600 px-4 py-2 text-sm font-medium transition-colors duration-200 text-center">
                                Sign In
                            </a>
                            <a href="/auth/get-started" className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 shadow-sm">
                                Get Started
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
