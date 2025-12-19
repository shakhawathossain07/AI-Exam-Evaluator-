import { StructuredQuestion } from './structured_types';

export const PAPER4_QUESTIONS: StructuredQuestion[] = [
  { number: '1', category: 'Planning', parts: [
      { text: 'Investigate fertilizer concentration effect on growth: identify independent variable.', marks: 1 },
      { text: 'State two dependent variables.', marks: 2 },
      { text: 'State three controlled variables.', marks: 3 },
      { text: 'Describe the experimental method.', marks: 6 },
      { text: 'Table of fertilizer vs height', kind: 'table', refId: 'fertilizer_growth' },
      { text: 'Plot a graph of the results.', marks: 4 },
      { text: 'Describe the relationship.', marks: 2 },
      { text: 'Explain result at highest concentration.', marks: 2 }
    ] },
  { number: '2', category: 'Planning', parts: [
      { text: 'Design investigation: effect of pH on enzyme X (state independent variable).', marks:1 },
      { text: 'State dependent variable.', marks:1 },
      { text: 'List three controlled variables.', marks:3 },
      { text: 'Outline method steps.', marks:6 },
      { text: 'Describe data presentation.', marks:2 },
      { text: 'State one source of error and improvement.', marks:2 },
      { text: 'Explain how results support conclusion.', marks:2 }
    ] },
  { number: '3', category: 'Planning', parts: [
      { text: 'Planning detail for investigating rate vs temperature.', marks:4 },
      { text: 'Risk assessment safety measures.', marks:3 },
      { text: 'Design data collection table.', marks:4 },
      { text: 'Show sample calculation.', marks:4 },
      { text: 'Evaluate method improvements.', marks:3 }
    ] },
  { number: '4', category: 'Practical Skills', parts: [
      { text: 'Investigate osmosis in potato cores: hypothesis.', marks:2 },
      { text: 'List variables to control.', marks:3 },
      { text: 'Method outline with volumes and timing.', marks:5 },
      { text: 'Plot % change vs concentration graph description.', marks:3 },
      { text: 'Determine isotonic point from graph.', marks:2 },
      { text: 'Sources of error & improvements.', marks:3 }
    ] },
  { number: '5', category: 'Analysis & Evaluation', parts: [
      { text: 'Plan investigation into effect of light intensity on photosynthesis.', marks:5 },
      { text: 'Identify independent variable scale.', marks:2 },
      { text: 'Controlled variables list.', marks:3 },
      { text: 'Data table design requirements.', marks:3 },
      { text: 'Graph features (axes, units).', marks:2 },
      { text: 'Conclusion from hypothetical trend.', marks:2 },
      { text: 'Evaluation of limitations.', marks:3 }
    ] },
  { number: '6', category: 'Analysis & Evaluation', parts: [
      { text: 'Design experiment to measure reaction rate with catalyst.', marks:5 },
      { text: 'Apparatus justification.', marks:3 },
      { text: 'Data recording format.', marks:3 },
      { text: 'Analytical approach (rate calculation).', marks:3 },
      { text: 'Safety considerations.', marks:3 },
      { text: 'Improvements for reliability.', marks:3 }
    ] },
  { number: '7', category: 'Practical Skills', parts: [
      { text: 'Plan investigation to determine factors affecting transpiration rate (outline).', marks:5 },
      { text: 'Describe method for measuring mass loss.', marks:4 },
      { text: 'List three environmental variables to control.', marks:3 },
      { text: 'Suggest two improvements to increase reliability.', marks:2 },
      { text: 'Explain how results inform plant adaptations.', marks:3 }
    ] }
];
