import { Router, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { config } from '../config';

const router = Router();
router.use(authMiddleware);

// Helper to determine if we should use mock fallback
const isMockMode = () => {
  return !config.geminiApiKey || 
         config.geminiApiKey === 'mock-api-key-for-local-testing';
};

router.post('/toolkit/generate', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { toolType, payload } = req.body;

    if (!toolType || !payload) {
      return res.status(400).json({ error: 'Missing toolType or payload.' });
    }

    if (isMockMode()) {
      // Return high quality mock data based on input parameters
      await new Promise(resolve => setTimeout(resolve, 2000)); // artificial delay for realism

      if (toolType === 'rubric') {
        const { topic = 'General Essay', grade = 'Grade 8', totalMarks = 20 } = payload;
        const maxPerCriterion = Math.max(1, Math.floor(Number(totalMarks) / 4));
        
        return res.json({
          success: true,
          data: {
            title: `Grading Rubric: ${topic} (${grade})`,
            totalMarks: Number(totalMarks),
            criteria: [
              {
                name: "Content & Accuracy",
                maxMarks: maxPerCriterion,
                achievementLevels: {
                  Exemplary: "Demonstrates deep understanding of the topic with detailed, accurate support.",
                  Proficient: "Covers key concepts clearly with minor inaccuracies or gaps.",
                  Developing: "Attempts to address concepts but contains substantial misunderstandings.",
                  Beginning: "Lacks focus, contains inaccurate content, or displays minimal comprehension."
                }
              },
              {
                name: "Structure & Organization",
                maxMarks: maxPerCriterion,
                achievementLevels: {
                  Exemplary: "Transitions are seamless; paragraphs are logically ordered and flow naturally.",
                  Proficient: "Good logical outline but some transitions feel forced or disjointed.",
                  Developing: "Disorganized structure; difficult to follow the main argument or progression.",
                  Beginning: "No discernible organization; ideas are presented randomly."
                }
              },
              {
                name: "Evidence & Examples",
                maxMarks: maxPerCriterion,
                achievementLevels: {
                  Exemplary: "Integrates highly relevant evidence, diagrams, or citations smoothly.",
                  Proficient: "Includes supporting evidence but could be further elaborated or integrated.",
                  Developing: "Minimal support; makes statements without relevant evidence or examples.",
                  Beginning: "No supporting evidence or examples provided."
                }
              },
              {
                name: "Mechanics & Tone",
                maxMarks: Number(totalMarks) - (maxPerCriterion * 3), // remainder
                achievementLevels: {
                  Exemplary: "Free of spelling/grammar errors. Uses appropriate academic language throughout.",
                  Proficient: "Few minor grammatical errors. Appropriate style overall.",
                  Developing: "Multiple grammatical errors that occasionally distract the reader.",
                  Beginning: "Frequent spelling and grammatical errors make the text difficult to comprehend."
                }
              }
            ]
          }
        });
      }

      if (toolType === 'lessonPlan') {
        const { topic = 'Topic', grade = 'Grade 10', durationDays = 3 } = payload;
        const daysCount = Math.max(1, Math.min(10, Number(durationDays)));
        const days = [];

        for (let i = 1; i <= daysCount; i++) {
          days.push({
            day: i,
            title: `Introduction & Key Concepts of ${topic} - Part ${i}`,
            activities: [
              `Warm-up: Q&A session recalling previous background knowledge (10 mins).`,
              `Interactive Lecture: Core theories, formulas, and visual slides for ${topic} (25 mins).`,
              `Guided Practice: Group discussion and worksheet resolving standard problems (15 mins).`
            ],
            homework: `Read Chapter ${i} of textbook and complete problems 1 through 5.`
          });
        }

        return res.json({
          success: true,
          data: {
            title: `Lesson Plan: ${topic} (${grade})`,
            durationDays: daysCount,
            objectives: [
              `Identify and define the fundamental principles of ${topic}.`,
              `Apply mathematical formulas or core frameworks to solve standard scenarios.`,
              `Collaborate in groups to analyze practical worksheets and present conclusions.`
            ],
            days
          }
        });
      }

      if (toolType === 'reportCard') {
        const { studentName = 'Student', grade = 'Grade 8', performance = 'Excellent', keywords = '' } = payload;
        
        let commentText = '';
        const traits = keywords ? `showing great skill in ${keywords}` : 'displaying excellent focus and effort';

        if (performance === 'Excellent') {
          commentText = `${studentName} is an outstanding student in this class. They consistently complete all assignments on time and demonstrate a deep, mature understanding of the material, ${traits}. Their classroom engagement is exemplary, and they frequently help peers grasp complex topics. It is a pleasure to have ${studentName} in my classroom, and I look forward to witnessing their continued academic growth.`;
        } else if (performance === 'Proficient') {
          commentText = `${studentName} has performed very well this term. They show a clear understanding of the core curricula and actively participate in group activities, ${traits}. With continued focus on double-checking their work and revising theoretical concepts, they can reach the top tier. Keep up the good work!`;
        } else {
          commentText = `${studentName} is making progress in class but would benefit from additional focus on the fundamental concepts. Currently, they sometimes struggle to stay fully engaged during lectures. However, when working on hands-on activities, they show promise. I encourage ${studentName} to seek help during office hours and regularly review worksheets at home to build confidence.`;
        }

        return res.json({
          success: true,
          data: {
            studentName,
            performance,
            comment: commentText
          }
        });
      }

      return res.status(400).json({ error: 'Unsupported toolType.' });
    }

    // Real Claude API Call Mode
    let prompt = '';
    if (toolType === 'rubric') {
      const { topic, grade, totalMarks } = payload;
      prompt = `Generate a detailed grading rubric table for a student assignment. Topic: ${topic}, Grade: ${grade}, Total Marks: ${totalMarks}. Detail the evaluation criteria (e.g. Content, Organization, Evidence, Mechanics) and levels of achievement (Exemplary, Proficient, Developing, Beginning) with specific descriptors and allocated marks for each cell. Return ONLY a valid JSON object. No explanation, no markdown, no backticks.
      JSON structure:
      {
        "title": "Grading Rubric: ${topic}",
        "totalMarks": ${totalMarks},
        "criteria": [
          {
            "name": "Criterion Name",
            "maxMarks": 5,
            "achievementLevels": {
              "Exemplary": "descriptor text",
              "Proficient": "descriptor text",
              "Developing": "descriptor text",
              "Beginning": "descriptor text"
            }
          }
        ]
      }`;
    } else if (toolType === 'lessonPlan') {
      const { topic, grade, durationDays } = payload;
      prompt = `Generate a professional day-by-day lesson plan. Topic: ${topic}, Grade: ${grade}, Duration: ${durationDays} days. Detail day-by-day objectives, class activities, and homework assignments. Return ONLY a valid JSON object. No explanation, no markdown, no backticks.
      JSON structure:
      {
        "title": "Lesson Plan: ${topic}",
        "durationDays": ${durationDays},
        "objectives": ["Objective 1", "Objective 2"],
        "days": [
          {
            "day": 1,
            "title": "Day Topic",
            "activities": ["Activity 1", "Activity 2"],
            "homework": "Homework detail description"
          }
        ]
      }`;
    } else if (toolType === 'reportCard') {
      const { studentName, grade, performance, keywords } = payload;
      prompt = `Generate a professional, constructive teacher comment paragraph for a student report card. Student Name: ${studentName}, Grade: ${grade}, Performance Level: ${performance}, Key qualities/keywords: ${keywords}. Return ONLY a valid JSON object. No explanation, no markdown, no backticks.
      JSON structure:
      {
        "studentName": "${studentName}",
        "performance": "${performance}",
        "comment": "Constructed report card paragraph comment..."
      }`;
    } else {
      return res.status(400).json({ error: 'Unsupported toolType.' });
    }

    const apiKey = config.geminiApiKey;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const maxRetries = 3;
    let delay = 1500;
    let lastError: any = null;
    let parsed: any = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
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

        // Handle transient errors with retry
        if (response.status === 503 || response.status === 429) {
          console.warn(`Gemini API toolkit returned status ${response.status} (attempt ${attempt}/${maxRetries}) due to high demand. Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
          continue;
        }

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
        parsed = JSON.parse(cleaned);
        break; // Break the loop if we succeed
      } catch (error: any) {
        lastError = error;
        console.warn(`Gemini API toolkit call attempt ${attempt} failed: ${error.message || error}`);
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
        }
      }
    }

    if (!parsed) {
      console.error('All Gemini API retries exhausted for toolkit generator:', lastError);
      throw new Error(`AI generation failed: ${lastError.message || lastError}`);
    }

    res.json({
      success: true,
      data: parsed
    });

  } catch (err: any) {
    console.error('Toolkit AI generation failed:', err);
    res.status(500).json({ error: 'AI generation request failed.' });
  }
});

export default router;
