import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Save, 
  RotateCcw,
  BookOpen,
  Target,
  Clock,
  FileText,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface IGCSESettingsConfig {
  // Question Bank Settings
  questionBankSize: number;
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
  };
  
  // Subject Weighting
  subjectWeighting: {
    biology: number;
    chemistry: number;
    physics: number;
  };
  
  // Paper Templates
  paperTemplates: {
    paper1: { duration: number; questions: number; marksPerQuestion: number };
    paper2: { duration: number; totalMarks: number; questionTypes: string[] };
    paper3: { duration: number; totalMarks: number; practicalFocus: boolean };
    paper4: { duration: number; totalMarks: number; extendedResponse: boolean };
    paper5: { duration: number; totalMarks: number; practicalSkills: boolean };
    paper6: { duration: number; totalMarks: number; alternativeToPractical: boolean };
  };
  
  // Generation Preferences
  includeFormulae: boolean;
  includeDataSheet: boolean;
  includePeriodicTable: boolean;
  languageSupport: string;
  accessibilityOptions: string[];
  
  // Quality Control
  reviewLevel: 'basic' | 'standard' | 'comprehensive';
  autoValidation: boolean;
  duplicateChecking: boolean;
}

export function IGCSESettings() {
  const [config, setConfig] = useState<IGCSESettingsConfig>({
    questionBankSize: 1000,
    difficultyDistribution: { easy: 30, medium: 50, hard: 20 },
    subjectWeighting: { biology: 33, chemistry: 33, physics: 34 },
    paperTemplates: {
      paper1: { duration: 45, questions: 40, marksPerQuestion: 1 },
      paper2: { duration: 75, totalMarks: 80, questionTypes: ['Short Answer', 'Structured'] },
      paper3: { duration: 75, totalMarks: 80, practicalFocus: true },
      paper4: { duration: 105, totalMarks: 120, extendedResponse: true },
      paper5: { duration: 75, totalMarks: 60, practicalSkills: true },
      paper6: { duration: 60, totalMarks: 60, alternativeToPractical: true }
    },
    includeFormulae: true,
    includeDataSheet: true,
    includePeriodicTable: true,
    languageSupport: 'English',
    accessibilityOptions: [],
    reviewLevel: 'standard',
    autoValidation: true,
    duplicateChecking: true
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Save configuration to localStorage or backend
    localStorage.setItem('igcse-settings', JSON.stringify(config));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    // Reset to default values
    setConfig({
      questionBankSize: 1000,
      difficultyDistribution: { easy: 30, medium: 50, hard: 20 },
      subjectWeighting: { biology: 33, chemistry: 33, physics: 34 },
      paperTemplates: {
        paper1: { duration: 45, questions: 40, marksPerQuestion: 1 },
        paper2: { duration: 75, totalMarks: 80, questionTypes: ['Short Answer', 'Structured'] },
        paper3: { duration: 75, totalMarks: 80, practicalFocus: true },
        paper4: { duration: 105, totalMarks: 120, extendedResponse: true },
        paper5: { duration: 75, totalMarks: 60, practicalSkills: true },
        paper6: { duration: 60, totalMarks: 60, alternativeToPractical: true }
      },
      includeFormulae: true,
      includeDataSheet: true,
      includePeriodicTable: true,
      languageSupport: 'English',
      accessibilityOptions: [],
      reviewLevel: 'standard',
      autoValidation: true,
      duplicateChecking: true
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          <span>IGCSE Generator Settings</span>
        </h3>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 px-4 py-2 text-slate-300 border border-slate-700 rounded-xl hover:bg-slate-800/50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
              saved 
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' 
                : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/25'
            }`}
          >
            {saved ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Settings</span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Question Bank Settings */}
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6">
          <h4 className="text-md font-semibold text-white mb-4 flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>Question Bank</span>
          </h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Question Bank Size
              </label>
              <input
                type="number"
                value={config.questionBankSize}
                onChange={(e) => setConfig({...config, questionBankSize: parseInt(e.target.value)})}
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 text-white"
                min="100"
                max="10000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Difficulty Distribution (%)
              </label>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <label className="w-16 text-sm text-slate-400">Easy:</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={config.difficultyDistribution.easy}
                    onChange={(e) => setConfig({
                      ...config,
                      difficultyDistribution: {
                        ...config.difficultyDistribution,
                        easy: parseInt(e.target.value)
                      }
                    })}
                    className="flex-1 accent-cyan-500"
                  />
                  <span className="w-12 text-sm text-white">{config.difficultyDistribution.easy}%</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <label className="w-16 text-sm text-slate-400">Medium:</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={config.difficultyDistribution.medium}
                    onChange={(e) => setConfig({
                      ...config,
                      difficultyDistribution: {
                        ...config.difficultyDistribution,
                        medium: parseInt(e.target.value)
                      }
                    })}
                    className="flex-1 accent-cyan-500"
                  />
                  <span className="w-12 text-sm text-white">{config.difficultyDistribution.medium}%</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <label className="w-16 text-sm text-slate-400">Hard:</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={config.difficultyDistribution.hard}
                    onChange={(e) => setConfig({
                      ...config,
                      difficultyDistribution: {
                        ...config.difficultyDistribution,
                        hard: parseInt(e.target.value)
                      }
                    })}
                    className="flex-1 accent-cyan-500"
                  />
                  <span className="w-12 text-sm text-white">{config.difficultyDistribution.hard}%</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Subject Weighting (%)
              </label>
              <div className="space-y-2">
                {Object.entries(config.subjectWeighting).map(([subject, weight]) => (
                  <div key={subject} className="flex items-center space-x-3">
                    <label className="w-20 text-sm text-slate-400 capitalize">{subject}:</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={weight}
                      onChange={(e) => setConfig({
                        ...config,
                        subjectWeighting: {
                          ...config.subjectWeighting,
                          [subject]: parseInt(e.target.value)
                        }
                      })}
                      className="flex-1 accent-cyan-500"
                    />
                    <span className="w-12 text-sm text-white">{weight}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Paper Templates */}
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6">
          <h4 className="text-md font-semibold text-white mb-4 flex items-center space-x-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>Paper Templates</span>
          </h4>
          
          <div className="space-y-4">
            {Object.entries(config.paperTemplates).map(([paperKey, template]) => (
              <div key={paperKey} className="border border-slate-700/50 rounded-xl p-3 bg-slate-800/30">
                <h5 className="font-medium text-white mb-2 capitalize">
                  {paperKey.replace(/(\d)/, ' $1')}
                </h5>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <label className="text-slate-400">Duration:</label>
                    <input
                      type="number"
                      value={template.duration}
                      onChange={(e) => setConfig({
                        ...config,
                        paperTemplates: {
                          ...config.paperTemplates,
                          [paperKey]: {
                            ...template,
                            duration: parseInt(e.target.value)
                          }
                        }
                      })}
                      className="w-full px-2 py-1 bg-slate-800/50 border border-slate-700 rounded-lg text-xs text-white focus:ring-1 focus:ring-cyan-500/50"
                      min="30"
                      max="180"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400">
                      {'questions' in template ? 'Questions:' : 'Total Marks:'}
                    </label>
                    <input
                      type="number"
                      value={'questions' in template ? template.questions : template.totalMarks}
                      onChange={(e) => setConfig({
                        ...config,
                        paperTemplates: {
                          ...config.paperTemplates,
                          [paperKey]: {
                            ...template,
                            ...('questions' in template 
                              ? { questions: parseInt(e.target.value) }
                              : { totalMarks: parseInt(e.target.value) }
                            )
                          }
                        }
                      })}
                      className="w-full px-2 py-1 bg-slate-800/50 border border-slate-700 rounded-lg text-xs text-white focus:ring-1 focus:ring-cyan-500/50"
                      min="1"
                      max="200"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Generation Preferences */}
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6">
          <h4 className="text-md font-semibold text-white mb-4 flex items-center space-x-2">
            <Target className="w-4 h-4 text-cyan-400" />
            <span>Generation Preferences</span>
          </h4>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.includeFormulae}
                  onChange={(e) => setConfig({...config, includeFormulae: e.target.checked})}
                  className="rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500/50"
                />
                <span className="text-sm text-slate-300">Include formulae sheet</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.includeDataSheet}
                  onChange={(e) => setConfig({...config, includeDataSheet: e.target.checked})}
                  className="rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500/50"
                />
                <span className="text-sm text-slate-300">Include data sheet</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.includePeriodicTable}
                  onChange={(e) => setConfig({...config, includePeriodicTable: e.target.checked})}
                  className="rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500/50"
                />
                <span className="text-sm text-slate-300">Include periodic table</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Language Support
              </label>
              <select
                value={config.languageSupport}
                onChange={(e) => setConfig({...config, languageSupport: e.target.value})}
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 text-white"
              >
                <option value="English" className="bg-slate-900">English</option>
                <option value="Spanish" className="bg-slate-900">Spanish</option>
                <option value="French" className="bg-slate-900">French</option>
                <option value="Arabic" className="bg-slate-900">Arabic</option>
                <option value="Chinese" className="bg-slate-900">Chinese</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Accessibility Options
              </label>
              <div className="space-y-1">
                {['Large Print', 'High Contrast', 'Screen Reader Compatible', 'Extended Time'].map(option => (
                  <label key={option} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={config.accessibilityOptions.includes(option)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setConfig({
                            ...config,
                            accessibilityOptions: [...config.accessibilityOptions, option]
                          });
                        } else {
                          setConfig({
                            ...config,
                            accessibilityOptions: config.accessibilityOptions.filter(o => o !== option)
                          });
                        }
                      }}
                      className="rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500/50"
                    />
                    <span className="text-sm text-slate-300">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quality Control */}
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6">
          <h4 className="text-md font-semibold text-white mb-4 flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-cyan-400" />
            <span>Quality Control</span>
          </h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Review Level
              </label>
              <select
                value={config.reviewLevel}
                onChange={(e) => setConfig({...config, reviewLevel: e.target.value as 'basic' | 'standard' | 'comprehensive'})}
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 text-white"
              >
                <option value="basic" className="bg-slate-900">Basic - Quick validation</option>
                <option value="standard" className="bg-slate-900">Standard - Thorough checking</option>
                <option value="comprehensive" className="bg-slate-900">Comprehensive - Extensive review</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.autoValidation}
                  onChange={(e) => setConfig({...config, autoValidation: e.target.checked})}
                  className="rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500/50"
                />
                <span className="text-sm text-slate-300">Auto-validation of generated content</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.duplicateChecking}
                  onChange={(e) => setConfig({...config, duplicateChecking: e.target.checked})}
                  className="rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500/50"
                />
                <span className="text-sm text-slate-300">Check for duplicate questions</span>
              </label>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5" />
                <div className="text-sm text-amber-300">
                  <p className="font-medium text-amber-200">Quality Assurance</p>
                  <p>All generated papers undergo automated quality checks to ensure Cambridge standards compliance.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}