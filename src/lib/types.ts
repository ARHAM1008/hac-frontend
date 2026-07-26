export interface User {
  id: string;
  full_name: string;
  email: string;
  is_active: boolean;
  has_completed_onboarding: boolean;
  created_at: string;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ApiError {
  detail: string;
}

export interface Document {
  id: string;
  filename: string;
  status: "processing" | "completed" | "failed";
  file_size: number;
  created_at: string;
}

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
}

export interface Citation {
  filename: string;
  page_number: number;
  preview: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations: Citation[];
  created_at: string;
}

export interface Scheme {
  id: string;
  name: string;
  description: string;
  category: string;
  benefits: string;
  details_url: string;
}

export interface SchemeMatch extends Scheme {
  score: number;
  reasons: string[];
  is_eligible: boolean;
}
