// Confirm fresh camera frames, rather than repeated reads of the same frame.
export function updatePoseHold(previous, confidence, timestamp, threshold = 0.55) {
  if (previous?.timestamp === timestamp) return previous;
  const continuous = previous && timestamp - previous.timestamp <= 250;
  const since = confidence >= threshold
    ? continuous && previous.confidence >= threshold ? previous.since : timestamp
    : null;
  return { timestamp, confidence, since,
    matched: since !== null && timestamp - since >= 180 };
}

export function hasPoseTracking(target, lm, visible) {
  if (![11, 12].every(i => visible(lm[i]))) return false;
  const left = visible(lm[15]), right = visible(lm[16]);
  const leftHand = [15, 19, 21].some(i => visible(lm[i]));
  const rightHand = [16, 20, 22].some(i => visible(lm[i]));
  switch (target) {
    case 'RIGHT_HAND_UP': return right;
    case 'LEFT_HAND_UP': return left;
    case 'TOUCH_NOSE': return visible(lm[0]) && (leftHand || rightHand);
    case 'TOUCH_HEAD': return [0, 7, 8].some(i => visible(lm[i])) && (leftHand || rightHand);
    case 'TOUCH_SHOULDERS': return leftHand && rightHand;
    case 'ARMS_OUT': return (left || visible(lm[13])) && (right || visible(lm[14]));
    default: return left && right;
  }
}
