/**
 * 우측: 선택된 환자 상세 패널
 * - 환자명, 검사 진행률 chips [혈액✔][소변✔][X-ray]...
 * - resultSummary, aiSummary
 * - flags, recommendedActions
 */
import React from 'react';
import type { ExamOrderItem } from './types';
import { EXAM_TYPE_LABELS } from './examFlowUtils';

interface PatientDetailPanelProps {
  patientItems: ExamOrderItem[];
  patientName: string | null;
}

export const PatientDetailPanel: React.FC<PatientDetailPanelProps> = ({
  patientItems,
  patientName,
}) => {
  if (!patientName && patientItems.length === 0) {
    return (
      <div
        style={{
          width: '320px',
          flexShrink: 0,
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '20px',
          backgroundColor: '#fff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          color: '#6b7280',
          fontSize: '14px',
        }}
      >
        환자를 선택하면 상세 정보가 표시됩니다.
      </div>
    );
  }

  const chips = patientItems.map((item) => {
    const label = EXAM_TYPE_LABELS[item.examType];
    const done = item.status === 'DONE';
    return { label, done };
  });

  const lastWithSummary = [...patientItems].reverse().find((i) => i.resultSummary || i.aiSummary);
  const resultSummary = lastWithSummary?.resultSummary;
  const aiSummary = lastWithSummary?.aiSummary;
  const flags = patientItems.flatMap((i) => i.flags ?? []);
  const recommendedActions = patientItems.flatMap((i) => i.recommendedActions ?? []);

  return (
    <div
      style={{
        width: '320px',
        flexShrink: 0,
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '20px',
        backgroundColor: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        overflow: 'auto',
      }}
    >
      <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: 600, color: '#1f2937' }}>
        {patientName}
      </h3>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '6px' }}>
          검사 진행률
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {chips.map(({ label, done }) => (
            <span
              key={label}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 500,
                backgroundColor: done ? '#d1fae5' : '#f3f4f6',
                color: done ? '#047857' : '#6b7280',
              }}
            >
              {label}{done ? ' ✔' : ''}
            </span>
          ))}
        </div>
      </div>
      {resultSummary && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '4px' }}>
            검사 결과 요약
          </div>
          <p style={{ margin: 0, fontSize: '14px', color: '#374151', lineHeight: 1.5 }}>
            {resultSummary}
          </p>
        </div>
      )}
      {aiSummary && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '4px' }}>
            AI 요약
          </div>
          <p style={{ margin: 0, fontSize: '14px', color: '#374151', lineHeight: 1.5 }}>
            {aiSummary}
          </p>
        </div>
      )}
      {flags.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '4px' }}>
            이상 플래그
          </div>
          <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '14px', color: '#b91c1c' }}>
            {flags.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>
      )}
      {recommendedActions.length > 0 && (
        <div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '4px' }}>
            추천 액션
          </div>
          <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '14px', color: '#1d4ed8' }}>
            {recommendedActions.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
