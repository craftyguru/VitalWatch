function App() {
  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Starry Background */}
      <div style={{ 
        position: 'absolute', 
        inset: 0, 
        background: 'linear-gradient(to bottom right, #000000, #111111, #000000)' 
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 1 }}>
          {/* Large Bright Stars */}
          <div style={{ position: 'absolute', top: '10%', left: '10%', width: '3px', height: '3px', backgroundColor: '#ffffff', borderRadius: '50%', animation: 'pulse 2s infinite', boxShadow: '0 0 6px #ffffff' }}></div>
          <div style={{ position: 'absolute', top: '20%', right: '15%', width: '2px', height: '2px', backgroundColor: '#ffff99', borderRadius: '50%', animation: 'pulse 3s infinite', boxShadow: '0 0 4px #ffff99' }}></div>
          <div style={{ position: 'absolute', top: '30%', left: '25%', width: '2px', height: '2px', backgroundColor: '#ffffff', borderRadius: '50%', animation: 'pulse 2.5s infinite', boxShadow: '0 0 4px #ffffff' }}></div>
          <div style={{ position: 'absolute', top: '40%', right: '30%', width: '3px', height: '3px', backgroundColor: '#ffffff', borderRadius: '50%', animation: 'pulse 1.8s infinite', boxShadow: '0 0 6px #ffffff' }}></div>
          <div style={{ position: 'absolute', top: '60%', left: '35%', width: '2px', height: '2px', backgroundColor: '#ffff99', borderRadius: '50%', animation: 'pulse 2.2s infinite', boxShadow: '0 0 4px #ffff99' }}></div>
          <div style={{ position: 'absolute', top: '80%', right: '25%', width: '2px', height: '2px', backgroundColor: '#ffffff', borderRadius: '50%', animation: 'pulse 3.2s infinite', boxShadow: '0 0 4px #ffffff' }}></div>
          <div style={{ position: 'absolute', bottom: '40%', left: '20%', width: '3px', height: '3px', backgroundColor: '#ffffff', borderRadius: '50%', animation: 'pulse 1.5s infinite', boxShadow: '0 0 6px #ffffff' }}></div>
          <div style={{ position: 'absolute', bottom: '60%', right: '16%', width: '2px', height: '2px', backgroundColor: '#ffffff', borderRadius: '50%', animation: 'pulse 2.8s infinite', boxShadow: '0 0 4px #ffffff' }}></div>
          <div style={{ position: 'absolute', bottom: '80%', left: '50%', width: '2px', height: '2px', backgroundColor: '#ffff99', borderRadius: '50%', animation: 'pulse 2.4s infinite', boxShadow: '0 0 4px #ffff99' }}></div>
          <div style={{ position: 'absolute', bottom: '32%', right: '50%', width: '3px', height: '3px', backgroundColor: '#ffffff', borderRadius: '50%', animation: 'pulse 1.9s infinite', boxShadow: '0 0 6px #ffffff' }}></div>
          
          {/* Medium Stars */}
          <div style={{ position: 'absolute', top: '16%', left: '50%', width: '1.5px', height: '1.5px', backgroundColor: '#ffffff', borderRadius: '50%', opacity: 0.8, animation: 'pulse 3.5s infinite' }}></div>
          <div style={{ position: 'absolute', top: '24%', right: '25%', width: '1.5px', height: '1.5px', backgroundColor: '#ffffff', borderRadius: '50%', opacity: 0.7, animation: 'pulse 2.9s infinite' }}></div>
          <div style={{ position: 'absolute', top: '44%', left: '16%', width: '1.5px', height: '1.5px', backgroundColor: '#ffff99', borderRadius: '50%', opacity: 0.8, animation: 'pulse 2.1s infinite' }}></div>
          <div style={{ position: 'absolute', top: '56%', right: '16%', width: '1.5px', height: '1.5px', backgroundColor: '#ffffff', borderRadius: '50%', opacity: 0.7, animation: 'pulse 3.1s infinite' }}></div>
          <div style={{ position: 'absolute', bottom: '44%', left: '25%', width: '1.5px', height: '1.5px', backgroundColor: '#ffffff', borderRadius: '50%', opacity: 0.6, animation: 'pulse 2.7s infinite' }}></div>
          <div style={{ position: 'absolute', bottom: '56%', right: '33%', width: '1.5px', height: '1.5px', backgroundColor: '#ffffff', borderRadius: '50%', opacity: 0.8, animation: 'pulse 2.3s infinite' }}></div>
          
          {/* Small Distant Stars */}
          <div style={{ position: 'absolute', top: '28%', left: '75%', width: '1px', height: '1px', backgroundColor: '#ffffff', borderRadius: '50%', opacity: 0.5 }}></div>
          <div style={{ position: 'absolute', top: '36%', right: '20%', width: '1px', height: '1px', backgroundColor: '#ffffff', borderRadius: '50%', opacity: 0.4 }}></div>
          <div style={{ position: 'absolute', top: '48%', left: '20%', width: '1px', height: '1px', backgroundColor: '#ffff99', borderRadius: '50%', opacity: 0.6 }}></div>
          <div style={{ position: 'absolute', top: '64%', right: '40%', width: '1px', height: '1px', backgroundColor: '#ffffff', borderRadius: '50%', opacity: 0.5 }}></div>
          <div style={{ position: 'absolute', bottom: '48%', left: '60%', width: '1px', height: '1px', backgroundColor: '#ffffff', borderRadius: '50%', opacity: 0.4 }}></div>
          <div style={{ position: 'absolute', bottom: '64%', right: '20%', width: '1px', height: '1px', backgroundColor: '#ffffff', borderRadius: '50%', opacity: 0.6 }}></div>
          
          {/* Extra Tiny Stars */}
          <div style={{ position: 'absolute', top: '15%', left: '80%', width: '0.5px', height: '0.5px', backgroundColor: '#ffffff', borderRadius: '50%', opacity: 0.3 }}></div>
          <div style={{ position: 'absolute', top: '35%', left: '70%', width: '0.5px', height: '0.5px', backgroundColor: '#ffffff', borderRadius: '50%', opacity: 0.4 }}></div>
          <div style={{ position: 'absolute', top: '55%', right: '10%', width: '0.5px', height: '0.5px', backgroundColor: '#ffffff', borderRadius: '50%', opacity: 0.3 }}></div>
          <div style={{ position: 'absolute', bottom: '25%', left: '85%', width: '0.5px', height: '0.5px', backgroundColor: '#ffffff', borderRadius: '50%', opacity: 0.4 }}></div>
          <div style={{ position: 'absolute', bottom: '15%', right: '5%', width: '0.5px', height: '0.5px', backgroundColor: '#ffffff', borderRadius: '50%', opacity: 0.3 }}></div>
        </div>
      </div>
      
      {/* Content Overlay */}
      <div style={{ position: 'relative', zIndex: 10 }}>
      {/* Navigation Header */}
      <nav className="bg-white/10 backdrop-blur-md shadow-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <img 
                  src="/logo.png" 
                  alt="VitalWatch Logo" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <span className="text-xl font-bold text-white">VitalWatch</span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-white/80 hover:text-yellow-300 font-medium">Features</a>
              <a href="#pricing" className="text-white/80 hover:text-yellow-300 font-medium">Pricing</a>
              <a href="#contact" className="text-white/80 hover:text-yellow-300 font-medium">Contact</a>
              <button className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors border border-white/30">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="mb-8 flex justify-center">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <img 
                src="/logo.png" 
                alt="VitalWatch Logo" 
                className="w-16 h-16 object-contain"
              />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-yellow-300 via-blue-200 to-purple-300 bg-clip-text text-transparent">
              VitalWatch
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
            AI-powered emergency monitoring and mental health support with real-time crisis detection and comprehensive wellness tracking
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-lg shadow-red-500/25">
              🚨 Start Emergency Protection
            </button>
            <button className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-lg text-lg font-semibold border-2 border-white/30 hover:bg-white/30 transition-colors">
              💚 Begin Wellness Journey
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-sm border border-white/20">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🚨</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Emergency Response</h3>
            <p className="text-white/80">Real-time AI monitoring with instant crisis detection and automated emergency contact alerts</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-sm border border-white/20">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">💚</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Mental Health Support</h3>
            <p className="text-white/80">Comprehensive mood tracking, therapeutic tools, and AI-powered wellness insights</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-sm border border-white/20">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📱</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Mobile Ready</h3>
            <p className="text-white/80">Available as TWA on Google Play Store with offline emergency functionality</p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

export default App;
