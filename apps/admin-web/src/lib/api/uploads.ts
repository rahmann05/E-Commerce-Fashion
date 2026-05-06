import { API_BASE_URL } from "./config";

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
  const res = await fetch(`${API_BASE_URL}/uploads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
    credentials: "include"
  });

  return await res.json();
}
