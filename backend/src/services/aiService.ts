import { IAssignment } from '../models/Assignment';
import { ISection, IQuestion } from '../models/QuestionPaper';
import { config } from '../config';


function buildPrompt(a: IAssignment): string {
  const configs = Array.isArray(a.marksConfig) ? a.marksConfig : [];
  const allocationPrompt = configs
    .map(item => `- ${item.type}: ${item.count} questions, ${item.marks} mark(s) each`)
    .join('\n');

  return `
You are an expert exam paper creator for school teachers.

Generate a complete question paper based on these details:
- Subject: ${a.subject}
- Grade: ${a.grade}
- Topic/Chapter: ${a.topic}
- Question types requested: ${a.questionTypes.join(', ')}
${allocationPrompt}
- Difficulty distribution: Easy ${a.difficulty.easy}%, Medium ${a.difficulty.medium}%, Hard ${a.difficulty.hard}%
- Additional instructions: ${a.instructions || 'None'}
${a.referenceText ? `- Reference material provided:\n${a.referenceText.slice(0, 2000)}` : ''}

RULES:
1. Return ONLY a valid JSON object. No explanation, no markdown, no backticks.
2. Group questions into sections matching the requested question types (e.g. Section A = Multiple Choice Questions, Section B = Short Questions, etc.).
3. Each question must have: "text", "difficulty" (exactly "Easy", "Medium", or "Hard"), "marks" (number), and "answer" (string).
4. MCQ / Multiple Choice Questions must also include "options": array of 4 strings labeled A) B) C) D). The "answer" for MCQ must be the letter of the correct option (e.g. "A", "B", "C", or "D").
5. Make questions age-appropriate for ${a.grade}.
6. Vary difficulty across questions to match the percentages given.

Return this exact JSON structure:
{
  "sections": [
    {
      "title": "Section A",
      "type": "Multiple Choice Questions",
      "instruction": "Attempt all questions.",
      "questions": [
        {
          "text": "Question text here",
          "difficulty": "Easy",
          "marks": 1,
          "options": ["A) option one", "B) option two", "C) option three", "D) option four"],
          "answer": "A"
        }
      ]
    }
  ]
}
`;
}

