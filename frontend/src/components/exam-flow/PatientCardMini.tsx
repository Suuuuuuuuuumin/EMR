/**
 * 보드 셀 내 미니 환자 카드. 클릭 시 해당 환자로 우측 패널 갱신
 */
import React from 'react';
import type { ExamOrderItem } from './types';

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  WAITING:   { bg: '#f3f4f6', color: '#6b7280' },
  IN_PROGRESS: { bg: '#dbeafe', color: '#1d4ed8' },
  DONE:      { bg: '#d1fae5', color: '#047857' },
  DELAYED:   { bg: '#fee2e2', color: '#b91c1c' },
};

interface PatientCardMiniProps {
  item: ExamOrderItem;
  isSelected: boolean;
  onClick: () => void;
}

export const PatientCardMini: React.FC<PatientCardMiniProps> = ({ item, isSelected, onClick }) => {
  const style = STATUS_STYLE[item.status] ?? STATUS_STYLE.WAITING;
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        textAlign: 'left',
        padding: '6px 8px',
        marginBottom: '4px',
        border: `1px solid ${isSelected ? '#0ea5e9' : '#e5e7eb'}`,
        borderRadius: '6px',
        backgroundColor: style.bg,
        color: style.color,
        fontSize: '12px',
        fontWeight: 500,
        cursor: 'pointer',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      }}
    >
      {item.patientName}
    </button>
  );
};
