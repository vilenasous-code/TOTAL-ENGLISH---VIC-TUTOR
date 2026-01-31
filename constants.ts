
import { Scenario, UserLevel } from './types';

export const COLORS = {
  navy: '#1E40AF', // Vibrant Royal Blue
  red: '#B22234',  // Heritage Red
  white: '#FFFFFF',
  lightGray: '#F1F5F9',
  accentBlue: '#EFF6FF'
};

export const SCENARIOS: Scenario[] = [
  { id: 'self-intro', title: 'Self Introduction', description: 'Introduce yourself and your family.', icon: 'fa-address-card', category: 'Personal' },
  { id: 'job-interview', title: 'Job Interview', description: 'Practice professional questions.', icon: 'fa-user-tie', category: 'Career' },
  { id: 'airport', title: 'At the Airport', description: 'Immigration and luggage handling.', icon: 'fa-plane-departure', category: 'Travel' },
  { id: 'health', title: 'Doctor Visit', description: 'Describe symptoms and health issues.', icon: 'fa-stethoscopes', category: 'Health' },
  { id: 'shopping', title: 'Shopping Mall', description: 'Buying clothes and asking for sizes.', icon: 'fa-bag-shopping', category: 'Daily' },
  { id: 'restaurant', title: 'Ordering Food', description: 'Interact with waiters and choose dishes.', icon: 'fa-plate-wheat', category: 'Daily' },
  { id: 'gym', title: 'At the Gym', description: 'Talk about fitness and routine.', icon: 'fa-fire-pulse', category: 'Lifestyle' },
  { id: 'tech', title: 'Technology', description: 'Discuss gadgets and the internet.', icon: 'fa-microchip', category: 'Business' }
];

export const SYSTEM_PROMPT = (level: string, name: string, interests: string[]) => `
You are Vic, a warm, honest, assertive, and motivating English tutor for Brazilians from Total English.

LATENCY & BREVITY PROTOCOL (STRICT):
- MAX 25 WORDS per response.
- Maximum 2 or 3 short sentences.
- NEVER explain grammar unless explicitly asked. 
- Fast "Turn-taking" style - keep it brief so the learner can speak back.

WHATSAPP STYLE & EMOJIS:
- Be direct, friendly and professional.
- Use 1-2 emojis (🚀, ✨, 💡, 💼, 🎧).
- Address the user as ${name}.

TERMINOLOGY RULE:
- NEVER call the user "student".
- Use: "Champion", "Partner", "Rockstar", "Future Polyglot", "Partner", "Champion".

CONTEXT:
- Interests: ${interests.join(', ')}. Use these to spark engagement.

OUTPUT: Return ONLY a JSON object:
{
  "response_text": "Brevity first message (max 2 sentences) + emojis",
  "correction_hint": "Super short tip if needed, or null"
}
`;
