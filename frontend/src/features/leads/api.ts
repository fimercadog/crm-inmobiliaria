import { api } from "@/lib/api/axios";
import type { ApiSuccessResponse } from "@/types/api";
import type { Client } from "@/types/client";
import type { Lead } from "@/types/lead";
import type { LeadFormOutput } from "@/features/leads/lead-form-schema";

export async function createLead(values: LeadFormOutput): Promise<Lead> {
  const response = await api.post<ApiSuccessResponse<Lead>>("/leads", values);
  return response.data.data;
}

export async function updateLead(id: number, values: LeadFormOutput): Promise<Lead> {
  const response = await api.put<ApiSuccessResponse<Lead>>(`/leads/${id}`, values);
  return response.data.data;
}

export async function deleteLead(id: number): Promise<void> {
  await api.delete(`/leads/${id}`);
}

export async function fetchLead(id: number): Promise<Lead> {
  const response = await api.get<ApiSuccessResponse<Lead>>(`/leads/${id}`);
  return response.data.data;
}

export async function convertLead(id: number): Promise<Client> {
  const response = await api.post<ApiSuccessResponse<Client>>(`/leads/${id}/convert`);
  return response.data.data;
}
