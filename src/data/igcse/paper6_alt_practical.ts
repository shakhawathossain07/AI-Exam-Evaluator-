import { StructuredQuestion } from './structured_types';

export const PAPER6_QUESTIONS: StructuredQuestion[] = [
  { number: '1', category: 'Practical Skills', parts: [
      { text: 'Calculate rate at 40°C.', marks: 2 },
      { text: 'Graph temperature vs rate', kind: 'graph', refId: 'rate_temp_graph' },
      { text: 'Describe relationship.', marks: 2 },
      { text: 'Explain collision theory temperature effect.', marks: 3 },
      { text: 'State two other factors affecting rate.', marks: 2 }
    ] },
  { number: '2', category: 'Practical Skills', parts: [
      { text: 'Describe observation when magnesium reacts with acid.', marks:2 },
      { text: 'Explain effect of increasing surface area.', marks:2 },
      { text: 'Suggest control variable.', marks:1 },
      { text: 'State one safety precaution.', marks:1 }
    ] },
  { number: '3', category: 'Practical Skills', parts: [
      { text: 'Describe method to test for presence of starch.', marks:2 },
      { text: 'Explain colour change.', marks:2 },
      { text: 'State a control test.', marks:1 },
      { text: 'Explain importance of control.', marks:2 }
    ] },
  { number: '4', category: 'Practical Skills', parts: [
      { text: 'Outline test for carbon dioxide gas.', marks:2 },
      { text: 'State observation for positive result.', marks:1 },
      { text: 'Explain limewater reaction.', marks:2 }
    ] },
  { number: '5', category: 'Practical Skills', parts: [
      { text: 'Plan method to determine density of irregular solid.', marks:3 },
      { text: 'List apparatus.', marks:2 },
      { text: 'State formula used.', marks:1 },
      { text: 'Explain step ensuring accuracy.', marks:2 }
    ] },
  { number: '6', category: 'Practical Skills', parts: [
      { text: 'Describe test to identify reducing sugar.', marks:2 },
      { text: 'Explain colour sequence with increasing sugar.', marks:2 },
      { text: 'State why water bath is used.', marks:1 },
      { text: 'Give one error source and improvement.', marks:2 }
    ] },
  { number: '7', category: 'Practical Skills', parts: [
      { text: 'Outline test for protein.', marks:2 },
      { text: 'State colour change for positive test.', marks:1 },
      { text: 'Explain why control is needed.', marks:2 }
    ] },
  { number: '8', category: 'Practical Skills', parts: [
      { text: 'Describe method to determine rate of photosynthesis using counting bubbles.', marks:3 },
      { text: 'List two variables to control.', marks:2 },
      { text: 'Suggest improvement for more accurate rate measurement.', marks:2 }
    ] }
  ,{ number: '9', category: 'Practical Skills', parts: [
      { text: 'Describe how to obtain a pure dry sample of a soluble salt from an acid and an insoluble base.', marks:3 },
      { text: 'State one safety precaution and explain its purpose.', marks:2 },
      { text: 'Explain why gentle warming is used before filtration.', marks:1 }
    ] }
];