function generateMockPaper(a: IAssignment): ISection[] {
  console.log('Generating mock question paper offline...');
  const sections: ISection[] = [];
  const configs = Array.isArray(a.marksConfig) ? a.marksConfig : [];
  
  // Calculate total questions
  let totalQuestions = 0;
  for (const item of configs) {
    if (a.questionTypes.includes(item.type)) {
      totalQuestions += Number(item.count);
    }
  }

  const diffs: ('Easy' | 'Medium' | 'Hard')[] = [];
  const easyCount = Math.round((a.difficulty.easy / 100) * totalQuestions) || 1;
  const mediumCount = Math.round((a.difficulty.medium / 100) * totalQuestions) || 1;
  
  for (let i = 0; i < easyCount; i++) diffs.push('Easy');
  for (let i = 0; i < mediumCount; i++) diffs.push('Medium');
  while (diffs.length < totalQuestions) {
    diffs.push('Hard');
  }

  let diffIndex = 0;
  const getNextDiff = (): 'Easy' | 'Medium' | 'Hard' => {
    const d = diffs[diffIndex] || 'Medium';
    diffIndex = (diffIndex + 1) % diffs.length;
    return d;
  };

  const topic = a.topic || 'General Topic';
  const subject = a.subject;

  // Templates
  const templates: Record<string, ((t: string, s: string) => string)[]> = {
    'Multiple Choice Questions': [
      (t, s) => `Which of the following represents the primary definition of '${t}' in the context of ${s}?`,
      (t, s) => `Identify the core component that forms the baseline structure of '${t}':`,
      (t, s) => `What is the main objective or goal of utilizing '${t}' inside ${s}?`,
      (t, s) => `Which of the following is NOT considered a characteristic feature of '${t}'?`
    ],
    'Short Questions': [
      (t, s) => `Explain the relationship between '${t}' and key foundational principles in ${s}.`,
      (t, s) => `Compare and contrast '${t}' with its closest alternative concept. Provide two distinctions.`,
      (t, s) => `Describe a real-world scenario where '${t}' plays a critical role in solving problems.`
    ],
    'Diagram/Graph-Based Questions': [
      (t, s) => `Analyze the diagram representing '${t}' and identify the labeled nodes.`,
      (t, s) => `Sketch a graph illustrating the behavior of '${t}' under variable loading conditions.`,
      (t, s) => `Interpret the flowchart detailing the execution sequence of '${t}' in ${s}.`
    ],
    'Numerical Problems': [
      (t, s) => `Calculate the total value under standard conditions using the '${t}' formulas. Show all steps.`,
      (t, s) => `A system utilizes '${t}' with initial parameters of 10 and 25. Solve for the final equilibrium state.`,
      (t, s) => `Determine the efficiency of the '${t}' process if the input energy is 500 Joules.`
    ]
  };

  const defaultTemplates = [
    (t: string, s: string) => `Describe key aspects of '${t}' in ${s} and discuss its general relevance.`,
    (t: string, s: string) => `Identify three primary parameters required to control '${t}' processes.`,
    (t: string, s: string) => `Provide a brief overview of modern applications of '${t}' in academic research.`
  ];

  const getMcqOptions = (index: number, t: string) => {
    const optionSets = [
      [`A) Primary definition of ${t}`, `B) Secondary alternative for ${t}`, `C) Unrelated concept`, `D) None of the above`],
      [`A) Increase efficiency`, `B) Reduce performance`, `C) Simplify layout`, `D) Core structural foundation`],
      [`A) Under normal load`, `B) Under high pressure`, `C) In isolated environments`, `D) Under all of the above`]
    ];
    return optionSets[index % optionSets.length];
  };

  // Build sections dynamically
  const alphabet = ['A', 'B', 'C', 'D', 'E', 'F'];
  let alphaIndex = 0;

  for (const item of configs) {
    if (!a.questionTypes.includes(item.type) || item.count <= 0) continue;

    const questions: IQuestion[] = [];
    const typeTemplates = templates[item.type] || defaultTemplates;
    const isMcq = item.type === 'Multiple Choice Questions' || item.type.toLowerCase().includes('mcq');

    for (let i = 0; i < item.count; i++) {
      const template = typeTemplates[i % typeTemplates.length];
      questions.push({
        text: template(topic, subject),
        difficulty: getNextDiff(),
        marks: Number(item.marks) || 1,
        options: isMcq ? getMcqOptions(i, topic) : undefined,
        answer: isMcq ? 'A' : `Model answer solution key for ${item.type} question ${i + 1} on ${topic}.`
      });
    }

    const secChar = alphabet[alphaIndex % alphabet.length];
    alphaIndex++;

    sections.push({
      title: `Section ${secChar}`,
      type: item.type,
      instruction: `Attempt all questions in this section. Each carries ${item.marks} mark(s).`,
      questions
    });
  }

  return sections;
}

export async function generatePaper(a: IAssignment): Promise<ISection[]> {
  const isMockMode = !config.geminiApiKey || config.geminiApiKey === 'mock-api-key-for-local-testing';
  if (isMockMode) {
    // Artificial delay to simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    return generateMockPaper(a);
  }

  const prompt = buildPrompt(a);
  const apiKey = config.geminiApiKey;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Gemini API error (status ${response.status}):`, errText);
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const result = await response.json() as any;
    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('Gemini API response structure invalid or empty candidates');
    }

    const cleaned = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    if (!parsed.sections || !Array.isArray(parsed.sections)) {
      throw new Error('AI response missing sections array.');
    }

    return parsed.sections;
  } catch (error) {
    console.error('Gemini API call failed, falling back to mock paper generation:', error);
    return generateMockPaper(a);
  }
}

