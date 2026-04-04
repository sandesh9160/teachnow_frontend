// import { api } from "@/services/api/client";
import { dashboardServerFetch } from "@/actions/dashboardServerFetch";  
import type { EducationPayload, EducationRecord } from "@/types/education";

function extractEducationList(body: unknown): EducationRecord[] {
  const root = body as Record<string, unknown> | null | undefined;
  const inner = (root?.data as Record<string, unknown> | undefined) ?? root;
  const raw = inner?.educations ?? inner?.education;
  return Array.isArray(raw) ? (raw as EducationRecord[]) : [];
}

/** Lists education entries from the jobseeker profile payload (no dedicated GET /education in spec). */
export async function listEducation(): Promise<EducationRecord[]> {
  const response = await dashboardServerFetch("/jobseeker/profile", { method: "GET" });
  return extractEducationList(response);
}

export async function createEducation(payload: EducationPayload): Promise<unknown> {
  const response = await dashboardServerFetch("/jobseeker/education", {
    method: "POST",
    data: payload,
  });
  return response;
}

export async function updateEducation(id: number | string, payload: EducationPayload): Promise<unknown> {
  const response = await dashboardServerFetch(`/jobseeker/education/${id}`, {
    method: "PUT",
    data: payload,
  });
  return response;
}

export async function deleteEducation(id: number | string): Promise<unknown> {
  const response = await dashboardServerFetch(`/jobseeker/education/${id}`, {
    method: "DELETE",
  });
  return response;
}
