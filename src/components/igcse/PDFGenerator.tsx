import jsPDF from 'jspdf';
import { PAPER1_MCQ_BANK } from '../../data/igcse/paper1_mcq';
import { PAPER2_QUESTIONS } from '../../data/igcse/paper2_core';
import { PAPER3_QUESTIONS } from '../../data/igcse/paper3_extended';
import { PAPER4_QUESTIONS } from '../../data/igcse/paper4_coursework_alt';
import { PAPER5_QUESTIONS } from '../../data/igcse/paper5_practical';
import { PAPER6_QUESTIONS } from '../../data/igcse/paper6_alt_practical';
import { StructuredQuestion } from '../../data/igcse/structured_types';
import { PAPER_BLUEPRINTS, PaperBlueprint } from '../../data/igcse/exam_blueprints';

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

export class CambridgePDFGenerator {
  private doc: jsPDF;
  private pageHeight: number;
  private pageWidth: number;
  private margin: number;
  private currentY: number;
  private lineHeight: number;
  private totalMarksAllocated: number;
  private questionMarkBreakdown: { number: string; marks: number }[];
  private categorySet: Set<string>;
  private targetMarks: number | null;
  private random: () => number;
  private lastConfig: QuestionPaperConfig | null;

  constructor() {
    this.doc = new jsPDF('p', 'mm', 'a4');
    this.pageHeight = 297;
    this.pageWidth = 210;
    this.margin = 20;
    this.currentY = this.margin;
    this.lineHeight = 6;
  this.totalMarksAllocated = 0;
  this.questionMarkBreakdown = [];
  this.categorySet = new Set();
  this.targetMarks = null;
  this.random = Math.random; // default, can be overridden with seed
  this.lastConfig = null;
  }

  setSeed(seed: string) {
    // Simple xorshift32 for reproducible generation
    let h = 2166136261 >>> 0;
    for (let i=0;i<seed.length;i++) {
      h ^= seed.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    let state = h >>> 0;
    this.random = () => {
      state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
      return ((state >>> 0) / 0xFFFFFFFF);
    };
  }

  async generatePaper(config: QuestionPaperConfig): Promise<void> {
    // Main orchestrator (async reserved for future remote assets if needed)
  this.totalMarksAllocated = 0; // reset accumulator
    this.targetMarks = this.getPaperMarks(config.paperNumber);
  this.lastConfig = config;
    this.addCambridgeHeader(config);
    this.addInstructions(config);
    await this.addQuestions(config);
  this.addMarkSummary();
    this.addFooter();
  this.auditMarks();
  }

  private addCambridgeHeader(config: QuestionPaperConfig): void {
    // Cambridge logo area (placeholder)
    this.doc.setFontSize(10);
    this.doc.text('CAMBRIDGE INTERNATIONAL EXAMINATIONS', this.pageWidth / 2, 15, { align: 'center' });
    
    this.currentY = 25;
    this.doc.setFontSize(9);
    this.doc.text('Cambridge International General Certificate of Secondary Education', this.pageWidth / 2, this.currentY, { align: 'center' });
    
    this.currentY += 15;
    
    // Subject and paper info
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    
    const leftText = 'SCIENCE – COMBINED';
    const rightText = `0653/${config.paperNumber}${config.variant}`;
    
    this.doc.text(leftText, this.margin, this.currentY);
    this.doc.text(rightText, this.pageWidth - this.margin, this.currentY, { align: 'right' });
    
    this.currentY += 8;
    
    const paperText = `Paper ${config.paperNumber}`;
    const sessionText = `${config.session.toUpperCase()}/${config.year}`;
    
    this.doc.text(paperText, this.margin, this.currentY);
    this.doc.text(sessionText, this.pageWidth - this.margin, this.currentY, { align: 'right' });
    
    this.currentY += 15;
    
    // Duration
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`${this.getPaperDuration(config.paperNumber)} minutes`, this.pageWidth - this.margin, this.currentY, { align: 'right' });
    
    this.currentY += 10;
    
    // Additional materials line
    this.doc.setFontSize(9);
    this.doc.text('Candidates answer on the Question Paper.', this.margin, this.currentY);
    this.currentY += 5;
    this.doc.text('No additional materials are required.', this.margin, this.currentY);
    
    this.currentY += 15;
  }

