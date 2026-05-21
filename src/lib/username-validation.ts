const BAD_WORDS = [
  'fuck', 'shit', 'ass', 'dick', 'pussy', 'bitch', 'nigger', 'nigga',
  'faggot', 'retard', 'cunt', 'whore', 'slut', 'nazi', 'hitler',
  'penis', 'vagina', 'cock', 'porn', 'sex', 'rape', 'kill', 'murder',
  'suicide', 'terrorist', 'bomb', 'drug', 'weed', 'crack', 'heroin',
];

function containsBadWord(username: string): boolean {
  const lower = username.toLowerCase().replace(/[_.\d]/g, '');
  return BAD_WORDS.some(word => lower.includes(word));
}

// Leet speak mapping
function deobfuscate(str: string): string {
  const map: Record<string, string> = {
    '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's',
    '7': 't', '8': 'b', '@': 'a', '$': 's',
  };
  let result = '';
  for (const ch of str.toLowerCase()) {
    result += map[ch] || ch;
  }
  return result.replace(/[_.]/g, '');
}

function containsBadWordDeobfuscated(username: string): boolean {
  const clean = deobfuscate(username);
  return BAD_WORDS.some(word => clean.includes(word));
}

export interface UsernameValidationResult {
  valid: boolean;
  error?: string;
}

export function validateUsername(username: string): UsernameValidationResult {
  if (!username) {
    return { valid: false, error: 'Username is required' };
  }

  if (username.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' };
  }

  if (username.length > 20) {
    return { valid: false, error: 'Username must be at most 20 characters' };
  }

  // Only letters, numbers, underscore, period allowed
  if (!/^[a-zA-Z0-9_.]+$/.test(username)) {
    return { valid: false, error: 'Only letters, numbers, _ and . are allowed' };
  }

  // Must start with a letter or number
  if (/^[_.]/.test(username)) {
    return { valid: false, error: 'Username must start with a letter or number' };
  }

  // Cannot end with a symbol
  if (/[_.]$/.test(username)) {
    return { valid: false, error: 'Username cannot end with a symbol' };
  }

  // No consecutive symbols
  if (/[_.]{2,}/.test(username)) {
    return { valid: false, error: 'Symbols cannot be used consecutively' };
  }

  // Profanity check
  if (containsBadWord(username) || containsBadWordDeobfuscated(username)) {
    return { valid: false, error: 'This username is not allowed' };
  }

  return { valid: true };
}

export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password) {
    return { valid: false, error: 'Password is required' };
  }
  if (password.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters' };
  }
  if (password.length > 128) {
    return { valid: false, error: 'Password must be at most 128 characters' };
  }
  return { valid: true };
}

// Generate a nice avatar color from a set of pleasant colors
const AVATAR_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#F97316', '#6366F1', '#14B8A6',
  '#E11D48', '#7C3AED', '#2563EB', '#059669', '#D97706',
];

export function getRandomAvatarColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}
