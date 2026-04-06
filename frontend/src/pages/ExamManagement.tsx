/**
 * 검사 관리 페이지 컴포넌트
 * 
 * 담당자: 김지현 (프론트엔드)
 * 
 * 주요 기능:
 * - 검사 오더 관리
 * - 검사 결과 입력 (혈압, 심전도, 혈당 등)
 * - AI 기반 검사 결과 분석 및 시각화
 * - 정상/비정상 수치 자동 판단 및 색상 표시
 * 
 * 기술 스택:
 * - React + TypeScript
 * - 조건부 렌더링 (정상/비정상 수치 시각적 구분)
 * - AI 분석 결과 표시
 * - 탭 기반 UI (검사 오더 / 검사 결과 / AI 분석)
 */
import React, { useState, useMemo } from 'react';
import { tokens } from '../design/tokens';
import { WaitingPatient } from '../data/waitingPatientsData';
import {
  buildDummyExamOrders,
  buildExamOrdersFromPrescriptions,
  buildOpsSummary,
  ExamFlowBoard,
  PatientDetailPanel,
  OpsSummaryPanel,
} from '../components/exam-flow';

interface ExamManagementProps {
    selectedPatient: WaitingPatient | null;
    onPatientClear: () => void;
    prescriptions?: Array<{
        id: string;
        patientName: string;
        patientId: string;
        tests: Array<{
            testName: string;
            urgency: 'routine' | 'urgent';
        }>;
        createdAt: string;
    }>;
}

