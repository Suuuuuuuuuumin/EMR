/**
 * 대시보드 검사 진행 환자(prescriptions) → ExamOrderItem[] 변환
 * 홈 대시보드와 검사 관리 화면 데이터 연동
 */
import type { ExamOrderItem, ExamType, ExamStatus } from './types';

export interface PrescriptionForExam {
  id: string;
  patientName: string;
  patientId: string;
  tests: Array<{ testName: string; urgency: 'routine' | 'urgent'; result?: string }>;
  createdAt: string;
}

/** 검사명 → ExamType 매핑 (대시보드 tests.testName 기준) */
function testNameToExamType(testName: string): ExamType | null {
  const t = testName.toLowerCase().replace(/\s/g, '');
  if (t.includes('혈액') || t.includes('cbc') || t.includes('전혈')) return 'BLOOD';
  if (t.includes('소변') || t.includes('요검사')) return 'URINE';
  if (t.includes('x-ray') || t.includes('x선') || t.includes('흉부') || t.includes('xray')) return 'XRAY';
  if (t.includes('심전도') || t.includes('ecg')) return 'ECG';
  if (t.includes('ct')) return 'CT';
  if (t.includes('초음파')) return 'XRAY'; // 초음파는 영상으로 XRAY 열에
  return null;
}

/** result 유무로 상태: 있으면 DONE, 없으면 진행중/대기 */
function testToStatus(result?: string): ExamStatus {
  if (result != null && result !== '') return 'DONE';
  return 'IN_PROGRESS'; // 미완료는 진행중으로 표시
}

/** ISO 날짜에서 08~17:30 범위의 슬롯 인덱스(0~19) 계산 */
function getSlotIndexFromDate(d: Date): number {
  const h = d.getHours();
  const m = d.getMinutes();
  if (h < 8 || h > 17 || (h === 17 && m > 30)) return 0;
  return (h - 8) * 2 + (m >= 30 ? 1 : 0);
}

/** 슬롯 인덱스 → ISO 시간 문자열 (해당 날짜) */
function slotIndexToScheduledAt(dateOnly: string, slotIndex: number): string {
  const h = 8 + Math.floor(slotIndex / 2);
  const m = (slotIndex % 2) * 30;
  return `${dateOnly}T${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00.000Z`;
}

/**
 * 해당 날짜의 prescriptions를 ExamOrderItem[]로 변환.
 * createdAt 기준 해당 일자만 포함, 환자별 첫 검사는 createdAt 시간, 이후는 30분 간격.
 */
export function buildExamOrdersFromPrescriptions(
  prescriptions: PrescriptionForExam[],
  selectedDate: string
): ExamOrderItem[] {
  const dateOnly = selectedDate.includes('T') ? selectedDate.split('T')[0] : selectedDate;
  const orders: ExamOrderItem[] = [];

  prescriptions.forEach((rx) => {
    const rxDate = new Date(rx.createdAt).toISOString().split('T')[0];
    if (rxDate !== dateOnly) return;
    if (!rx.tests || rx.tests.length === 0) return;

    let slotIndex = getSlotIndexFromDate(new Date(rx.createdAt));
    const maxSlot = 19;

    rx.tests.forEach((test, idx) => {
      const examType = testNameToExamType(test.testName);
      if (!examType) return;
      if (slotIndex > maxSlot) slotIndex = 0;

      const scheduledAt = slotIndexToScheduledAt(dateOnly, slotIndex);
      slotIndex += 1;

      const status = testToStatus(test.result);
      orders.push({
        id: `${rx.id}-${examType}-${idx}`,
        patientId: rx.patientId,
        patientName: rx.patientName,
        examType,
        scheduledAt,
        status,
        resultSummary: test.result,
        aiSummary: undefined,
        flags: [],
        recommendedActions: [],
      });
    });
  });

  return orders;
}
