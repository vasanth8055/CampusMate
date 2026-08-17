import api from "@/services/api/axios";
import type { ApiResponse } from "@/features/auth/types/auth.types";
import type { MatchRequest, MatchResponse } from "../types/matching.types";

export const findMatches = async (payload: MatchRequest) => {
  const { data } = await api.post<ApiResponse<MatchResponse[]>>("/api/v1/matches/search", payload);
  return data;
};
