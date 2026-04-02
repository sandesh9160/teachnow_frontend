import { api, getCsrfCookie } from "@/services/api/client";
import type { Resume, ResumeResponse } from "@/types/resume";

function normalizeResumeList(body: unknown): Resume[] {
  if (Array.isArray(body)) return body as Resume[];
  const root = body as Record<string, unknown> | null | undefined;
  const inner = root?.data;
  if (Array.isArray(inner)) return inner as Resume[];
  if (inner && typeof inner === "object" && !Array.isArray(inner)) return [inner as Resume];
  return [];
}

export async function getResumes(): Promise<Resume[]> {
  const response = await api.get<unknown>("/jobseeker/resumes");
  return normalizeResumeList(response.data);
}

export async function uploadResume(file: File): Promise<unknown> {
  if (typeof window !== "undefined") await getCsrfCookie();

  const formData = new FormData();
  formData.append("resume", file);
  formData.append("title", file.name);

  const response = await api.post<ResumeResponse>("/jobseeker/resumes", formData, {
    transformRequest: [
      (data, headers) => {
        if (headers && typeof (headers as { delete?: (k: string) => void }).delete === "function") {
          (headers as { delete: (k: string) => void }).delete("Content-Type");
        }
        return data;
      },
    ],
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  });
  return response.data;
}

export async function deleteResume(id: number | string): Promise<unknown> {
  if (typeof window !== "undefined") await getCsrfCookie();
  const response = await api.delete<unknown>(`/jobseeker/resumes/${id}`);
  return response.data;
}

export async function setDefaultResume(id: number | string): Promise<unknown> {
  if (typeof window !== "undefined") await getCsrfCookie();
  const response = await api.post<unknown>(`/jobseeker/resumes/${id}/default`);
  return response.data;
}