  private addInstructions(config: QuestionPaperConfig): void {
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('READ THESE INSTRUCTIONS FIRST', this.margin, this.currentY);
    
    this.currentY += 10;
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9);
    
    const instructions = [
      'Write your Centre number, candidate number and name on all the work you hand in.',
      'Write in dark blue or black pen.',
      'You may use an HB pencil for any diagrams or graphs.',
      'Do not use staples, paper clips, glue or correction fluid.',
      'DO NOT WRITE IN ANY BARCODES.',
      '',
      'Answer all questions.',
      '',
      'The use of an approved scientific calculator is expected, where appropriate.',
      'You may lose marks if you do not show your working or if you do not use appropriate units.',
      '',
      'At the end of the examination, fasten all your work securely together.',
      '',
      'The number of marks is given in brackets [ ] at the end of each question or part question.'
    ];

    instructions.forEach(instruction => {
      if (instruction === '') {
        this.currentY += 3;
      } else {
        this.addWrappedText(instruction, this.margin, this.currentY, this.pageWidth - 2 * this.margin);
        this.currentY += 5;
      }
    });

    this.currentY += 10;

    // Student information boxes
    this.addStudentInfoBoxes();

    // Examiner use box
    this.doc.rect(this.pageWidth - 60, this.currentY, 40, 20);
    this.doc.setFontSize(8);
    this.doc.text('For Examiner\'s Use', this.pageWidth - 40, this.currentY + 5, { align: 'center' });
    this.doc.text(`Total: ${this.getPaperMarks(config.paperNumber)}`, this.pageWidth - 40, this.currentY + 15, { align: 'center' });

    this.currentY += 25;

    // Document info
    this.doc.setFontSize(8);
    this.doc.text('This document consists of 8 printed pages.', this.margin, this.currentY);
    this.currentY += 8;
    this.doc.text(`© UCLES ${config.year}`, this.margin, this.currentY);
    this.doc.text('[Turn over', this.pageWidth - this.margin, this.currentY, { align: 'right' });

