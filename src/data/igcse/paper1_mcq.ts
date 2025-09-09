// Externalized MCQ question bank for IGCSE Combined Science 0653 Paper 1
// NOTE: All questions are original rephrasings or generic science facts to avoid copyright issues.
export interface MCQItem {
  id: string;
  subject: 'Biology' | 'Chemistry' | 'Physics';
  question: string;
  options: string[]; // prefixed with letter formatting (A ...)
  marks?: number; // default 1
  diagramType?: string; // matches internal drawing helpers
}

export const PAPER1_MCQ_BANK: MCQItem[] = [
  { id: 'bio_cell_membrane', subject: 'Biology', question: 'Which structure controls movement of substances into and out of a cell?', options: ['A  cell wall', 'B  cell membrane', 'C  cytoplasm', 'D  vacuole'] },
  { id: 'bio_photosynthesis', subject: 'Biology', question: 'The process by which green plants synthesise glucose is', options: ['A  respiration', 'B  photosynthesis', 'C  fermentation', 'D  transpiration'] },
  { id: 'bio_blood_transport', subject: 'Biology', question: 'Which blood vessel carries oxygenated blood from the heart to the body?', options: ['A  vena cava', 'B  pulmonary vein', 'C  aorta', 'D  pulmonary artery'] },
  { id: 'chem_atomic_number', subject: 'Chemistry', question: 'The atomic number of an element is the number of', options: ['A  neutrons', 'B  protons', 'C  electrons + neutrons', 'D  protons + neutrons'] },
  { id: 'chem_compound', subject: 'Chemistry', question: 'Which of these is a compound?', options: ['A  oxygen', 'B  nitrogen', 'C  water', 'D  hydrogen'] },
  { id: 'chem_neutral_ph', subject: 'Chemistry', question: 'The pH of a neutral aqueous solution at 25°C is', options: ['A  0', 'B  3', 'C  7', 'D  14'] },
  { id: 'phys_current_unit', subject: 'Physics', question: 'The SI unit of electric current is the', options: ['A  volt', 'B  ampere', 'C  coulomb', 'D  ohm'] },
  { id: 'phys_wave_type', subject: 'Physics', question: 'Sound in air is transmitted as', options: ['A  transverse waves', 'B  longitudinal waves', 'C  electromagnetic waves', 'D  standing waves'] },
  { id: 'phys_friction', subject: 'Physics', question: 'The force opposing relative motion between surfaces is', options: ['A  friction', 'B  tension', 'C  weight', 'D  lift'] },
  { id: 'phys_em_radio', subject: 'Physics', question: 'Which electromagnetic radiation has the longest wavelength?', options: ['A  X-rays', 'B  radio waves', 'C  infrared', 'D  ultraviolet'] },
  // Additional questions to reach 40 unique items (all original, generic syllabus-aligned)
  { id: 'bio_enzyme_temp', subject: 'Biology', question: 'Enzymes are best described as', options: ['A  lipids', 'B  biological catalysts', 'C  hormones', 'D  nucleic acids'] },
  { id: 'bio_diffusion', subject: 'Biology', question: 'Diffusion is the net movement of particles from', options: ['A  low to high concentration', 'B  high to low concentration', 'C  low to high temperature', 'D  high pressure to low pressure'] },
  { id: 'bio_respiration', subject: 'Biology', question: 'Aerobic respiration releases energy using', options: ['A  oxygen', 'B  nitrogen', 'C  carbon monoxide', 'D  chlorine'] },
  { id: 'bio_transpiration', subject: 'Biology', question: 'Loss of water vapour from leaves mainly occurs through the', options: ['A  cuticle', 'B  stomata', 'C  xylem', 'D  phloem'] },
  { id: 'bio_villi', subject: 'Biology', question: 'Villi increase the efficiency of absorption by providing', options: ['A  digestive enzymes', 'B  greater surface area', 'C  movement by cilia', 'D  muscular contractions'] },
  { id: 'bio_chlorophyll_role', subject: 'Biology', question: 'Chlorophyll is needed in photosynthesis to', options: ['A  absorb light energy', 'B  fix nitrogen', 'C  produce minerals', 'D  control water loss'] },
  { id: 'bio_protein_building', subject: 'Biology', question: 'The basic units of proteins are', options: ['A  fatty acids', 'B  simple sugars', 'C  amino acids', 'D  nucleotides'] },
  { id: 'bio_vaccination', subject: 'Biology', question: 'Vaccination provides protection mainly by stimulating', options: ['A  antibody production', 'B  digestion', 'C  transpiration', 'D  mitosis in muscles'] },
  { id: 'chem_state_change', subject: 'Chemistry', question: 'Evaporation involves a change from', options: ['A  gas to liquid', 'B  solid to gas', 'C  liquid to gas', 'D  solid to liquid'] },
  { id: 'chem_valency', subject: 'Chemistry', question: 'A calcium atom (atomic number 20) forms an ion by', options: ['A  gaining 1 electron', 'B  gaining 2 electrons', 'C  losing 1 electron', 'D  losing 2 electrons'] },
  { id: 'chem_mixture', subject: 'Chemistry', question: 'Air is best described as a', options: ['A  compound', 'B  element', 'C  mixture', 'D  molecule'] },
  { id: 'chem_period_group', subject: 'Chemistry', question: 'Elements in the same group of the Periodic Table have similar', options: ['A  densities', 'B  atomic masses', 'C  chemical properties', 'D  melting points'] },
  { id: 'chem_ph_indicator', subject: 'Chemistry', question: 'An indicator changes colour because of differences in', options: ['A  pressure', 'B  temperature', 'C  pH', 'D  volume'] },
  { id: 'chem_rate_surface', subject: 'Chemistry', question: 'Increasing surface area of a solid reactant usually', options: ['A  decreases rate', 'B  increases rate', 'C  stops the reaction', 'D  changes products formed'] },
  { id: 'chem_fractional', subject: 'Chemistry', question: 'Fractional distillation separates liquids by differences in', options: ['A  colour', 'B  boiling point', 'C  density', 'D  pH'] },
  { id: 'chem_acid_metal', subject: 'Chemistry', question: 'An acid reacting with a metal produces a salt and', options: ['A  oxygen', 'B  hydrogen', 'C  chlorine', 'D  nitrogen'] },
  { id: 'phys_speed_def', subject: 'Physics', question: 'Speed is defined as', options: ['A  distance × time', 'B  distance ÷ time', 'C  time ÷ distance', 'D  acceleration × time'] },
  { id: 'phys_density', subject: 'Physics', question: 'Density is mass divided by', options: ['A  area', 'B  length', 'C  volume', 'D  time'] },
  { id: 'phys_energy_unit', subject: 'Physics', question: 'The SI unit of energy is the', options: ['A  joule', 'B  watt', 'C  newton', 'D  pascal'] },
  { id: 'phys_force_calc', subject: 'Physics', question: 'Force can be calculated using', options: ['A  mass × acceleration', 'B  mass ÷ acceleration', 'C  acceleration ÷ mass', 'D  mass × speed'] },
  { id: 'phys_gravity', subject: 'Physics', question: 'Objects fall towards Earth mainly because of', options: ['A  friction', 'B  air resistance', 'C  magnetism', 'D  gravity'] },
  { id: 'phys_reflection', subject: 'Physics', question: 'The angle of incidence equals the angle of', options: ['A  deviation', 'B  diffraction', 'C  refraction', 'D  reflection'] },
  { id: 'phys_series_current', subject: 'Physics', question: 'In a simple series circuit the current is', options: ['A  different everywhere', 'B  zero in wires', 'C  the same at all points', 'D  only in the battery'] },
  { id: 'phys_light_medium', subject: 'Physics', question: 'Light slows down when it enters glass because', options: ['A  glass is colder', 'B  frequency decreases', 'C  it is a denser medium', 'D  wavelength increases'] },
  { id: 'phys_moment', subject: 'Physics', question: 'A moment is the product of force and', options: ['A  distance from pivot', 'B  time applied', 'C  velocity', 'D  energy'] },
  { id: 'phys_insulator', subject: 'Physics', question: 'A good electrical insulator has', options: ['A  many free electrons', 'B  high conductivity', 'C  few free electrons', 'D  zero resistance'] },
  { id: 'bio_pathogen', subject: 'Biology', question: 'A pathogen is an organism that', options: ['A  decomposes waste', 'B  causes disease', 'C  fixes nitrogen', 'D  absorbs sunlight'] },
  { id: 'chem_exothermic', subject: 'Chemistry', question: 'An exothermic reaction', options: ['A  absorbs heat', 'B  releases heat', 'C  needs light only', 'D  always forms gas'] },
  { id: 'chem_electrolysis', subject: 'Chemistry', question: 'Electrolysis involves decomposition using', options: ['A  light', 'B  pressure', 'C  electricity', 'D  catalysts'] },
  { id: 'phys_pressure', subject: 'Physics', question: 'Pressure on a surface is force divided by', options: ['A  area', 'B  length', 'C  mass', 'D  volume'] },
  { id: 'phys_kinetic', subject: 'Physics', question: 'Kinetic energy increases when', options: ['A  speed decreases', 'B  mass decreases', 'C  speed increases', 'D  object rests'] },
  { id: 'bio_food_chain', subject: 'Biology', question: 'In a food chain, energy is transferred between', options: ['A  decomposers and water', 'B  trophic levels', 'C  soils only', 'D  minerals only'] },
  { id: 'chem_catalyst', subject: 'Chemistry', question: 'A catalyst increases reaction rate by', options: ['A  being consumed', 'B  lowering activation energy', 'C  raising temperature permanently', 'D  changing products'] },
  { id: 'phys_work', subject: 'Physics', question: 'Work done equals force ×', options: ['A  distance moved', 'B  acceleration', 'C  pressure', 'D  momentum'] },
];
