/**
 * Single source of truth for StackSphere Social Space Posting Policy
 * 
 * Rules:
 * - 0 friends: Posting BLOCKED (0 posts/day)
 * - 1 friend: 1 post/day
 * - 2 to 10 friends: 2 posts/day
 * - > 10 friends (11+): Unlimited posts/day (Infinity)
 */

export interface SocialPostingTier {
  id: string;
  minFriends: number;
  maxFriends: number;
  limit: number; // 0, 1, 2, or Infinity
  tierTitleKey: string;
  tierDescKey: string;
}

export const SOCIAL_POSTING_TIERS: SocialPostingTier[] = [
  {
    id: "noFriends",
    minFriends: 0,
    maxFriends: 0,
    limit: 0,
    tierTitleKey: "socialTierNoFriendsTitle",
    tierDescKey: "socialTierNoFriendsDesc",
  },
  {
    id: "oneFriend",
    minFriends: 1,
    maxFriends: 1,
    limit: 1,
    tierTitleKey: "socialTierOneFriendTitle",
    tierDescKey: "socialTierOneFriendDesc",
  },
  {
    id: "twoToTenFriends",
    minFriends: 2,
    maxFriends: 10,
    limit: 2,
    tierTitleKey: "socialTierTwoToTenTitle",
    tierDescKey: "socialTierTwoToTenDesc",
  },
  {
    id: "overTenFriends",
    minFriends: 11,
    maxFriends: Infinity,
    limit: Infinity,
    tierTitleKey: "socialTierOverTenTitle",
    tierDescKey: "socialTierOverTenDesc",
  },
];

/**
 * Calculates the daily post limit for a user based on their active friend count
 */
export function getDailyPostLimit(friendCount: number): number {
  if (friendCount === 0) return 0;
  if (friendCount === 1) return 1;
  if (friendCount >= 2 && friendCount <= 10) return 2;
  return Infinity;
}
