/**
 * 검사 플로우 화면용 더미 데이터 (API 없이 바로 표시)
 * - 한 환자당 3~5개 검사 패키지
 * - 상태: DONE / IN_PROGRESS / DELAYED 혼합
 */
import type { ExamOrderItem } from './types';

const TODAY = new Date().toISOString().split('T')[0];

function slotAt(hour: number, min: number): string {
  return `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
}

/** scheduledAt을 해당 날짜의 ISO 문자열로 */
function at(dateStr: string, hour: number, min: number): string {
  return `${dateStr}T${slotAt(hour, min)}:00.000Z`;
}

export function buildDummyExamOrders(selectedDate: string): ExamOrderItem[] {
  const atDate = (h: number, m: number) => at(selectedDate, h, m);
  return [
    // 환자1: 김철수 - 5개 검사, 일부 DONE / IN_PROGRESS / DELAYED
    { id: 'e1', patientId: 'p1', patientName: '김철수', examType: 'BLOOD',  scheduledAt: atDate(8, 0),  status: 'DONE',    startedAt: atDate(8, 5),  finishedAt: atDate(8, 25), resultSummary: 'WBC 7.2, RBC 4.8, Hb 14.2 정상', aiSummary: '전혈 정상 범위. 추가 검사 불필요.', flags: [], recommendedActions: [] },
    { id: 'e2', patientId: 'p1', patientName: '김철수', examType: 'URINE', scheduledAt: atDate(8, 0),  status: 'DONE',    startedAt: atDate(8, 30), finishedAt: atDate(8, 35), resultSummary: '요단백 음성, 당 음성', aiSummary: '소변검사 정상.', flags: [], recommendedActions: [] },
    { id: 'e3', patientId: 'p1', patientName: '김철수', examType: 'XRAY',  scheduledAt: atDate(8, 30), status: 'IN_PROGRESS', startedAt: atDate(9, 0), resultSummary: undefined, aiSummary: undefined, flags: [], recommendedActions: [] },
    { id: 'e4', patientId: 'p1', patientName: '김철수', examType: 'ECG',   scheduledAt: atDate(9, 0),  status: 'WAITING', resultSummary: undefined, aiSummary: undefined, flags: [], recommendedActions: [] },
    { id: 'e5', patientId: 'p1', patientName: '김철수', examType: 'CT',    scheduledAt: atDate(10, 0), status: 'WAITING', resultSummary: undefined, aiSummary: undefined, flags: [], recommendedActions: [] },
    // 환자2: 이영희 - 4개 검사
    { id: 'e6', patientId: 'p2', patientName: '이영희', examType: 'BLOOD',  scheduledAt: atDate(9, 0),  status: 'DONE',    startedAt: atDate(9, 10), finishedAt: atDate(9, 30), resultSummary: 'HbA1c 6.2%, 공복혈당 108', aiSummary: '당화혈색소 약간 상승. 식이·운동 권고.', flags: ['공복혈당 경계'], recommendedActions: ['1주 후 재검', '당뇨 식이 상담'] },
    { id: 'e7', patientId: 'p2', patientName: '이영희', examType: 'URINE', scheduledAt: atDate(9, 0),  status: 'DONE',    resultSummary: '정상', aiSummary: '소변 정상.', flags: [], recommendedActions: [] },
    { id: 'e8', patientId: 'p2', patientName: '이영희', examType: 'ECG',   scheduledAt: atDate(9, 30), status: 'IN_PROGRESS', startedAt: atDate(9, 35), resultSummary: undefined, aiSummary: undefined, flags: [], recommendedActions: [] },
    { id: 'e9', patientId: 'p2', patientName: '이영희', examType: 'XRAY',  scheduledAt: atDate(10, 30), status: 'WAITING', resultSummary: undefined, aiSummary: undefined, flags: [], recommendedActions: [] },
    // 환자3: 박민수 - DELAYED 포함
    { id: 'e10', patientId: 'p3', patientName: '박민수', examType: 'BLOOD',  scheduledAt: atDate(8, 30), status: 'DELAYED', resultSummary: undefined, aiSummary: undefined, flags: ['검사 지연'], recommendedActions: ['즉시 채혈 진행'] },
    { id: 'e11', patientId: 'p3', patientName: '박민수', examType: 'CT',    scheduledAt: atDate(11, 0), status: 'WAITING', resultSummary: undefined, aiSummary: undefined, flags: [], recommendedActions: [] },
    { id: 'e12', patientId: 'p3', patientName: '박민수', examType: 'XRAY',  scheduledAt: atDate(11, 30), status: 'WAITING', resultSummary: undefined, aiSummary: undefined, flags: [], recommendedActions: [] },
    // 환자4: 최지현
    { id: 'e13', patientId: 'p4', patientName: '최지현', examType: 'BLOOD',  scheduledAt: atDate(10, 0), status: 'DONE',    resultSummary: '지질정상', aiSummary: '콜레스테롤 정상.', flags: [], recommendedActions: [] },
    { id: 'e14', patientId: 'p4', patientName: '최지현', examType: 'URINE', scheduledAt: atDate(10, 0), status: 'IN_PROGRESS', startedAt: atDate(10, 15), resultSummary: undefined, aiSummary: undefined, flags: [], recommendedActions: [] },
    { id: 'e15', patientId: 'p4', patientName: '최지현', examType: 'ECG',   scheduledAt: atDate(14, 0), status: 'WAITING', resultSummary: undefined, aiSummary: undefined, flags: [], recommendedActions: [] },
  ];
}
