/**
 * NyayaOS Civic - Cloud Functions Skeleton (TypeScript)
 * 
 * These functions handle sensitive logic like reputation recalculation,
 * subscription enforcement, and automated governance tasks.
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

/**
 * REPUTATION ENGINE
 * Recalculates user governance weight based on activity.
 * Triggered periodically or on specific actions.
 */
export const recalculateReputation = functions.firestore
  .document('pools/{poolId}/proposals/{proposalId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const oldData = change.before.data();

    // Only recalculate if a proposal was closed/passed
    if (newData.status !== 'active' && oldData.status === 'active') {
      const { poolId } = context.params;
      const creatorId = newData.creatorId;

      const userRef = db.collection('users').doc(creatorId);
      const userDoc = await userRef.get();
      const userData = userDoc.data();

      if (!userData) return;

      // Formula: (contributionScore * 0.4) + (votingParticipation * 0.3) + (proposalAccuracy * 0.3)
      const newWeight = (userData.contributionScore * 0.4) + 
                        (userData.votingParticipation * 0.3) + 
                        (userData.proposalAccuracy * 0.3);

      await userRef.update({ reputationScore: newWeight });
      
      // Log the audit event
      await db.collection('pools').doc(poolId).collection('auditLogs').add({
        userId: 'system',
        action: 'REPUTATION_UPDATE',
        details: `Updated reputation for ${creatorId} to ${newWeight}`,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  });

/**
 * SUBSCRIPTION ENFORCEMENT
 * Checks tier before allowing Pro/Federation features.
 */
export const checkFeatureAccess = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User must be signed in.');

  const { poolId, feature } = data;
  const poolDoc = await db.collection('pools').doc(poolId).get();
  const poolData = poolDoc.data();

  if (!poolData) throw new functions.https.HttpsError('not-found', 'Pool not found.');

  const tier = poolData.subscriptionTier;

  const featureMap: { [key: string]: string[] } = {
    'reputation_voting': ['pro', 'federation'],
    'cost_projection': ['pro', 'federation'],
    'federation_module': ['federation'],
    'private_pools': ['pro', 'federation']
  };

  const allowedTiers = featureMap[feature] || ['free', 'pro', 'federation'];
  return { allowed: allowedTiers.includes(tier) };
});

/**
 * AUTOMATED PROPOSAL CLOSURE
 * Scheduled task to close expired proposals.
 */
export const autoCloseProposals = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => {
    const now = admin.firestore.Timestamp.now();
    const expiredProposals = await db.collectionGroup('proposals')
      .where('status', '==', 'active')
      .where('expiresAt', '<=', now)
      .get();

    const batch = db.batch();
    expiredProposals.forEach(doc => {
      const data = doc.data();
      const status = data.votesFor > data.votesAgainst ? 'passed' : 'rejected';
      batch.update(doc.ref, { status });
    });

    await batch.commit();
    console.log(`Closed ${expiredProposals.size} proposals.`);
  });
