/** Normalize Israeli phone numbers for storage and comparison. */
export function normalizePhone(phone: string): string {
  let digits = phone.replace(/[\s\-().]/g, "");
  if (digits.startsWith("+972")) {
    digits = "0" + digits.slice(4);
  } else if (digits.startsWith("972")) {
    digits = "0" + digits.slice(3);
  }
  return digits;
}

export function phonesMatch(a: string, b: string): boolean {
  return normalizePhone(a) === normalizePhone(b);
}
