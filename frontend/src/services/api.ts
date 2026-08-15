import { 
  DashboardSummary, AttentionStudent, ClassInsights, Student, StudentProfile, 
  Activity, Material 
} from '../types';

const API_BASE = '/api/v1';

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('student360_token');
  
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: 'An error occurred' }));
    throw new Error(errorData.detail || `API request failed with status ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Dashboard
  getDashboardSummary: () => fetchApi<DashboardSummary>('/dashboard/summary'),
  getAttentionStudents: () => fetchApi<AttentionStudent[]>('/dashboard/attention'),
  getClassInsights: () => fetchApi<ClassInsights>('/dashboard/insights'),

  // Students
  getStudents: (params?: { search?: string; status?: string; course?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);
    if (params?.course) query.append('course', params.course);
    const str = query.toString();
    return fetchApi<Student[]>(`/students${str ? `?${str}` : ''}`);
  },

  getStudentProfile: (id: number) => fetchApi<StudentProfile>(`/students/${id}`),

  createStudent: (student: Partial<Student>) => fetchApi<Student>('/students', {
    method: 'POST',
    body: JSON.stringify(student),
  }),

  // Activities Quick Actions
  createSeminar: (data: any) => fetchApi<Activity>('/activities/seminar', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  createAssignment: (data: any) => fetchApi<Activity>('/activities/assignment', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  createPbl: (data: any) => fetchApi<Activity>('/activities/pbl', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  createPgl: (data: any) => fetchApi<Activity>('/activities/pgl', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  createGenericActivity: (data: any) => fetchApi<Activity>('/activities/generic', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Materials
  getMaterials: (params?: { category?: string; course?: string; unit?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.course) query.append('course', params.course);
    if (params?.unit) query.append('unit', params.unit);
    if (params?.search) query.append('search', params.search);
    const str = query.toString();
    return fetchApi<Material[]>(`/materials${str ? `?${str}` : ''}`);
  },

  createMaterial: (formData: FormData) => fetchApi<Material>('/materials', {
    method: 'POST',
    body: formData,
  }),

  // Upload evidence file
  uploadEvidence: (formData: FormData) => fetchApi<any>('/evidence/upload', {
    method: 'POST',
    body: formData,
  }),

  // Reports
  getStudentReportPdfUrl: (studentId: number) => `/api/v1/reports/student/${studentId}/pdf`,
  getClassSummaryPdfUrl: () => `/api/v1/reports/class/summary/pdf`,
  getExportCsvUrl: () => `/api/v1/reports/export/csv`,
};
