/**
 * Age Gating evaluation following COPPA and minor safety requirements
 * 
 * Rules:
 * - Under 13: Blocked (COPPA compliance)
 * - 13–15: Allowed, flagged as minor, restricted explicit content, no ad targeting
 * - 16–17: Allowed, minor policy
 * - 18+: Full access
 */
export function evaluateAge(dobString) {
  if (!dobString || typeof dobString !== 'string') {
    return { valid: false, blocked: true, error: 'Date of birth is required.' };
  }

  const birthDate = new Date(dobString);
  if (isNaN(birthDate.getTime())) {
    return { valid: false, blocked: true, error: 'Invalid date format. Use YYYY-MM-DD.' };
  }

  const today = new Date();
  if (birthDate > today) {
    return { valid: false, blocked: true, error: 'Date of birth cannot be in the future.' };
  }

  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  // Under 13 COPPA blocking
  if (age < 13) {
    return {
      valid: false,
      blocked: true,
      age,
      ageBracket: 'under13',
      isMinor: true,
      error: 'Account creation is not permitted for individuals under 13 years of age under child online privacy regulations (COPPA).',
    };
  }

  // 13–15 minor tier
  if (age <= 15) {
    return {
      valid: true,
      blocked: false,
      age,
      ageBracket: '13-15',
      isMinor: true,
      contentPolicy: {
        explicitContent: false,
        adTargeting: false,
        socialFeatures: false,
      },
    };
  }

  // 16–17 tier
  if (age <= 17) {
    return {
      valid: true,
      blocked: false,
      age,
      ageBracket: '16-17',
      isMinor: true,
      contentPolicy: {
        explicitContent: false,
        adTargeting: false,
        socialFeatures: true,
      },
    };
  }

  // 18+ full tier
  return {
    valid: true,
    blocked: false,
    age,
    ageBracket: '18+',
    isMinor: false,
    contentPolicy: {
      explicitContent: true,
      adTargeting: true,
      socialFeatures: true,
    },
  };
}
