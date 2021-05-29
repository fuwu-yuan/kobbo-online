export interface NetworkResponse {
  status: "success"|"error";
  code: string;
  message?: string;
  data?: any;
}
