import { 
  Investigation, 
  InvestigationTurn, 
  Guide, 
  DocSource, 
  SystemHealth, 
  User, 
  GuideStatus 
} from '../types';

const API_BASE = '/api';

function getGuestToken(): string {
  let token = localStorage.getItem('zelqora_guest_token');
  if (!token) {
    token = 'gst_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('zelqora_guest_token', token);
  }
  return token;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  headers.set('X-Requested-With', 'XMLHttpRequest');
  headers.set('X-Zelqora-CSRF', '1');

  const guestToken = getGuestToken();
  if (guestToken) {
    headers.set('x-zelqora-guest-token', guestToken);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include' // Sends HttpOnly session cookies
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.message || data?.error || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // System Health
  getHealth: () => request<SystemHealth>('/health'),

  // Auth
  register: (email: string, password: string) => 
    request<{ user: User; token: string; claimed_investigations: number }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  login: (email: string, password: string) => 
    request<{ user: User; token: string; claimed_investigations: number }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  logout: () => 
    request<{ success: boolean }>('/auth/logout', { method: 'POST' }),

  getMe: () => 
    request<{ user: User | null; guest_token: string | null }>('/auth/me'),

  claimGuestInvestigations: () => 
    request<{ success: boolean; claimed_investigations: number }>('/auth/claim', {
      method: 'POST',
      body: JSON.stringify({ guest_token: getGuestToken() })
    }),

  // Investigations
  listInvestigations: () => 
    request<{ investigations: Investigation[] }>('/investigations'),

  getInvestigation: (id: string) => 
    request<{ investigation: Investigation }>(`/investigations/${id}`),

  createInvestigation: (data: {
    title: string;
    category: string;
    description: string;
    environment: any;
  }) => request<{ investigation: Investigation; diagnostic_engine_mode: string }>('/investigations', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  submitTurn: (id: string, data: {
    test_output?: string;
    answered_questions?: Record<string, string>;
  }) => request<{ turn: InvestigationTurn; diagnostic_engine_mode: string }>(`/investigations/${id}/turn`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  rollbackInvestigation: (id: string, turnIndex: number) => 
    request<{ success: boolean; investigation: Investigation }>(`/investigations/${id}/rollback`, {
      method: 'POST',
      body: JSON.stringify({ turn_index: turnIndex })
    }),

  resolveInvestigation: (id: string, status: 'resolved' | 'abandoned', resolutionNotes: string) => 
    request<{ investigation: Investigation }>(`/investigations/${id}/resolution`, {
      method: 'PATCH',
      body: JSON.stringify({ status, resolution_notes: resolutionNotes })
    }),

  deleteInvestigation: (id: string) => 
    request<{ success: boolean }>(`/investigations/${id}`, { method: 'DELETE' }),

  // Public Guides
  getPublishedGuides: (category?: string) => 
    request<{ guides: Guide[] }>(`/guides${category ? `?category=${encodeURIComponent(category)}` : ''}`),

  getGuideBySlug: (slug: string) => 
    request<{ guide: Guide }>(`/guides/${slug}`),

  // Editorial System
  getEditorialGuides: (status?: GuideStatus) => 
    request<{ guides: Guide[] }>(`/guides/editorial/list${status ? `?status=${status}` : ''}`),

  createGuideDraft: (draft: any) => 
    request<{ guide: Guide }>('/guides/editorial/draft', {
      method: 'POST',
      body: JSON.stringify(draft)
    }),

  updateGuideStatus: (id: string, status: GuideStatus, verification_checklist?: any) => 
    request<{ guide: Guide }>(`/guides/editorial/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, verification_checklist })
    }),

  // Documentation Registry
  getDocSources: () => 
    request<{ sources: DocSource[] }>('/documentation/sources'),

  searchDocs: (q: string, category?: string) => 
    request<{ results: any[] }>(`/documentation/search?q=${encodeURIComponent(q)}${category ? `&category=${encodeURIComponent(category)}` : ''}`),

  // Inquiries & Feedback
  submitContact: (data: { name: string; email: string; subject: string; message: string }) =>
    request<{ success: boolean; message: string }>('/contact', {
      method: 'POST',
      body: JSON.stringify(data)
    })
};
