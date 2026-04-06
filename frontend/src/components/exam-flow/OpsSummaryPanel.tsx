/**
 * 운영 요약 패널: 검사 일정 스타일의 패딩·구성
 * - 한 줄 헤더 + 칩/리스트를 효율적으로 배치
 */
import React from 'react';
import type { OpsSummary } from './types';
import { EXAM_TYPE_LABELS } from './examFlowUtils';

interface OpsSummaryPanelProps {
  opsSummary: OpsSummary;
}

const COUNT_LABELS: Record<keyof OpsSummary['counts'], string> = {
  WAITING: '대기',
  IN_PROGRESS: '진행중',
  DONE: '완료',
  DELAYED: '지연',
};

const COUNT_COLORS: Record<keyof OpsSummary['counts'], string> = {
  WAITING: '#6b7280',
  IN_PROGRESS: '#2563eb',
  DONE: '#059669',
  DELAYED: '#dc2626',
};

export const OpsSummaryPanel: React.FC<OpsSummaryPanelProps> = ({ opsSummary }) => {
  const { counts, bottlenecks, delayedList } = opsSummary;
  const total = counts.WAITING + counts.IN_PROGRESS + counts.DONE + counts.DELAYED;

  return (
    <div
      style={{
        width: '100%',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        backgroundColor: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        overflow: 'hidden',
      }}
    >
      {/* 검사 일정처럼 한 줄 헤더 + 구분선 */}
      <div
        style={{
          padding: '12px 20px 10px',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <div
          style={{
            fontSize: '15px',
            fontWeight: 600,
            color: '#374151',
          }}
        >
          오늘 현황 · 검사 {total}건
        </div>
      </div>
      {/* 칩: 가로 한 줄, 일정한 간격 */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          padding: '12px 20px',
          alignItems: 'center',
        }}
      >
        {(Object.entries(counts) as [keyof OpsSummary['counts'], number][]).map(([k, v]) => (
          <span
            key={k}
            style={{
              padding: '5px 10px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              backgroundColor: `${COUNT_COLORS[k]}18`,
              color: COUNT_COLORS[k],
            }}
          >
            {COUNT_LABELS[k]} {v}
          </span>
        ))}
      </div>
      {/* 병목 / 지연: 한 줄에 두 블록 나란히, 패딩 효율 */}
      {(bottlenecks.length > 0 || delayedList.length > 0) && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px 24px',
            padding: '8px 20px 14px',
            borderTop: '1px dashed #e5e7eb',
          }}
        >
          {bottlenecks.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#6b7280',
                  marginBottom: '4px',
                }}
              >
                병목 (대기 많은 순)
              </div>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: '14px',
                  fontSize: '12px',
                  color: '#374151',
                  lineHeight: 1.5,
                }}
              >
                {bottlenecks.map(({ examType, waitingCount }) => (
                  <li key={examType}>
                    {EXAM_TYPE_LABELS[examType]} {waitingCount}건
                  </li>
                ))}
              </ul>
            </div>
          )}
          {delayedList.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#dc2626',
                  marginBottom: '4px',
                }}
              >
                지연/노쇼
              </div>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: '14px',
                  fontSize: '12px',
                  color: '#b91c1c',
                  lineHeight: 1.5,
                }}
              >
                {delayedList.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
