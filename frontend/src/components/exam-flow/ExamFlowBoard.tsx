/**
 * 메인: 시간(행) x 검사유형(열) 매트릭스 보드
 * - 환자별 타임라인 실선으로 연결 (같은 환자 검사 흐름)
 */
import React, { useRef, useLayoutEffect, useState, useMemo } from 'react';
import type { ExamOrderItem, ExamType } from './types';
import {
  buildTimeSlots,
  buildMatrix,
  getPatientFlowSegments,
  EXAM_TYPE_LABELS,
  formatTimeForDisplay,
} from './examFlowUtils';
import { ExamCell } from './ExamCell';

const EXAM_TYPES = ['BLOOD', 'URINE', 'XRAY', 'ECG', 'CT'] as const;

interface ExamFlowBoardProps {
  examOrders: ExamOrderItem[];
  selectedPatientId: string | null;
  onSelectPatient: (patientId: string) => void;
}

interface LineSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  patientId: string;
}

export const ExamFlowBoard: React.FC<ExamFlowBoardProps> = ({
  examOrders,
  selectedPatientId,
  onSelectPatient,
}) => {
  const timeSlots = useMemo(() => buildTimeSlots(), []);
  const matrix = buildMatrix(examOrders, timeSlots);
  const gridRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<LineSegment[]>([]);
  const [gridSize, setGridSize] = useState({ w: 720, h: 900 });

  useLayoutEffect(() => {
    const gridEl = gridRef.current;
    if (!gridEl) return;
    const w = gridEl.scrollWidth;
    const h = gridEl.scrollHeight;
    setGridSize((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
    const segments = getPatientFlowSegments(examOrders, timeSlots);
    if (segments.length === 0) {
      setLines([]);
      return;
    }
    const cells = gridEl.querySelectorAll<HTMLElement>('[data-cell]');
    const gridRect = gridEl.getBoundingClientRect();
    const scrollLeft = gridEl.parentElement?.scrollLeft ?? 0;
    const scrollTop = gridEl.parentElement?.scrollTop ?? 0;
    const key = (slot: string, examType: string) => `${slot}-${examType}`;
    const centerByKey = new Map<string, { x: number; y: number }>();
    cells.forEach((el) => {
      const slot = el.getAttribute('data-slot');
      const examType = el.getAttribute('data-examtype');
      if (!slot || !examType) return;
      const r = el.getBoundingClientRect();
      centerByKey.set(key(slot, examType), {
        x: r.left - gridRect.left + r.width / 2 + scrollLeft,
        y: r.top - gridRect.top + r.height / 2 + scrollTop,
      });
    });
    const resolved: LineSegment[] = [];
    segments.forEach(({ patientId, from, to }) => {
      const c1 = centerByKey.get(key(from.slot, from.examType));
      const c2 = centerByKey.get(key(to.slot, to.examType));
      if (c1 && c2) {
        resolved.push({
          x1: c1.x,
          y1: c1.y,
          x2: c2.x,
          y2: c2.y,
          patientId,
        });
      }
    });
    setLines(resolved);
  }, [examOrders, timeSlots]);

  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        overflow: 'auto',
        backgroundColor: '#fff',
        boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
        position: 'relative',
      }}
    >
      <div ref={gridRef} style={{ minWidth: '720px', position: 'relative' }}>
        {/* 환자 타임라인 실선 오버레이 */}
        {lines.length > 0 && (
          <svg
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: `${gridSize.w}px`,
              height: `${gridSize.h}px`,
              pointerEvents: 'none',
              zIndex: 5,
            }}
            width={gridSize.w}
            height={gridSize.h}
          >
            {/* 환자 연결선만: 아주 얇은 회색 점선(0.5), 가시성 해치지 않도록 */}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="6"
                markerHeight="4"
                refX="5"
                refY="2"
                orient="auto"
              >
                <polygon points="0 0, 6 2, 0 4" fill="#94a3b8" />
              </marker>
            </defs>
            {lines.map((seg, i) => (
              <line
                key={i}
                x1={seg.x1}
                y1={seg.y1}
                x2={seg.x2}
                y2={seg.y2}
                stroke="#94a3b8"
                strokeWidth={0.5}
                strokeDasharray="3 2"
                strokeLinecap="round"
                markerEnd="url(#arrowhead)"
              />
            ))}
          </svg>
        )}
        {/* Sticky 헤더 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '52px repeat(5, 1fr)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            backgroundColor: '#fff',
            borderBottom: '1px solid #1f2937',
            fontWeight: 600,
            fontSize: '13px',
            color: '#1f2937',
          }}
        >
          <div style={{ padding: '10px 6px', borderRight: '1px solid #d1d5db' }}>시간</div>
          {EXAM_TYPES.map((et) => (
            <div
              key={et}
              style={{ padding: '10px 6px', textAlign: 'center', borderRight: '1px solid #d1d5db' }}
            >
              {EXAM_TYPE_LABELS[et]}
            </div>
          ))}
        </div>
        {/* 행: 각 timeSlot */}
        {timeSlots.map((slot) => (
          <div
            key={slot}
            style={{
              display: 'grid',
              gridTemplateColumns: '52px repeat(5, 1fr)',
              position: 'relative',
            }}
          >
            <div
              style={{
                padding: '8px 6px',
                borderRight: '1px solid #d1d5db',
                borderBottom: '1px solid #e5e7eb',
                fontWeight: 500,
                fontSize: '13px',
                color: '#374151',
                backgroundColor: '#fff',
              }}
            >
              {formatTimeForDisplay(slot)}
            </div>
            {EXAM_TYPES.map((examType) => (
              <ExamCell
                key={`${slot}-${examType}`}
                slot={slot}
                examType={examType}
                items={matrix[slot]?.[examType as ExamType] ?? []}
                selectedPatientId={selectedPatientId}
                onSelectPatient={onSelectPatient}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
