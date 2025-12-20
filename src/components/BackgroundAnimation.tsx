import React from 'react';
import { motion } from 'framer-motion';
import { Brain, GraduationCap, BookOpen, Award, Target, Zap, Lightbulb, Star, Trophy, Atom, Calculator, Globe } from 'lucide-react';

export function BackgroundAnimation() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Animated Grid Pattern */}
      <AnimatedGrid />
      
      {/* Pulsating Orbs */}
      <PulsatingOrbs />
      
      {/* Neural Network Visualization */}
      <NeuralNetwork />
      
      {/* Data Streams */}
      <DataStreams />
      
      {/* Floating Educational Icons */}
      <FloatingIcons />
    </div>
  );
}

// 1. Animated Grid Pattern
function AnimatedGrid() {
  return (
    <div className="absolute inset-0">
      <svg className="w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <motion.path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="url(#gridGradient)"
              strokeWidth="1"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.6 }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            />
          </pattern>
          <linearGradient id="gridGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-blue-500/5" />
    </div>
  );
}

// 2. Pulsating Orbs
function PulsatingOrbs() {
  const orbs = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    size: Math.random() * 120 + 80,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 4,
    duration: Math.random() * 6 + 4,
    color: ['indigo', 'purple', 'blue'][Math.floor(Math.random() * 3)]
  }));

  const getOrbGradient = (color: string) => {
    const gradients = {
      indigo: 'from-indigo-400/20 to-indigo-600/10',
      purple: 'from-purple-400/20 to-purple-600/10',
      blue: 'from-blue-400/20 to-blue-600/10'
    };
    return gradients[color as keyof typeof gradients];
  };

  return (
    <div className="absolute inset-0">
      {orbs.map((orb) => (
        <motion.div
          key={orb.id}
          className={`absolute rounded-full bg-gradient-radial ${getOrbGradient(orb.color)} blur-sm`}
          style={{
            width: orb.size,
            height: orb.size,
            left: `${orb.left}%`,
            top: `${orb.top}%`,
          }}
          initial={{ scale: 0.8, opacity: 0.3 }}
          animate={{
            scale: [0.8, 1.2, 0.8],
            opacity: [0.3, 0.6, 0.3],
            x: [0, 30, -30, 0],
            y: [0, -20, 20, 0],
          }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}

// 3. Neural Network Visualization
function NeuralNetwork() {
  const nodes = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 8 + 4,
    delay: Math.random() * 3
  }));

  const connections = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const distance = Math.sqrt(
        Math.pow(nodes[i].x - nodes[j].x, 2) + Math.pow(nodes[i].y - nodes[j].y, 2)
      );
      if (distance < 40) {
        connections.push({
          from: nodes[i],
          to: nodes[j],
          delay: Math.random() * 4
        });
      }
    }
  }

  return (
    <div className="absolute inset-0 opacity-30">
      <svg className="w-full h-full">
        <defs>
          <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        
        {/* Connections */}
        {connections.map((connection, index) => (
          <motion.line
            key={index}
            x1={`${connection.from.x}%`}
            y1={`${connection.from.y}%`}
            x2={`${connection.to.x}%`}
            y2={`${connection.to.y}%`}
            stroke="url(#connectionGradient)"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: [0, 1, 0],
              opacity: [0, 0.8, 0]
            }}
            transition={{
              duration: 3,
              delay: connection.delay,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
        
        {/* Nodes */}
        {nodes.map((node) => (
          <motion.circle
            key={node.id}
            cx={`${node.x}%`}
            cy={`${node.y}%`}
            r={node.size}
            fill="url(#nodeGradient)"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.4, 0.8, 0.4]
            }}
            transition={{
              duration: 2,
              delay: node.delay,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
        
        <defs>
          <radialGradient id="nodeGradient">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.2" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}

// 4. Data Streams
function DataStreams() {
  const streams = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 5,
    duration: Math.random() * 8 + 6,
    opacity: Math.random() * 0.3 + 0.1
  }));

  return (
    <div className="absolute inset-0">
      {streams.map((stream) => (
        <motion.div
          key={stream.id}
          className="absolute w-px bg-gradient-to-t from-transparent via-indigo-400/40 to-transparent"
          style={{
            left: `${stream.left}%`,
            height: '200px',
            opacity: stream.opacity
          }}
          initial={{ y: '100vh' }}
          animate={{ y: '-200px' }}
          transition={{
            duration: stream.duration,
            delay: stream.delay,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
}

// 5. Floating Educational Icons
function FloatingIcons() {
  const icons = [
    Brain, GraduationCap, BookOpen, Award, Target, Zap, 
    Lightbulb, Star, Trophy, Atom, Calculator, Globe,
    Brain, GraduationCap, BookOpen
  ];

  const floatingIcons = icons.map((Icon, i) => ({
    Icon,
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 8,
    duration: Math.random() * 15 + 20,
    size: Math.random() * 16 + 20,
    rotation: Math.random() * 360
  }));

  return (
    <div className="absolute inset-0">
      {floatingIcons.map((item) => {
        const Icon = item.Icon;
        return (
          <motion.div
            key={item.id}
            className="absolute text-indigo-400/20"
            style={{
              left: `${item.left}%`,
              fontSize: `${item.size}px`
            }}
            initial={{ 
              y: '100vh', 
              rotate: item.rotation,
              opacity: 0 
            }}
            animate={{ 
              y: '-100px',
              rotate: item.rotation + 360,
              opacity: [0, 0.6, 0.6, 0]
            }}
            transition={{
              duration: item.duration,
              delay: item.delay,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <Icon size={item.size} />
          </motion.div>
        );
      })}
    </div>
  );
}

// Stunning Dynamic Background Component for all pages
export function DynamicBackground({ variant = 'default' }: { variant?: 'default' | 'admin' }) {
  const primaryColor = variant === 'admin' ? 'red' : 'cyan';
  const secondaryColor = variant === 'admin' ? 'orange' : 'blue';
  
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Animated gradient mesh */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      
      {/* Large animated orbs */}
      <motion.div
        animate={{ 
          x: [0, 100, 50, 0],
          y: [0, 50, 100, 0],
          scale: [1, 1.2, 1, 1.2, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute -top-40 -left-40 w-[500px] h-[500px] bg-gradient-to-br ${variant === 'admin' ? 'from-red-500/30 to-orange-600/20' : 'from-cyan-500/30 to-blue-600/20'} rounded-full blur-3xl`}
      />
      <motion.div
        animate={{ 
          x: [0, -80, -40, 0],
          y: [0, 80, 40, 0],
          scale: [1, 1.3, 1.1, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-gradient-to-tl from-purple-600/25 to-pink-500/15 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ 
          x: [0, 60, -60, 0],
          y: [0, -40, 40, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-gradient-to-br ${variant === 'admin' ? 'from-orange-500/20 to-red-400/15' : 'from-blue-500/20 to-cyan-400/15'} rounded-full blur-3xl`}
      />
      <motion.div
        animate={{ 
          x: [0, -50, 50, 0],
          y: [0, 60, -30, 0],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1/4 left-1/3 w-[350px] h-[350px] bg-gradient-to-tr from-indigo-500/20 to-violet-400/15 rounded-full blur-3xl"
      />
      
      {/* Floating particles */}
      {[...Array(25)].map((_, i) => (
        <motion.div
          key={`dynamic-particle-${i}`}
          initial={{ 
            x: `${Math.random() * 100}%`,
            y: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.5 + 0.2,
          }}
          animate={{ 
            y: [`${Math.random() * 100}%`, `${Math.random() * 100 - 50}%`],
            x: [`${Math.random() * 100}%`, `${Math.random() * 100 + 20}%`],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{ 
            duration: Math.random() * 15 + 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 5,
          }}
          className={`absolute rounded-full ${
            i % 3 === 0 
              ? variant === 'admin' ? 'bg-red-400/50' : 'bg-cyan-400/50'
              : i % 3 === 1 
                ? variant === 'admin' ? 'bg-orange-400/50' : 'bg-blue-400/50'
                : 'bg-purple-400/50'
          }`}
          style={{
            width: Math.random() * 4 + 2,
            height: Math.random() * 4 + 2,
          }}
        />
      ))}
      
      {/* Animated geometric shapes */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className={`absolute top-20 right-20 w-32 h-32 border ${variant === 'admin' ? 'border-red-500/20' : 'border-cyan-500/20'} rounded-xl`}
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-32 left-20 w-24 h-24 border border-purple-500/20 rounded-lg"
      />
      <motion.div
        animate={{ rotate: 360, scale: [1, 1.1, 1] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className={`absolute top-1/2 left-10 w-16 h-16 border ${variant === 'admin' ? 'border-orange-500/15' : 'border-blue-500/15'} rounded-full`}
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
        className="absolute top-40 left-1/3 w-20 h-20 border border-indigo-500/15"
        style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}
      />
      
      {/* Grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(${variant === 'admin' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(6, 182, 212, 0.3)'} 1px, transparent 1px), linear-gradient(90deg, ${variant === 'admin' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(6, 182, 212, 0.3)'} 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
      
      {/* Radial gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950/80" />
      
      {/* Animated scan line effect */}
      <motion.div
        animate={{ y: ['-100%', '200%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className={`absolute left-0 right-0 h-px bg-gradient-to-r from-transparent ${variant === 'admin' ? 'via-red-500/30' : 'via-cyan-500/30'} to-transparent`}
      />
    </div>
  );
}