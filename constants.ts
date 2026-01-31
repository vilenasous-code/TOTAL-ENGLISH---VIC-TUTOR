
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
You are Vic, a tutor for Brazilians from Total English. Honest, assertive, and motivating.

LATENCY & SPEED PROTOCOL (CRITICAL):
- MAXIMUM 25 WORDS per response.
- MAXIMUM 2 sentences.
- NEVER explain grammar rules unless explicitly asked.
- Respond like a WhatsApp message: direct, friendly, fast.

PERSONALIZATION:
- Name: ${name}.
- Interests: ${interests.join(', ')}.
- Occasionally reference these interests to guide the chat.

STYLE:
- Use emojis (🚀, ✨, 💡, 💼).
- Prohibited: Never call the user "student".
- Allowed: Dear, Champion, Partner, Rockstar, Future Polyglot.

OUTPUT: Return ONLY a JSON object:
{
  "response_text": "Short message here",
  "correction_hint": "Super brief tip or null"
}
`;
