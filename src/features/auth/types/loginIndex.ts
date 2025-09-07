// src/features/auth/types/loginIndex.ts
// 로그인 요청 시 필요한 credentials 타입
export interface LoginCredentials {
  user_name: string;
  password: string;
}

// 백엔드로 전송되는 실제 로그인 요청 데이터 타입
export interface LoginRequest {
  grant_type: string;
  device_id: string;
  user_name: string;
  password: string;
}

// 로그인 응답 데이터 타입
export interface LoginResponse {
  result_code: number;
  result_msg: string;
  session_key: string;
  expires_in: number; // expired_in에서 expires_in으로 수정
  tenant_id: number;
  role_id: number;
  menu_role_id: number;
}

// API 에러 타입
export interface AuthApiError {
  message: string;
  status: number;
}
