/**
 * 검사 플로우 파생 데이터 계산
 *
 * 1) 슬롯 생성: 08:00~17:30 30분 간격 20개 (buildTimeSlots)
 * 2) 매트릭스 구성: examOrders의 scheduledAt → slot 키로 매핑 후, (slot, examType)별로 배열 구성 (buildMatrix)
 * 3) 요약 계산: status별 counts, WAITING인 항목만 검사유형별 집계 후 상위 3개 병목, DELAYED 환자명 리스트 (buildOpsSummary)
 */
import type { ExamOrderItem, ExamType, OpsSummary } from './types';

const EXAM_TYPES: ExamType[] = ['BLOOD', 'URINE', 'XRAY', 'ECG', 'CT'];

/** 08:00 ~ 17:30, 30분 간격 슬롯 20개 생성 */
export function buildTimeSlots(): string[] {
  return Array.from({ length: 20 }, (_, i) => {
    const h = 8 + Math.floor(i / 2);
    const m = (i % 2) * 30;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  });
}

/** scheduledAt(ISO) → 해당 날짜의 timeSlot 키 (예: "09:30") */
export function scheduledAtToSlot(scheduledAt: string): string {
  const d = new Date(scheduledAt);
  const h = d.getUTCHours();
  const m = d.getUTCMinutes();
  if (h < 8 || h > 17 || (h === 17 && m > 30)) return '08:00'; // 범위 밖이면 첫 슬롯에
  const idx = (h - 8) * 2 + (m >= 30 ? 1 : 0);
  const slots = buildTimeSlots();
  return slots[idx] ?? '08:00';
}

/** examOrders를 시간(행) x 검사유형(열) 매트릭스로 구성 */
export function buildMatrix(
  examOrders: ExamOrderItem[],
  timeSlots: string[]
): Record<string, Record<ExamType, ExamOrderItem[]>> {
  const matrix: Record<string, Record<ExamType, ExamOrderItem[]>> = {};
  timeSlots.forEach(slot => {
    matrix[slot] = {} as Record<ExamType, ExamOrderItem[]>;
    EXAM_TYPES.forEach(et => { matrix[slot][et] = []; });
  });
  examOrders.forEach(item => {
    const slot = scheduledAtToSlot(item.scheduledAt);
    if (!matrix[slot]) return;
    if (!matrix[slot][item.examType]) matrix[slot][item.examType] = [];
    matrix[slot][item.examType].push(item);
  });
  return matrix;
}

/** 운영 요약: counts, bottlenecks(Top 3), delayedList */
export function buildOpsSummary(examOrders: ExamOrderItem[]): OpsSummary {
  const counts = { WAITING: 0, IN_PROGRESS: 0, DONE: 0, DELAYED: 0 };
  const waitingByType: Record<string, number> = {};
  const delayedNames = new Set<string>();

  examOrders.forEach(item => {
    counts[item.status]++;
    if (item.status === 'WAITING') {
      waitingByType[item.examType] = (waitingByType[item.examType] ?? 0) + 1;
    }
    if (item.status === 'DELAYED') {
      delayedNames.add(item.patientName);
    }
  });

  const bottlenecks = (Object.entries(waitingByType) as [ExamType, number][])
    .map(([examType, waitingCount]) => ({ examType, waitingCount }))
    .sort((a, b) => b.waitingCount - a.waitingCount)
    .slice(0, 3);

  return {
    counts,
    bottlenecks,
    delayedList: Array.from(delayedNames),
  };
}

/** 두 번째 사진 참고: 컬럼 헤더 풀 네이밍 */
export const EXAM_TYPE_LABELS: Record<ExamType, string> = {
  BLOOD: '혈액 검사',
  URINE: '소변 검사',
  XRAY: 'X-ray',
  ECG: '심전도',
  CT: 'CT',
};

/** 시간 표시: 8:00, 8:30 (한 자리 시는 앞 0 없음, 두 번째 사진 스타일) */
export function formatTimeForDisplay(slot: string): string {
  const [h, m] = slot.split(':').map(Number);
  return `${h}:${m.toString().padStart(2, '0')}`;
}

const EXAM_TYPE_ORDER: ExamType[] = ['BLOOD', 'URINE', 'XRAY', 'ECG', 'CT'];

/** 환자별 타임라인 실선 연결용: (slot, examType) 순서쌍 리스트. scheduledAt → examType 순 정렬 */
export function getPatientFlowSegments(
  examOrders: ExamOrderItem[],
  timeSlots: string[]
): Array<{ patientId: string; from: { slot: string; examType: ExamType }; to: { slot: string; examType: ExamType } }> {
  const byPatient = new Map<string, ExamOrderItem[]>();
  examOrders.forEach((item) => {
    if (!byPatient.has(item.patientId)) byPatient.set(item.patientId, []);
    byPatient.get(item.patientId)!.push(item);
  });
  const slotOrder = new Map(timeSlots.map((s, i) => [s, i]));
  const typeOrder = new Map(EXAM_TYPE_ORDER.map((t, i) => [t, i]));
  const segments: Array<{
    patientId: string;
    from: { slot: string; examType: ExamType };
    to: { slot: string; examType: ExamType };
  }> = [];
  byPatient.forEach((items, patientId) => {
    const sorted = [...items].sort((a, b) => {
      const slotA = scheduledAtToSlot(a.scheduledAt);
      const slotB = scheduledAtToSlot(b.scheduledAt);
      const orderA = slotOrder.get(slotA) ?? 0;
      const orderB = slotOrder.get(slotB) ?? 0;
      if (orderA !== orderB) return orderA - orderB;
      return (typeOrder.get(a.examType) ?? 0) - (typeOrder.get(b.examType) ?? 0);
    });
    for (let i = 0; i < sorted.length - 1; i++) {
      const from = sorted[i];
      const to = sorted[i + 1];
      segments.push({
        patientId,
        from: { slot: scheduledAtToSlot(from.scheduledAt), examType: from.examType },
        to: { slot: scheduledAtToSlot(to.scheduledAt), examType: to.examType },
      });
    }
  });
  return segments;
}
