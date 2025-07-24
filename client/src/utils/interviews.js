import jsPDF from 'jspdf';
import 'jspdf-autotable';

export function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB');
}

export const skillKeywords = [
  { skill: 'communication', keywords: ['communication', 'explain', 'describe', 'collaborate', 'team'] },
  { skill: 'react', keywords: ['react', 'jsx', 'component', 'props', 'state', 'hook'] },
  { skill: 'javascript', keywords: ['javascript', 'js', 'es6', 'variable', 'function', 'array', 'object'] },
  { skill: 'industry awareness', keywords: ['industry', 'trend', 'awareness', 'best practice', 'tool', 'framework'] },
  { skill: 'css', keywords: ['css', 'style', 'layout', 'flex', 'grid', 'responsive'] },
  { skill: 'html', keywords: ['html', 'markup', 'element', 'tag'] },
  { skill: 'soft skills', keywords: ['soft', 'conflict', 'feedback', 'leadership', 'adapt', 'problem'] },
  { skill: 'technical skills', keywords: ['technical', 'algorithm', 'performance', 'optimize', 'debug'] },
];

export function categorizeSkill(question, jobRole = '', jobDesc = '') {
  const q = (question + ' ' + jobRole + ' ' + jobDesc).toLowerCase();
  for (const { skill, keywords } of skillKeywords) {
    if (keywords.some(k => q.includes(k))) return skill;
  }
  return 'other';
}

export function downloadReportPDF(reportData) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text('Interview Feedback Report', 14, 18);
  doc.setFontSize(12);
  doc.text(`Overall Score: ${reportData.score}/10`, 14, 28);

  // Calculate average skill scores
  let avgSkills = { communication: 0, grammar: 0, attitude: 0, softSkills: 0 };
  if (reportData.report && reportData.report.length > 0) {
    const totals = reportData.report.reduce((acc, item) => {
      if (item.skillAnalysis) {
        acc.communication += item.skillAnalysis.communication || 5;
        acc.grammar += item.skillAnalysis.grammar || 5;
        acc.attitude += item.skillAnalysis.attitude || 5;
        acc.softSkills += item.skillAnalysis.softSkills || 5;
      }
      return acc;
    }, { communication: 0, grammar: 0, attitude: 0, softSkills: 0 });

    const count = reportData.report.length;
    avgSkills = {
      communication: count > 0 ? Math.round(totals.communication / count * 10) / 10 : 0,
      grammar: count > 0 ? Math.round(totals.grammar / count * 10) / 10 : 0,
      attitude: count > 0 ? Math.round(totals.attitude / count * 10) / 10 : 0,
      softSkills: count > 0 ? Math.round(totals.softSkills / count * 10) / 10 : 0
    };
  }

  doc.text(`Communication: ${avgSkills.communication}/10`, 14, 38);
  doc.text(`Grammar & Language: ${avgSkills.grammar}/10`, 14, 48);
  doc.text(`Professional Attitude: ${avgSkills.attitude}/10`, 14, 58);
  doc.text(`Soft Skills: ${avgSkills.softSkills}/10`, 14, 68);

  let y = 78;
  if (reportData.report && reportData.report.length > 0) {
    doc.setFontSize(14);
    doc.text('Detailed Question Analysis:', 14, y);
    y += 10;
    doc.setFontSize(12);
    reportData.report.forEach((item, idx) => {
      doc.setFont(undefined, 'bold');
      doc.text(`Q${idx + 1}: ${item.question}`, 14, y);
      y += 8;
      doc.setFont(undefined, 'normal');
      doc.text(`Your Answer: ${item.user || 'No answer'}`, 14, y);
      y += 8;
      doc.text(`Ideal Answer: ${item.ideal}`, 14, y);
      y += 8;
      doc.text(`Content Score: ${item.score}/10`, 14, y);
      y += 8;
      if (item.skillAnalysis) {
        doc.text(`Communication: ${item.skillAnalysis.communication}/10, Grammar: ${item.skillAnalysis.grammar}/10, Attitude: ${item.skillAnalysis.attitude}/10`, 14, y);
        y += 8;
      }
      if (item.skill) {
        doc.text(`Skill Category: ${item.skill}`, 14, y);
        y += 8;
      }
      y += 5;
      if (y > 270) { doc.addPage(); y = 20; }
    });
  }
  doc.save('interview_feedback_report.pdf');
} 