    this.currentY += 15;
  }

  private addStudentInfoBoxes(): void {
    // Centre Number box
    this.doc.rect(this.margin, this.currentY, 50, 15);
    this.doc.setFontSize(8);
    this.doc.text('Centre Number', this.margin + 2, this.currentY + 5);
    
    // Candidate Number box
    this.doc.rect(this.margin + 55, this.currentY, 50, 15);
    this.doc.text('Candidate Number', this.margin + 57, this.currentY + 5);
    
    // Name box
    this.doc.rect(this.margin + 110, this.currentY, 60, 15);
    this.doc.text('Candidate Name', this.margin + 112, this.currentY + 5);
    
    this.currentY += 20;
  }

  private async addQuestions(config: QuestionPaperConfig): Promise<void> {
    if (config.paperNumber === '1') {
      this.addMultipleChoiceQuestions();
    } else if (config.paperNumber === '2') {
      this.addPaper2Questions();
    } else if (config.paperNumber === '3') {
  this.addPaper3Questions();
    } else if (config.paperNumber === '4') {
      this.addPaper4Questions();
    } else if (config.paperNumber === '5') {
      this.addPaper5Questions();
    } else if (config.paperNumber === '6') {
      this.addPaper6Questions();
    }
  }

  private addMultipleChoiceQuestions(): void {
    // Shuffle question bank deterministically if seed set
    const pool = [...PAPER1_MCQ_BANK];
    for (let i = pool.length -1; i > 0; i--) {
      const j = Math.floor(this.random()* (i+1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const needed = 40;
    const selected = pool.slice(0, Math.min(needed, pool.length));
    selected.forEach((question, idx) => {
      const qNum = idx + 1;
      if (this.currentY > this.pageHeight - 50) {
        this.doc.addPage();
        this.currentY = this.margin;
        this.addPageHeader(qNum);
      }
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.addWrappedText(`${qNum}  ${question.question}`, this.margin, this.currentY, this.pageWidth - 2 * this.margin);
      this.currentY += 8;
      question.options.forEach(option => {
        this.doc.text(`    ${option}`, this.margin + 5, this.currentY);
        this.currentY += 5;
      });
      this.currentY += 6;
      this.totalMarksAllocated += 1;
      const existing = this.questionMarkBreakdown.find(q=>q.number===String(qNum));
      if (existing) existing.marks += 1; else this.questionMarkBreakdown.push({number:String(qNum), marks:1});
    });
  }

  private addPaper2Questions(): void {
  // Use structured question bank for Paper 2
  this.addStructured(PAPER2_QUESTIONS, this.getPaperMarks('2'));
  }

  private addPaper3Questions(): void {
  // Use structured question bank for Paper 3
  this.addStructured(PAPER3_QUESTIONS, this.getPaperMarks('3'));
  }

  private addPaper4Questions(): void {
  // Use structured question bank for Paper 4
  this.addStructured(PAPER4_QUESTIONS, this.getPaperMarks('4'));
  }

  private addPaper5Questions(): void {
  // Use structured question bank for Paper 5
  this.addStructured(PAPER5_QUESTIONS, this.getPaperMarks('5'));
  }

  private addPaper6Questions(): void {
  // Use structured question bank for Paper 6
  this.addStructured(PAPER6_QUESTIONS, this.getPaperMarks('6'));
  }

  private addSimpleQuestion(questionNumber: string, lines: string[]): void {
    // Page break if near bottom
    if (this.currentY > this.pageHeight - 70) {
      this.doc.addPage();
      this.currentY = this.margin;
      this.addRunningHeader();
    }
    this.doc.setFontSize(10);
    this.doc.setFont('times','normal');
    const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
    let partIndex = 0;
    let questionMarks = 0;
    const baseIndent = this.margin;
    const partIndent = baseIndent + 8;

    for (const raw of lines) {
      let line = raw.trim();
      const isDiagram = /^\[DIAGRAM:/.test(line);
      const isTable = /^\[TABLE:/.test(line);
      const isGraph = /^\[GRAPH:/.test(line);
      const markMatch = line.match(/\[(\d+)\]\s*$/);
      let partMarks = 0;
      if (markMatch) {
        partMarks = parseInt(markMatch[1],10);
        questionMarks += partMarks;
        line = line.replace(/\s*\[\d+\]\s*$/,'');
      }
      if (isDiagram) {
        const type = line.replace('[DIAGRAM:','').replace(']','').trim();
        this.drawDiagram(type);
        continue;
      }
      if (isTable) {
        const type = line.replace('[TABLE:','').replace(']','').trim();
        this.drawTable(type);
        continue;
      }
      if (isGraph) {
        const type = line.replace('[GRAPH:','').replace(']','').trim();
        this.drawGraph(type);
        continue;
      }
      if (!line) { this.currentY += 3; continue; }
      const prefix = `(${letters[partIndex]}) `;
      const textToRender = partIndex===0 ? `${questionNumber} ${prefix}${line}` : `${prefix}${line}`;
      partIndex++;
      const markGutter = 16;
      const textWidth = this.pageWidth - 2*this.margin - markGutter;
      this.addWrappedText(textToRender, partIndex===1? baseIndent : partIndent, this.currentY, textWidth);
      const markY = this.currentY - this.lineHeight + 1.5;
      if (partMarks>0) {
        this.doc.setFont('times','bold');
        this.doc.text(`[${partMarks}]`, this.pageWidth - this.margin - 1, markY, {align:'right'});
        this.doc.setFont('times','normal');
      }
      if (partMarks>0 && !isDiagram && !isTable && !isGraph) {
        const answerLines = Math.max(1, Math.min(8, Math.ceil(partMarks/2)));
        for (let i=0;i<answerLines;i++) {
          this.doc.line(partIndent, this.currentY, this.pageWidth - this.margin, this.currentY);
          this.currentY += this.lineHeight;
        }
      } else {
        this.currentY += 2;
      }
      if (this.currentY > this.pageHeight - 40) {
        this.doc.addPage();
        this.currentY = this.margin;
        this.addRunningHeader();
      }
    }
    this.totalMarksAllocated += questionMarks;
    this.currentY += 4;
  }

  // --- Drawing helpers for diagrams, tables, graphs ---
  private ensureSpace(height: number): void {
    if (this.currentY + height > this.pageHeight - 20) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
  }

  private drawDiagram(type: string): void {
    this.doc.setFontSize(8);
    switch (type) {
      case 'plant_cell': {
        this.ensureSpace(55);
        const x = this.margin + 10;
        const y = this.currentY;
        this.doc.setDrawColor(0);
        this.doc.rect(x, y, 60, 40); // cell wall
        this.doc.setFillColor(230, 255, 230);
        this.doc.rect(x+2, y+2, 56, 36); // cell membrane area
        // nucleus
        this.doc.setFillColor(255, 235, 235);
        this.doc.circle(x+42, y+20, 8, 'FD');
        this.doc.text('nucleus', x+37, y+20);
        // chloroplasts
        this.doc.setFillColor(180, 240, 180);
        for (let i=0;i<4;i++) {
          this.doc.ellipse(x+15, y+8 + i*7, 8, 3, 'F');
        }
        this.doc.text('A', x-3, y+5);
        this.doc.text('B', x-3, y+20);
        this.doc.text('C', x-3, y+35);
        this.currentY += 50;
        break;
      }
      case 'simple_circuit': {
        this.ensureSpace(45);
        const x = this.margin + 10;
        const y = this.currentY;
        // battery
        this.doc.line(x, y+10, x+15, y+10);
        this.doc.line(x+15, y+6, x+15, y+14);
        this.doc.line(x+18, y+6, x+18, y+14);
        this.doc.line(x+18, y+10, x+45, y+10); // wire to lamp
        // lamp
        this.doc.circle(x+50, y+10, 5);
        this.doc.text('lamp', x+45, y+22);
        this.doc.line(x+55, y+10, x+80, y+10); // to switch
        // switch
        this.doc.line(x+80, y+10, x+92, y+10);
        this.doc.line(x+92, y+10, x+98, y+5);
        this.doc.line(x+98, y+5, x+100, y+5);
        this.doc.text('switch', x+90, y+22);
        // ammeter (below)
        this.doc.line(x+50, y+15, x+50, y+30);
        this.doc.circle(x+50, y+35, 5);
        this.doc.text('A', x+48, y+36);
        this.doc.line(x+50, y+40, x, y+40);
        this.doc.line(x, y+40, x, y+10);
        this.currentY += 55;
        break;
      }
      case 'gas_collection': {
        this.ensureSpace(55);
        const x = this.margin + 10;
        const y = this.currentY;
        // flask
        this.doc.ellipse(x+20, y+25, 12, 18);
        this.doc.rect(x+18, y+5, 4, 12); // neck
        // delivery tube
        this.doc.line(x+20, y+5, x+50, y+5);
        this.doc.line(x+50, y+5, x+50, y+10);
        // inverted cylinder (gas collection)
        this.doc.rect(x+45, y+10, 10, 30);
        this.doc.text('H₂', x+47, y+25);
        this.doc.text('Mg + HCl', x+10, y+50);
        this.currentY += 60;
        break;
      }
      case 'transpiration_setup': {
        this.ensureSpace(60);
        const x = this.margin + 10;
        const y = this.currentY;
        // potometer outline
        this.doc.rect(x, y+10, 20, 30); // reservoir
        this.doc.text('Water', x+2, y+27);
        this.doc.line(x+20, y+25, x+60, y+25); // capillary tube
        this.doc.circle(x+40, y+25, 2); // air bubble
        this.doc.text('Air bubble', x+34, y+20);
        this.doc.line(x+60, y+25, x+60, y+5); // stem upwards
        this.doc.ellipse(x+60, y+2, 6, 3); // leaf cluster top
        this.doc.text('Plant shoot', x+50, y+45);
        this.currentY += 65;
        break;
      }
      case 'density_apparatus': {
        this.ensureSpace(55);
        const x = this.margin + 10;
        const y = this.currentY;
        // balance
        this.doc.rect(x, y+30, 25, 10);
        this.doc.text('Balance', x, y+28);
        // measuring cylinder
        this.doc.rect(x+40, y+10, 15, 35);
        this.doc.text('Measuring', x+38, y+50);
        this.doc.text('cylinder', x+40, y+55);
        // solid sample
        this.doc.rect(x+46, y+25, 5, 5);
        this.doc.text('Sample', x+44, y+23);
        this.currentY += 60;
        break;
      }
      default:
        this.ensureSpace(10);
        this.doc.text(`[Diagram: ${type}]`, this.margin+10, this.currentY+10);
        this.currentY += 20;
    }
  }

  private addRunningHeader(): void {
    if (!this.lastConfig) return;
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica','italic');
    this.doc.text(`0653/${this.lastConfig.paperNumber}${this.lastConfig.variant}`, this.margin, 10);
    this.doc.text(`${this.lastConfig.session.toUpperCase()}/${this.lastConfig.year}`, this.pageWidth - this.margin, 10, {align:'right'});
    this.currentY = 20;
    this.doc.setFont('times','normal');
  }

  private drawTable(type: string): void {
    this.doc.setFontSize(8);
    switch(type) {
      case 'states_of_matter': {
        this.ensureSpace(40);
        const headers = ['State','Shape','Volume','Particle arrangement'];
        const data = [
          ['Solid','fixed','fixed','regular'],
          ['Liquid','not fixed','fixed','close'],
          ['Gas','not fixed','not fixed','random']
        ];
        this.simpleTable(headers, data);
        break;
      }
      case 'reaction_temperature_table': {
        this.ensureSpace(45);
        const headers = ['Temp (°C)','Time (s)'];
        const data = [ ['20','120'], ['30','80'], ['40','55'], ['50','40'], ['60','30'] ];
        this.simpleTable(headers, data);
        break;
      }
      case 'fertilizer_growth': {
        this.ensureSpace(45);
        const headers = ['Fertilizer conc. (%)','Mean height (cm)'];
        const data = [ ['0','4.2'], ['1','6.8'], ['2','8.1'], ['3','8.4'], ['4','7.9'] ];
        this.simpleTable(headers, data);
        break;
      }
      default: {
        this.ensureSpace(10);
        this.doc.text(`[Table: ${type}]`, this.margin+10, this.currentY+10);
        this.currentY += 15;
      }
    }
  }

  private drawGraph(type: string): void {
    this.doc.setFontSize(8);
    switch(type) {
      case 'enzyme_temperature': {
        this.ensureSpace(55);
        const x0 = this.margin + 10;
        const y0 = this.currentY + 40;
        const width = 70;
        const height = 35;
        // axes
        this.doc.line(x0, y0, x0 + width, y0);
        this.doc.line(x0, y0, x0, y0 - height);
        this.doc.text('Temp (°C)', x0 + width/2 - 10, y0 + 6);
        this.doc.text('Activity', x0 - 8, y0 - height/2);
        // curve (simple)
        let prevX = x0;
        let prevY = y0;
        for (let t=0;t<=70;t+=5){
          const rel = t/70; // 0..1
          const activity = Math.exp(-Math.pow((rel-0.5)/0.25,2));
          const x = x0 + t;
          const y = y0 - activity*30;
          if (t>0) this.doc.line(prevX, prevY, x, y);
          prevX = x; prevY = y;
        }
        this.doc.text('Optimum ~37°C', x0+30, y0-25);
        this.currentY += 60;
        break;
      }
      case 'energy_profile': {
        this.ensureSpace(55);
        const x0 = this.margin + 10;
        const y0 = this.currentY + 35;
        const width = 70;
        const height = 30;
        // axes
        this.doc.line(x0, y0, x0 + width, y0);
        this.doc.line(x0, y0, x0, y0 - height);
        // energy profile (exothermic)
        const peakX = x0 + width*0.3;
        const peakY = y0 - height*0.9;
        this.doc.line(x0, y0 - height*0.2, peakX, peakY);
        this.doc.line(peakX, peakY, x0 + width, y0 - height*0.6);
        this.doc.text('Activation energy', peakX - 5, peakY - 5);
        this.doc.text('Energy', x0 - 8, y0 - height/2);
        this.doc.text('Progress', x0 + width/2 - 10, y0 + 6);
        this.currentY += 60;
        break;
      }
      case 'rate_temp_graph': {
        this.ensureSpace(55);
        const x0 = this.margin + 10;
        const y0 = this.currentY + 40;
        const width = 70;
        const height = 35;
        // axes
        this.doc.line(x0, y0, x0 + width, y0);
        this.doc.line(x0, y0, x0, y0 - height);
        this.doc.text('Temp (°C)', x0 + width/2 - 10, y0 + 6);
        this.doc.text('Rate', x0 - 6, y0 - height/2);
        // increasing then plateau curve
        let prevX = x0;
        let prevY = y0;
        for (let t=0;t<=70;t+=5){
          const rel = t/70;
          const rate = rel < 0.6 ? rel/0.6 : 1 - (rel-0.6)*0.4; // rise then slight fall
          const x = x0 + t;
          const y = y0 - rate*30;
          if (t>0) this.doc.line(prevX, prevY, x, y);
          prevX = x; prevY = y;
        }
        this.doc.text('Trend', x0+25, y0-28);
        this.currentY += 60;
        break;
      }
      default: {
        this.ensureSpace(10);
        this.doc.text(`[Graph: ${type}]`, this.margin+10, this.currentY+10);
        this.currentY += 20;
      }
    }
  }

  private simpleTable(headers: string[], rows: string[][]): void {
    const colCount = headers.length;
    const totalWidth = this.pageWidth - 2*this.margin - 20;
    const colWidth = totalWidth / colCount;
  const x = this.margin + 10;
  const y = this.currentY;
    // header
    this.doc.setFont('helvetica','bold');
    headers.forEach((h,i)=>{
      this.doc.rect(x + i*colWidth, y, colWidth, 6);
      this.doc.text(h, x + i*colWidth + 2, y+4);
    });
    this.doc.setFont('helvetica','normal');
    rows.forEach((r,rowIdx)=>{
      const rowY = y + 6 + rowIdx*6;
      r.forEach((cell,i)=>{
        this.doc.rect(x + i*colWidth, rowY, colWidth, 6);
        this.doc.text(cell, x + i*colWidth + 2, rowY+4);
      });
    });
    this.currentY += 6 + rows.length*6 + 5;
  }

  private addPageHeader(pageNum: number): void {
    if (pageNum > 1) {
      this.doc.setFontSize(8);
      this.doc.text(`0653/${pageNum}`, this.pageWidth / 2, this.margin - 5, { align: 'center' });
      this.currentY = this.margin + 5;
    }
  }

  private addWrappedText(text: string, x: number, y: number, maxWidth: number): void {
    const lines = this.doc.splitTextToSize(text, maxWidth);
    lines.forEach((line: string, index: number) => {
      this.doc.text(line, x, y + (index * this.lineHeight));
    });
    this.currentY = y + (lines.length * this.lineHeight);
  }

  private addFooter(): void {
    const totalPages = this.doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(8);
      this.doc.text('© UCLES 2025', this.margin, this.pageHeight - 10);
      this.doc.text(`0653/${i}`, this.pageWidth / 2, this.pageHeight - 10, { align: 'center' });
      if (i < totalPages) {
        this.doc.text('[Turn over', this.pageWidth - this.margin, this.pageHeight - 10, { align: 'right' });
      }
    }
  // Summary marks on last page
  this.doc.setPage(totalPages);
  this.doc.setFontSize(9);
  const tgt = this.targetMarks ?? 0;
  const status = this.totalMarksAllocated === tgt ? 'OK' : (this.totalMarksAllocated < tgt ? 'UNDER' : 'OVER');
  this.doc.text(`Allocated marks: ${this.totalMarksAllocated} / ${tgt} (${status})`, this.pageWidth - this.margin - 5, this.pageHeight - 20, { align: 'right' });
  }

  private addMarkSummary(): void {
    // Add a dedicated page summarizing per-question marks (after questions)
    this.doc.addPage();
    this.currentY = this.margin;
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica','bold');
    this.doc.text('Question Mark Summary', this.pageWidth/2, this.currentY, {align:'center'});
    this.currentY += 10;
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica','normal');
    const headers = ['Q','Marks'];
    const rows = this.questionMarkBreakdown.map(q=>[q.number, String(q.marks)]);
    // compute total row
    rows.push(['Total', String(this.totalMarksAllocated)]);
    // simple table reuse
    const colCount = headers.length;
    const totalWidth = this.pageWidth - 2*this.margin - 20;
    const colWidth = totalWidth / colCount;
    const x = this.margin + 10;
    const y = this.currentY;
    this.doc.setFont('helvetica','bold');
    headers.forEach((h,i)=>{ this.doc.rect(x + i*colWidth, y, colWidth, 6); this.doc.text(h, x + i*colWidth + 2, y+4); });
    this.doc.setFont('helvetica','normal');
    rows.forEach((r,rowIdx)=>{
      const rowY = y + 6 + rowIdx*6;
      r.forEach((cell,i)=>{ this.doc.rect(x + i*colWidth, rowY, colWidth, 6); this.doc.text(cell, x + i*colWidth + 2, rowY+4); });
    });
    this.currentY = y + 6 + rows.length*6 + 10;
  }

  private addStructured(bank: StructuredQuestion[], target: number) {
    // Shuffle deterministically using seeded random if available
    const shuffled = [...bank];
    for (let i = shuffled.length -1; i>0; i--) {
      const j = Math.floor(this.random() * (i+1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
  const blueprint = (Object.values(PAPER_BLUEPRINTS) as PaperBlueprint[]).find((b: PaperBlueprint)=> b.totalMarks === target);
    const categoryAllocated: Record<string, number> = {};
    const categoryNeeded: Record<string, number> = {};
  if (blueprint) blueprint.categories.forEach((c: {name: string; minMarks: number})=> categoryNeeded[c.name] = c.minMarks);
    const usedOriginal = new Set<string>();
    let nextSeq = 1;

  const applyQuestion = (q: StructuredQuestion) => {
      if (this.totalMarksAllocated >= target) return;
      if (usedOriginal.has(q.number)) return;
      let questionMarks = 0;
      const lines: string[] = [];
      if (q.category) {
        if (!this.categorySet.has(q.category)) {
          this.insertCategoryHeading(q.category);
          this.categorySet.add(q.category);
        }
      }
      for (let idx=0; idx<q.parts.length; idx++) {
        const p = q.parts[idx];
        const remaining = target - this.totalMarksAllocated - questionMarks;
        if (remaining <= 0) break;
        if (p.kind === 'diagram') { lines.push(`[DIAGRAM: ${p.refId}]`); continue; }
        if (p.kind === 'table') { lines.push(`[TABLE: ${p.refId}]`); continue; }
        if (p.kind === 'graph') { lines.push(`[GRAPH: ${p.refId}]`); continue; }
        const partMarks = p.marks || 0;
        if (partMarks === 0) { lines.push(p.text); continue; }
        if (partMarks <= remaining) { lines.push(p.text + `  [${partMarks}]`); questionMarks += partMarks; }
        else { lines.push(p.text + `  [${remaining}]`); questionMarks += remaining; }
      }
      if (lines.length) {
        const displayNumber = String(nextSeq++);
        this.addSimpleQuestion(displayNumber, lines);
        this.questionMarkBreakdown.push({ number: displayNumber, marks: questionMarks });
        if (q.category) categoryAllocated[q.category] = (categoryAllocated[q.category]||0) + questionMarks;
        usedOriginal.add(q.number);
      }
    };

    // Pass 1: satisfy minimums
    if (blueprint) {
      for (const q of shuffled) {
        if (this.totalMarksAllocated >= target) break;
        if (!q.category) continue;
        const needed = categoryNeeded[q.category];
        if (!needed) continue;
        if ((categoryAllocated[q.category]||0) >= needed) continue;
        applyQuestion(q);
      }
    }
    // Pass 2: fill remaining marks
    for (const q of shuffled) {
      if (this.totalMarksAllocated >= target) break;
      if (usedOriginal.has(q.number)) continue;
      applyQuestion(q);
    }
    // Auto filler only for theory papers (not practical 5/6) and only if small deficit
    const practicalPapers = ['5','6'];
  if (!practicalPapers.includes(this.lastConfig?.paperNumber || '') && this.totalMarksAllocated < target) {
      while (this.totalMarksAllocated < target) {
        const needed = target - this.totalMarksAllocated;
        const fillerMarks = Math.min(needed, 2);
    const qNum = String(nextSeq++);
        const line = `Auto-generated short recall/calculation item  [${fillerMarks}]`;
        this.addSimpleQuestion(qNum, [line]);
        this.questionMarkBreakdown.push({ number: qNum, marks: fillerMarks });
      }
    }
  }

  private insertCategoryHeading(category: string) {
    if (this.currentY > this.pageHeight - 40) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica','bold');
    this.doc.text(category.toUpperCase(), this.margin, this.currentY);
    this.currentY += 6;
    this.doc.setFont('helvetica','normal');
  }

  private auditMarks(): void {
    try {
      const tgt = this.targetMarks ?? 0;
      const diff = tgt - this.totalMarksAllocated;
      const status = diff === 0 ? 'OK' : (diff > 0 ? `UNDER by ${diff}` : `OVER by ${-diff}`);
      // Consolidate duplicate question numbers (MCQs already individually stored)
      const consolidated: Record<string, number> = {};
      this.questionMarkBreakdown.forEach(q=>{ consolidated[q.number] = (consolidated[q.number]||0)+q.marks; });
      const rows = Object.entries(consolidated)
        .sort((a,b)=> parseInt(a[0].replace(/\D/g,''),10)-parseInt(b[0].replace(/\D/g,''),10))
        .map(([number, marks])=> ({ Question: number, Marks: marks }));
      console.groupCollapsed('[CambridgePDFGenerator] Mark Audit');
      console.table(rows);
      console.log('Total Allocated:', this.totalMarksAllocated, 'Target:', tgt, 'Status:', status);
      if (diff > 0) {
        console.warn(`Paper UNDER target by ${diff} marks. Add more questions or increase part marks.`);
      } else if (diff < 0) {
        console.warn(`Paper OVER target by ${-diff} marks. Consider trimming question parts.`);
      }
  console.groupEnd();
  const csv = ['Question,Marks', ...rows.map(r=>`${r.Question},${r.Marks}`), `Total,${this.totalMarksAllocated}`].join('\n');
  (globalThis as unknown as { __CAMBRIDGE_MARK_CSV__?: string }).__CAMBRIDGE_MARK_CSV__ = csv;
    } catch (e) {
      console.error('Mark audit failed', e);
    }
  }

  private getPaperDuration(paperNumber: string): number {
    const durations = { '1': 45, '2': 75, '3': 75, '4': 105, '5': 75, '6': 60 };
    return durations[paperNumber as keyof typeof durations] || 60;
  }

  private getPaperMarks(paperNumber: string): number {
    const marks = { '1': 40, '2': 80, '3': 80, '4': 120, '5': 60, '6': 60 };
    return marks[paperNumber as keyof typeof marks] || 60;
  }

  save(filename: string): void {
    this.doc.save(filename);
  }

  getBlob(): Blob {
    return this.doc.output('blob');
  }
}