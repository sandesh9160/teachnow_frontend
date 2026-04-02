import { api } from "@/services/api/client";
import type { EducationPayload, EducationRecord } from "@/types/education";

function extractEducationList(body: unknown): EducationRecord[] {
  const root = body as Record<string, unknown> | null | undefined;
  const inner = (root?.data as Record<string, unknown> | undefined) ?? root;
  const raw = inner?.education;
  return Array.isArray(raw) ? (raw as EducationRecord[]) : [];
}

/** Lists education entries from the jobseeker profile payload (no dedicated GET /education in spec). */
export async function listEducation(): Promise<EducationRecord[]> {
  const response = await api.get<unknown>("/jobseeker/profile");
  return extractEducationList(response.data);
}

export async function createEducation(payload: EducationPayload): Promise<unknown> {
  const response = await api.post<unknown>("/jobseeker/education", payload);
  return response.data;
}

export async function updateEducation(id: number | string, payload: EducationPayload): Promise<unknown> {
  const response = await api.put<unknown>(`/jobseeker/education/${id}`, payload);
  return response.data;
}

export async function deleteEducation(id: number | string): Promise<unknown> {
  const response = await api.delete<unknown>(`/jobseeker/education/${id}`);
  return response.data;
}
