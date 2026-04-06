/**
 * 시간(행) x 검사유형(열) 매트릭스의 한 셀.
 * 해당 슬롯·검사유형에 예정된 환자(들)를 미니 카드로 표시. 2개 초과 시 "+N" 축약
 */
import React from 'react';
import type { ExamOrderItem } from './types';
import { PatientCardMini } from './PatientCardMini';

const MAX_VISIBLE = 2;

interface ExamCellProps {
  slot: string;
  examType: string;
  items: ExamOrderItem[];
  selectedPatientId: string | null;
  onSelectPatient: (patientId: string) => void;
}

export const ExamCell: React.FC<ExamCellProps> = ({
  slot,
  examType,
  items,
  selectedPatientId,
  onSelectPatient,
}) => {
  const visible = items.slice(0, MAX_VISIBLE);
  const restCount = items.length - MAX_VISIBLE;

  return (
    <div
      data-cell
      data-slot={slot}
      data-examtype={examType}
      style={{
        minHeight: '44px',
        padding: '6px',
        borderRight: '1px solid #d1d5db',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: items.length ? '#fafafa' : '#fff',
      }}
    >
      {visible.map((item) => (
        <PatientCardMini
          key={item.id}
          item={item}
          isSelected={item.patientId === selectedPatientId}
          onClick={() => onSelectPatient(item.patientId)}
        />
      ))}
      {restCount > 0 && (
        <div
          style={{
            padding: '6px 8px',
            fontSize: '11px',
            color: '#6b7280',
            fontWeight: 500,
          }}
        >
          +{restCount}
        </div>
      )}
    </div>
  );
};
