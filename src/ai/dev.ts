import { config } from 'dotenv';
config();

import '@/ai/flows/generate-architecture-summary.ts';
import '@/ai/flows/generate-file-by-file-documentation.ts';
import '@/ai/flows/answer-repo-question.ts';
