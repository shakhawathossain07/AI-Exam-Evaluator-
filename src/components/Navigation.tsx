import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  FileText, 
  History, 
  BarChart3, 
  Settings as SettingsIcon,
  GraduationCap,
  LogOut,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { NavigationTab } from '../App';

interface NavigationProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const navItems = [
    { id: 'dashboard' as NavigationTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'evaluate' as NavigationTab, label: 'Evaluate', icon: FileText },
    { id: 'results' as NavigationTab, label: 'Results', icon: History },
    { id: 'analytics' as NavigationTab, label: 'Analytics', icon: BarChart3 },
    { id: 'igcse-generator' as NavigationTab, label: 'IGCSE Generator', icon: BookOpen },
    { id: 'settings' as NavigationTab, label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <nav className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg blur opacity-50" />
              <div className="relative bg-gradient-to-r from-cyan-500 to-blue-500 p-2 rounded-lg">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-white">AI Exam Evaluator</h1>
              <span className="flex items-center px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-xs text-cyan-400">
                <Sparkles className="w-3 h-3 mr-1" />
                Pro
              </span>
            </div>
          </motion.div>

          {/* Navigation Items - Centered */}
          <div className="flex items-center space-x-1 flex-1 justify-center">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onTabChange(item.id)}
                  className={`
                    relative px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200
                    ${isActive 
                      ? 'text-white' 
                      : 'text-slate-400 hover:text-white'
                    }
                  `}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavTab"
                      className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg border border-cyan-500/30"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Icon className={`w-4 h-4 relative z-10 ${isActive ? 'text-cyan-400' : ''}`} />
                  <span className="font-medium relative z-10 text-sm">{item.label}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Sign Out - Fixed width container */}
          <motion.div 
            className="w-48 flex justify-end"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 text-slate-400 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800/50 transition-all duration-200 border border-transparent hover:border-slate-700/50"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Sign Out</span>
            </button>
          </motion.div>
        </div>
      </div>
    </nav>
  );
}