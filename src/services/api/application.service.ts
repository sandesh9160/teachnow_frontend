import { api, getCsrfCookie } from "@/services/api/client";
import type { ApplicationPayload } from "@/types/application";

export async function applyJob(jobId: string | number, payload: ApplicationPayload): Promise<unknown> {
  if (typeof window !== "undefined") await getCsrfCookie();
  const response = await api.post<unknown>(`/jobseeker/jobs/${jobId}/apply`, payload);
  return response.data;
}
