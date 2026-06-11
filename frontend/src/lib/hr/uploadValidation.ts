// Allowed MIME types for HR document uploads
const ALLOWED_DOC_MIMES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const ALLOWED_PHOTO_MIMES = new Set(["image/jpeg", "image/png", "image/webp"]);

const MAX_DOC_SIZE_BYTES = 10 * 1024 * 1024;  // 10 MB
const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export function validateDocumentUpload(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_DOC_MIMES.has(file.type)) {
    return { valid: false, error: `File type not allowed: ${file.type}. Allowed: PDF, Word, JPEG, PNG, WebP.` };
  }
  if (file.size > MAX_DOC_SIZE_BYTES) {
    return { valid: false, error: `File too large (max 10 MB). Got ${(file.size / 1024 / 1024).toFixed(1)} MB.` };
  }
  return { valid: true };
}

export function validatePhotoUpload(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_PHOTO_MIMES.has(file.type)) {
    return { valid: false, error: `Photo type not allowed: ${file.type}. Allowed: JPEG, PNG, WebP.` };
  }
  if (file.size > MAX_PHOTO_SIZE_BYTES) {
    return { valid: false, error: `Photo too large (max 5 MB). Got ${(file.size / 1024 / 1024).toFixed(1)} MB.` };
  }
  return { valid: true };
}
