'use client';

import React, { useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import type { EventClickArg, DateSelectArg, EventContentArg } from '@fullcalendar/core';
import type { Activity } from '@/lib/api/services/crm.service';
import { Card, Badge, Tooltip } from 'antd';
import {
  PhoneOutlined,
  MailOutlined,
  TeamOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

// Activity type configuration
const activityConfig: Record<
  Activity['type'],
  { icon: React.ReactNode; color: string; bgColor: string; borderColor: string }
> = {
  Call: {
    icon: <PhoneOutlined />,
    color: '#1890ff',
    bgColor: '#e6f4ff',
    borderColor: '#1890ff',
  },
  Email: {
    icon: <MailOutlined />,
    color: '#13c2c2',
    bgColor: '#e6fffb',
    borderColor: '#13c2c2',
  },
  Meeting: {
    icon: <TeamOutlined />,
    color: '#52c41a',
    bgColor: '#f6ffed',
    borderColor: '#52c41a',
  },
  Task: {
    icon: <FileTextOutlined />,
    color: '#fa8c16',
    bgColor: '#fff7e6',
    borderColor: '#fa8c16',
  },
  Note: {
    icon: <FileTextOutlined />,
    color: '#8c8c8c',
    bgColor: '#fafafa',
    borderColor: '#d9d9d9',
  },
};

interface ActivityCalendarProps {
  activities: Activity[];
  onEventClick?: (activity: Activity) => void;
  onDateSelect?: (start: Date, end: Date) => void;
  loading?: boolean;
}

export function ActivityCalendar({
  activities,
  onEventClick,
  onDateSelect,
  loading = false,
}: ActivityCalendarProps) {
  const calendarRef = useRef<FullCalendar>(null);

  // Transform activities to FullCalendar events
  const events = activities.map((activity) => {
    const config = activityConfig[activity.type] || activityConfig.Note; // Fallback to Note config
    const isCompleted = activity.status === 'Completed';
    const isCancelled = activity.status === 'Cancelled';

    return {
      id: String(activity.id),
      title: activity.title,
      start: activity.startTime,
      end: activity.endTime || activity.startTime,
      backgroundColor: isCompleted ? '#f6ffed' : isCancelled ? '#fff1f0' : config.bgColor,
      borderColor: isCompleted ? '#52c41a' : isCancelled ? '#ff4d4f' : config.borderColor,
      textColor: isCompleted ? '#52c41a' : isCancelled ? '#ff4d4f' : config.color,
      extendedProps: {
        activity,
        type: activity.type,
        status: activity.status,
        description: activity.description,
      },
    };
  });

  const handleEventClick = (clickInfo: EventClickArg) => {
    const activity = clickInfo.event.extendedProps.activity as Activity;
    onEventClick?.(activity);
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    onDateSelect?.(selectInfo.start, selectInfo.end);
    selectInfo.view.calendar.unselect();
  };

  // Custom event content renderer
  const renderEventContent = (eventInfo: EventContentArg) => {
    const { activity, type, status } = eventInfo.event.extendedProps;
    const config = activityConfig[type as Activity['type']] || activityConfig.Note; // Fallback to Note config
    const isCompleted = status === 'Completed';
    const isCancelled = status === 'Cancelled';
    const isAllDay = !eventInfo.event.end || eventInfo.event.allDay;

    return (
      <Tooltip
        title={
          <div className="text-xs">
            <div className="font-semibold mb-1">{eventInfo.event.title}</div>
            {eventInfo.event.extendedProps.description && (
              <div className="mb-1">{eventInfo.event.extendedProps.description}</div>
            )}
            <div className="text-gray-300">
              {dayjs(eventInfo.event.start).format('HH:mm')}
              {eventInfo.event.end && !isAllDay && ` - ${dayjs(eventInfo.event.end).format('HH:mm')}`}
            </div>
          </div>
        }
      >
        <div className="fc-event-main-frame px-1">
          <div className="flex items-center gap-1">
            <span className="text-xs">{config.icon}</span>
            <span className="fc-event-title text-xs font-medium truncate">
              {eventInfo.event.title}
            </span>
            {isCompleted && <Badge status="success" />}
            {isCancelled && <Badge status="error" />}
          </div>
          {!eventInfo.view.type.includes('list') && eventInfo.event.start && (
            <div className="fc-event-time text-xs opacity-75">
              <ClockCircleOutlined className="mr-1" />
              {dayjs(eventInfo.event.start).format('HH:mm')}
            </div>
          )}
        </div>
      </Tooltip>
    );
  };

  return (
    <Card
      loading={loading}
      className="activity-calendar-card"
      styles={{ body: { padding: '16px' } }}
    >
      <style jsx global>{`
        .activity-calendar-card .fc {
          font-family: inherit;
        }

        .activity-calendar-card .fc-theme-standard td,
        .activity-calendar-card .fc-theme-standard th {
          border-color: #f0f0f0;
        }

        .activity-calendar-card .fc-col-header-cell {
          background: #fafafa;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.5px;
          color: #8c8c8c;
          padding: 12px 8px;
        }

        .activity-calendar-card .fc-daygrid-day-number {
          color: #262626;
          font-weight: 500;
          padding: 8px;
        }

        .activity-calendar-card .fc-day-today {
          background-color: #e6f4ff !important;
        }

        .activity-calendar-card .fc-day-today .fc-daygrid-day-number {
          background: #1890ff;
          color: white;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .activity-calendar-card .fc-event {
          border-radius: 4px;
          border-left-width: 3px;
          margin: 1px 2px;
          padding: 2px 4px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .activity-calendar-card .fc-event:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          transform: translateY(-1px);
        }

        .activity-calendar-card .fc-button {
          background: white;
          border-color: #d9d9d9;
          color: #262626;
          text-transform: capitalize;
          font-weight: 500;
          padding: 6px 15px;
          border-radius: 6px;
          transition: all 0.3s;
        }

        .activity-calendar-card .fc-button:hover {
          background: #fafafa;
          border-color: #1890ff;
          color: #1890ff;
        }

        .activity-calendar-card .fc-button-primary:not(:disabled):active,
        .activity-calendar-card .fc-button-primary:not(:disabled).fc-button-active {
          background: #1890ff;
          border-color: #1890ff;
          color: white;
        }

        .activity-calendar-card .fc-toolbar-title {
          font-size: 20px;
          font-weight: 600;
          color: #262626;
        }

        .activity-calendar-card .fc-daygrid-day-events {
          margin-top: 2px;
        }

        .activity-calendar-card .fc-timegrid-slot {
          height: 3em;
        }

        .activity-calendar-card .fc-timegrid-event {
          border-radius: 4px;
          border-left-width: 3px;
        }

        .activity-calendar-card .fc-list-event:hover td {
          background-color: #fafafa;
        }

        .activity-calendar-card .fc-list-event-dot {
          border-width: 4px;
        }

        .activity-calendar-card .fc-scrollgrid {
          border-radius: 8px;
          overflow: hidden;
        }

        .activity-calendar-card .fc-daygrid-day-frame {
          min-height: 100px;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .activity-calendar-card .fc-toolbar {
            flex-direction: column;
            gap: 10px;
          }

          .activity-calendar-card .fc-toolbar-chunk {
            display: flex;
            justify-content: center;
          }
        }
      `}</style>

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
        }}
        buttonText={{
          today: 'Bugün',
          month: 'Ay',
          week: 'Hafta',
          day: 'Gün',
          list: 'Liste',
        }}
        locale="tr"
        firstDay={1}
        height="auto"
        events={events}
        eventClick={handleEventClick}
        selectable={true}
        select={handleDateSelect}
        eventContent={renderEventContent}
        nowIndicator={true}
        weekNumbers={false}
        dayMaxEvents={3}
        moreLinkText={(num) => `+${num} daha`}
        slotMinTime="06:00:00"
        slotMaxTime="22:00:00"
        allDaySlot={true}
        expandRows={true}
        stickyHeaderDates={true}
        navLinks={true}
        editable={false}
        eventDisplay="block"
        dayHeaderFormat={{ weekday: 'short' }}
      />
    </Card>
  );
}
