import React from 'react';
import { ArrowRight, Sparkles, Moon, Star, Heart } from 'lucide-react';

// ✅ FIXED IMPORT - Updated path to match new directory structure
import FloatingElement from '../layout/FloatingElement';
//                           ^^^^^^^ 
//                           Corrected path to 'layout' directory

const HomePage = ({ setCurrentPage }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* ✅ These components will now work correctly */}
      <FloatingElement type="star" position="top-right" size="small" />
      <FloatingElement type="moon" position="top-left" size="medium" />
      <FloatingElement type="cloud" position="bottom-right" size="large" />
      <FloatingElement type="sparkles" position="center-left" size="small" />
      
      {/* Enhanced background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <FloatingElement type="star" position="top-center" size="medium" />
        <FloatingElement type="star" position="bottom-left" size="small" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="text-center max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                DreamCrafter
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-purple-200 mb-8 leading-relaxed">
              A velvet lens on your inner world. Explore the depths of your subconscious 
              and unlock the mysteries hidden within your dreams.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <Moon className="w-8 h-8 text-purple-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Dream Analysis</h3>
              <p className="text-purple-200 text-sm">
                Advanced AI-powered interpretation of your dream patterns and meanings.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <Star className="w-8 h-8 text-yellow-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Lucid Training</h3>
              <p className="text-purple-200 text-sm">
                Learn techniques to achieve consciousness within your dreams.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <Heart className="w-8 h-8 text-pink-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Dream Journal</h3>
              <p className="text-purple-200 text-sm">
                Record and track your dreams with our intuitive journaling system.
              </p>
            </div>
          </div>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => setCurrentPage('signup')}
              className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-full transform transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-purple-500/25 flex items-center space-x-2"
            >
              <span>Start Your Journey</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>

            <button
              onClick={() => setCurrentPage('features')}
              className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold rounded-full hover:bg-white/20 transition-all duration-300 flex items-center space-x-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>Explore Features</span>
            </button>
          </div>

          {/* Testimonial or Quote */}
          <div className="mt-16 max-w-2xl mx-auto">
            <blockquote className="text-lg italic text-purple-200 border-l-4 border-purple-400 pl-6">
              "Dreams are the royal road to the unconscious mind. Let DreamCrafter 
              be your guide on this extraordinary journey of self-discovery."
            </blockquote>
            <cite className="block text-right text-purple-300 mt-4 text-sm">
              — Inspired by Carl Jung
            </cite>
          </div>
        </div>
      </div>

      {/* Enhanced animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default HomePage;
