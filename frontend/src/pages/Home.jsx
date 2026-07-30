import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Zap, Wrench, ChevronRight, Star } from 'lucide-react';
import Button from '../components/Button';
import Card, { CardContent } from '../components/Card';

const Home = () => {
  const navigate = useNavigate();

  // Ensure user starts at the top of the page on refresh
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const headline = "Experience the Future of Driving.";
  const words = headline.split(" ");

  return (
    <div className="min-h-screen bg-charcoal-900 overflow-hidden relative text-white">
      {/* Background Glow Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="glow-orb bg-premium-purple w-[500px] h-[500px] top-20 left-10"></div>
        <div className="glow-orb bg-premium-indigo w-[400px] h-[400px] bottom-20 right-10"></div>
        <div className="glow-orb bg-premium-cyan w-[600px] h-[600px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      </div>

      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center px-6 text-center z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 1 },
            visible: { transition: { staggerChildren: 0.12 } }
          }}
          className="flex flex-wrap justify-center gap-x-4 mb-6 mt-16 max-w-5xl"
        >
          {words.map((word, i) => (
            <motion.span
              key={i}
              variants={{
                hidden: { opacity: 0, y: -40, rotateX: 90 },
                visible: { opacity: 1, y: 0, rotateX: 0, transition: { type: "spring", damping: 12, stiffness: 100 } }
              }}
              className="text-5xl md:text-7xl lg:text-8xl font-display font-black leading-[1.1] tracking-tight text-white"
            >
              {word === "Future" || word === "Driving." ? (
                <span className="grad-text">{word}</span>
              ) : word}
            </motion.span>
          ))}
        </motion.div>

        <motion.p 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
          className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-light"
        >
          Premium sales, seamless service, and unmatched performance. Discover your next vehicle or book a service today.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, type: "spring", bounce: 0.5 }}
          className="flex gap-4 justify-center"
        >
          <button 
            onClick={() => navigate('/cars')} 
            className="px-8 py-3 rounded-full bg-white text-charcoal-900 font-semibold text-sm tracking-wide hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-premium-purple/25"
          >
            Explore Fleet
          </button>
          <button 
            onClick={() => navigate('/service-booking')} 
            className="px-8 py-3 rounded-full border border-white/20 text-white font-medium text-sm tracking-wide hover:bg-white/10 transition-all duration-300 hover:scale-105"
          >
            Book Service
          </button>
        </motion.div>
      </section>

      {/* About Us Section */}
      <section className="py-32 relative z-10 bg-charcoal-800/20 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
              }}
            >
              <motion.p variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="text-premium-cyan text-xs font-semibold tracking-[0.2em] uppercase mb-4">About SpeedMotors</motion.p>
              <motion.h2 variants={{ hidden: { opacity: 0, x: -30 }, visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 60 } } }} className="text-4xl md:text-5xl font-display font-bold text-white mb-6 leading-tight">
                Redefining the <span className="grad-text">Automotive</span> Standard
              </motion.h2>
              <motion.p variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="text-gray-400 text-lg mb-8 font-light leading-relaxed">
                Founded with a singular vision to blend breathtaking performance with uncompromising luxury. 
                SpeedMotors isn't just a dealership—it's a destination for automotive purists and forward-thinking drivers alike.
              </motion.p>
              <motion.p variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="text-gray-400 text-lg mb-10 font-light leading-relaxed">
                For over 15 years, our master craftsmen and engineers have curated a selection of the world's finest vehicles. 
                Every car that enters our fleet is more than a machine; it's a testament to innovation, precision, and passion.
              </motion.p>
              
              <motion.div variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1, transition: { type: "spring", bounce: 0.5 } } }} className="flex gap-4">
                <Button variant="primary" onClick={() => navigate('/cars')} className="px-8">Discover Our Vision</Button>
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 100, rotateY: -30, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, x: 0, rotateY: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, type: "spring", bounce: 0.3 }}
              className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl h-[500px] perspective-[1000px]"
            >
              <img 
                src="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=800" 
                alt="About SpeedMotors" 
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-charcoal-900/80 via-charcoal-900/20 to-transparent pointer-events-none" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section - Slide Up */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-20"
          >
            <p className="text-premium-purple text-xs font-semibold tracking-[0.2em] uppercase mb-4">Our Process</p>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white leading-tight">Why Choose <span className="grad-text">SpeedMotors</span></h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: "Performance", desc: "Top-tier engineering and exhilarating speed.", num: "01", color: "from-premium-purple" },
              { icon: Shield, title: "Quality", desc: "Rigorous 150-point inspection ensuring safety.", num: "02", color: "from-premium-indigo" },
              { icon: Wrench, title: "Servicing", desc: "State-of-the-art facilities with certified techs.", num: "03", color: "from-premium-cyan" }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 80 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: idx * 0.2, type: "spring", stiffness: 50 }}
                className="group relative h-[400px]"
              >
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${feature.color} to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-500 z-0`} />
                <Card className="h-full bg-charcoal-800/40 backdrop-blur-md border border-white/5 group-hover:border-white/20 transition-all duration-500 relative z-10 overflow-hidden">
                  <span className="absolute top-4 right-4 text-7xl font-black text-white/5 group-hover:text-white/10 transition-colors duration-500 font-display select-none">
                    {feature.num}
                  </span>
                  <CardContent className="p-8 h-full flex flex-col justify-end">
                    <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center text-white mb-6 border border-white/10">
                      <feature.icon size={24} />
                    </div>
                    <h3 className="text-2xl font-display font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Featured Fleet Section - Slide In From Right */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row justify-between items-end mb-16"
          >
            <div>
              <p className="text-premium-indigo text-xs font-semibold tracking-[0.2em] uppercase mb-4">Selected Vehicles</p>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-white">Featured <span className="text-gray-500">Models</span></h2>
            </div>
            <button onClick={() => navigate('/cars')} className="hidden md:flex items-center gap-2 text-sm font-semibold tracking-widest uppercase hover:text-premium-indigo transition-colors mt-4 md:mt-0">
              View All <ChevronRight size={16} />
            </button>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Elektrify X", type: "SUV", price: "$55,000", img: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=800" },
              { name: "Aero Sedan", type: "Sedan", price: "$42,000", img: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=800" },
              { name: "Thrust Coupe", type: "Coupe", price: "$68,000", img: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800" }
            ].map((car, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: idx * 0.15, type: "spring", stiffness: 60 }}
              >
                <div className="group relative rounded-2xl overflow-hidden cursor-pointer h-[450px]" onClick={() => navigate('/cars')}>
                  <img src={car.img} alt={car.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
                  
                  <div className="absolute inset-0 p-8 flex flex-col justify-end">
                    <p className="text-xs font-semibold tracking-widest uppercase text-white/60 mb-2">{car.type}</p>
                    <div className="flex justify-between items-end">
                      <h3 className="text-2xl font-display font-bold text-white">{car.name}</h3>
                      <span className="text-lg font-light text-white/80">{car.price}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Legacy Stats Section - Pop and Bounce */}
      <section className="py-24 relative z-10 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
            {[
              { num: "50+", label: "Premium Models" },
              { num: "12k", label: "Happy Clients" },
              { num: "15", label: "Years of Excellence" },
              { num: "99%", label: "Service Satisfaction" }
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.3 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: idx * 0.1, type: "spring", bounce: 0.6 }}
                className="text-center group"
              >
                <div className="font-display font-black text-5xl md:text-7xl mb-2 text-white group-hover:grad-text transition-all duration-300">
                  {stat.num}
                </div>
                <div className="text-gray-500 text-xs font-semibold tracking-[0.2em] uppercase">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Ownership Experience Section - Pincer Slide In */}
      <section className="py-32 relative z-10 border-b border-white/5 bg-charcoal-900 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-premium-indigo/5 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <p className="text-premium-cyan text-xs font-semibold tracking-[0.2em] uppercase mb-4">Ownership</p>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6 leading-tight">
                More Than a Car. <br /><span className="text-gray-500">A Lifestyle.</span>
              </h2>
              <p className="text-gray-400 text-lg mb-10 font-light max-w-lg">
                When you acquire a SpeedMotors vehicle, you unlock access to an exclusive ecosystem designed to make every journey effortless.
              </p>
              
              <div className="space-y-8">
                {[
                  { title: "24/7 Concierge Service", desc: "Global roadside assistance and priority bookings." },
                  { title: "Over-the-Air Updates", desc: "Your vehicle improves over time with continuous software enhancements." },
                  { title: "VIP Lounge Access", desc: "Access to exclusive lounges across our global dealership network." }
                ].map((perk, i) => (
                  <motion.div 
                    key={i} 
                    className="flex gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + (i * 0.1) }}
                  >
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-premium-cyan">
                      <Star size={16} />
                    </div>
                    <div>
                      <h4 className="text-white font-bold font-display text-lg mb-1">{perk.title}</h4>
                      <p className="text-gray-500 text-sm">{perk.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 100, rotate: 5 }}
              whileInView={{ opacity: 1, x: 0, rotate: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, type: "spring" }}
              className="relative h-[600px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
            >
              <img src="https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&q=80&w=800" alt="Ownership Experience" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/90 via-transparent to-transparent" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Engineering & Innovation Section - Blur and Scale up */}
      <section className="py-32 relative z-10 bg-charcoal-900 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, filter: "blur(10px)", scale: 1.1 }}
            whileInView={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <p className="text-premium-cyan text-xs font-semibold tracking-[0.2em] uppercase mb-4">Technology</p>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white leading-tight">
              Engineering <span className="text-gray-500">&</span> Innovation
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12">
            <motion.div 
              initial={{ opacity: 0, y: 100, rotateX: 20 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="relative h-[400px] rounded-3xl overflow-hidden group perspective-[1000px]"
            >
              <img src="https://images.unsplash.com/photo-1518987048-93e29699e79a?auto=format&fit=crop&q=80&w=800" alt="Aerodynamics" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900 via-charcoal-900/40 to-transparent p-8 flex flex-col justify-end">
                <h3 className="text-2xl font-display font-bold text-white mb-2">Active Aerodynamics</h3>
                <p className="text-gray-400">Dynamic spoilers and air vents adapt in real-time to maximize downforce and battery efficiency.</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 100, rotateX: 20 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              className="relative h-[400px] rounded-3xl overflow-hidden group perspective-[1000px]"
            >
              <img src="https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800" alt="Battery Tech" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900 via-charcoal-900/40 to-transparent p-8 flex flex-col justify-end">
                <h3 className="text-2xl font-display font-bold text-white mb-2">Quantum Battery Cell</h3>
                <p className="text-gray-400">Next-generation solid-state batteries providing over 500 miles of range with 15-minute ultra-fast charging.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Global Presence Section - Rotation Stagger */}
      <section className="py-32 relative z-10 bg-charcoal-800/20 border-b border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">Global <span className="grad-text">Studios</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">Experience SpeedMotors in person at our flagship architectural studios located in the world's most iconic cities.</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {['New York', 'London', 'Dubai', 'Tokyo'].map((city, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, rotate: -15, scale: 0.8 }}
                whileInView={{ opacity: 1, rotate: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, type: "spring" }}
                className="py-8 px-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors duration-300"
              >
                <h4 className="text-xl font-display font-bold text-white mb-1">{city}</h4>
                <p className="text-xs text-gray-500 uppercase tracking-widest">Flagship Studio</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest News & Insights - Drop Down */}
      <section className="py-32 relative z-10 bg-charcoal-900 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: -40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="flex flex-col md:flex-row justify-between items-end mb-16"
          >
            <div>
              <p className="text-premium-indigo text-xs font-semibold tracking-[0.2em] uppercase mb-4">Journal</p>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-white">Latest <span className="text-gray-500">Insights</span></h2>
            </div>
            <button className="hidden md:flex items-center gap-2 text-sm font-semibold tracking-widest uppercase hover:text-premium-indigo transition-colors mt-4 md:mt-0">
              Read All <ChevronRight size={16} />
            </button>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "The Future of Autonomous Racing", date: "Jul 12, 2026", img: "https://images.unsplash.com/photo-1536700503339-1e4b06520771?auto=format&fit=crop&q=80&w=800" },
              { title: "Inside the Aerodynamics Lab", date: "Jun 28, 2026", img: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=800" },
              { title: "SpeedMotors Wins Global Design Award", date: "Jun 15, 2026", img: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=800" }
            ].map((news, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 40, x: -20 }}
                whileInView={{ opacity: 1, y: 0, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="group cursor-pointer"
              >
                <div className="h-48 rounded-2xl overflow-hidden mb-6 relative">
                  <img src={news.img} alt={news.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                </div>
                <p className="text-xs text-premium-purple font-semibold uppercase tracking-widest mb-3">{news.date}</p>
                <h3 className="text-xl font-display font-bold text-white group-hover:text-premium-cyan transition-colors duration-300">{news.title}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section - 3D Flip */}
      <section className="py-32 relative z-10 bg-charcoal-800/30 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, rotateX: 90 }}
            whileInView={{ opacity: 1, rotateX: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20 origin-bottom"
          >
            <p className="text-premium-purple text-xs font-semibold tracking-[0.2em] uppercase mb-4">Testimonials</p>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white leading-tight">
              Words From <span className="grad-text">Our Drivers</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Michael R.", review: "The easiest buying experience I've ever had. Transparent pricing and incredible luxury.", role: "Elektrify X Owner" },
              { name: "Sarah L.", review: "Their service center is top notch. The live repair tracking gives complete peace of mind.", role: "Loyal Customer" },
              { name: "David K.", review: "Stunning vehicles. The test drive process was flawless, and the staff was brilliant.", role: "Thrust Coupe Owner" }
            ].map((testi, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, rotateY: -90 }}
                whileInView={{ opacity: 1, rotateY: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: idx * 0.15, type: "spring", stiffness: 60 }}
                className="origin-left"
              >
                <Card className="h-full bg-charcoal-900/60 backdrop-blur border border-white/5 hover:border-premium-purple/30 transition-all duration-300">
                  <CardContent className="p-8 flex flex-col h-full">
                    <div className="flex gap-1 text-premium-purple mb-6">
                      {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                    </div>
                    <p className="text-gray-300 italic mb-8 flex-1 leading-relaxed text-lg">"{testi.review}"</p>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-premium-purple to-premium-indigo opacity-80" />
                      <div>
                        <h4 className="font-display font-bold text-white text-sm">{testi.name}</h4>
                        <p className="text-xs text-gray-500 uppercase tracking-widest">{testi.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Massive Reveal */}
      <section className="py-32 relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-premium-purple/10 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.5, filter: "blur(20px)" }}
            whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ duration: 1, type: "spring", bounce: 0.4 }}
          >
            <h2 className="text-5xl md:text-7xl font-display font-bold text-white leading-[1.1] mb-6">
              Ready to <span className="grad-text">Drive?</span>
            </h2>
            <p className="text-gray-400 text-lg md:text-xl font-light mb-10 max-w-2xl mx-auto">
              Book a personalized test drive session today and experience the pinnacle of automotive engineering firsthand.
            </p>
            <button 
              onClick={() => navigate('/cars')} 
              className="px-10 py-4 rounded-full bg-white text-charcoal-900 font-bold text-sm tracking-widest uppercase hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.3)]"
            >
              Schedule Now
            </button>
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 border-t border-white/5 text-center relative z-10">
        <p className="text-gray-500 font-medium text-sm">&copy; 2026 SpeedMotors. Designed for elegance.</p>
      </footer>
    </div>
  );
};

export default Home;
