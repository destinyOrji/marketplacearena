import React from 'react';
import logo from '../logo.png';

const Footer: React.FC = () => {
    return (
        <footer className="bg-blue-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                    {/* Company Info */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center mb-6">
                            <img
                                src={logo}
                                alt="Health Market Arena Logo"
                                className="w-8 h-8 mr-3 object-contain"
                            />
                        <span className="text-xl font-semibold">Health Market Arena</span>
                        </div>

                        <p className="text-blue-100 mb-6 leading-relaxed">
                            Nigeria's leading digital healthcare marketplace, connecting patients with
                            healthcare professionals, hospitals, and emergency services for accessible,
                            quality healthcare.
                        </p>

                        <div className="space-y-3">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-blue-300 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                </svg>
                                <span className="text-blue-100">+234 (0) 800 HEALTH</span>
                            </div>

                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-blue-300 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                </svg>
                                <span className="text-blue-100">healthmarketarena@gmail.com</span>
                            </div>

                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-blue-300 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                                <span className="text-blue-100">Port Harcourt, Rivers State, Nigeria</span>
                            </div>
                        </div>

                        {/* Social Media Icons */}
                        <div className="flex space-x-4 mt-6">
                            <a href="https://www.instagram.com/healthmarketarena/" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-white transition-colors duration-200" aria-label="Instagram">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                </svg>
                            </a>
                            <a href="https://www.tiktok.com/@healthmarketarena" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-white transition-colors duration-200" aria-label="TikTok">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                                </svg>
                            </a>
                            <a href="#" className="text-blue-300 hover:text-white transition-colors duration-200" aria-label="LinkedIn">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                            </a>
                            <a href="#" className="text-blue-300 hover:text-white transition-colors duration-200" aria-label="YouTube">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-blue-100 hover:text-white transition-colors duration-200">Home</a></li>
                            <li><a href="#" className="text-blue-100 hover:text-white transition-colors duration-200">About Us</a></li>
                            <li><a href="#" className="text-blue-100 hover:text-white transition-colors duration-200">Services</a></li>
                            <li><a href="#" className="text-blue-100 hover:text-white transition-colors duration-200">Contact Us</a></li>
                            <li><a href="#" className="text-blue-100 hover:text-white transition-colors duration-200">FAQs</a></li>
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Services</h3>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-blue-100 hover:text-white transition-colors duration-200">Find a Doctor</a></li>
                            <li><a href="#" className="text-blue-100 hover:text-white transition-colors duration-200">Book a Hospital</a></li>
                            <li><a href="#" className="text-blue-100 hover:text-white transition-colors duration-200">Ambulance Services</a></li>
                            <li><a href="#" className="text-blue-100 hover:text-white transition-colors duration-200">Telemedicine</a></li>
                            <li><a href="#" className="text-blue-100 hover:text-white transition-colors duration-200">Home Care</a></li>
                            <li><a href="#" className="text-blue-100 hover:text-white transition-colors duration-200">Digital Prescription</a></li>
                        </ul>
                    </div>

                    {/* For Users */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">For Users</h3>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-blue-100 hover:text-white transition-colors duration-200">Patients</a></li>
                            <li><a href="#" className="text-blue-100 hover:text-white transition-colors duration-200">Professionals</a></li>
                            <li><a href="#" className="text-blue-100 hover:text-white transition-colors duration-200">Hospitals</a></li>
                            <li><a href="#" className="text-blue-100 hover:text-white transition-colors duration-200">Ambulance Services</a></li>
                        </ul>

                        <h3 className="text-lg font-semibold mb-4 mt-8">Legal</h3>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-blue-100 hover:text-white transition-colors duration-200">Privacy Policy</a></li>
                            <li><a href="#" className="text-blue-100 hover:text-white transition-colors duration-200">Terms of Usage</a></li>
                            <li><a href="#" className="text-blue-100 hover:text-white transition-colors duration-200">Medical Disclaimer</a></li>
                            <li><a href="#" className="text-blue-100 hover:text-white transition-colors duration-200">Data Protection</a></li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-blue-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-blue-200 text-sm">
                            © 2026 Health Market Arena. All rights reserved.
                        </p>
                        <p className="text-blue-200 text-sm mt-2 md:mt-0">
                            Patented/Operated by DCCS Technology Development Company Limited
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
