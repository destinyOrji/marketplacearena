/**
 * PasswordStrengthMeter
 *
 * Shows a live color bar + checklist as the user types a password.
 * Mirrors the same rules enforced on the backend (validatePassword.js):
 *   ✓ 8+ characters
 *   ✓ Uppercase letter  (A–Z)
 *   ✓ Lowercase letter  (a–z)
 *   ✓ Number            (0–9)
 *   ✓ Special character (@#$%! etc.)
 *
 * Usage:
 *   <PasswordStrengthMeter password={passwordValue} />
 */
import React from 'react';

interface Rule {
  label: string;
  test: (pw: string) => boolean;
}

const RULES: Rule[] = [
  { label: 'At least 8 characters',              test: pw => pw.length >= 8 },
  { label: 'At least one uppercase letter (A–Z)', test: pw => /[A-Z]/.test(pw) },
  { label: 'At least one lowercase letter (a–z)', test: pw => /[a-z]/.test(pw) },
  { label: 'At least one number (0–9)',           test: pw => /[0-9]/.test(pw) },
  { label: 'At least one special character (@#$%! etc.)', test: pw => /[^A-Za-z0-9]/.test(pw) },
];

/** Returns 0–5 based on how many rules pass. */
export const getPasswordStrength = (password: string): number =>
  RULES.filter(r => r.test(password)).length;

interface Props {
  password: string;
  /** Show checklist items. Default true. */
  showChecklist?: boolean;
  /** Hide the whole component when password is empty. Default true. */
  hideWhenEmpty?: boolean;
}

const PasswordStrengthMeter: React.FC<Props> = ({
  password,
  showChecklist = true,
  hideWhenEmpty = true,
}) => {
  if (hideWhenEmpty && !password) return null;

  const strength = getPasswordStrength(password);

  // Bar segments: 0 = grey, 1–2 = red, 3 = orange, 4 = yellow, 5 = green
  const segmentColor = (index: number): string => {
    if (index >= strength) return 'bg-gray-200';
    if (strength <= 2) return 'bg-red-500';
    if (strength === 3) return 'bg-orange-500';
    if (strength === 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const strengthLabel = (): { text: string; color: string } => {
    if (strength === 0) return { text: 'Too weak',  color: 'text-red-500' };
    if (strength === 1) return { text: 'Very weak', color: 'text-red-500' };
    if (strength === 2) return { text: 'Weak',      color: 'text-red-500' };
    if (strength === 3) return { text: 'Fair',      color: 'text-orange-500' };
    if (strength === 4) return { text: 'Good',      color: 'text-yellow-600' };
    return { text: 'Strong', color: 'text-green-600' };
  };

  const { text, color } = strengthLabel();

  return (
    <div className="mt-2 space-y-2">
      {/* Strength bar */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1 flex-1">
          {RULES.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${segmentColor(i)}`}
            />
          ))}
        </div>
        <span className={`text-xs font-semibold w-16 text-right ${color}`}>{text}</span>
      </div>

      {/* Checklist */}
      {showChecklist && (
        <ul className="space-y-0.5">
          {RULES.map(rule => {
            const passed = rule.test(password);
            return (
              <li key={rule.label} className="flex items-center gap-1.5 text-xs">
                {passed ? (
                  <svg className="h-3.5 w-3.5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                )}
                <span className={passed ? 'text-green-700' : 'text-gray-500'}>{rule.label}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default PasswordStrengthMeter;
