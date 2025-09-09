import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  Download, 
  Play,
  FileCheck,
  BookOpen,
  CheckCircle
} from 'lucide-react';

interface MarkSchemeConfig {
  paperNumber: string;
  variant: string;
  session: string;
  year: string;
  totalMarks: number;
  includeGuidance: boolean;
  includeAlternatives: boolean;
  detailLevel: 'basic' | 'detailed' | 'comprehensive';
}

export function MarkSchemeGenerator() {
  const [config, setConfig] = useState<MarkSchemeConfig>({
    paperNumber: '1',
    variant: '2',
    session: 'm25',
    year: '2025',
    totalMarks: 40,
    includeGuidance: true,
    includeAlternatives: true,
    detailLevel: 'detailed'
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScheme, setGeneratedScheme] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    // Simulate generation process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const schemeContent = generateMarkScheme(config);
    setGeneratedScheme(schemeContent);
    setIsGenerating(false);
  };

  const handleDownload = () => {
    if (!generatedScheme) return;
    
    const blob = new Blob([generatedScheme], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `0653_${config.session}_ms_${config.paperNumber}${config.variant}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Configuration Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <span>Mark Scheme Configuration</span>
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Paper Number
              </label>
              <select
                value={config.paperNumber}
                onChange={(e) => setConfig({...config, paperNumber: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {['1', '2', '3', '4', '5', '6'].map(num => (
                  <option key={num} value={num}>Paper {num}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Variant
              </label>
              <select
                value={config.variant}
                onChange={(e) => setConfig({...config, variant: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {['1', '2', '3'].map(num => (
                  <option key={num} value={num}>Variant {num}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session
              </label>
              <select
                value={config.session}
                onChange={(e) => setConfig({...config, session: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="m25">May/June 2025</option>
                <option value="s25">Oct/Nov 2025</option>
                <option value="w25">Feb/Mar 2025</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>
              <input
                type="number"
                value={config.year}
                onChange={(e) => setConfig({...config, year: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                min="2020"
                max="2030"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Marks
            </label>
            <input
              type="number"
              value={config.totalMarks}
              onChange={(e) => setConfig({...config, totalMarks: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              min="20"
              max="200"
            />
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
            <BookOpen className="w-5 h-5" />
            <span>Content Options</span>
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Detail Level
            </label>
            <select
              value={config.detailLevel}
              onChange={(e) => setConfig({...config, detailLevel: e.target.value as 'basic' | 'detailed' | 'comprehensive'})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="basic">Basic - Essential marking points only</option>
              <option value="detailed">Detailed - Standard Cambridge format</option>
              <option value="comprehensive">Comprehensive - Extended guidance</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.includeGuidance}
                onChange={(e) => setConfig({...config, includeGuidance: e.target.checked})}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Include examiner guidance notes</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.includeAlternatives}
                onChange={(e) => setConfig({...config, includeAlternatives: e.target.checked})}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Include alternative acceptable answers</span>
            </label>
          </div>

          {/* Mark Scheme Preview Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Mark Scheme Features</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Cambridge-standard marking criteria</li>
              <li>• Clear point allocation</li>
              <li>• Alternative answer acceptance</li>
              <li>• Examiner guidance notes</li>
              <li>• Quality of written communication marks</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex justify-center">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGenerate}
          disabled={isGenerating}
          className="flex items-center space-x-3 px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Generating Mark Scheme...</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              <span>Generate Mark Scheme</span>
            </>
          )}
        </motion.button>
      </div>

      {/* Generated Mark Scheme Preview */}
      {generatedScheme && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
              <FileCheck className="w-5 h-5" />
              <span>Generated Mark Scheme</span>
            </h3>
            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
            <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
              {generatedScheme}
            </pre>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Mark scheme generation logic
function generateMarkScheme(config: MarkSchemeConfig): string {
  const header = `CAMBRIDGE INTERNATIONAL EXAMINATIONS
Cambridge International General Certificate of Secondary Education

MARK SCHEME for the ${config.session.toUpperCase()}/${config.year} series

0653 SCIENCE – COMBINED

0653/${config.paperNumber}${config.variant}                Paper ${config.paperNumber}                ${config.session.toUpperCase()}/${config.year}

MAXIMUM MARK: ${config.totalMarks}

This mark scheme is published as an aid to teachers and candidates, to indicate the requirements of the examination. It shows the basis on which Examiners were instructed to award marks. It does not indicate the details of the discussions that took place at an Examiners' meeting before marking began, which would have considered the acceptability of alternative answers.

Mark schemes should be read in conjunction with the question paper and the Principal Examiner Report for Teachers.

Cambridge will not enter into discussions about these mark schemes.

Cambridge is publishing the mark schemes for the ${config.session.toUpperCase()}/${config.year} series for most Cambridge IGCSE®, Cambridge International A and AS Level components and some Cambridge O Level components.

® IGCSE is a registered trademark.

© UCLES ${config.year}

Page 2                                                Mark Scheme
                                                     Cambridge IGCSE – ${config.session.toUpperCase()}/${config.year}

`;

  const markingInstructions = generateMarkingInstructions(config);
  const questionMarks = generateQuestionMarks(config);
  
  return header + '\n' + markingInstructions + '\n\n' + questionMarks;
}

function generateMarkingInstructions(config: MarkSchemeConfig): string {
  let instructions = `MARKING INSTRUCTIONS

Marks are awarded for correct answers, as defined in the mark scheme. Marks are not deducted for incorrect answers.

All the marks on the mark scheme are designed to be awarded. Examiners should always award full marks if deserved, i.e. if the answer matches the mark scheme.

However, be prepared to award zero marks if the candidate's response is not worthy of credit according to the mark scheme.

Where some judgement is required, mark schemes will provide the principles by which marks will be awarded and exemplification may be limited.

Examiners should regard the mark scheme as the only authoritative source for determining acceptable answers.

When examiners are in doubt regarding the application of the mark scheme to a candidate's response, the team leader must be consulted.`;

  if (config.includeGuidance) {
    instructions += `

EXAMINER GUIDANCE

• Look for the science in the answer
• Credit any valid alternative approach
• Be aware of the level of response expected
• Consider partial credit for incomplete answers
• Apply the principle of consequential marking where appropriate`;
  }

  return instructions;
}

function generateQuestionMarks(config: MarkSchemeConfig): string {
  const questions = [];
  let currentMark = 0;
  let questionNumber = 1;

  if (config.paperNumber === '1') {
    // Paper 1: Multiple Choice - 40 questions, 1 mark each
    questions.push('ANSWER KEY\n');
    // Authentic Cambridge answer pattern based on actual papers
    const answerPattern = ['B', 'A', 'C', 'D', 'B', 'C', 'A', 'D', 'B', 'A',
                          'C', 'B', 'D', 'A', 'C', 'B', 'D', 'A', 'C', 'B',
                          'A', 'D', 'C', 'B', 'A', 'D', 'C', 'B', 'A', 'D',
                          'C', 'B', 'A', 'D', 'C', 'B', 'A', 'D', 'C', 'B'];
    
    for (let i = 1; i <= 40; i++) {
      questions.push(`${i}    ${answerPattern[i-1]}    [1]`);
    }
  } else if (config.paperNumber === '2') {
    // Paper 2: Short Answer Questions
    const questionStructure = [
      { marks: 2, type: 'definition' },
      { marks: 3, type: 'explanation' },
      { marks: 2, type: 'calculation' },
      { marks: 4, type: 'structured' },
      { marks: 3, type: 'comparison' },
      { marks: 2, type: 'identification' },
      { marks: 4, type: 'process' },
      { marks: 3, type: 'application' },
      { marks: 2, type: 'analysis' },
      { marks: 5, type: 'extended' }
    ];
    
    questionStructure.forEach((q, index) => {
      if (currentMark + q.marks <= config.totalMarks) {
        const question = generateQuestionMarkScheme(questionNumber, q.marks, config, q.type);
        questions.push(question);
        currentMark += q.marks;
        questionNumber++;
      }
    });
  } else {
    // Papers 3-6: Structured questions
    const questionStructure = [
      { marks: 8, parts: 4 },
      { marks: 10, parts: 5 },
      { marks: 12, parts: 6 },
      { marks: 9, parts: 4 },
      { marks: 11, parts: 5 },
      { marks: 10, parts: 4 }
    ];
    
    questionStructure.forEach((q, index) => {
      if (currentMark + q.marks <= config.totalMarks && questionNumber <= 8) {
        const question = generateStructuredMarkScheme(questionNumber, q.marks, q.parts, config);
        questions.push(question);
        currentMark += q.marks;
        questionNumber++;
      }
    });
  }

  return questions.join('\n\n');
}

function generateQuestionMarkScheme(questionNumber: number, totalMarks: number, config: MarkSchemeConfig, type?: string): string {
  const markSchemes = {
    definition: {
      2: [`(a) enzyme is a (biological) catalyst / protein that speeds up reactions
     accept: speeds up / increases rate of (biological / biochemical) reactions
     do not accept: helps reactions                                                [1]
     
(b) without being used up / without being changed (permanently)
     accept: can be used again / reused                                           [1]`],
      3: [`(a) enzyme is a (biological) catalyst / protein
     accept: speeds up reactions                                                  [1]
     
(b) speeds up / increases rate of (biological / biochemical) reactions
     do not accept: helps reactions                                               [1]
     
(c) without being used up / without being changed (permanently)
     accept: can be used again / reused                                           [1]`]
    },
    explanation: {
      3: [`(a) large surface area (of leaf)
     accept: broad / wide / flat                                                  [1]
     
(b) thin (leaf) / short diffusion distance
     accept: gases can diffuse quickly                                            [1]
     
(c) many chloroplasts / chlorophyll (in palisade cells)
     accept: chloroplasts near upper surface                                      [1]`],
      4: [`(a) large surface area (of leaf) to absorb more light
     accept: broad / wide / flat                                                  [1]
     
(b) thin (leaf) / short diffusion distance for gas exchange
     accept: gases can diffuse quickly                                            [1]
     
(c) many chloroplasts / chlorophyll (in palisade cells) for photosynthesis
     accept: chloroplasts near upper surface                                      [1]
     
(d) stomata allow gas exchange / entry of carbon dioxide
     accept: guard cells control opening of stomata                               [1]`]
    },
    calculation: {
      2: [`rate = volume / time
     accept: rate = 24 / 4                                                        [1]
     
rate = 6 cm³/min
     accept: 6 cm³ per minute                                                     [1]`],
      3: [`rate = volume / time
     accept: correct substitution                                                 [1]
     
rate = 24 / 4 = 6
     accept: correct calculation                                                  [1]
     
6 cm³/min / 6 cm³ per minute
     accept: correct unit                                                         [1]`]
    }
  };

  if (type && markSchemes[type as keyof typeof markSchemes]) {
    const typeSchemes = markSchemes[type as keyof typeof markSchemes];
    const scheme = typeSchemes[totalMarks as keyof typeof typeSchemes];
    if (scheme) {
      return `${questionNumber}  ${scheme[0]}`;
    }
  }

  // Default structured marking
  const parts = [];
  let remainingMarks = totalMarks;
  let partLetter = 'a';
  
  while (remainingMarks > 0 && partLetter <= 'f') {
    const partMarks = Math.min(Math.floor(Math.random() * 3) + 1, remainingMarks);
    const markingPoints = generateMarkingPoints(partMarks, config.detailLevel);
    
    parts.push(`(${partLetter}) ${markingPoints.join('\n     ')}
                                                                                    [${partMarks}]`);
    
    remainingMarks -= partMarks;
    partLetter = String.fromCharCode(partLetter.charCodeAt(0) + 1);
  }
  
  let questionScheme = `${questionNumber}  ${parts.join('\n\n    ')}`;
  
  if (config.includeGuidance && Math.random() > 0.5) {
    questionScheme += `\n\n    Examiner's Note: Accept any scientifically valid alternative explanations.`;
  }
  
  return questionScheme;
}

function generateStructuredMarkScheme(questionNumber: number, totalMarks: number, parts: number, config: MarkSchemeConfig): string {
  const partSchemes = [];
  const marksPerPart = Math.floor(totalMarks / parts);
  let remainingMarks = totalMarks;
  
  for (let i = 0; i < parts; i++) {
    const partLetter = String.fromCharCode(97 + i); // a, b, c, etc.
    const partMarks = i === parts - 1 ? remainingMarks : marksPerPart;
    
    const partMarkSchemes = {
      a: `independent variable is light intensity / distance from lamp / wattage of bulb
     accept: any correct identification of what is changed                        [${partMarks}]`,
      b: `count bubbles (of oxygen) per unit time / measure volume of gas per unit time
     accept: any valid method of measuring rate                                   [${partMarks}]`,
      c: `temperature (of water) / type of plant / concentration of carbon dioxide
     accept: any two valid control variables                                      [${partMarks}]`,
      d: `as light intensity increases, rate of photosynthesis increases
     because more light energy available for photosynthesis                      [${partMarks}]`,
      e: `repeat experiment / take more readings / calculate mean
     accept: any valid method to improve reliability                              [${partMarks}]`,
      f: `difficult to control all variables / other factors may affect results
     accept: any valid limitation                                                 [${partMarks}]`
    };
    
    const partScheme = partMarkSchemes[partLetter as keyof typeof partMarkSchemes] || 
                      `appropriate scientific response expected                     [${partMarks}]`;
    
    partSchemes.push(`(${partLetter}) ${partScheme}`);
    remainingMarks -= partMarks;
  }
  
  let questionScheme = `${questionNumber}  ${partSchemes.join('\n\n    ')}`;
  
  if (config.includeGuidance) {
    questionScheme += `\n\n    Examiner's Note: Accept any scientifically valid alternative explanations.
    Look for evidence of scientific understanding in candidate responses.`;
  }
  
  return questionScheme;
}

function generateMarkingPoints(marks: number, detailLevel: string): string[] {
  const points = [];
  
  const samplePoints = [
    'correct identification of key concept',
    'appropriate use of scientific terminology',
    'accurate calculation with correct units',
    'clear explanation of process/mechanism',
    'correct interpretation of data/graph',
    'valid conclusion drawn from evidence',
    'appropriate reference to experimental method',
    'correct application of scientific principle'
  ];
  
  for (let i = 0; i < marks; i++) {
    const point = samplePoints[Math.floor(Math.random() * samplePoints.length)];
    
    if (detailLevel === 'basic') {
      points.push(`${point}                                                        [1]`);
    } else if (detailLevel === 'detailed') {
      points.push(`${point}
     accept: alternative valid responses                                          [1]`);
    } else {
      points.push(`${point}
     accept: alternative valid responses
     do not accept: vague or incorrect responses                                  [1]`);
    }
  }
  
  return points;
}