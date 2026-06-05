// src/fixtures/demoQuestions.ts
// One example question per horary category, used in the demo mode question picker
// and onboarding hints.

import type { HoraryCategory } from '@/constants/config';

export const DEMO_QUESTIONS: Record<HoraryCategory, string> = {
  general:      'Is this the right time to make this decision?',
  love:         'Does this person have genuine feelings for me?',
  marriage:     'Will our relationship lead to marriage?',
  career:       'Will I succeed in my new professional role?',
  job:          'Will I receive the job offer I am waiting for?',
  money:        'Will this financial investment be profitable?',
  health:       'Will my health condition improve in the coming months?',
  pregnancy:    'Will I conceive a child this year?',
  fertility:    'Is now a favourable time to try for a baby?',
  missing_item: 'Will the lost item be recovered?',
  travel:       'Will my upcoming journey go smoothly?',
};
