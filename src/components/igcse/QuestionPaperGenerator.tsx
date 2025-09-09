import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Download, 
  Settings, 
  Play,
  BookOpen,
  Target,
  Eye
} from 'lucide-react';
import { CambridgePDFGenerator } from './PDFGenerator';
import { PAPER2_QUESTIONS } from '../../data/igcse/paper2_core';
import { PAPER3_QUESTIONS } from '../../data/igcse/paper3_extended';
import { PAPER4_QUESTIONS } from '../../data/igcse/paper4_coursework_alt';
import { PAPER5_QUESTIONS } from '../../data/igcse/paper5_practical';
import { PAPER6_QUESTIONS } from '../../data/igcse/paper6_alt_practical';
import { StructuredQuestion } from '../../data/igcse/structured_types';

interface QuestionPaperConfig {
  paperNumber: string;
  variant: string;
  session: string;
  year: string;
  duration: number;
  totalMarks: number;
  subjects: string[];
  difficulty: 'foundation' | 'higher';
  questionTypes: string[];
}

export function QuestionPaperGenerator() {
  const [config, setConfig] = useState<QuestionPaperConfig>({
    paperNumber: '1',
    variant: '2',
    session: 'm25',
    year: '2025',
    duration: 45,
    totalMarks: 40,
    subjects: ['Biology', 'Chemistry', 'Physics'],
    difficulty: 'foundation',
    questionTypes: ['Multiple Choice', 'Short Answer', 'Structured']
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPaper, setGeneratedPaper] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [seed, setSeed] = useState<string>('');

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      // Generate HTML preview
    const paperContent = generateAuthenticQuestionPaper(config);
      setGeneratedPaper(paperContent);
      
      // Generate PDF
  const pdfGenerator = new CambridgePDFGenerator();
  if (seed.trim()) pdfGenerator.setSeed(seed.trim());
  await pdfGenerator.generatePaper(config);
      const blob = pdfGenerator.getBlob();
      setPdfBlob(blob);
      
    } catch (error) {
      console.error('Error generating paper:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!pdfBlob) return;
    
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `0653_${config.session}_qp_${config.paperNumber}${config.variant}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePreviewPDF = () => {
    if (!pdfBlob) return;
    
    const url = URL.createObjectURL(pdfBlob);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Configuration Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Paper Configuration</span>
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Paper Number
              </label>
              <select
                value={config.paperNumber}
                onChange={(e) => setConfig({...config, paperNumber: e.target.value})}
                aria-label="Paper Number"
                title="Paper Number"
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
                aria-label="Variant"
                title="Variant"
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
                aria-label="Session"
                title="Session"
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
                aria-label="Year"
                title="Year"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                min="2020"
                max="2030"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Question Generation</label>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setSeed('')}
                className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                  seed === '' 
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                Generate Different Questions
              </button>
              <button
                type="button"
                onClick={() => setSeed('reproducible')}
                className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                  seed !== '' 
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                Generate Same Questions
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {seed === '' 
                ? 'Each generation will create unique questions and variants.' 
                : 'Will regenerate the same questions for consistent testing.'
              }
            </p>
          </div>
        </div>

        {/* Paper Type Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <span>Paper Information</span>
          </h3>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">
              Paper {config.paperNumber} - {getPaperTitle(config.paperNumber)}
            </h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• Duration: {getPaperDuration(config.paperNumber)} minutes</p>
              <p>• Total Marks: {getPaperMarks(config.paperNumber)}</p>
              <p>• Question Types: {getPaperTypes(config.paperNumber)}</p>
              <p>• {getPaperDescription(config.paperNumber)}</p>
            </div>
          </div>

          {/* Cambridge Reference Guide */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-medium text-amber-800 mb-2 flex items-center space-x-2">
              <BookOpen className="w-4 h-4" />
              <span>Cambridge IGCSE Reference Guide</span>
            </h4>
            <div className="text-sm text-amber-700 space-y-2">
              <div>
                <p className="font-medium">What is a Variant?</p>
                <p>Variants are different versions of the same paper given in different time zones:</p>
                <p>• <strong>Variant 1:</strong> Asia/Australia time zones</p>
                <p>• <strong>Variant 2:</strong> Middle East/Africa time zones</p>
                <p>• <strong>Variant 3:</strong> Americas time zones</p>
                <p>All variants test the same content at the same difficulty level.</p>
              </div>
              
              <div>
                <p className="font-medium">Session Codes:</p>
                <p>• <strong>m25:</strong> May/June 2025 examination session</p>
                <p>• <strong>s25:</strong> October/November 2025 session</p>
                <p>• <strong>w25:</strong> February/March 2025 session</p>
              </div>
              
              <div>
                <p className="font-medium">File Naming Convention:</p>
                <p><code>0653_m25_qp_12</code> = Subject Code_Session_Question Paper_Paper Number + Variant</p>
                <p>Example: Paper 1, Variant 2, May/June 2025</p>
              </div>
            </div>
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
          className="flex items-center space-x-3 px-8 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Generating Authentic Cambridge Paper...</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              <span>Generate Question Paper (with diagrams & tables)</span>
            </>
          )}
        </motion.button>
      </div>

      {/* Generated Paper Preview */}
      {generatedPaper && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Generated Cambridge IGCSE Question Paper</span>
            </h3>
            <div className="flex items-center space-x-3">
              <button
                onClick={handlePreviewPDF}
                disabled={!pdfBlob}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>Preview PDF</span>
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={!pdfBlob}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
          
          <div className="bg-white border rounded-lg p-6 overflow-y-auto shadow-inner max-h-[80vh]">
            <div className="cambridge-paper-preview font-[Times_New_Roman] leading-snug">
              {/* Cambridge Header Preview */}
              <div className="text-center mb-6 border-b pb-4">
                <div className="text-xs font-medium mb-1">CAMBRIDGE INTERNATIONAL EXAMINATIONS</div>
                <div className="text-xs mb-3">Cambridge International General Certificate of Secondary Education</div>
                
                <div className="flex justify-between items-center mb-2">
                  <div className="font-bold">SCIENCE – COMBINED</div>
                  <div className="font-bold">0653/{config.paperNumber}{config.variant}</div>
                </div>
                
                <div className="flex justify-between items-center mb-3">
                  <div>Paper {config.paperNumber}</div>
                  <div>{config.session.toUpperCase()}/{config.year}</div>
                </div>
                
                <div className="text-right text-sm">{getPaperDuration(config.paperNumber)} minutes</div>
              </div>

              {/* Instructions Preview */}
              <div className="mb-6 text-xs">
                <div className="font-bold mb-2">READ THESE INSTRUCTIONS FIRST</div>
                <div className="space-y-1 text-xs">
                  <p>Write your Centre number, candidate number and name on all the work you hand in.</p>
                  <p>Write in dark blue or black pen.</p>
                  <p>Answer all questions.</p>
                  <p>The number of marks is given in brackets [ ] at the end of each question or part question.</p>
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <div></div>
                  <div className="border border-gray-400 p-2 text-center">
                    <div className="text-xs">For Examiner's Use</div>
                    <div className="text-xs mt-1">Total: {getPaperMarks(config.paperNumber)}</div>
                  </div>
                </div>
              </div>

              {/* Sample Questions Preview */}
              <div className="text-sm space-y-4">
                {config.paperNumber === '1' ? (
                  <div>
                    <div className="font-medium mb-2">Sample Multiple Choice Questions:</div>
                    <div className="ml-4 space-y-2">
                      <div>1  Which structure controls what enters and leaves a cell?</div>
                      <div className="ml-4 space-y-1">
                        <div>A  cell wall</div>
                        <div>B  cell membrane</div>
                        <div>C  cytoplasm</div>
                        <div>D  nucleus</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="font-medium mb-2">Sample Structured Questions:</div>
                    {renderStructuredPreview(config.paperNumber)}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t text-xs text-gray-600 text-center">
                <p>This is a preview. The complete paper will be generated as a PDF with all questions.</p>
                <p className="mt-1">© UCLES {config.year}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Helper functions for paper information
function getPaperTitle(paperNumber: string): string {
  const titles = {
    '1': 'Multiple Choice',
    '2': 'Core Theory',
    '3': 'Extended Theory',
    '4': 'Coursework Alternative',
    '5': 'Practical Test',
    '6': 'Alternative to Practical'
  };
  return titles[paperNumber as keyof typeof titles] || 'Unknown';
}

function getPaperDuration(paperNumber: string): number {
  const durations = {
    '1': 45,
    '2': 75,
    '3': 75,
    '4': 105,
    '5': 75,
    '6': 60
  };
  return durations[paperNumber as keyof typeof durations] || 60;
}

function getPaperMarks(paperNumber: string): number {
  const marks = {
    '1': 40,
    '2': 80,
    '3': 80,
    '4': 120,
    '5': 60,
    '6': 60
  };
  return marks[paperNumber as keyof typeof marks] || 60;
}

function getPaperTypes(paperNumber: string): string {
  const types = {
    '1': 'Multiple Choice Questions',
    '2': 'Short Answer & Structured Questions',
    '3': 'Extended Structured Questions',
    '4': 'Extended Response Questions',
    '5': 'Practical Skills Assessment',
    '6': 'Paper-based Practical Questions'
  };
  return types[paperNumber as keyof typeof types] || 'Mixed Questions';
}

function getPaperDescription(paperNumber: string): string {
  const descriptions = {
    '1': '40 multiple choice questions covering all three sciences',
    '2': 'Core curriculum questions for Foundation and Higher tiers',
    '3': 'Extended curriculum questions requiring detailed responses',
    '4': 'Alternative to coursework with comprehensive coverage',
    '5': 'Laboratory-based practical skills assessment',
    '6': 'Paper-based alternative to practical assessment'
  };
  return descriptions[paperNumber as keyof typeof descriptions] || 'Standard examination paper';
}

// Authentic Cambridge IGCSE question generation
function generateAuthenticQuestionPaper(config: QuestionPaperConfig): string {
  const header = `CAMBRIDGE INTERNATIONAL EXAMINATIONS
Cambridge International General Certificate of Secondary Education

SCIENCE – COMBINED                                                    0653/${config.paperNumber}${config.variant}
Paper ${config.paperNumber}                                          ${config.session.toUpperCase()}/${config.year}

                                                                      ${getPaperDuration(config.paperNumber)} minutes

Candidates answer on the Question Paper.
No additional materials are required.

READ THESE INSTRUCTIONS FIRST

Write your Centre number, candidate number and name on all the work you hand in.
Write in dark blue or black pen.
You may use an HB pencil for any diagrams or graphs.
Do not use staples, paper clips, glue or correction fluid.
DO NOT WRITE IN ANY BARCODES.

Answer all questions.

The use of an approved scientific calculator is expected, where appropriate.
You may lose marks if you do not show your working or if you do not use appropriate units.

At the end of the examination, fasten all your work securely together.

The number of marks is given in brackets [ ] at the end of each question or part question.

For Examiner's Use
Total: ${getPaperMarks(config.paperNumber)}

This document consists of 8 printed pages.

© UCLES ${config.year}                                               [Turn over
`;

  const questions = generateAuthenticQuestions(config);
  
  return header + '\n\n' + questions;
}

function generateAuthenticQuestions(config: QuestionPaperConfig): string {
  const questions = [];

  if (config.paperNumber === '1') {
    // Paper 1: Multiple Choice Questions (40 questions, 1 mark each)
    for (let i = 1; i <= 40; i++) {
      const question = generateAuthenticMCQ(i);
      questions.push(question);
    }
  } else if (config.paperNumber === '2') {
    // Paper 2: Core Theory Questions
    questions.push(...generatePaper2Questions());
  } else if (config.paperNumber === '3') {
    // Paper 3: Extended Theory Questions
    questions.push(...generatePaper3Questions());
  } else if (config.paperNumber === '4') {
    // Paper 4: Coursework Alternative
    questions.push(...generatePaper4Questions());
  } else if (config.paperNumber === '5') {
    // Paper 5: Practical Test
    questions.push(...generatePaper5Questions());
  } else if (config.paperNumber === '6') {
    // Paper 6: Alternative to Practical
    questions.push(...generatePaper6Questions());
  }

  return questions.join('\n\n');
}

// Authentic Multiple Choice Questions for Paper 1
function generateAuthenticMCQ(questionNumber: number): string {
  const mcqQuestions = [
    // Biology Questions
    {
      question: "Which structure controls what enters and leaves a cell?",
      options: ["A  cell wall", "B  cell membrane", "C  cytoplasm", "D  nucleus"],
      subject: "Biology",
      diagram: {
        src: "https://www.bbc.co.uk/bitesize/guides/zqrq7ty/images/animal_cell_simple.png",
        alt: "Simple animal cell diagram showing cell membrane, nucleus, and cytoplasm",
        reference: "BBC Bitesize - Animal Cell Structure"
      }
    },
    {
      question: "The process by which green plants make glucose is called",
      options: ["A  photosynthesis", "B  respiration", "C  transpiration", "D  translocation"],
      subject: "Biology",
      diagram: {
        src: "https://www.bbc.co.uk/bitesize/guides/zs4mk2p/images/photosynthesis_equation.png",
        alt: "Photosynthesis equation showing carbon dioxide + water → glucose + oxygen",
        reference: "BBC Bitesize - Photosynthesis Process"
      }
    },
    {
      question: "Which blood vessel carries oxygenated blood away from the heart?",
      options: ["A  aorta", "B  pulmonary artery", "C  pulmonary vein", "D  vena cava"],
      subject: "Biology",
      diagram: {
        src: "https://www.bbc.co.uk/bitesize/guides/zs4mk2p/images/heart_diagram_simple.png",
        alt: "Simple heart diagram showing major blood vessels",
        reference: "BBC Bitesize - Heart and Blood Vessels"
      }
    },
    {
      question: "The part of the digestive system where most absorption takes place is the",
      options: ["A  large intestine", "B  small intestine", "C  stomach", "D  liver"],
      subject: "Biology"
    },
    {
      question: "Which gas is produced during photosynthesis?",
      options: ["A  carbon dioxide", "B  hydrogen", "C  nitrogen", "D  oxygen"],
      subject: "Biology"
    },
    
    // Chemistry Questions
    {
      question: "The atomic number of an element is the number of",
      options: ["A  electrons", "B  neutrons", "C  protons", "D  protons and neutrons"],
      subject: "Chemistry",
      diagram: {
        src: "https://www.bbc.co.uk/bitesize/guides/zshb4qt/images/atomic_structure_diagram.png",
        alt: "Atomic structure diagram showing protons, neutrons, and electrons",
        reference: "BBC Bitesize - Atomic Structure"
      }
    },
    {
      question: "Which of these is a compound?",
      options: ["A  chlorine", "B  hydrogen", "C  oxygen", "D  water"],
      subject: "Chemistry"
    },
    {
      question: "The pH of a neutral solution is",
      options: ["A  0", "B  7", "C  10", "D  14"],
      subject: "Chemistry"
    },
    {
      question: "When magnesium burns in air, the product formed is",
      options: ["A  magnesium chloride", "B  magnesium hydroxide", "C  magnesium oxide", "D  magnesium sulfate"],
      subject: "Chemistry"
    },
    {
      question: "The process of a solid changing directly to a gas is called",
      options: ["A  condensation", "B  evaporation", "C  melting", "D  sublimation"],
      subject: "Chemistry"
    },
    
    // Physics Questions
    {
      question: "The unit of electric current is the",
      options: ["A  ampere", "B  coulomb", "C  ohm", "D  volt"],
      subject: "Physics",
      diagram: {
        src: "https://www.bbc.co.uk/bitesize/guides/zq8q7ty/images/ammeter_circuit.png",
        alt: "Circuit diagram showing ammeter measuring electric current",
        reference: "BBC Bitesize - Electric Current Measurement"
      }
    },
    {
      question: "Sound waves are",
      options: ["A  electromagnetic waves", "B  longitudinal waves", "C  transverse waves", "D  light waves"],
      subject: "Physics"
    },
    {
      question: "The force that opposes motion between two surfaces is",
      options: ["A  gravity", "B  friction", "C  magnetism", "D  tension"],
      subject: "Physics"
    },
    {
      question: "Which type of electromagnetic radiation has the longest wavelength?",
      options: ["A  gamma rays", "B  radio waves", "C  ultraviolet", "D  X-rays"],
      subject: "Physics"
    },
    {
      question: "The speed of light in a vacuum is approximately",
      options: ["A  3 × 10⁶ m/s", "B  3 × 10⁷ m/s", "C  3 × 10⁸ m/s", "D  3 × 10⁹ m/s"],
      subject: "Physics"
    }
  ];

  // Cycle through questions to ensure variety
  const selectedQuestion = mcqQuestions[(questionNumber - 1) % mcqQuestions.length];
  
  let questionText = `${questionNumber}  ${selectedQuestion.question}`;
  
  // Add diagram if available
  if (selectedQuestion.diagram) {
    questionText += `

    <img src="${selectedQuestion.diagram.src}" 
         alt="${selectedQuestion.diagram.alt}" 
         style="max-width: 300px; margin: 10px 0;" />
    
    Reference: ${selectedQuestion.diagram.reference}`;
  }
  
  questionText += `

    ${selectedQuestion.options.join('\n    ')}`;
  
  return questionText;
}

// Paper 2: Core Theory Questions
function generatePaper2Questions(): string[] {
  return [
    `1  (a) State the function of the following parts of a plant cell:
        
        (i) cell wall
        
        .....................................................................................................................................
        
        (ii) chloroplast
        
        .....................................................................................................................................
                                                                                                                [2]
    
    (b) The diagram shows a plant cell.
    
        <img src="https://www.bbc.co.uk/bitesize/guides/zqrq7ty/images/plant_cell_diagram.png" 
             alt="Plant cell diagram showing labeled parts A, B, C" 
             style="max-width: 400px; margin: 10px 0;" />
        
        Reference: BBC Bitesize - Plant Cell Structure
        
        (i) Label the parts A, B and C on the diagram.                                                      [3]
        
        (ii) Name one part shown in the diagram that is not found in animal cells.
        
        .....................................................................................................................................
                                                                                                                [1]`,

    `2  (a) Complete the word equation for photosynthesis.
    
        carbon dioxide + ........................... → glucose + ...........................
                                                                                                                [2]
    
    (b) State two conditions needed for photosynthesis to occur.
    
        1. .................................................................................................................................
        
        2. .................................................................................................................................
                                                                                                                [2]
    
    (c) Explain why photosynthesis is important for life on Earth.
    
        .....................................................................................................................................
        
        .....................................................................................................................................
                                                                                                                [2]`,

    `3  (a) Complete the table to show the properties of the three states of matter.
    
        | State  | Shape           | Volume          | Particle arrangement |
        |--------|-----------------|-----------------|---------------------|
        | Solid  | fixed           |                 |                     |
        | Liquid |                 | fixed           |                     |
        | Gas    |                 |                 | random              |
                                                                                                                [3]
    
    (b) Explain, in terms of particles, what happens when a solid melts.
    
        .....................................................................................................................................
        
        .....................................................................................................................................
                                                                                                                [2]`,

    `4  (a) The diagram shows a simple electric circuit.
    
        <img src="https://www.bbc.co.uk/bitesize/guides/zq8q7ty/images/simple_circuit_diagram.png" 
             alt="Simple electric circuit with battery, switch, ammeter, and lamp in series" 
             style="max-width: 350px; margin: 10px 0;" />
        
        Reference: BBC Bitesize - Electric Circuits
        
        (i) What is the purpose of the switch in the circuit?
        
        .....................................................................................................................................
                                                                                                                [1]
        
        (ii) What does the ammeter measure?
        
        .....................................................................................................................................
                                                                                                                [1]
    
    (b) State Ohm's law.
    
        .....................................................................................................................................
        
        .....................................................................................................................................
                                                                                                                [2]
    
    (c) Calculate the resistance of a lamp when the current through it is 0.5 A and the voltage across it is 6 V.
    
        resistance = ........................... Ω
                                                                                                                [2]`
  ];
}

// Paper 3: Extended Theory Questions
function generatePaper3Questions(): string[] {
  return [
    `1  This question is about enzymes and digestion.
    
    (a) Define the term enzyme.
    
        .....................................................................................................................................
        
        .....................................................................................................................................
                                                                                                                [2]
    
    (b) The graph shows the effect of temperature on enzyme activity.
    
        <img src="https://www.bbc.co.uk/bitesize/guides/zs4mk2p/images/enzyme_temperature_graph.png" 
             alt="Graph showing enzyme activity vs temperature with bell curve peaking at 37°C" 
             style="max-width: 400px; margin: 10px 0;" />
        
        Reference: BBC Bitesize - Enzyme Activity and Temperature
        
        (i) State the optimum temperature for this enzyme.
        
        optimum temperature = ........................... °C
                                                                                                                [1]
        
        (ii) Explain why enzyme activity decreases above the optimum temperature.
        
        .....................................................................................................................................
        
        .....................................................................................................................................
        
        .....................................................................................................................................
                                                                                                                [3]
    
    (c) Describe how you would investigate the effect of pH on enzyme activity.
    
        .....................................................................................................................................
        
        .....................................................................................................................................
        
        .....................................................................................................................................
        
        .....................................................................................................................................
                                                                                                                [4]`,

    `2  This question is about chemical reactions and energy changes.
    
    (a) The equation shows the reaction between hydrogen and oxygen.
    
        2H₂ + O₂ → 2H₂O
        
        (i) State what type of reaction this is.
        
        .....................................................................................................................................
                                                                                                                [1]
        
        (ii) Calculate the number of moles of water produced when 4 moles of hydrogen react completely.
        
        number of moles = ...........................
                                                                                                                [1]
    
    (b) The diagram shows the energy changes during this reaction.
    
        <img src="https://www.bbc.co.uk/bitesize/guides/zshb4qt/images/energy_profile_diagram.png" 
             alt="Energy profile diagram showing reactants, activation energy peak, and products with energy released" 
             style="max-width: 450px; margin: 10px 0;" />
        
        Reference: BBC Bitesize - Energy Changes in Chemical Reactions
        
        (i) Is this reaction exothermic or endothermic? Give a reason for your answer.
        
        .....................................................................................................................................
        
        .....................................................................................................................................
                                                                                                                [2]
        
        (ii) Explain what is meant by activation energy.
        
        .....................................................................................................................................
        
        .....................................................................................................................................
                                                                                                                [2]
    
    (c) Describe how a catalyst affects the rate of a chemical reaction.
    
        .....................................................................................................................................
        
        .....................................................................................................................................
        
        .....................................................................................................................................
                                                                                                                [3]`
  ];
}

// Paper 4: Coursework Alternative Questions
function generatePaper4Questions(): string[] {
  return [
    `1  This question is about investigating the factors affecting plant growth.
    
    A student wants to investigate how different concentrations of fertilizer affect the growth of seedlings.
    
    (a) State the independent variable in this investigation.
    
        .....................................................................................................................................
                                                                                                                [1]
    
    (b) State two dependent variables that could be measured.
    
        1. .................................................................................................................................
        
        2. .................................................................................................................................
                                                                                                                [2]
    
    (c) State three variables that should be kept constant (controlled variables).
    
        1. .................................................................................................................................
        
        2. .................................................................................................................................
        
        3. .................................................................................................................................
                                                                                                                [3]
    
    (d) Describe a method for this investigation.
    
        .....................................................................................................................................
        
        .....................................................................................................................................
        
        .....................................................................................................................................
        
        .....................................................................................................................................
        
        .....................................................................................................................................
        
        .....................................................................................................................................
                                                                                                                [6]
    
    (e) The results are shown in the table.
    
        | Fertilizer concentration (%) | Average height after 2 weeks (cm) |
        |------------------------------|-----------------------------------|
        | 0                           | 8.2                               |
        | 0.5                         | 12.4                              |
        | 1.0                         | 15.8                              |
        | 1.5                         | 18.1                              |
        | 2.0                         | 16.9                              |
        
        (i) Plot a graph of these results.                                                                  [4]
        
        (ii) Describe the relationship shown by the graph.
        
        .....................................................................................................................................
        
        .....................................................................................................................................
                                                                                                                [2]
        
        (iii) Suggest an explanation for the results at 2.0% fertilizer concentration.
        
        .....................................................................................................................................
        
        .....................................................................................................................................
                                                                                                                [2]`
  ];
}

// Paper 5: Practical Test Questions
function generatePaper5Questions(): string[] {
  return [
    `1  You are provided with:
    • a measuring cylinder
    • a balance
    • samples of different liquids A, B, and C
    • a stopwatch
    
    The apparatus is shown in the diagram below.
    
    <img src="https://www.bbc.co.uk/bitesize/guides/zq8hpv4/images/measuring_cylinder_balance.png" 
         alt="Laboratory apparatus showing measuring cylinder and electronic balance" 
         style="max-width: 300px; margin: 10px 0;" />
    
    Reference: BBC Bitesize - Laboratory Equipment
    
    You are going to investigate the density of these liquids.
    
    (a) Describe how you would measure the volume of liquid A accurately using the measuring cylinder.
    
        .....................................................................................................................................
        
        .....................................................................................................................................
                                                                                                                [2]
    
    (b) Describe how you would measure the mass of liquid A using the balance.
    
        .....................................................................................................................................
        
        .....................................................................................................................................
                                                                                                                [2]
    
    (c) Write the equation for calculating density.
    
        density = ...........................................................
                                                                                                                [1]
    
    (d) Record your measurements and calculations in the table below.
    
        | Liquid | Volume (cm³) | Mass (g) | Density (g/cm³) |
        |--------|--------------|----------|-----------------|
        | A      |              |          |                 |
        | B      |              |          |                 |
        | C      |              |          |                 |
                                                                                                                [6]
    
    (e) The diagram shows the relative densities of the three liquids.
    
        <img src="https://www.bbc.co.uk/bitesize/guides/zq8hpv4/images/density_comparison.png" 
             alt="Three beakers showing liquids A, B, C with different density layers" 
             style="max-width: 350px; margin: 10px 0;" />
        
        Reference: BBC Bitesize - Density Comparison
        
        State which liquid has the highest density.
        
        .....................................................................................................................................
                                                                                                                [1]`
  ];
}

// Paper 6: Alternative to Practical Questions
function generatePaper6Questions(): string[] {
  return [
    `1  A student investigated the effect of temperature on the rate of reaction between magnesium and hydrochloric acid.
    
    The equation for the reaction is:
    Mg + 2HCl → MgCl₂ + H₂
    
    The apparatus used is shown in the diagram below.
    
    <img src="https://www.bbc.co.uk/bitesize/guides/zq8hpv4/images/gas_collection_apparatus.png" 
         alt="Gas collection apparatus showing conical flask with magnesium and HCl connected to measuring cylinder" 
         style="max-width: 400px; margin: 10px 0;" />
    
    Reference: BBC Bitesize - Gas Collection Methods
    
    (a) The student measured the volume of hydrogen gas produced at different temperatures.
    
        The results are shown in the table.
        
        | Temperature (°C) | Time for 50 cm³ of gas to be produced (s) |
        |------------------|-------------------------------------------|
        | 20               | 120                                       |
        | 30               | 80                                        |
        | 40               | 55                                        |
        | 50               | 40                                        |
        | 60               | 30                                        |
        
        (i) Calculate the rate of reaction at 40°C.
        
        rate = volume of gas ÷ time
        
        rate = ........................... cm³/s
                                                                                                                [2]
        
        (ii) Plot a graph of temperature against rate of reaction on the grid below.
        
        <img src="https://www.printablepaper.net/preview/graph-paper-1-cm" 
             alt="Graph paper grid for plotting temperature vs rate of reaction" 
             style="max-width: 400px; margin: 10px 0;" />
        
        Reference: Graph paper for data plotting
                                                                                                                [4]
        
        (iii) Describe the relationship shown by your graph.
        
        .....................................................................................................................................
        
        .....................................................................................................................................
                                                                                                                [2]
    
    (b) The diagram shows the particle model for this reaction.
    
        <img src="https://www.bbc.co.uk/bitesize/guides/zshb4qt/images/collision_theory_diagram.png" 
             alt="Particle collision diagram showing successful and unsuccessful collisions" 
             style="max-width: 350px; margin: 10px 0;" />
        
        Reference: BBC Bitesize - Collision Theory
        
        Explain, in terms of particle theory, why increasing temperature increases the rate of reaction.
        
        .....................................................................................................................................
        
        .....................................................................................................................................
        
        .....................................................................................................................................
                                                                                                                [3]
    
    (c) State two other factors that could affect the rate of this reaction.
    
        1. .................................................................................................................................
        
        2. .................................................................................................................................
                                                                                                                [2]`
  ];
}

// Render a brief preview of the first structured question (or parts) for selected paper
function renderStructuredPreview(paperNumber: string) {
  const map: Record<string, StructuredQuestion[]> = {
    '2': PAPER2_QUESTIONS,
    '3': PAPER3_QUESTIONS,
    '4': PAPER4_QUESTIONS,
    '5': PAPER5_QUESTIONS,
    '6': PAPER6_QUESTIONS
  };
  const bank = map[paperNumber] || [];
  if (!bank.length) return <div className="ml-4 text-xs text-gray-500">No preview available.</div>;
  const q = bank[0];
  const parts = q.parts.slice(0, Math.min(4, q.parts.length));
  return (
    <div className="ml-4 space-y-2 text-xs">
      <div className="font-medium">Question {q.number}</div>
      {parts.map((p: StructuredQuestion['parts'][number], i: number)=> (
        <div key={i} className="pl-2">{p.text}{p.marks ? <span className="text-[10px] ml-2">[{p.marks}]</span> : null}</div>
      ))}
      {q.parts.length > parts.length && <div className="italic text-gray-500">...more parts in full paper</div>}
    </div>
  );
}