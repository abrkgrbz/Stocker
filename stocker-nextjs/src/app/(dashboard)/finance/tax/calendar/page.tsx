'use client';

/**
 * Vergi Takvimi (Tax Calendar) Dashboard
 * Türkiye vergi beyanname ve ödeme tarihleri takip sistemi
 * GİB son bildirim tarihleri ve hatırlatıcılar
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React, { useState } from 'react';
import { Calendar, Badge, Tag, Modal, Button, Alert, Tabs, Progress, Select, Tooltip, Card } from 'antd';
import type { CalendarProps } from 'antd';
import {
  CalendarDaysIcon,
  BellAlertIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowRightIcon,
  BanknotesIcon,
  CalculatorIcon,
  DocumentDuplicateIcon,
  UserGroupIcon,
  BuildingOffice2Icon,
  ChartBarIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/tr';
import locale from 'antd/es/calendar/locale/tr_TR';

dayjs.locale('tr');

// Types
type TaxEventType = 'declaration' | 'payment' | 'notification' | 'deadline';
type TaxCategory = 'kdv' | 'muhtasar' | 'gecici' | 'kurumlar' | 'babs' | 'sgk' | 'damga' | 'other';
type EventStatus = 'upcoming' | 'due-soon' | 'overdue' | 'completed';

interface TaxEvent {
  id: number;
  date: string;
  title: string;
  description: string;
  type: TaxEventType;
  category: TaxCategory;
  status: EventStatus;
  isRecurring: boolean;
  reminderDays: number[];
  amount?: number;
  period?: string;
}

// Category configurations
const categoryConfig: Record<TaxCategory, { label: string; color: string; icon: React.ReactNode }> = {
  kdv: { label: 'KDV', color: 'blue', icon: <DocumentTextIcon className="w-4 h-4" /> },
  muhtasar: { label: 'Muhtasar', color: 'purple', icon: <UserGroupIcon className="w-4 h-4" /> },
  gecici: { label: 'Geçici Vergi', color: 'cyan', icon: <CalculatorIcon className="w-4 h-4" /> },
  kurumlar: { label: 'Kurumlar', color: 'green', icon: <BuildingOffice2Icon className="w-4 h-4" /> },
  babs: { label: 'Ba-Bs', color: 'orange', icon: <DocumentDuplicateIcon className="w-4 h-4" /> },
  sgk: { label: 'SGK', color: 'red', icon: <UserGroupIcon className="w-4 h-4" /> },
  damga: { label: 'Damga Vergisi', color: 'default', icon: <DocumentTextIcon className="w-4 h-4" /> },
  other: { label: 'Diğer', color: 'default', icon: <DocumentTextIcon className="w-4 h-4" /> },
};

// Event type configurations
const eventTypeConfig: Record<TaxEventType, { label: string; color: string }> = {
  declaration: { label: 'Beyanname', color: 'blue' },
  payment: { label: 'Ödeme', color: 'green' },
  notification: { label: 'Bildirim', color: 'orange' },
  deadline: { label: 'Son Gün', color: 'red' },
};

// Status configurations
const statusConfig: Record<EventStatus, { label: string; color: string; bgColor: string }> = {
  upcoming: { label: 'Yaklaşan', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  'due-soon': { label: 'Yakında', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  overdue: { label: 'Gecikmiş', color: 'text-red-700', bgColor: 'bg-red-100' },
  completed: { label: 'Tamamlandı', color: 'text-green-700', bgColor: 'bg-green-100' },
};

// Month names
const monthNames = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

// Generate mock events for current month and next months
const generateMockEvents = (): TaxEvent[] => {
  const events: TaxEvent[] = [];
  const currentDate = dayjs();
  const currentMonth = currentDate.month();
  const currentYear = currentDate.year();

  // KDV Beyanname - Every month 26th
  for (let i = 0; i < 3; i++) {
    const eventDate = dayjs().add(i, 'month').date(26);
    events.push({
      id: events.length + 1,
      date: eventDate.format('YYYY-MM-DD'),
      title: 'KDV Beyannamesi',
      description: `${monthNames[eventDate.month()]} ${eventDate.year()} dönemi KDV beyannamesi son günü`,
      type: 'declaration',
      category: 'kdv',
      status: eventDate.isBefore(currentDate) ? 'completed' :
              eventDate.diff(currentDate, 'day') <= 7 ? 'due-soon' : 'upcoming',
      isRecurring: true,
      reminderDays: [7, 3, 1],
      period: `${monthNames[eventDate.subtract(1, 'month').month()]} ${eventDate.year()}`,
    });
  }

  // Muhtasar - Every month 26th
  for (let i = 0; i < 3; i++) {
    const eventDate = dayjs().add(i, 'month').date(26);
    events.push({
      id: events.length + 1,
      date: eventDate.format('YYYY-MM-DD'),
      title: 'Muhtasar Beyanname',
      description: `${monthNames[eventDate.month()]} ${eventDate.year()} dönemi muhtasar beyanname son günü`,
      type: 'declaration',
      category: 'muhtasar',
      status: eventDate.isBefore(currentDate) ? 'completed' :
              eventDate.diff(currentDate, 'day') <= 7 ? 'due-soon' : 'upcoming',
      isRecurring: true,
      reminderDays: [7, 3, 1],
      period: `${monthNames[eventDate.subtract(1, 'month').month()]} ${eventDate.year()}`,
    });
  }

  // SGK Prim Bildirgeleri - Every month 26th
  for (let i = 0; i < 3; i++) {
    const eventDate = dayjs().add(i, 'month').date(26);
    events.push({
      id: events.length + 1,
      date: eventDate.format('YYYY-MM-DD'),
      title: 'SGK APHB Bildirimi',
      description: `${monthNames[eventDate.month()]} ${eventDate.year()} dönemi aylık prim ve hizmet belgesi`,
      type: 'notification',
      category: 'sgk',
      status: eventDate.isBefore(currentDate) ? 'completed' :
              eventDate.diff(currentDate, 'day') <= 7 ? 'due-soon' : 'upcoming',
      isRecurring: true,
      reminderDays: [7, 3, 1],
      period: `${monthNames[eventDate.subtract(1, 'month').month()]} ${eventDate.year()}`,
    });
  }

  // Ba-Bs Formu - Every month last day
  for (let i = 0; i < 3; i++) {
    const eventDate = dayjs().add(i, 'month').endOf('month');
    events.push({
      id: events.length + 1,
      date: eventDate.format('YYYY-MM-DD'),
      title: 'Ba-Bs Formu',
      description: `${monthNames[eventDate.subtract(1, 'month').month()]} ${eventDate.year()} dönemi Ba-Bs bildirimi`,
      type: 'notification',
      category: 'babs',
      status: eventDate.isBefore(currentDate) ? 'completed' :
              eventDate.diff(currentDate, 'day') <= 7 ? 'due-soon' : 'upcoming',
      isRecurring: true,
      reminderDays: [7, 3, 1],
      period: `${monthNames[eventDate.subtract(1, 'month').month()]} ${eventDate.year()}`,
    });
  }

  // Geçici Vergi - Quarterly (17th of 2nd month after quarter)
  const quarterlyDates = [
    dayjs(`${currentYear}-05-17`), // Q1 -> May 17
    dayjs(`${currentYear}-08-17`), // Q2 -> Aug 17
    dayjs(`${currentYear}-11-17`), // Q3 -> Nov 17
    dayjs(`${currentYear + 1}-02-17`), // Q4 -> Feb 17 next year
  ];

  const quarters = ['1. Çeyrek', '2. Çeyrek', '3. Çeyrek', '4. Çeyrek'];
  quarterlyDates.forEach((eventDate, index) => {
    if (eventDate.isAfter(currentDate.subtract(3, 'month'))) {
      events.push({
        id: events.length + 1,
        date: eventDate.format('YYYY-MM-DD'),
        title: 'Geçici Vergi Beyannamesi',
        description: `${currentYear} ${quarters[index]} geçici vergi beyannamesi`,
        type: 'declaration',
        category: 'gecici',
        status: eventDate.isBefore(currentDate) ? 'completed' :
                eventDate.diff(currentDate, 'day') <= 7 ? 'due-soon' : 'upcoming',
        isRecurring: true,
        reminderDays: [14, 7, 3, 1],
        period: `${currentYear} ${quarters[index]}`,
      });
    }
  });

  // Kurumlar Vergisi - Annual (April 30)
  const kurumlasDate = dayjs(`${currentYear}-04-30`);
  if (kurumlasDate.isAfter(currentDate.subtract(1, 'month'))) {
    events.push({
      id: events.length + 1,
      date: kurumlasDate.format('YYYY-MM-DD'),
      title: 'Kurumlar Vergisi Beyannamesi',
      description: `${currentYear - 1} yılı kurumlar vergisi beyannamesi`,
      type: 'declaration',
      category: 'kurumlar',
      status: kurumlasDate.isBefore(currentDate) ? 'completed' :
              kurumlasDate.diff(currentDate, 'day') <= 30 ? 'due-soon' : 'upcoming',
      isRecurring: true,
      reminderDays: [30, 14, 7, 3, 1],
      period: `${currentYear - 1} Yılı`,
    });
  }

  // Payment dates
  for (let i = 0; i < 3; i++) {
    const eventDate = dayjs().add(i, 'month').date(26);
    events.push({
      id: events.length + 1,
      date: eventDate.format('YYYY-MM-DD'),
      title: 'KDV Ödeme',
      description: `${monthNames[eventDate.subtract(1, 'month').month()]} ${eventDate.year()} dönemi KDV ödeme son günü`,
      type: 'payment',
      category: 'kdv',
      status: eventDate.isBefore(currentDate) ? 'completed' :
              eventDate.diff(currentDate, 'day') <= 7 ? 'due-soon' : 'upcoming',
      isRecurring: true,
      reminderDays: [7, 3, 1],
      amount: 125000,
      period: `${monthNames[eventDate.subtract(1, 'month').month()]} ${eventDate.year()}`,
    });
  }

  return events.sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));
};

const mockEvents = generateMockEvents();

export default function TaxCalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [selectedEvent, setSelectedEvent] = useState<TaxEvent | null>(null);
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('calendar');
  const [filterCategory, setFilterCategory] = useState<TaxCategory | 'all'>('all');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  // Get events for a specific date
  const getEventsForDate = (date: Dayjs): TaxEvent[] => {
    return mockEvents.filter(event =>
      dayjs(event.date).isSame(date, 'day') &&
      (filterCategory === 'all' || event.category === filterCategory)
    );
  };

  // Calendar cell render
  const dateCellRender = (date: Dayjs) => {
    const events = getEventsForDate(date);
    if (events.length === 0) return null;

    return (
      <ul className="events-list m-0 p-0 list-none">
        {events.slice(0, 3).map((event) => (
          <li key={event.id} className="mb-1">
            <Badge
              color={categoryConfig[event.category].color === 'default' ? 'gray' : categoryConfig[event.category].color}
              text={
                <span className="text-xs truncate max-w-[80px] inline-block">
                  {event.title}
                </span>
              }
            />
          </li>
        ))}
        {events.length > 3 && (
          <li className="text-xs text-slate-500">+{events.length - 3} daha</li>
        )}
      </ul>
    );
  };

  // Get upcoming events
  const upcomingEvents = mockEvents
    .filter(e => dayjs(e.date).isAfter(dayjs()) && (filterCategory === 'all' || e.category === filterCategory))
    .slice(0, 10);

  // Get this week's events
  const thisWeekEvents = mockEvents.filter(e => {
    const eventDate = dayjs(e.date);
    const startOfWeek = dayjs().startOf('week');
    const endOfWeek = dayjs().endOf('week');
    return eventDate.isAfter(startOfWeek) && eventDate.isBefore(endOfWeek) &&
           (filterCategory === 'all' || e.category === filterCategory);
  });

  // Get overdue events
  const overdueEvents = mockEvents.filter(e =>
    e.status === 'overdue' && (filterCategory === 'all' || e.category === filterCategory)
  );

  // Get due soon events (next 7 days)
  const dueSoonEvents = mockEvents.filter(e => {
    const eventDate = dayjs(e.date);
    const daysUntil = eventDate.diff(dayjs(), 'day');
    return daysUntil >= 0 && daysUntil <= 7 && e.status !== 'completed' &&
           (filterCategory === 'all' || e.category === filterCategory);
  });

  // Stats
  const stats = {
    totalThisMonth: mockEvents.filter(e => dayjs(e.date).month() === dayjs().month()).length,
    completed: mockEvents.filter(e => e.status === 'completed').length,
    upcoming: mockEvents.filter(e => e.status === 'upcoming').length,
    dueSoon: dueSoonEvents.length,
    overdue: overdueEvents.length,
  };

  // Tab items
  const tabItems = [
    {
      key: 'calendar',
      label: (
        <span className="flex items-center gap-2">
          <CalendarDaysIcon className="w-4 h-4" />
          Takvim
        </span>
      ),
      children: (
        <div className="space-y-6">
          {/* Calendar */}
          <Calendar
            locale={locale}
            value={selectedDate}
            onChange={setSelectedDate}
            dateCellRender={dateCellRender}
            onSelect={(date) => {
              const events = getEventsForDate(date);
              if (events.length > 0) {
                setSelectedEvent(events[0]);
                setEventModalVisible(true);
              }
            }}
            className="border border-slate-200 rounded-xl overflow-hidden [&_.ant-picker-calendar-header]:!px-4 [&_.ant-picker-calendar-header]:!py-3 [&_.ant-picker-calendar-header]:!border-b [&_.ant-picker-calendar-header]:!border-slate-200"
          />
        </div>
      ),
    },
    {
      key: 'list',
      label: (
        <span className="flex items-center gap-2">
          <DocumentTextIcon className="w-4 h-4" />
          Liste Görünümü
        </span>
      ),
      children: (
        <div className="space-y-4">
          {upcomingEvents.map((event) => {
            const daysUntil = dayjs(event.date).diff(dayjs(), 'day');
            return (
              <div
                key={event.id}
                className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 cursor-pointer transition-colors"
                onClick={() => {
                  setSelectedEvent(event);
                  setEventModalVisible(true);
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg ${statusConfig[event.status].bgColor} flex items-center justify-center flex-shrink-0`}>
                      {categoryConfig[event.category].icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-900">{event.title}</span>
                        <Tag color={categoryConfig[event.category].color}>
                          {categoryConfig[event.category].label}
                        </Tag>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{event.description}</p>
                      {event.period && (
                        <p className="text-xs text-slate-400 mt-1">Dönem: {event.period}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-slate-900">
                      {dayjs(event.date).format('DD MMM')}
                    </div>
                    <div className={`text-xs ${daysUntil <= 3 ? 'text-red-600 font-medium' : daysUntil <= 7 ? 'text-amber-600' : 'text-slate-500'}`}>
                      {daysUntil === 0 ? 'Bugün' : daysUntil === 1 ? 'Yarın' : `${daysUntil} gün kaldı`}
                    </div>
                    {event.amount && (
                      <div className="text-sm font-semibold text-slate-900 mt-1">
                        {formatCurrency(event.amount)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ),
    },
    {
      key: 'reminders',
      label: (
        <span className="flex items-center gap-2">
          <BellAlertIcon className="w-4 h-4" />
          Hatırlatmalar
        </span>
      ),
      children: (
        <div className="space-y-6">
          {/* Overdue */}
          {overdueEvents.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-red-700 mb-3 flex items-center gap-2">
                <ExclamationTriangleIcon className="w-4 h-4" />
                Gecikmiş ({overdueEvents.length})
              </h3>
              <div className="space-y-2">
                {overdueEvents.map((event) => (
                  <div
                    key={event.id}
                    className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                        {categoryConfig[event.category].icon}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-red-900">{event.title}</span>
                        <div className="text-xs text-red-600">{event.period}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-red-700">
                        {dayjs(event.date).format('DD MMM YYYY')}
                      </div>
                      <div className="text-xs text-red-600">
                        {Math.abs(dayjs(event.date).diff(dayjs(), 'day'))} gün gecikti
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Due Soon */}
          {dueSoonEvents.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-amber-700 mb-3 flex items-center gap-2">
                <ClockIcon className="w-4 h-4" />
                Bu Hafta ({dueSoonEvents.length})
              </h3>
              <div className="space-y-2">
                {dueSoonEvents.map((event) => {
                  const daysUntil = dayjs(event.date).diff(dayjs(), 'day');
                  return (
                    <div
                      key={event.id}
                      className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                          {categoryConfig[event.category].icon}
                        </div>
                        <div>
                          <span className="text-sm font-medium text-amber-900">{event.title}</span>
                          <div className="text-xs text-amber-600">{event.period}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-amber-700">
                          {dayjs(event.date).format('DD MMM')}
                        </div>
                        <div className="text-xs text-amber-600">
                          {daysUntil === 0 ? 'Bugün!' : daysUntil === 1 ? 'Yarın!' : `${daysUntil} gün kaldı`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Upcoming */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <CalendarDaysIcon className="w-4 h-4" />
              Yaklaşan ({upcomingEvents.filter(e => dayjs(e.date).diff(dayjs(), 'day') > 7).length})
            </h3>
            <div className="space-y-2">
              {upcomingEvents.filter(e => dayjs(e.date).diff(dayjs(), 'day') > 7).slice(0, 5).map((event) => (
                <div
                  key={event.id}
                  className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                      {categoryConfig[event.category].icon}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-slate-900">{event.title}</span>
                      <div className="text-xs text-slate-500">{event.period}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-slate-700">
                      {dayjs(event.date).format('DD MMM')}
                    </div>
                    <div className="text-xs text-slate-500">
                      {dayjs(event.date).diff(dayjs(), 'day')} gün kaldı
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Page Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
          <CalendarDaysIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Vergi Takvimi</h1>
              <p className="text-sm text-slate-500">GİB beyanname ve ödeme tarihleri takip sistemi</p>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={filterCategory}
                onChange={setFilterCategory}
                options={[
                  { value: 'all', label: 'Tüm Kategoriler' },
                  ...Object.entries(categoryConfig).map(([key, config]) => ({
                    value: key,
                    label: config.label,
                  })),
                ]}
                className="w-48 [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
              />
              <Button
                icon={<BellAlertIcon className="w-4 h-4" />}
                className="!border-slate-300 !text-slate-700 hover:!border-slate-400"
              >
                Hatırlatıcı Ekle
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      {dueSoonEvents.length > 0 && (
        <Alert
          type="warning"
          showIcon
          icon={<ExclamationTriangleIcon className="w-5 h-5" />}
          message={`${dueSoonEvents.length} adet yaklaşan son tarih!`}
          description={
            <div className="flex items-center gap-2 mt-1">
              {dueSoonEvents.slice(0, 3).map((event) => (
                <Tag key={event.id} color={categoryConfig[event.category].color}>
                  {event.title} - {dayjs(event.date).format('DD MMM')}
                </Tag>
              ))}
              {dueSoonEvents.length > 3 && (
                <span className="text-xs text-amber-600">+{dueSoonEvents.length - 3} daha</span>
              )}
            </div>
          }
          className="mb-8 !border-amber-200 !bg-amber-50"
        />
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <CalendarDaysIcon className="w-5 h-5 text-slate-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.totalThisMonth}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Bu Ay</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Tamamlandı</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <ClockIcon className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-600">{stats.upcoming}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Yaklaşan</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <BellAlertIcon className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600">{stats.dueSoon}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Bu Hafta</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Gecikmiş</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          className="[&_.ant-tabs-nav]:!mb-6"
        />
      </div>

      {/* Quick Reference */}
      <div className="mt-8 bg-white border border-slate-200 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Vergi Takvimi Referans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-2">Aylık Beyannameler</h4>
            <ul className="text-xs text-slate-500 space-y-1">
              <li>• <strong>KDV:</strong> Takip eden ayın 26'sı</li>
              <li>• <strong>Muhtasar:</strong> Takip eden ayın 26'sı</li>
              <li>• <strong>Ba-Bs:</strong> Takip eden ayın son günü</li>
              <li>• <strong>SGK APHB:</strong> Takip eden ayın 26'sı</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-2">Çeyreklik Beyannameler</h4>
            <ul className="text-xs text-slate-500 space-y-1">
              <li>• <strong>Geçici Vergi Q1:</strong> 17 Mayıs</li>
              <li>• <strong>Geçici Vergi Q2:</strong> 17 Ağustos</li>
              <li>• <strong>Geçici Vergi Q3:</strong> 17 Kasım</li>
              <li>• <strong>Geçici Vergi Q4:</strong> 17 Şubat (sonraki yıl)</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-2">Yıllık Beyannameler</h4>
            <ul className="text-xs text-slate-500 space-y-1">
              <li>• <strong>Kurumlar Vergisi:</strong> 30 Nisan</li>
              <li>• <strong>Gelir Vergisi:</strong> 31 Mart</li>
              <li>• <strong>e-Defter Beratı:</strong> 30 Nisan</li>
              <li>• <strong>Yıllık Ba-Bs:</strong> 15 Şubat</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Event Detail Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${statusConfig[selectedEvent?.status || 'upcoming'].bgColor} flex items-center justify-center`}>
              {selectedEvent && categoryConfig[selectedEvent.category].icon}
            </div>
            <div>
              <div className="text-lg font-semibold">{selectedEvent?.title}</div>
              <div className="text-sm text-slate-500">{selectedEvent?.period}</div>
            </div>
          </div>
        }
        open={eventModalVisible}
        onCancel={() => setEventModalVisible(false)}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button onClick={() => setEventModalVisible(false)}>
              Kapat
            </Button>
            <Button type="primary" className="!bg-slate-900 hover:!bg-slate-800">
              İşleme Git
            </Button>
          </div>
        }
        width={500}
      >
        {selectedEvent && (
          <div className="space-y-4 mt-4">
            <div className="flex items-center gap-4">
              <Tag color={categoryConfig[selectedEvent.category].color} className="!text-sm">
                {categoryConfig[selectedEvent.category].label}
              </Tag>
              <Tag color={eventTypeConfig[selectedEvent.type].color} className="!text-sm">
                {eventTypeConfig[selectedEvent.type].label}
              </Tag>
              <Tag className={`!text-sm ${statusConfig[selectedEvent.status].bgColor} ${statusConfig[selectedEvent.status].color} !border-0`}>
                {statusConfig[selectedEvent.status].label}
              </Tag>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <div className="text-sm text-slate-500 mb-1">Açıklama</div>
              <div className="text-sm text-slate-900">{selectedEvent.description}</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="text-sm text-slate-500 mb-1">Son Tarih</div>
                <div className="text-lg font-semibold text-slate-900">
                  {dayjs(selectedEvent.date).format('DD MMMM YYYY')}
                </div>
                <div className="text-xs text-slate-500">
                  {dayjs(selectedEvent.date).format('dddd')}
                </div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="text-sm text-slate-500 mb-1">Kalan Süre</div>
                <div className={`text-lg font-semibold ${
                  dayjs(selectedEvent.date).diff(dayjs(), 'day') <= 3 ? 'text-red-600' :
                  dayjs(selectedEvent.date).diff(dayjs(), 'day') <= 7 ? 'text-amber-600' : 'text-slate-900'
                }`}>
                  {dayjs(selectedEvent.date).diff(dayjs(), 'day')} gün
                </div>
              </div>
            </div>

            {selectedEvent.amount && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-sm text-green-600 mb-1">Tahmini Ödeme Tutarı</div>
                <div className="text-xl font-bold text-green-700">
                  {formatCurrency(selectedEvent.amount)}
                </div>
              </div>
            )}

            <div className="text-xs text-slate-400">
              Hatırlatma: {selectedEvent.reminderDays.map(d => `${d} gün önce`).join(', ')}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
