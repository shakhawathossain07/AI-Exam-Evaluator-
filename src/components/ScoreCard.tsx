import React from 'react';
import { motion } from 'framer-motion';

interface ScoreCardProps {
  title: string;
  value: string;
  color?: string;
  delay?: number;
}

export function ScoreCard({ title, value, color = 'indigo', delay = 0 }: ScoreCardProps) {
  const getColorClasses = (color: string) => {
    const colorMap = {
      indigo: 'bg-indigo-50 text-indigo-800',
      green: 'bg-green-50 text-green-800',
      blue: 'bg-blue-50 text-blue-800',
      yellow: 'bg-yellow-50 text-yellow-800',
      orange: 'bg-orange-50 text-orange-800',
      red: 'bg-red-50 text-red-800'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.indigo;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`p-6 rounded-lg text-center ${getColorClasses(color)}`}
    >
      <h3 className="text-sm font-medium uppercase tracking-wide mb-2">
        {title}
      </h3>
      <p className="text-3xl font-bold">
        {value}
      </p>
    </motion.div>
  );
}