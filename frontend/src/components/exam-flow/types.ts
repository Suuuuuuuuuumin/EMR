/**
 * 검사 플로우 추적용 타입 정의
 * - ExamFlowBoard, PatientDetailPanel, OpsSummaryPanel 등에서 사용
 */

export type ExamType = 'BLOOD' | 'URINE' | 'XRAY' | 'ECG' | 'CT';

export type ExamStatus = 'WAITING' | 'IN_PROGRESS' | 'DONE' | 'DELAYED';

export interface Patient {
  id: string;
  name: string;
}

export interface ExamOrderItem {
  id: string;
  patientId: string;
  patientName: string;
  examType: ExamType;
  scheduledAt: string; // ISO string
  status: ExamStatus;
  startedAt?: string;
  finishedAt?: string;
  resultSummary?: string;
  aiSummary?: string;
  flags?: string[];
  recommendedActions?: string[];
}

/** 시간(행) x 검사유형(열) 매트릭스: [timeSlot][examType] = ExamOrderItem[] */
export type ExamMatrix = Record<string, Record<ExamType, ExamOrderItem[]>>;

export interface OpsSummary {
  counts: {
    WAITING: number;
    IN_PROGRESS: number;
    DONE: number;
    DELAYED: number;
  };
  /** 검사유형별 대기 수가 많은 순 Top 3 */
  bottlenecks: Array< { examType: ExamType; waitingCount: number } >;
  /** 지연/노쇼 환자 간단 리스트 (환자명) */
  delayedList: string[];
}
