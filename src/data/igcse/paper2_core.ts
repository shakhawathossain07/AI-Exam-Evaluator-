import { StructuredQuestion } from './structured_types';

// Core Theory Paper 2 sample bank (abbreviated) - marks align to 80 target when aggregated
export const PAPER2_QUESTIONS: StructuredQuestion[] = [
  {
    number: '1',
  category: 'Biology',
    parts: [
      { text: 'State the function of the following parts of a plant cell:', marks: 0 },
      { text: '(i) cell wall', marks: 1 },
      { text: '(ii) chloroplast', marks: 1 },
      { text: 'Diagram of plant cell', kind: 'diagram', refId: 'plant_cell' },
      { text: 'Label the parts A, B and C on the diagram.', marks: 3 },
      { text: 'Name one part shown in the diagram not found in animal cells.', marks: 1 }
    ]
  },
  {
    number: '2',
  category: 'Biology',
    parts: [
      { text: 'Complete the word equation for photosynthesis.', marks: 2 },
      { text: 'State two conditions needed for photosynthesis to occur.', marks: 2 },
      { text: 'Explain why photosynthesis is important for life on Earth.', marks: 2 }
    ]
  },
  { number: '3', category: 'Chemistry', parts: [
      { text: 'Complete the table to show properties of states of matter', kind: 'table', refId: 'states_of_matter' },
      { text: 'Explain in particle terms what happens when a solid melts.', marks: 2 },
      { text: 'Describe arrangement of particles in a gas.', marks: 2 }
    ] },
  { number: '4', category: 'Physics', parts: [
      { text: 'Simple circuit diagram', kind:'diagram', refId:'simple_circuit' },
      { text: 'State the purpose of a switch.', marks:1 },
      { text: 'State what an ammeter measures.', marks:1 },
      { text: 'State Ohm\'s law.', marks:2 },
      { text: 'Calculate resistance given V and I.', marks:2 }
    ] },
  { number: '5', category: 'Biology', parts: [
      { text: 'Name the enzyme that breaks down starch.', marks:1 },
      { text: 'State where amylase is produced.', marks:1 },
      { text: 'Explain why enzymes are important in digestion.', marks:3 }
    ] },
  { number: '6', category: 'Chemistry', parts: [
      { text: 'State pH of pure water.', marks:1 },
      { text: 'Name an indicator for acids and bases.', marks:1 },
      { text: 'Complete: acid + base -> ___ + ___', marks:2 }
    ] },
  { number: '7', category: 'Physics', parts: [
      { text: 'State Newton\'s first law.', marks:2 },
      { text: 'A car travels 100 m in 20 s. Calculate average speed.', marks:2 }
    ] },
  { number: '8', category: 'Biology', parts: [
      { text: 'Define diffusion.', marks:2 },
      { text: 'Explain how temperature affects diffusion rate.', marks:2 }
    ] },
  { number: '9', category: 'Biology', parts: [
      { text: 'Explain one adaptation of red blood cells.', marks:2 },
      { text: 'Describe function of haemoglobin.', marks:2 }
    ] },
  { number: '10', category: 'Chemistry', parts: [
      { text: 'State one environmental problem caused by plastic waste.', marks:2 },
      { text: 'Suggest one method to reduce plastic pollution.', marks:2 }
    ] },
  { number: '11', category: 'Biology', parts: [
      { text: 'Describe the process of respiration (word equation).', marks:2 },
      { text: 'Explain difference between aerobic and anaerobic respiration.', marks:3 },
      { text: 'State one use of energy in cells.', marks:2 }
    ] },
  { number: '12', category: 'Biology', parts: [
      { text: 'Define ecosystem.', marks:2 },
      { text: 'State two abiotic factors affecting plant distribution.', marks:2 },
      { text: 'Explain why food chains rarely have more than five trophic levels.', marks:3 }
    ] },
  { number: '13', category: 'Chemistry', parts: [
      { text: 'State what is meant by neutralisation.', marks:2 },
      { text: 'Describe test for carbon dioxide gas.', marks:2 },
      { text: 'Explain why acids react with metals to form salts and hydrogen.', marks:3 },
      { text: 'Predict products of hydrochloric acid and sodium hydroxide.', marks:2 }
    ] },
  { number: '14', category: 'Physics', parts: [
      { text: 'Define potential difference.', marks:2 },
      { text: 'Explain why adding more bulbs in parallel changes current.', marks:3 },
      { text: 'Calculate current given charge and time.', marks:2 },
      { text: 'State unit of resistance.', marks:1 },
      { text: 'Explain energy transfer in a battery-powered lamp.', marks:3 }
    ] }
];
