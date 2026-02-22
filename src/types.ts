export type SubscriptionTier = 'free' | 'pro' | 'federation';
export type UserRole = 'superadmin' | 'admin' | 'member';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  poolId?: string;
  reputationScore: number;
  contributionScore: number;
  votingParticipation: number;
  proposalAccuracy: number;
}

export interface Subscription {
  id: string;
  poolId: string;
  tier: SubscriptionTier;
  status: 'active' | 'canceled' | 'past_due';
  currentPeriodEnd: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export interface Pool {
  id: string;
  name: string;
  description: string;
  subscriptionTier: SubscriptionTier;
  isPrivate: boolean;
  treasuryBalance: number;
  createdAt: string;
  adminId: string;
  transparencyUrl?: string;
}

export interface Proposal {
  id: string;
  poolId: string;
  title: string;
  description: string;
  creatorId: string;
  status: 'active' | 'passed' | 'rejected' | 'closed';
  votesFor: number;
  votesAgainst: number;
  weightedVotesFor: number;
  weightedVotesAgainst: number;
  createdAt: string;
  expiresAt: string;
}

export interface Case {
  id: string;
  poolId: string;
  title: string;
  description: string;
  stage: 'filing' | 'discovery' | 'trial' | 'judgment' | 'appeal';
  estimatedCost: number;
  actualCost: number;
  status: 'ongoing' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface FederationGroup {
  id: string;
  title: string;
  memberPools: string[];
  sharedTreasury: number;
  governanceModel: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  poolId: string;
  userId: string;
  action: string;
  details: string;
  timestamp: string;
}