export const ExamManagement: React.FC<ExamManagementProps> = ({
  selectedPatient,
  onPatientClear,
  prescriptions = [],
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'schedule'>('orders');
  const [selectedDate, setSelectedDate] = useState<string>(() =>
    new Date().toISOString().split('T')[0]
  );
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // 홈 대시보드 검사 진행 환자(prescriptions)와 연동: 해당 날짜 오더가 있으면 사용, 없으면 더미
  const examOrders = useMemo(() => {
    const fromPrescriptions = buildExamOrdersFromPrescriptions(prescriptions, selectedDate);
    if (fromPrescriptions.length > 0) return fromPrescriptions;
    return buildDummyExamOrders(selectedDate);
  }, [prescriptions, selectedDate]);
  const opsSummary = useMemo(() => buildOpsSummary(examOrders), [examOrders]);
  const patientItems = useMemo(
    () => examOrders.filter((i) => i.patientId === selectedPatientId),
    [examOrders, selectedPatientId]
  );
  const selectedPatientName = patientItems[0]?.patientName ?? null;

  const changeSelectedDateByDays = (delta: number) => {
    const d = new Date(selectedDate + 'T12:00:00');
    d.setDate(d.getDate() + delta);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const generateMonthCalendar = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    const calendar = [];
    const today = new Date();
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const isCurrentMonth = date.getMonth() === month;
      const isToday = date.toDateString() === today.toDateString();
      const fromRx = buildExamOrdersFromPrescriptions(prescriptions, dateStr).length;
      const orderCount = fromRx > 0 ? fromRx : buildDummyExamOrders(dateStr).length;
      calendar.push({
        date: date.getDate(),
        dateStr,
        isCurrentMonth,
        isToday,
        isSelected: dateStr === selectedDate,
        orderCount,
      });
    }
    return calendar;
  };

    const generateYearCalendars = (year: number) => {
        const monthNames = [
            '1월', '2월', '3월', '4월', '5월', '6월',
            '7월', '8월', '9월', '10월', '11월', '12월'
        ];
        const months = [];
        for (let month = 0; month < 12; month++) {
            months.push({
                month,
                monthName: monthNames[month],
                calendar: generateMonthCalendar(year, month)
            });
        }
        const reorderedMonths = [];
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 3; col++) {
                const monthIndex = row + col * 4;
                if (monthIndex < 12) reorderedMonths.push(months[monthIndex]);
            }
        }
        return reorderedMonths;
    };

    const yearCalendars = generateYearCalendars(currentYear);
    const filteredOrdersByDate = examOrders;

    return (
        <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
                <div style={{ marginBottom: '24px' }}>
                    <h1 style={{ 
                        fontSize: '28px', 
                        fontWeight: 700, 
                        color: tokens.colors.text.primary,
                        marginBottom: '8px'
                    }}>
                        검사 관리
                    </h1>
                    <p style={{ 
                        fontSize: '16px', 
                        color: tokens.colors.text.secondary 
                    }}>
                        검사 오더, 결과 입력 및 AI 분석을 관리합니다.
                    </p>
                </div>

                {selectedPatient && (
                    <div style={{
                        backgroundColor: '#f0f9ff',
                        border: '1px solid #3b82f6',
                        borderRadius: '8px',
                        padding: '16px',
                        marginBottom: '24px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <h3 style={{ 
                                margin: 0, 
                                fontSize: '16px', 
                                color: '#1e40af',
                                fontWeight: 600
                            }}>
                                검사 오더 작성 중: {selectedPatient.name} 환자
                            </h3>
                        </div>
                        <button
                            onClick={onPatientClear}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: 'white',
                                color: '#374151',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '14px',
                                cursor: 'pointer'
                            }}
                        >
                            선택 해제
                        </button>
                    </div>
                )}

                <div style={{ 
                    display: 'flex', 
                    borderBottom: '1px solid #e5e7eb',
                    marginBottom: '24px'
                }}>
                    {[
                        { key: 'orders', label: '검사 오더' },
                        { key: 'schedule', label: '검사 일정' }
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key as any)}
                            style={{
                                padding: '12px 24px',
                                border: 'none',
                                backgroundColor: 'transparent',
                                color: activeTab === tab.key ? tokens.colors.primary : tokens.colors.text.secondary,
                                borderBottom: activeTab === tab.key ? `2px solid ${tokens.colors.primary}` : '2px solid transparent',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: 500
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'orders' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                        {/* 1. 오늘 현황: 검사 일정 스타일 패딩구분(헤더 한 줄 + 칩 + 병목/지연) */}
                        <div style={{ marginBottom: '16px' }}>
                            <OpsSummaryPanel opsSummary={opsSummary} />
                        </div>
                        {/* 2. 날짜 선택: ◀ 2026.02.12 ▶ (두 번째 사진 스타일) */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '16px',
                                marginBottom: '20px',
                            }}
                        >
                            <button
                                type="button"
                                onClick={() => changeSelectedDateByDays(-1)}
                                style={{
                                    padding: '8px 12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    background: 'white',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    color: tokens.colors.text.primary,
                                }}
                            >
                                ◀
                            </button>
                            <span
                                style={{
                                    fontSize: '18px',
                                    fontWeight: 600,
                                    color: tokens.colors.text.primary,
                                    minWidth: '140px',
                                    textAlign: 'center',
                                }}
                            >
                                {selectedDate &&
                                    `${selectedDate.slice(0, 4)}.${selectedDate.slice(5, 7)}.${selectedDate.slice(8, 10)}`}
                            </span>
                            <button
                                type="button"
                                onClick={() => changeSelectedDateByDays(1)}
                                style={{
                                    padding: '8px 12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    background: 'white',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    color: tokens.colors.text.primary,
                                }}
                            >
                                ▶
                            </button>
                        </div>
                        {/* 3. 보드 + 우측 패널만 (오늘 현황은 위에 이미 표시) */}
                        <div
                            style={{
                                display: 'flex',
                                gap: '16px',
                                alignItems: 'flex-start',
                                minHeight: '480px',
                                backgroundColor: '#fff',
                                borderRadius: '8px',
                                padding: '20px',
                                border: '1px solid #e5e7eb',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                            }}
                        >
                            <ExamFlowBoard
                                examOrders={examOrders}
                                selectedPatientId={selectedPatientId}
                                onSelectPatient={setSelectedPatientId}
                            />
                            <PatientDetailPanel
                                patientItems={patientItems}
                                patientName={selectedPatientName}
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'schedule' && (
                    <>
                        <div style={{
                            marginBottom: '24px',
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                            padding: '24px'
                        }}>
                            <div style={{ fontSize: '16px', fontWeight: 600, color: tokens.colors.text.primary, marginBottom: '16px' }}>
                                선택한 날짜: {selectedDate && new Date(selectedDate + 'T12:00:00').toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })} · 검사 예약 {filteredOrdersByDate.length}건
                            </div>
                            {filteredOrdersByDate.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {filteredOrdersByDate.map((order) => (
                                        <span key={order.id} style={{ padding: '8px 12px', borderRadius: '6px', fontSize: '14px', backgroundColor: '#f0f9ff', color: '#1e40af' }}>
                                            {order.patientName} · {order.code || '검사'}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                            padding: '24px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                                <button type="button" onClick={() => setCurrentYear(currentYear - 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: tokens.colors.text.primary, padding: '8px' }}>◀</button>
                                <div style={{ fontSize: '24px', fontWeight: 700, color: tokens.colors.text.primary }}>{currentYear}</div>
                                <button type="button" onClick={() => setCurrentYear(currentYear + 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: tokens.colors.text.primary, padding: '8px' }}>▶</button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                                {yearCalendars.map((monthData) => (
                                    <div key={monthData.month} style={{ marginBottom: '24px' }}>
                                        <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px', color: tokens.colors.text.primary, textAlign: 'center' }}>{monthData.monthName}</div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
                                            {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                                                <div key={day} style={{ textAlign: 'center', fontSize: '11px', fontWeight: 600, color: index === 0 ? '#dc2626' : index === 6 ? '#2563eb' : '#6b7280', padding: '4px' }}>{day}</div>
                                            ))}
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
                                            {monthData.calendar.map((day, index) => {
                                                const isSelected = day.dateStr === selectedDate;
                                                const hasOrders = day.orderCount > 0;
                                                return (
                                                    <div
                                                        key={index}
                                                        onClick={() => day.isCurrentMonth && setSelectedDate(day.dateStr)}
                                                        style={{
                                                            aspectRatio: '1',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            justifyContent: 'flex-start',
                                                            padding: '2px',
                                                            fontSize: '14px',
                                                            cursor: day.isCurrentMonth ? 'pointer' : 'default',
                                                            borderRadius: '4px',
                                                            position: 'relative',
                                                            backgroundColor: isSelected ? '#dbeafe' : day.isToday && !hasOrders ? 'rgba(59, 130, 246, 0.1)' : !day.isCurrentMonth ? '#f9fafb' : hasOrders ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                                                            color: day.isCurrentMonth ? (isSelected ? '#1e40af' : '#374151') : '#d1d5db',
                                                            fontWeight: day.isToday || isSelected ? 600 : 400,
                                                            border: isSelected ? '2px solid #3b82f6' : '1px solid transparent',
                                                            minHeight: '32px'
                                                        }}
                                                    >
                                                        <span style={{ marginBottom: '2px' }}>{day.date}</span>
                                                        {hasOrders && (
                                                            <span style={{ position: 'absolute', bottom: '2px', left: '50%', transform: 'translateX(-50%)', width: '6px', height: '2px', backgroundColor: '#2563eb', borderRadius: '2px' }} />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

            </div>
        </div>
    );
};