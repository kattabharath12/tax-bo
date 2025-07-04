export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  is_cpa: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  full_name: string;
  password: string;
}

export interface TaxReturn {
  id: number;
  tax_year: number;
  income: number;
  deductions: number;
  withholdings: number;
  tax_owed: number;
  refund_amount: number;
  amount_owed: number;
  status: string;
  created_at: string;
}

export interface TaxFormData {
  tax_year: number;
  income: number;
  deductions?: number;
  withholdings: number;
}