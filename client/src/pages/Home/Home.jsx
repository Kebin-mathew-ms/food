import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Shield, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Home landing page for Food Waste Redistribution Platform.
 */
export const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] py-12 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-3xl"
      >
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-6">
          <Heart className="w-3.5 h-3.5" /> Nourishing Communities, Reducing Waste
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
          Bridging Surplus Food with <span className="text-primary bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">Those in Need</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
          A premium redistribution ecosystem connecting local food donors, dedicated volunteers, non-profit organizations, and system administrators to dynamically minimize food wastage.
        </p>
        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <Link
            to="/register"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-lg shadow-primary/20 hover:scale-[1.02]"
          >
            Get Started <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-sm font-semibold border border-input bg-card text-card-foreground hover:bg-accent transition-all hover:scale-[1.02]"
          >
            Donor Portal
          </Link>
        </div>
      </motion.div>

      {/* Feature Section */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full"
      >
        <div className="bg-card border border-border p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-foreground">For Donors</h3>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Quickly list surplus inventory, schedule collection times, and track your environmental footprint impacts.
          </p>
        </div>

        <div className="bg-card border border-border p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-foreground">For NGOs & Volunteers</h3>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Claim available donations instantly, accept transport runs, and secure surplus packages for distribution.
          </p>
        </div>

        <div className="bg-card border border-border p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-foreground">For Admins</h3>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Monitor real-time status flows, manage compliance documents, and access operational system reports.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
