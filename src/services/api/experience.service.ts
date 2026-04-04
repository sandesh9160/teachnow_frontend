import { dashboardServerFetch } from "@/actions/dashboardServerFetch";
import type { ExperiencePayload, ExperienceRecord } from "@/types/experience";

function extractExperienceList(body: unknown): ExperienceRecord[] {
  const root = body as Record<string, unknown> | null | undefined;
  const inner = (root?.data as Record<string, unknown> | undefined) ?? root;
  const raw = inner?.experiences ?? inner?.experience;
  return Array.isArray(raw) ? (raw as ExperienceRecord[]) : [];
}

export async function listExperiences(): Promise<ExperienceRecord[]> {
  const response = await dashboardServerFetch("/jobseeker/profile", { method: "GET" });
  return extractExperienceList(response);
}

export async function createExperience(payload: ExperiencePayload): Promise<unknown> {
  const response = await dashboardServerFetch("/jobseeker/experience", {
    method: "POST",
    data: payload,
  });
  return response;
}

export async function updateExperience(id: number | string, payload: ExperiencePayload): Promise<unknown> {
  const response = await dashboardServerFetch(`/jobseeker/experience/${id}`, {
    method: "PUT",
    data: payload,
  });
  return response;
}

export async function deleteExperience(id: number | string): Promise<unknown> {
  const response = await dashboardServerFetch(`/jobseeker/experience/${id}`, {
    method: "DELETE",
  });
  return response;
}
