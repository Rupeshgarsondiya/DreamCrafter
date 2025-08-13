import React from 'react';
import { Moon, Heart, Mail, Phone, MapPin, Github, Twitter, Instagram, Home, Zap } from 'lucide-react';

const Footer = ({ setCurrentPage }) => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    navigation: [
      { label: 'Home', icon: Home, action: () => setCurrentPage('home') },
      { label: 'Features', icon: Zap, action: () => setCurrentPage('features') },
      { label: 'Login', icon: null, action: () => setCurrentPage('login') },
      { label: 'Sign Up', icon: null, action: () => setCurrentPage('signup') }
    ],
    social: [
      { label: 'GitHub', icon: Github, href: '#' },
      { label: 'Twitter', icon: Twitter, href: '#' },
      { label: 'Instagram', icon: Instagram, href: '#' }
    ]
  };

  return (
    <footer className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 border border-white/20 rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-16 h-16 border border-white/20 rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-12 h-12 border border-white/20 rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <Moon className="w-8 h-8 text-purple-300" />
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                  DreamCrafter
                </h3>
                <p className="text-purple-200 text-sm">A velvet lens on your inner world</p>
              </div>
            </div>
            <p className="text-purple-100 mb-6 max-w-md leading-relaxed">
              Explore the depths of your subconscious mind with advanced dream analysis tools. 
              Transform your sleep into a journey of self-discovery and unlock the mysteries of your dreams.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-purple-200">
                <Mail className="w-4 h-4" />
                <span className="text-sm">hello@dreamcrafter.com</span>
              </div>
              <div className="flex items-center space-x-3 text-purple-200">
                <Phone className="w-4 h-4" />
                <span className="text-sm">+1 (555) 123-DREAM</span>
              </div>
              <div className="flex items-center space-x-3 text-purple-200">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">Dream Valley, Consciousness City</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Navigation</h4>
            <ul className="space-y-2">
              {footerLinks.navigation.map(({ label, icon: Icon, action }) => (
                <li key={label}>
                  <button
                    onClick={action}
                    className="flex items-center space-x-2 text-purple-200 hover:text-white transition-colors duration-300 group"
                  >
                    {Icon && <Icon className="w-4 h-4 group-hover:text-purple-300" />}
                    <span className="hover:underline">{label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Social & Community */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Connect</h4>
            <div className="space-y-4">
              {/* Social Links */}
              <div className="flex space-x-4">
                {footerLinks.social.map(({ label, icon: Icon, href }) => (
                  <a
                    key={label}
                    href={href}
                    className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/20 transition-all duration-300 group"
                    aria-label={label}
                  >
                    <Icon className="w-5 h-5 text-purple-300 group-hover:text-white" />
                  </a>
                ))}
              </div>
              
              {/* Newsletter Signup */}
              <div className="mt-6">
                <h5 className="text-sm font-medium text-white mb-2">Dream Newsletter</h5>
                <div className="flex">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-l-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-sm"
                  />
                  <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-r-lg transition-all duration-300 text-sm font-medium">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 text-purple-200 text-sm">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-pink-400 fill-current animate-pulse" />
            <span>for dreamers worldwide</span>
          </div>
          
          <div className="flex items-center space-x-6 mt-4 md:mt-0 text-sm text-purple-200">
            <span>&copy; {currentYear} DreamCrafter. All rights reserved.</span>
            <div className="flex space-x-4">
              <button className="hover:text-white transition-colors duration-300">Privacy</button>
              <button className="hover:text-white transition-colors duration-300">Terms</button>
              <button className="hover:text-white transition-colors duration-300">Support</button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
