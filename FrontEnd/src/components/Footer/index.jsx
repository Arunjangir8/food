import React from 'react';
import {
    HiChevronRight,
    HiOutlinePhone,
    HiOutlineMail,
    HiHeart
} from 'react-icons/hi';
import {
    FaFacebookF,
    FaTwitter,
    FaInstagram,
    FaLinkedinIn,
    FaApple,
    FaGooglePlay
} from 'react-icons/fa';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const quickLinks = [
        { name: 'About Us', href: '/about' },
        { name: 'Restaurants', href: '/restaurants' },
        { name: 'Help Center', href: '/help' },
        { name: 'Partner with Us', href: '/partner' }
    ];

    const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad'];

    return (
        <div className='w-[100vw]'>
            <div className="bg-gradient-to-r from-red-500 to-red-500 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h3 className="text-3xl font-bold text-white mb-4">
                            Stay Updated with Delicious Deals!
                        </h3>
                        <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
                            Get exclusive offers, new restaurant alerts, and foodie news delivered straight to your inbox
                        </p>

                        <div className="flex flex-col sm:flex-row max-w-md mx-auto gap-4">
                            <input
                                type="email"
                                placeholder="Enter your email address"
                                className="flex-1 px-6 py-4 rounded-md text-gray-900 font-medium placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/30"
                            />
                            <button className="bg-white hover:bg-gray-100 text-red-600 font-bold px-8 py-4 rounded-md transition-all duration-300 flex items-center justify-center space-x-2 transform hover:scale-105">
                                <span>Subscribe</span>
                                <HiChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <footer className="bg-gray-900 text-white">
                {/* Main Footer Content */}
                <div className="py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

                            {/* Company Info */}
                            <div className="lg:col-span-1">
                                <div className="flex items-center space-x-2 mb-4">
                                    <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-500 rounded-md flex items-center justify-center">
                                        <span className="text-white font-bold text-lg">F</span>
                                    </div>
                                    <h3 className="text-xl font-bold">FoodieZone</h3>
                                </div>

                                <p className="text-gray-400 mb-4 text-sm leading-relaxed">
                                    Delivering happiness to your doorstep with fresh, delicious meals.
                                </p>

                                {/* Contact Info */}
                                <div className="space-y-2 text-sm text-gray-400">
                                    <div className="flex items-center space-x-2">
                                        <HiOutlinePhone className="w-4 h-4 text-red-500" />
                                        <span>1800-123-4567</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <HiOutlineMail className="w-4 h-4 text-red-500" />
                                        <span>support@foodiezone.com</span>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div>
                                <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                                <ul className="space-y-2">
                                    {quickLinks.map((link, index) => (
                                        <li key={index}>
                                            <a
                                                href={link.href}
                                                className="text-gray-400 hover:text-red-400 transition-colors duration-200 text-sm"
                                            >
                                                {link.name}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Cities */}
                            <div>
                                <h4 className="text-lg font-semibold mb-4">Available Cities</h4>
                                <div className="grid grid-cols-2 gap-1">
                                    {cities.map((city, index) => (
                                        <a
                                            key={index}
                                            href={`/city/${city.toLowerCase()}`}
                                            className="text-gray-400 hover:text-red-400 transition-colors duration-200 text-sm"
                                        >
                                            {city}
                                        </a>
                                    ))}
                                </div>
                            </div>

                            {/* App Download */}
                            <div>
                                <h4 className="text-lg font-semibold mb-4">Download App</h4>
                                <div className="space-y-2">
                                    <a
                                        href="#"
                                        className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 p-2 rounded-md transition-colors duration-200 group"
                                    >
                                        <FaApple className="w-5 h-5 text-white" />
                                        <div>
                                            <div className="text-xs text-gray-400">Download on</div>
                                            <div className="text-sm font-semibold group-hover:text-red-400">App Store</div>
                                        </div>
                                    </a>

                                    <a
                                        href="#"
                                        className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 p-2 rounded-md transition-colors duration-200 group"
                                    >
                                        <FaGooglePlay className="w-5 h-5 text-white" />
                                        <div>
                                            <div className="text-xs text-gray-400">Get it on</div>
                                            <div className="text-sm font-semibold group-hover:text-red-400">Google Play</div>
                                        </div>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Footer */}
                <div className="border-t border-gray-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">

                            {/* Copyright */}
                            <div className="flex items-center space-x-2 text-gray-400 text-sm">
                                <span>© {currentYear} FoodieExpress. Made with</span>
                                <HiHeart className="w-4 h-4 text-red-500 fill-current" />
                                <span>in India. All rights reserved.</span>
                            </div>

                            {/* Social Media */}
                            <div className="flex items-center space-x-3">
                                {[
                                    { Icon: FaFacebookF, href: '#' },
                                    { Icon: FaTwitter, href: '#' },
                                    { Icon: FaInstagram, href: '#' },
                                    { Icon: FaLinkedinIn, href: '#' }
                                ].map(({ Icon, href }, index) => (
                                    <a
                                        key={index}
                                        href={href}
                                        className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-red-400 transition-all duration-200 hover:bg-gray-700"
                                    >
                                        <Icon className="w-4 h-4" />
                                    </a>
                                ))}
                            </div>

                            {/* Legal Links */}
                            <div className="flex items-center space-x-4 text-sm text-gray-400">
                                <a href="/privacy" className="hover:text-red-400 transition-colors duration-200">
                                    Privacy
                                </a>
                                <a href="/terms" className="hover:text-red-400 transition-colors duration-200">
                                    Terms
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Footer;
