import React from 'react';
import { Upload, Brain, Moon, Star, Eye, Zap, Heart, Sparkles } from 'lucide-react';
import { dreamFacts, articles } from '../../data/dreamData';

const FeaturesPage = ({ setCurrentPage }) => {
  const iconMap = {
    Star,
    Moon,
    Heart,
    Sparkles,
    Eye,
    Zap,
    Brain
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="text-center mb-16 relative">
          {/* Background decoration */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <Brain className="w-32 h-32 text-purple-400 dream-float" />
          </div>
          
          <div className="relative z-10">
            <h2 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
              Dream Analytics & Visualization
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed">
              Unlock the mysteries of your subconscious mind with our advanced dream analysis tools. 
              Experience the future of sleep science and consciousness exploration.
            </p>
          </div>
        </div>

        {/* Main Feature Section */}
        <div className="grid lg:grid-cols-2 gap-16 mb-20">
          {/* Left - Video Upload Section */}
          <div className="space-y-8">
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-10 shadow-2xl hover:shadow-3xl transition-all duration-500 border border-purple-100">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-purple-700 mb-2">Upload Your Dream Recording</h3>
                <p className="text-gray-600">Transform your sleep data into visual dream experiences</p>
              </div>
              
              {/* Upload Area */}
              <div className="border-2 border-dashed border-purple-300 rounded-2xl p-12 text-center hover:border-purple-500 transition-all duration-300 cursor-pointer group bg-gradient-to-br from-purple-50/50 to-pink-50/50">
                <div className="mb-6">
                  <Upload className="w-20 h-20 text-purple-400 mx-auto mb-4 group-hover:text-purple-600 transition-all duration-300 group-hover:scale-110" />
                </div>
                <div className="space-y-2 mb-6">
                  <p className="text-gray-700 font-medium">Drop your sleep recording here</p>
                  <p className="text-sm text-gray-500">or click to browse files</p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 mb-6 text-xs text-gray-500">
                  <span className="px-3 py-1 bg-purple-100 rounded-full">MP4</span>
                  <span className="px-3 py-1 bg-pink-100 rounded-full">AVI</span>
                  <span className="px-3 py-1 bg-blue-100 rounded-full">MOV</span>
                  <span className="px-3 py-1 bg-green-100 rounded-full">MP3</span>
                </div>
                <button className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg">
                  Choose File
                </button>
              </div>

              {/* Analysis Process */}
              <div className="mt-8 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6">
                <h4 className="font-semibold text-purple-700 mb-4 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2" />
                  What happens during analysis:
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-3 bg-white/60 rounded-xl">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <Eye className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="font-medium text-gray-800">REM Sleep Pattern Detection</span>
                      <p className="text-sm text-gray-600">Identify rapid eye movement cycles</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-3 bg-white/60 rounded-xl">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="font-medium text-gray-800">Neural Activity Mapping</span>
                      <p className="text-sm text-gray-600">Visualize brainwave patterns</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-3 bg-white/60 rounded-xl">
                    <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="font-medium text-gray-800">Dream Intensity Analysis</span>
                      <p className="text-sm text-gray-600">Measure emotional depth</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Dream Facts */}
          <div className="space-y-8">
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-purple-100">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4">
                  <Star className="w-8 h-8 text-white sparkle-animation" />
                </div>
                <h3 className="text-2xl font-semibold text-purple-700 mb-2">Fascinating Dream Science</h3>
                <p className="text-gray-600">Discover the incredible world of sleep research</p>
              </div>
              
              <div className="space-y-6">
                {dreamFacts.map((fact, index) => {
                  const IconComponent = iconMap[fact.icon];
                  return (
                    <div key={index} className="group p-4 bg-white/50 rounded-2xl hover:bg-white/80 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 bg-gradient-to-r ${fact.gradient} rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 mb-2 group-hover:text-purple-700 transition-colors duration-300">
                            {fact.title}
                          </h4>
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {fact.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Visual Articles Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">
              Explore Dream Science
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Dive deeper into the fascinating world of sleep and dreams with our curated research articles
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {articles.map((article) => {
              const IconComponent = iconMap[article.icon];
              return (
                <article key={article.id} className="group bg-white/70 backdrop-blur-sm rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-purple-100">
                  <div className={`h-56 bg-gradient-to-br ${article.gradient} relative overflow-hidden`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <IconComponent className="w-20 h-20 text-white opacity-90 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="absolute top-4 right-4 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs">
                      {article.readTime}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                  <div className="p-8">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3 group-hover:text-purple-700 transition-colors duration-300">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                      {article.description}
                    </p>
                    <button className="text-purple-600 text-sm font-semibold hover:text-purple-700 transition-colors duration-300 flex items-center group">
                      Read More 
                      <span className="ml-1 group-hover:ml-2 transition-all duration-300">→</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <Moon className="absolute top-4 left-4 w-16 h-16 dream-float" />
            <Star className="absolute bottom-4 right-4 w-12 h-12 sparkle-animation" />
            <Heart className="absolute top-1/2 left-1/4 w-8 h-8 dream-float" style={{ animationDelay: '1s' }} />
          </div>
          <div className="relative z-10">
            <h3 className="text-3xl font-bold mb-4">Ready to Explore Your Dreams?</h3>
            <p className="text-purple-100 mb-8 max-w-2xl mx-auto">
              Join thousands of dream explorers who have discovered the hidden depths of their subconscious minds
            </p>
            <button 
              onClick={() => setCurrentPage('signup')}
              className="px-8 py-4 bg-white text-purple-600 rounded-xl hover:bg-purple-50 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
            >
              Start Your Dream Journey
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesPage;