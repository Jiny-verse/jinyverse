import type { ApiOptions, PageResponse } from '../types/api';
import { apiGet, apiPost, apiPut, apiDelete } from './api';
import type { Inquiry, InquiryThread, InquiryCreateInput, InquiryThreadCreateInput } from '../schemas/inquiry';

const INQUIRY_PATH = 'api/inquiries';

// --- External ---

/** [Public] 티켓 생성 */
export async function createInquiry(
  options: ApiOptions,
  data: InquiryCreateInput
): Promise<Inquiry> {
  return apiPost<Inquiry>(options, INQUIRY_PATH, data);
}

/** [Member] 내 티켓 목록 */
export async function getMyInquiries(
  options: ApiOptions,
  params?: { page?: number; size?: number }
): Promise<PageResponse<Inquiry>> {
  return apiGet<PageResponse<Inquiry>>(options, `${INQUIRY_PATH}/me`, {
    page: params?.page ?? 0,
    size: params?.size ?? 10,
  });
}

/** [Member] 내 티켓 상세 */
export async function getMyInquiryById(
  options: ApiOptions,
  id: string
): Promise<Inquiry> {
  return apiGet<Inquiry>(options, `${INQUIRY_PATH}/me/${id}`);
}

/** [Member] 추가 문의 (customer_message 스레드 추가) */
export async function addCustomerMessage(
  options: ApiOptions,
  inquiryId: string,
  content: string
): Promise<InquiryThread> {
  return apiPost<InquiryThread>(options, `${INQUIRY_PATH}/${inquiryId}/threads`, {
    typeCode: 'customer_message',
    content,
    sendEmail: false,
  });
}

// --- Internal ---

/** [Admin] 전체 티켓 목록 */
export async function getInquiries(
  options: ApiOptions,
  params?: {
    page?: number;
    size?: number;
    statusCode?: string;
    priorityCode?: string;
    categoryCode?: string;
    assigneeId?: string;
    q?: string;
  }
): Promise<PageResponse<Inquiry>> {
  return apiGet<PageResponse<Inquiry>>(options, INQUIRY_PATH, {
    page: params?.page ?? 0,
    size: params?.size ?? 20,
    statusCode: params?.statusCode,
    priorityCode: params?.priorityCode,
    categoryCode: params?.categoryCode,
    assigneeId: params?.assigneeId,
    q: params?.q,
  });
}

/** [Admin] 티켓 상세 */
export async function getInquiryById(
  options: ApiOptions,
  id: string
): Promise<Inquiry> {
  return apiGet<Inquiry>(options, `${INQUIRY_PATH}/${id}`);
}

/** [Admin] 상태 변경 */
export async function updateInquiryStatus(
  options: ApiOptions,
  id: string,
  statusCode: string
): Promise<Inquiry> {
  return apiPut<Inquiry>(options, `${INQUIRY_PATH}/${id}/status`, { statusCode });
}

/** [Admin] 우선순위 변경 */
export async function updateInquiryPriority(
  options: ApiOptions,
  id: string,
  priorityCode: string
): Promise<Inquiry> {
  return apiPut<Inquiry>(options, `${INQUIRY_PATH}/${id}/priority`, { priorityCode });
}

/** [Admin] 담당자 지정 */
export async function assignInquiry(
  options: ApiOptions,
  id: string,
  assigneeId: string
): Promise<Inquiry> {
  return apiPut<Inquiry>(options, `${INQUIRY_PATH}/${id}/assignee`, { assigneeId });
}

/** [Admin] 스레드 추가 (reply / internal_note) */
export async function addInquiryThread(
  options: ApiOptions,
  inquiryId: string,
  data: InquiryThreadCreateInput
): Promise<InquiryThread> {
  return apiPost<InquiryThread>(options, `${INQUIRY_PATH}/${inquiryId}/threads`, data);
}

/** [Admin] 티켓 삭제 */
export async function deleteInquiry(options: ApiOptions, id: string): Promise<void> {
  return apiDelete(options, `${INQUIRY_PATH}/${id}`);
}
