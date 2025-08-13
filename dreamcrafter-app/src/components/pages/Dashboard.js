import React, { useState, useEffect } from 'react';
import { Moon, Cloud, Star, User, LogOut, Mail, Calendar, Shield } from 'lucide-react';
import AuthService from '../../services/auth';

const Dashboard = ({ setCurrentPage, onAuthChange }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    if (!AuthService.isAuthenticated()) {
      if (onAuthChange) onAuthChange(false);
      setCurrentPage('login');
      return;
    }

    // Get user data
    const userData = AuthService.getCurrentUser();
    setUser(userData);
    setLoading(false);

    // Optionally fetch fresh profile data
    fetchProfile();
  }, [setCurrentPage, onAuthChange]);

  const fetchProfile = async () => {
    const result = await AuthService.getProfile();
    if (result.success) {
      setUser(result.data);
      localStorage.setItem('dreamcraft_user', JSON.stringify(result.data));
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    const result = await AuthService.logout();
    if (result.success) {
      if (onAuthChange) onAuthChange(false);
      setCurrentPage('home');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading your dream world...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* ... rest of the dashboard component remains the same ... */}
      {/* I'll include the full dashboard here but it's mostly the same as before */}
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <Moon className="absolute top-10 left-10 w-8 h-8 text-yellow-200 opacity-70 animate-pulse" />
        <Cloud className="absolute top-20 right-20 w-12 h-12 text-white opacity-50 animate-float" />
        <Star className="absolute bottom-20 left-20 w-6 h-6 text-yellow-300 opacity-80 animate-twinkle" />
        <Star className="absolute top-1/3 right-1/3 w-4 h-4 text-purple-200 opacity-60 animate-twinkle" />
        <Star className="absolute bottom-1/3 left-1/4 w-5 h-5 text-blue-200 opacity-70 animate-twinkle" />
      </div>

      <div className="relative z-10 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header with Logout */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">
                    Welcome to DreamCrafter
                  </h1>
                  {user && (
                    <p className="text-purple-200 text-xl">
                      Hello, {user.first_name} {user.last_name}! 🌙
                    </p>
                  )}
                  <p className="text-purple-300 text-sm mt-1">
                    Ready to explore your inner world?
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-3 bg-red-600/20 hover:bg-red-600/30 border border-red-400 rounded-lg text-red-200 hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Rest of dashboard content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* User Profile Card */}
            {user && (
              <div className="lg:col-span-1">
                <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-6 border border-white/20">
                  <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
                    <User className="w-6 h-6 mr-2" />
                    Your Profile
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-purple-300" />
                      <div>
                        <p className="text-purple-200 text-sm">Name</p>
                        <p className="text-white font-medium">
                          {user.first_name} {user.last_name}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-purple-300" />
                      <div>
                        <p className="text-purple-200 text-sm">Email</p>
                        <p className="text-white font-medium">{user.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-purple-300" />
                      <div>
                        <p className="text-purple-200 text-sm">Username</p>
                        <p className="text-white font-medium">@{user.username}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 text-purple-300" />
                      <div>
                        <p className="text-purple-200 text-sm">Email Status</p>
                        <div className="flex items-center space-x-2">
                          <span className={`w-3 h-3 rounded-full ${user.is_email_verified ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
                          <span className="text-white font-medium">
                            {user.is_email_verified ? 'Verified' : 'Pending Verification'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Main Content Area */}
            <div className="lg:col-span-2">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20 mb-8">
                <h2 className="text-3xl font-semibold text-white mb-6">Welcome to Your Dream Portal!</h2>
                <p className="text-purple-200 mb-8 text-lg leading-relaxed">
                  You have successfully entered the DreamCrafter universe! Explore your subconscious mind, 
                  record your dreams, practice lucid dreaming techniques, and connect with fellow dream explorers.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-xl p-6 border border-purple-400/30 hover:border-purple-400/50 transition-all duration-300 cursor-pointer">
                    <h3 className="text-white font-semibold mb-3 text-lg">🌙 Dream Journal</h3>
                    <p className="text-purple-200 text-sm mb-4">
                      Record, analyze, and track your dreams to uncover patterns and meanings.
                    </p>
                    <button className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                      Start Journaling →
                    </button>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-xl p-6 border border-blue-400/30 hover:border-blue-400/50 transition-all duration-300 cursor-pointer">
                    <h3 className="text-white font-semibold mb-3 text-lg">✨ Lucid Training</h3>
                    <p className="text-purple-200 text-sm mb-4">
                      Learn techniques and exercises to achieve lucid dreaming consciousness.
                    </p>
                    <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                      Begin Training →
                    </button>
                  </div>
                  
                  <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-xl p-6 border border-indigo-400/30 hover:border-indigo-400/50 transition-all duration-300 cursor-pointer">
                    <h3 className="text-white font-semibold mb-3 text-lg">🌟 Dream Community</h3>
                    <p className="text-purple-200 text-sm mb-4">
                      Share experiences and connect with fellow dream explorers worldwide.
                    </p>
                    <button className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
                      Join Community →
                    </button>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-xl p-6 border border-green-400/30 hover:border-green-400/50 transition-all duration-300 cursor-pointer">
                    <h3 className="text-white font-semibold mb-3 text-lg">🧠 Dream Analysis</h3>
                    <p className="text-purple-200 text-sm mb-4">
                      Get AI-powered insights and interpretations of your dream patterns.
                    </p>
                    <button className="text-green-400 hover:text-green-300 text-sm font-medium">
                      Analyze Dreams →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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

export default Dashboard;
