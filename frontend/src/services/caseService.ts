import api from './api';

export interface Case {
  id: number;
  file_number: string;
  full_name: string;
  phone_number_1: string;
  phone_number_2?: string;
  country?: string;
  city: string;
  street_address?: string;
  notes?: string;
  housing_type: string;
  join_date: string;
  family_income: number;
  property_rental_income: number;
  other_income: number;
  receives_government_aid: boolean;
  government_aid_organization?: string;
  is_parent_deceased: boolean;
  is_monthly_aid: boolean;
  monthly_aid_amount?: number;
  created_at: string;
  total_income?: number;
}

export interface FamilyMember {
  id: number;
  case_id: number;
  name: string;
  age?: number;
  marital_status?: string;
  school_or_university?: string;
  family_relation: string;
  notes?: string;
}

export interface WorkRecord {
  id: number;
  case_id: number;
  person_type: string;
  employer_name?: string;
  employer_address?: string;
  employer_phone?: string;
  job_title?: string;
  monthly_salary?: number;
}

const caseService = {
  // Cases
  getCases: (params?: any) => api.get('/cases', { params }),
  getCase: (id: number) => api.get(`/cases/${id}`),
  createCase: (data: Partial<Case>) => api.post('/cases', data),
  updateCase: (id: number, data: Partial<Case>) => api.put(`/cases/${id}`, data),
  deleteCase: (id: number) => api.delete(`/cases/${id}`),
  
  // Family Members
  getFamilyMembers: (caseId: number) => api.get(`/cases/${caseId}/family`),
  createFamilyMember: (caseId: number, data: Partial<FamilyMember>) => api.post(`/cases/${caseId}/family`, data),
  updateFamilyMember: (memberId: number, data: Partial<FamilyMember>) => api.put(`/family/${memberId}`, data),
  deleteFamilyMember: (memberId: number) => api.delete(`/family/${memberId}`),
  
  // Work Records
  getWorkRecords: (caseId: number) => api.get(`/cases/${caseId}/work`),
  createWorkRecord: (caseId: number, data: Partial<WorkRecord>) => api.post(`/cases/${caseId}/work`, data),
  updateWorkRecord: (workId: number, data: Partial<WorkRecord>) => api.put(`/work/${workId}`, data),
  deleteWorkRecord: (workId: number) => api.delete(`/work/${workId}`),
  // Add to caseService object:
getAids: (params?: any) => api.get('/aids', { params }),
getAid: (id: number) => api.get(`/aids/${id}`),
createAid: (data: any) => api.post('/aids', data),
updateAid: (id: number, data: any) => api.put(`/aids/${id}`, data),
deleteAid: (id: number) => api.delete(`/aids/${id}`),
getAidReceipt: (id: number) => api.get(`/aids/${id}/receipt`),
getAidTypes: () => api.get('/aids/types'),
getCasesForDropdown: () => api.get('/cases', { params: { size: 100 } }),

// Monthly Aid Methods (Simplified)
getCurrentCycle: () => api.get('/monthly/cycles/current'),
generateCurrentCycleTransactions: () => api.post('/monthly/cycles/current/generate'),
closeCurrentCycle: () => api.post('/monthly/cycles/current/close'),
getCurrentTransactions: (params?: any) => api.get('/monthly/current/transactions', { params }),
getCycleHistory: (params?: any) => api.get('/monthly/cycles/history', { params }),
markTransactionDelivered: (transactionId: number, data?: any) => api.put(`/monthly/transactions/${transactionId}/deliver`, data || {}),
bulkMarkDelivered: (transactionIds: number[]) => api.put('/monthly/transactions/bulk-deliver', transactionIds),
getMonthlyDashboard: () => api.get('/monthly/dashboard'),
openCurrentCycle: () => api.post('/monthly/cycles/current/open'),
getCycleDetails: (cycleId: number) => api.get(`/monthly/cycles/${cycleId}/details`),
exportCycleToExcel: (cycleId: number) => api.get(`/monthly/cycles/${cycleId}/export`, { responseType: 'blob' }),
};

export default caseService;