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