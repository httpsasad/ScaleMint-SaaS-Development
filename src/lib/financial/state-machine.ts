/**
 * ScaleMint Funding Request State Machine
 * Authoritative Server-Side State Transitions and Role Enforcements
 */

export type FundingRequestBackendStatus = 
  | 'pending'
  | 'approved'
  | 'processing'
  | 'completed'
  | 'rejected'
  | 'failed'
  | 'cancelled';

export interface StateTransitionResult {
  valid: boolean;
  error?: string;
  isTerminal?: boolean;
}

// Permitted transition table
const VALID_TRANSITIONS: Record<FundingRequestBackendStatus, readonly FundingRequestBackendStatus[]> = {
  pending: ['approved', 'rejected', 'cancelled'],
  approved: ['processing', 'cancelled'],
  processing: ['completed', 'failed'],
  completed: [], // Terminal
  rejected: [],  // Terminal
  failed: [],    // Terminal
  cancelled: [], // Terminal
};

const TERMINAL_STATES: ReadonlySet<FundingRequestBackendStatus> = new Set([
  'completed',
  'rejected',
  'failed',
  'cancelled',
]);

/**
 * Checks whether a proposed state transition is valid according to the state graph.
 */
export function isValidStateTransition(
  currentStatus: FundingRequestBackendStatus,
  targetStatus: FundingRequestBackendStatus
): StateTransitionResult {
  if (currentStatus === targetStatus) {
    return {
      valid: true,
      error: 'Idempotent transition: Current state already matches target state.',
      isTerminal: TERMINAL_STATES.has(currentStatus),
    };
  }

  if (TERMINAL_STATES.has(currentStatus)) {
    return {
      valid: false,
      error: `Cannot transition from terminal state "${currentStatus}" to "${targetStatus}".`,
      isTerminal: true,
    };
  }

  const allowed = VALID_TRANSITIONS[currentStatus];
  if (!allowed || !allowed.includes(targetStatus)) {
    return {
      valid: false,
      error: `Invalid transition: State "${currentStatus}" cannot transition directly to "${targetStatus}". Permitted next states: [${allowed.join(', ')}].`,
      isTerminal: false,
    };
  }

  return {
    valid: true,
    isTerminal: TERMINAL_STATES.has(targetStatus),
  };
}

/**
 * Validates whether the acting user role has authority to execute the transition.
 * 
 * Rules:
 * - Clients can ONLY cancel their own requests in 'pending' state.
 * - Clients CANNOT approve, reject, or mark requests as processing/completed.
 * - Platform owners and admins have full authority for administrative decisions.
 */
export function validateStateTransitionPermission(
  actorRole: string,
  currentStatus: FundingRequestBackendStatus,
  targetStatus: FundingRequestBackendStatus
): { permitted: boolean; error?: string } {
  const isOwnerOrAdmin = actorRole === 'scalemint_owner' || actorRole === 'scalemint_admin';

  if (targetStatus === 'cancelled') {
    // Both client and owner can cancel
    if (isOwnerOrAdmin) return { permitted: true };
    if (currentStatus === 'pending') return { permitted: true };
    return {
      permitted: false,
      error: 'Clients may only cancel funding requests that are still in "pending" status.',
    };
  }

  // All other state transitions (approved, rejected, processing, completed, failed) require owner/admin privileges
  if (!isOwnerOrAdmin) {
    return {
      permitted: false,
      error: `Unauthorized: Only platform owners or administrators are permitted to transition requests to "${targetStatus}".`,
    };
  }

  return { permitted: true };
}
