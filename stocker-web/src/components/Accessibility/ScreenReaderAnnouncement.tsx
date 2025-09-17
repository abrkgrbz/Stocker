import React, { useEffect, useRef } from 'react';

interface ScreenReaderAnnouncementProps {
  message: string;
  politeness?: 'polite' | 'assertive';
  clearAfter?: number;
}

/**
 * Component for making announcements to screen readers
 * Uses ARIA live regions to announce messages
 */
export const ScreenReaderAnnouncement: React.FC<ScreenReaderAnnouncementProps> = ({
  message,
  politeness = 'polite',
  clearAfter = 1000
}) => {
  const announcementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (message && announcementRef.current) {
      // Clear any existing message
      announcementRef.current.textContent = '';
      
      // Set new message after a brief delay to ensure it's announced
      setTimeout(() => {
        if (announcementRef.current) {
          announcementRef.current.textContent = message;
        }
      }, 100);

      // Clear the message after specified time
      if (clearAfter > 0) {
        const clearTimer = setTimeout(() => {
          if (announcementRef.current) {
            announcementRef.current.textContent = '';
          }
        }, clearAfter);

        return () => clearTimeout(clearTimer);
      }
    }
  }, [message, clearAfter]);

  return (
    <div
      ref={announcementRef}
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: '0',
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: '0'
      }}
    />
  );
};

// Hook for using screen reader announcements
export const useScreenReaderAnnouncement = () => {
  const [announcement, setAnnouncement] = React.useState('');

  const announce = (message: string, politeness: 'polite' | 'assertive' = 'polite') => {
    setAnnouncement('');
    setTimeout(() => {
      setAnnouncement(message);
    }, 100);
  };

  return {
    announcement,
    announce,
    ScreenReaderAnnouncement: () => (
      <ScreenReaderAnnouncement message={announcement} />
    )
  };
};

export default ScreenReaderAnnouncement;