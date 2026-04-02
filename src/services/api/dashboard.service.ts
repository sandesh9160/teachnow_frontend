import { api } from "@/services/api/client";
import type { DashboardResponse } from "@/types/dashboard";

export async function getDashboard(): Promise<DashboardResponse> {
  const response = await api.get<DashboardResponse>("/jobseeker/dashboard");
  return response.data;
}
