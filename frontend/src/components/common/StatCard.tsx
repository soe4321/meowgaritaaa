import React from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  label: string;
  value: number | string;
  subtext?: string;
  icon: React.ReactNode;
  accentColor?: 'forest' | 'terracotta' | 'mustard' | 'charcoal';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon,
  accentColor = 'forest',
}) => {
  const accentClasses = {
    forest: 'bg-forest-50 text-forest-800 border-forest-100',
    terracotta: 'bg-terracotta-50 text-terracotta-800 border-terracotta-100',
    mustard: 'bg-mustard-50 text-mustard-800 border-mustard-100',
    charcoal: 'bg-charcoal-50 text-charcoal-800 border-charcoal-100',
  }[accentColor];

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18 }}
      className="bg-white rounded-xl border border-ivory-300 p-5 shadow-soft hover:shadow-card transition-all"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-charcoal-500">{label}</p>
          <p className="mt-2 text-3xl font-serif font-bold text-charcoal-900">{value}</p>
          {subtext && <p className="mt-1 text-xs text-charcoal-500 font-sans">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-lg border ${accentClasses}`}>{icon}</div>
      </div>
    </motion.div>
  );
};
