import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import logo from '../logo.png';

// ─── Nav data ────────────────────────────────────────────────────────────────
const mainLinks = [
    { href: '/',        label: 'Home' },
    { href: '/about',   label: 'About' },
    { href: '/services',label: 'Services' },
    { href: '/blog',    label: 'Blog' },
    { href: '/contact', label: 'Contact' },
];

const moreGroups = [
    {
        label: 'Quick Links',
        color: 'blue',
        items: [
            { href: '/professionals', label: 'Professionals', desc: 'Join our healthcare network',    icon: 'M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z' },
            { href: '/hospitals',     label: 'Hospitals',     desc: 'Streamline medical staffing',   icon: 'M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z' },
            { href: '/ambulance',     label: 'Ambulance',     desc: 'Emergency services at your call',icon: 'M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z' },
            { href: '/gym-physio',    label: 'Gym & Physio',  desc: 'Fitness and physiotherapy services', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
        ],
    },
    {
        label: 'Resources',
        color: 'green',
        items: [
            { href: '/our-team', label: 'Our Team', desc: 'Get to know our team',    icon: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z' },
            { href: '/contact',  label: 'Contact',  desc: 'Reach out to our team',   icon: 'M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z' },
        ],
    },
    {
        label: 'Legal',
        color: 'purple',
        items: [
            { href: '/privacy',    label: 'Privacy',    desc: 'Read our privacy policy',    icon: 'M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z' },
            { href: '/terms',      label: 'Terms',      desc: 'Review service conditions',  icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
            { href: '/compliance', label: 'Compliance', desc: 'Our regulatory standards',   icon: 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' },
        ],
    },
];

const colorMap: Record<string, { bg: string; text: string; hover: string; dot: string }> = {
    blue:   { bg: 'bg-blue-600',   text: 'text-blue-600',   hover: 'hover:bg-blue-50',   dot: 'bg-blue-500' },
    green:  { bg: 'bg-green-600',  text: 'text-green-600',  hover: 'hover:bg-green-50',  dot: 'bg-green-500' },
    purple: { bg: 'bg-purple-600', text: 'text-purple-600', hover: 'hover:bg-purple-50', dot: 'bg-purple-500' },
};

// ─── Component ────────────────────────────────────────────────────────────────
const Navbar: React.FC = () => {
    const [isMoreOpen, setIsMoreOpen]           = useState(false);
    const [isMobileOpen, setIsMobileOpen]       = useState(false);
    const [openSection, setOpenSection]         = useState<string | null>(null);
    const location = useLocation();
    const moreRef  = useRef<HTMLDivElement>(null);

    const isActive = (path: string) => location.pathname === path;

    // Close desktop "More" dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
                setIsMoreOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        document.body.style.overflow = isMobileOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isMobileOpen]);

    const closeMobile = () => {
        setIsMobileOpen(false);
        setOpenSection(null);
    };

    return (
        <>
            <nav className="bg-white shadow-sm border-b border-gray-200 relative z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">

                        {/* Logo */}
                        <a href="/" className="flex items-center flex-shrink-0">
                            <img src={logo} alt="Health Market Arena" className="w-8 h-8 mr-2 object-contain" />
                            <span className="text-lg font-semibold text-blue-600 leading-tight">
                                Health Market<br className="hidden xs:block sm:hidden" /> Arena
                            </span>
                        </a>

                        {/* Desktop nav links */}
                        <div className="hidden md:flex items-center space-x-1">
                            {mainLinks.map(link => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                                        isActive(link.href)
                                            ? 'text-blue-600 bg-blue-50'
                                            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                                    }`}
                                >
                                    {link.label}
                                </a>
                            ))}

                            {/* More dropdown */}
                            <div className="relative" ref={moreRef}>
                                <button
                                    onClick={() => setIsMoreOpen(v => !v)}
                                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors duration-200"
                                >
                                    More
                                    <svg className={`ml-1 h-4 w-4 transition-transform duration-200 ${isMoreOpen ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>

                                {isMoreOpen && (
                                    <div className="absolute right-0 mt-2 w-[640px] bg-white rounded-2xl shadow-2xl border border-gray-100 py-6 z-50">
                                        <div className="grid grid-cols-3 gap-6 px-6">
                                            {moreGroups.map(group => {
                                                const c = colorMap[group.color];
                                                return (
                                                    <div key={group.label}>
                                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center">
                                                            <span className={`w-2 h-2 rounded-full ${c.dot} mr-2`} />
                                                            {group.label}
                                                        </h3>
                                                        <div className="space-y-1">
                                                            {group.items.map(item => (
                                                                <a
                                                                    key={item.href}
                                                                    href={item.href}
                                                                    onClick={() => setIsMoreOpen(false)}
                                                                    className={`flex items-center space-x-3 p-2 rounded-xl ${c.hover} transition-colors duration-200 group`}
                                                                >
                                                                    <div className={`w-8 h-8 ${c.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d={item.icon} clipRule="evenodd" />
                                                                        </svg>
                                                                    </div>
                                                                    <div>
                                                                        <p className={`text-sm font-semibold text-gray-900 group-hover:${c.text}`}>{item.label}</p>
                                                                        <p className="text-xs text-gray-500">{item.desc}</p>
                                                                    </div>
                                                                </a>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Desktop auth buttons */}
                        <div className="hidden md:flex items-center space-x-3">
                            <a href="/auth/login" className="text-sm font-medium text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md transition-colors duration-200">
                                Sign In
                            </a>
                            <a href="/auth/get-started" className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors duration-200 shadow-sm">
                                Get Started
                            </a>
                        </div>

                        {/* Mobile hamburger */}
                        <button
                            type="button"
                            onClick={() => setIsMobileOpen(v => !v)}
                            className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                            aria-label="Toggle menu"
                        >
                            {isMobileOpen ? (
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </nav>

            {/* ── Mobile drawer ─────────────────────────────────────────────── */}
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity duration-300 ${isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={closeMobile}
            />

            {/* Drawer panel */}
            <div
                className={`fixed top-0 right-0 h-full w-4/5 max-w-xs bg-white z-50 md:hidden flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${isMobileOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Drawer header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center">
                        <img src={logo} alt="Health Market Arena" className="w-7 h-7 mr-2 object-contain" />
                        <span className="text-base font-semibold text-blue-600">Health Market Arena</span>
                    </div>
                    <button onClick={closeMobile} className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto">

                    {/* Main links */}
                    <div className="px-3 py-3">
                        {mainLinks.map(link => (
                            <a
                                key={link.href}
                                href={link.href}
                                onClick={closeMobile}
                                className={`flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-200 ${
                                    isActive(link.href)
                                        ? 'text-blue-600 bg-blue-50'
                                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                                }`}
                            >
                                {link.label}
                                {isActive(link.href) && (
                                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />
                                )}
                            </a>
                        ))}
                    </div>

                    <div className="border-t border-gray-100 mx-4" />

                    {/* Collapsible sections */}
                    <div className="px-3 py-3 space-y-1">
                        {moreGroups.map(group => {
                            const c = colorMap[group.color];
                            const isOpen = openSection === group.label;
                            return (
                                <div key={group.label} className="rounded-xl overflow-hidden">
                                    {/* Section toggle */}
                                    <button
                                        onClick={() => setOpenSection(isOpen ? null : group.label)}
                                        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors duration-200"
                                    >
                                        <span className="flex items-center">
                                            <span className={`w-2 h-2 rounded-full ${c.dot} mr-2.5`} />
                                            {group.label}
                                        </span>
                                        <svg
                                            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                                            fill="currentColor" viewBox="0 0 20 20"
                                        >
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>

                                    {/* Section items */}
                                    {isOpen && (
                                        <div className="pl-4 pr-2 pb-2 space-y-1">
                                            {group.items.map(item => (
                                                <a
                                                    key={item.href}
                                                    href={item.href}
                                                    onClick={closeMobile}
                                                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl ${c.hover} transition-colors duration-200 group`}
                                                >
                                                    <div className={`w-8 h-8 ${c.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d={item.icon} clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{item.label}</p>
                                                        <p className="text-xs text-gray-500">{item.desc}</p>
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Drawer footer — auth buttons */}
                <div className="border-t border-gray-100 px-4 py-4 space-y-2 bg-gray-50">
                    <a
                        href="/auth/login"
                        onClick={closeMobile}
                        className="block w-full text-center text-sm font-medium text-gray-700 border border-gray-300 bg-white hover:bg-gray-50 px-4 py-2.5 rounded-xl transition-colors duration-200"
                    >
                        Sign In
                    </a>
                    <a
                        href="/auth/get-started"
                        onClick={closeMobile}
                        className="block w-full text-center text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl transition-colors duration-200 shadow-sm"
                    >
                        Get Started
                    </a>
                </div>
            </div>
        </>
    );
};

export default Navbar;
