"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePaper = generatePaper;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const config_1 = require("../config");
const client = new sdk_1.default({ apiKey: config_1.config.anthropicApiKey || 'mock-key' });
function buildPrompt(a) {
    return `
You are an expert exam paper creator for school teachers.

Generate a complete question paper based on these details:
- Subject: ${a.subject}
- Grade: ${a.grade}
- Topic/Chapter: ${a.topic}
- Question types requested: ${a.questionTypes.join(', ')}
- MCQ: ${a.marksConfig.mcq.count} questions, ${a.marksConfig.mcq.marks} mark each
- Short answer: ${a.marksConfig.short.count} questions, ${a.marksConfig.short.marks} marks each
- Long answer: ${a.marksConfig.long.count} questions, ${a.marksConfig.long.marks} marks each
- Difficulty distribution: Easy ${a.difficulty.easy}%, Medium ${a.difficulty.medium}%, Hard ${a.difficulty.hard}%
- Additional instructions: ${a.instructions || 'None'}
${a.referenceText ? `- Reference material provided:\n${a.referenceText.slice(0, 2000)}` : ''}

RULES:
1. Return ONLY a valid JSON object. No explanation, no markdown, no backticks.
2. Group questions into sections (Section A = MCQ, Section B = Short, Section C = Long).
3. Each question must have: "text", "difficulty" (exactly "Easy", "Medium", or "Hard"), "marks" (number).
4. MCQ questions must also include "options": array of 4 strings labeled A) B) C) D).
5. Make questions age-appropriate for ${a.grade}.
6. Vary difficulty across questions to match the percentages given.

Return this exact JSON structure:
{
  "sections": [
    {
      "title": "Section A",
      "type": "MCQ",
      "instruction": "Attempt all questions. Each question carries ${a.marksConfig.mcq.marks} mark(s).",
      "questions": [
        {
          "text": "Question text here",
          "difficulty": "Easy",
          "marks": ${a.marksConfig.mcq.marks},
          "options": ["A) option one", "B) option two", "C) option three", "D) option four"]
        }
      ]
    }
  ]
}
`;
}
function generateMockPaper(a) {
    console.log('Generating mock question paper offline...');
    const sections = [];
    const diffs = [];
    const easyCount = Math.round((a.difficulty.easy / 100) * (a.marksConfig.mcq.count + a.marksConfig.short.count + a.marksConfig.long.count)) || 1;
    const mediumCount = Math.round((a.difficulty.medium / 100) * (a.marksConfig.mcq.count + a.marksConfig.short.count + a.marksConfig.long.count)) || 1;
    for (let i = 0; i < easyCount; i++)
        diffs.push('Easy');
    for (let i = 0; i < mediumCount; i++)
        diffs.push('Medium');
    while (diffs.length < (a.marksConfig.mcq.count + a.marksConfig.short.count + a.marksConfig.long.count)) {
        diffs.push('Hard');
    }
    let diffIndex = 0;
    const getNextDiff = () => {
        const d = diffs[diffIndex] || 'Medium';
        diffIndex = (diffIndex + 1) % diffs.length;
        return d;
    };
    // Section A - MCQ
    if (a.questionTypes.includes('MCQ') && a.marksConfig.mcq.count > 0) {
        const questions = [];
        for (let i = 1; i <= a.marksConfig.mcq.count; i++) {
            questions.push({
                text: `Which of the following best describes the concept of ${a.topic || 'the topic'} in the context of ${a.subject}?`,
                difficulty: getNextDiff(),
                marks: a.marksConfig.mcq.marks || 1,
                options: [
                    `A) Primary definition of ${a.topic}`,
                    `B) Secondary alternative for ${a.topic}`,
                    `C) Irrelevant choice regarding ${a.subject}`,
                    `D) All of the above`
                ]
            });
        }
        sections.push({
            title: 'Section A',
            type: 'MCQ',
            instruction: `Attempt all questions. Each question carries ${a.marksConfig.mcq.marks || 1} mark(s). Select the single best answer.`,
            questions
        });
    }
    // Section B - Short Answer
    if (a.questionTypes.includes('Short answer') && a.marksConfig.short.count > 0) {
        const questions = [];
        for (let i = 1; i <= a.marksConfig.short.count; i++) {
            questions.push({
                text: `Explain the relationship between ${a.topic || 'the topic'} and key principles in ${a.subject}. Provide two supporting examples.`,
                difficulty: getNextDiff(),
                marks: a.marksConfig.short.marks || 3
            });
        }
        sections.push({
            title: 'Section B',
            type: 'Short answer',
            instruction: `Answer all questions in 2-3 sentences. Each question carries ${a.marksConfig.short.marks || 3} marks.`,
            questions
        });
    }
    // Section C - Long Answer
    if (a.questionTypes.includes('Long answer') && a.marksConfig.long.count > 0) {
        const questions = [];
        for (let i = 1; i <= a.marksConfig.long.count; i++) {
            questions.push({
                text: `Critically analyze the impact of ${a.topic || 'the topic'} on modern developments in ${a.subject}. Discuss the long-term implications and challenges.`,
                difficulty: getNextDiff(),
                marks: a.marksConfig.long.marks || 8
            });
        }
        sections.push({
            title: 'Section C',
            type: 'Long answer',
            instruction: `Answer all questions in detail. Support your answers with diagrams or case studies where appropriate. Each question carries ${a.marksConfig.long.marks || 8} marks.`,
            questions
        });
    }
    return sections;
}
async function generatePaper(assignment) {
    const isMockKey = !config_1.config.anthropicApiKey ||
        config_1.config.anthropicApiKey === 'mock-api-key-for-local-testing' ||
        config_1.config.anthropicApiKey === 'sk-ant-xxxxxxxxxxxxxxxxxxxxxxxx';
    if (isMockKey) {
        // Artificial delay to simulate AI processing
        await new Promise(resolve => setTimeout(resolve, 3000));
        return generateMockPaper(assignment);
    }
    const prompt = buildPrompt(assignment);
    try {
        const response = await client.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 4096,
            messages: [{ role: 'user', content: prompt }],
        });
        const rawText = response.content
            .filter(b => b.type === 'text')
            .map(b => b.text || '')
            .join('');
        // Strip any accidental markdown fences
        const cleaned = rawText.replace(/```json|```/g, '').trim();
        let parsed;
        try {
            parsed = JSON.parse(cleaned);
        }
        catch {
            // Retry once with stricter instructions or offline fallback
            console.warn('AI returned invalid JSON. Falling back to mock paper generation.');
            return generateMockPaper(assignment);
        }
        if (!parsed.sections || !Array.isArray(parsed.sections)) {
            throw new Error('AI response missing sections array.');
        }
        return parsed.sections;
    }
    catch (error) {
        console.error('Claude API call failed:', error);
        // If it fails, fallback to generating mock paper so the user can test
        return generateMockPaper(assignment);
    }
}
