import React from 'react';
import { motion } from 'framer-motion';

interface ScoreCardProps {
  title: string;
  value: string;
  color?: string;
  delay?: number;
}

export function ScoreCard({ title, value, color = 'cyan', delay = 0 }: ScoreCardProps) {
  const getColorClasses = (color: string) => {
    const colorMap = {
      cyan: 'bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border-cyan-500/20 text-cyan-400',
      indigo: 'bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border-indigo-500/20 text-indigo-400',
      green: 'bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border-emerald-500/20 text-emerald-400',
      blue: 'bg-gradient-to-br from-blue-500/20 to-indigo-500/10 border-blue-500/20 text-blue-400',
      yellow: 'bg-gradient-to-br from-amber-500/20 to-orange-500/10 border-amber-500/20 text-amber-400',
      orange: 'bg-gradient-to-br from-orange-500/20 to-red-500/10 border-orange-500/20 text-orange-400',
      red: 'bg-gradient-to-br from-red-500/20 to-rose-500/10 border-red-500/20 text-red-400',
      purple: 'bg-gradient-to-br from-purple-500/20 to-pink-500/10 border-purple-500/20 text-purple-400'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.cyan;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`p-6 rounded-2xl text-center border backdrop-blur-sm ${getColorClasses(color)}`}
    >
      <h3 className="text-sm font-medium uppercase tracking-wide mb-2 text-slate-400">
        {title}
      </h3>
      <p className="text-3xl font-bold text-white">
        {value}
      </p>
    </motion.div>
  );
}