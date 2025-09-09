import { StructuredQuestion } from './structured_types';

export const PAPER5_QUESTIONS: StructuredQuestion[] = [
  { number: '1', category: 'Practical Skills', parts: [
      { text: 'Measure volume of liquid accurately.', marks: 2 },
      { text: 'Measure mass on balance.', marks: 2 },
      { text: 'State equation for density.', marks: 1 },
      { text: 'Record measurements in table.', marks: 6 },
      { text: 'Identify highest density.', marks: 1 }
    ] },
  { number: '2', category: 'Practical Skills', parts: [
      { text: 'Plan experiment to determine boiling point of unknown liquid.', marks:4 },
      { text: 'List safety precautions.', marks:3 },
      { text: 'Describe data table structure.', marks:3 },
      { text: 'Explain how to improve accuracy.', marks:3 }
    ] },
  { number: '3', category: 'Practical Skills', parts: [
      { text: 'Investigate effect of concentration on reaction rate: outline method.', marks:5 },
      { text: 'State variable to measure.', marks:1 },
      { text: 'Controlled variables list.', marks:3 },
      { text: 'Sample rate calculation.', marks:2 },
      { text: 'Suggest improvement for precision.', marks:2 }
    ] },
  { number: '4', category: 'Practical Skills', parts: [
      { text: 'Design experiment to measure plant transpiration.', marks:5 },
      { text: 'Apparatus justification.', marks:3 },
      { text: 'Data recording method.', marks:3 },
      { text: 'Error sources and mitigation.', marks:3 }
    ] },
  { number: '5', category: 'Practical Skills', parts: [
      { text: 'Plan test to determine energy content of a food sample.', marks:5 },
      { text: 'State formula for energy calculation.', marks:2 },
      { text: 'List safety measures.', marks:2 },
      { text: 'Suggest improvement for heat loss reduction.', marks:2 }
    ] }
];
