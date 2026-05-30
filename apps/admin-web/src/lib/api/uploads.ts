import { COMMERCE_API_URL } from "./config";

export interface UploadResponse {
  success: boolean;
  publicUrl?: string;
  path?: string;
  error?: string;
}

export async function uploadImage(params: {
  bucket: string;
  path: string;
  base64: string;
  contentType: string;
}): Promise<UploadResponse> {
  const res = await fetch(`${COMMERCE_API_URL}/uploads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
    credentials: "include"
  });

  return await res.json();
}

/**
 * Converts a File object to a Base64 string (stripped of prefix)
 */
export function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const base64 = result.includes('base64,') ? result.split('base64,')[1] : result;
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * Generates a unique file path for uploads
 */
export function generateFilePath(folder: string, originalName: string): string {
  const fileExt = originalName.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  return `${folder}/${fileName}`;
}
