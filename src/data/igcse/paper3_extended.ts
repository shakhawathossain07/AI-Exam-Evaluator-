import { StructuredQuestion } from './structured_types';

export const PAPER3_QUESTIONS: StructuredQuestion[] = [
  { number: '1', category: 'Biology', parts: [
      { text: 'Define the term enzyme.', marks: 2 },
      { text: 'Graph of enzyme activity vs temperature', kind: 'graph', refId: 'enzyme_temperature' },
      { text: 'State the optimum temperature for this enzyme.', marks: 1 },
      { text: 'Explain why enzyme activity decreases above the optimum temperature.', marks: 3 },
      { text: 'Describe an investigation of pH effect on enzyme activity.', marks: 4 }
    ]
  },
  { number: '2', category: 'Biology', parts: [
      { text: 'Explain lock and key model.', marks:3 },
      { text: 'Describe effect of substrate concentration on rate.', marks:3 },
      { text: 'Calculate rate from data given.', marks:2 }
    ] },
  { number: '3', category: 'Biology', parts: [
      { text: 'Define allele.', marks:1 },
      { text: 'State genotype of heterozygous round seed pea.', marks:1 },
      { text: 'Predict phenotypic ratio of monohybrid cross.', marks:2 },
      { text: 'Explain why observed ratios may differ.', marks:3 }
    ] },
  { number: '4', category: 'Physics', parts: [
      { text: 'State equation linking acceleration, change in velocity and time.', marks:1 },
      { text: 'Calculate acceleration from velocity change.', marks:2 },
      { text: 'Explain difference between mass and weight.', marks:3 }
    ] },
  { number: '5', category: 'Chemistry', parts: [
      { text: 'Define rate of reaction.', marks:1 },
      { text: 'Explain collision theory for concentration increase.', marks:2 },
      { text: 'Calculate average rate from gas volume/time.', marks:2 },
      { text: 'Suggest advantage of catalyst.', marks:1 },
      { text: 'Explain why powdered solids react faster.', marks:3 }
    ] },
  { number: '6', category: 'Physics', parts: [
      { text: 'State principle of conservation of energy.', marks:1 },
      { text: 'Calculate energy from power and time.', marks:2 },
      { text: 'Suggest two ways to reduce energy loss in a house.', marks:2 }
    ] },
  { number: '7', category: 'Biology', parts: [
      { text: 'Define trophic level.', marks:1 },
      { text: 'Explain energy loss between trophic levels.', marks:2 },
      { text: 'State two reasons for conserving biodiversity.', marks:2 }
    ] },
  { number: '8', category: 'Physics', parts: [
      { text: 'Calculate density of a block.', marks:2 },
      { text: 'Calculate voltage from current and resistance.', marks:2 },
      { text: 'Calculate moles from mass and Mr.', marks:1 },
      { text: 'Explain one safety precaution when heating chemicals.', marks:1 }
    ] },
  { number: '9', category: 'Chemistry', parts: [
      { text: 'Explain why increasing temperature increases diffusion.', marks:3 },
      { text: 'Transformer turns and voltage calculation.', marks:2 }
    ] },
  { number: '10', category: 'Biology', parts: [
      { text: 'Describe natural selection.', marks:3 },
      { text: 'Explain role of mutation in variation.', marks:2 },
      { text: 'Define adaptation.', marks:2 }
    ] },
  { number: '11', category: 'Chemistry', parts: [
      { text: 'Explain greenhouse effect basics.', marks:3 },
      { text: 'State two greenhouse gases.', marks:2 },
      { text: 'Suggest one way to reduce carbon emissions.', marks:2 }
    ] },
  { number: '12', category: 'Physics', parts: [
      { text: 'State law of conservation of momentum.', marks:2 },
      { text: 'Calculate momentum of moving object.', marks:2 },
      { text: 'Explain impulse concept.', marks:2 }
    ] }
];
