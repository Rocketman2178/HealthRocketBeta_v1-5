import { sleepChallenges } from './sleepChallenges';
import { mindsetChallenges } from './mindsetChallenges';
import { nutritionChallenges } from './nutritionChallenges';
import { exerciseChallenges } from './exerciseChallenges';
import { biohackingChallenges } from './biohackingChallenges';
import { premiumChallenges } from './premiumChallenges';
import { tier0Challenge } from './tier0Challenge';
import type { Challenge } from '../../types/game';

// Update tier0Challenge category
tier0Challenge.category = 'Contests';

// Export tier0Challenge separately
export { tier0Challenge };

// Export all challenges including Tier 0
export const challenges: Challenge[] = [
  tier0Challenge,
  ...premiumChallenges,
  ...sleepChallenges,
  ...mindsetChallenges,
  ...nutritionChallenges,
  ...exerciseChallenges,
  ...biohackingChallenges
];