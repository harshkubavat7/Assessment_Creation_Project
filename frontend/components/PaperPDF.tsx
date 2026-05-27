import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { QuestionPaper } from '../types';

const styles = StyleSheet.create({
  page: { 
    padding: 40, 
    fontFamily: 'Helvetica', 
    fontSize: 10, 
    lineHeight: 1.6,
    color: '#1a1a1a'
  },
  header: { 
    textAlign: 'center', 
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#1a1a1a',
    paddingBottom: 10
  },
  title: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginBottom: 4,
    textTransform: 'uppercase'
  },
  meta: { 
    fontSize: 10, 
    color: '#333', 
    marginBottom: 4 
  },
  studentRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 20, 
    borderBottomWidth: 1, 
    borderBottomColor: '#ccc', 
    paddingBottom: 12 
  },
  field: { 
    width: '30%' 
  },
  fieldLabel: { 
    fontSize: 9, 
    color: '#666',
    marginBottom: 2
  },
  fieldLine: { 
    borderBottomWidth: 1, 
    borderBottomColor: '#000', 
    height: 12 
  },
  sectionTitle: { 
    fontSize: 11, 
    fontWeight: 'bold', 
    marginBottom: 4, 
    marginTop: 14,
    backgroundColor: '#f3f4f6',
    padding: 4,
    paddingLeft: 8
  },
  instruction: { 
    fontSize: 9, 
    color: '#4b5563', 
    marginBottom: 8, 
    fontStyle: 'italic' 
  },
  question: { 
    flexDirection: 'row', 
    marginBottom: 10,
    paddingLeft: 6
  },
  qNum: { 
    width: 24, 
    fontSize: 10,
    fontWeight: 'bold'
  },
  qBody: { 
    flex: 1 
  },
  qText: { 
    fontSize: 10,
    marginBottom: 4
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: 8,
    marginBottom: 4
  },
  optionText: { 
    width: '50%',
    fontSize: 9, 
    color: '#374151'
  },
  badge: { 
    fontSize: 8, 
    color: '#4b5563', 
    marginTop: 2,
    fontWeight: 'medium'
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#9ca3af',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8
  },
  // Answer Key styling for PDF
  answerKeyTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
    paddingBottom: 4,
    textTransform: 'uppercase'
  },
  answerKeySection: {
    marginBottom: 10
  },
  answerKeySecHeader: {
    fontSize: 9,
    fontWeight: 'bold',
    backgroundColor: '#f3f4f6',
    padding: 3,
    paddingLeft: 6,
    marginBottom: 6
  },
  answerRow: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingLeft: 8
  },
  answerNum: {
    width: 20,
    fontWeight: 'bold'
  },
  answerText: {
    flex: 1,
    fontSize: 9,
    color: '#374151'
  }
});

interface PaperPDFProps {
  paper: QuestionPaper;
  meta: {
    schoolName?: string;
    subject: string;
    grade: string;
    totalMarks: number;
    topic: string;
  };
  includeAnswers?: boolean;
}

function renderPDFQuestionText(text: string) {
  if (!text) return null;
  const parts = text.split(/(```[\s\S]*?```)/g);
  return parts.map((part, index) => {
    if (part.startsWith('```')) {
      const lines = part.split('\n');
      const code = lines.slice(1, -1).join('\n').replace(/ /g, '\u00A0');
      return (
        <Text key={index} style={{
          fontFamily: 'Courier',
          fontSize: 8.5,
          backgroundColor: '#f3f4f6',
          padding: 6,
          marginTop: 4,
          marginBottom: 4
        }}>
          {code}
        </Text>
      );
    }
    
    // Convert boundary spaces to non-breaking spaces to prevent trimming
    let formattedPart = part;
    if (formattedPart.startsWith(' ')) {
      formattedPart = '\u00A0' + formattedPart.slice(1);
    }
    if (formattedPart.endsWith(' ')) {
      formattedPart = formattedPart.slice(0, -1) + '\u00A0';
    }
    formattedPart = formattedPart.replace(/  /g, ' \u00A0');
    
    return (
      <Text key={index} style={{ fontSize: 10 }}>
        {formattedPart}
      </Text>
    );
  });
}

export function PaperPDF({ paper, meta, includeAnswers = false }: PaperPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{meta.schoolName || 'ACADEMIC ASSESSMENT'}</Text>
          <Text style={styles.meta}>
            {`Subject: ${meta.subject}  |  Grade: ${meta.grade}  |  Topic: ${meta.topic || 'General'}`}
          </Text>
          <Text style={styles.meta}>
            {`Maximum Marks: ${meta.totalMarks}  |  Duration: 3 Hours`}
          </Text>
        </View>

        {/* Student Info Block */}
        <View style={styles.studentRow}>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Student Name</Text>
            <View style={styles.fieldLine} />
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Roll Number</Text>
            <View style={styles.fieldLine} />
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Class & Section</Text>
            <View style={styles.fieldLine} />
          </View>
        </View>

        {/* Exam Sections */}
        {paper.sections.map((sec, si) => (
          <View key={si} wrap={false}>
            <Text style={styles.sectionTitle}>{sec.title} — {sec.type}</Text>
            <Text style={styles.instruction}>{sec.instruction || 'Attempt all questions.'}</Text>
            {sec.questions.map((q, qi) => (
              <View key={qi} style={styles.question}>
                <Text style={styles.qNum}>Q{qi + 1}.</Text>
                <View style={styles.qBody}>
                  <View style={{ marginBottom: 4 }}>
                    {renderPDFQuestionText(q.text)}
                  </View>
                  
                  {/* Options for MCQ */}
                  {q.options && q.options.length > 0 && (
                    <View style={styles.optionRow}>
                      {q.options.map((o, oi) => (
                        <Text key={oi} style={styles.optionText}>{o}</Text>
                      ))}
                    </View>
                  )}
                  
                  <Text style={styles.badge}>
                    {`[${q.difficulty}]  |  [${q.marks} mark${q.marks > 1 ? 's' : ''}]`}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ))}

        {/* Answer Key block rendered if toggle enabled */}
        {includeAnswers && (
          <View wrap={false} style={{ marginTop: 20 }}>
            <Text style={styles.answerKeyTitle}>Answer Key</Text>
            {paper.sections.map((sec, si) => (
              <View key={si} style={styles.answerKeySection}>
                <Text style={styles.answerKeySecHeader}>{sec.title} — {sec.type}</Text>
                {sec.questions.map((q, qi) => (
                  <View key={qi} style={styles.answerRow}>
                    <Text style={styles.answerNum}>{qi + 1}.</Text>
                    <View style={styles.answerText}>
                      {renderPDFQuestionText(q.answer || 'No answer solution key provided.')}
                      <Text style={{ fontSize: 8, color: '#6b7280', marginTop: 2 }}>({q.difficulty})</Text>
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer} fixed>
          Generated by VedaAI · Review questions and answers before distribution.
        </Text>
      </Page>
    </Document>
  );
}
export default PaperPDF;
