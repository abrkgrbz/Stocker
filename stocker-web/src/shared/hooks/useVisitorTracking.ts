import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

export interface VisitorData {
  type: 'first-time' | 'returning' | 'active-user';
  visitCount: number;
  lastVisit?: Date;
  hasAccount: boolean;
  preferredLanguage?: string;
  interestAreas?: string[];
  lastActiveRoute?: string;
}

export const useVisitorTracking = () => {
  const [visitorData, setVisitorData, removeVisitorData] = useLocalStorage<VisitorData>('visitor_tracking', {
    type: 'first-time',
    visitCount: 0,
    hasAccount: false,
  });

  const [currentVisitType, setCurrentVisitType] = useState<VisitorData['type']>('first-time');

  useEffect(() => {
    const updateVisitorData = () => {
      const now = new Date();
      const lastVisit = visitorData.lastVisit ? new Date(visitorData.lastVisit) : null;
      const timeSinceLastVisit = lastVisit ? now.getTime() - lastVisit.getTime() : null;
      const daysSinceLastVisit = timeSinceLastVisit ? Math.floor(timeSinceLastVisit / (1000 * 60 * 60 * 24)) : null;

      let newVisitorType: VisitorData['type'] = 'first-time';
      
      // Determine visitor type based on history
      if (visitorData.hasAccount || localStorage.getItem('auth-storage')) {
        newVisitorType = 'active-user';
      } else if (visitorData.visitCount > 0 && daysSinceLastVisit !== null) {
        if (daysSinceLastVisit <= 30) {
          newVisitorType = 'returning';
        } else {
          newVisitorType = 'first-time'; // Reset to first-time if long absence
        }
      }

      const updatedData: VisitorData = {
        ...visitorData,
        type: newVisitorType,
        visitCount: visitorData.visitCount + 1,
        lastVisit: now,
        hasAccount: Boolean(localStorage.getItem('auth-storage')),
      };

      setVisitorData(updatedData);
      setCurrentVisitType(newVisitorType);
    };

    updateVisitorData();
  }, []);

  const trackInterest = (area: string) => {
    const interests = visitorData.interestAreas || [];
    if (!interests.includes(area)) {
      setVisitorData({
        ...visitorData,
        interestAreas: [...interests, area],
      });
    }
  };

  const trackRouteVisit = (route: string) => {
    setVisitorData({
      ...visitorData,
      lastActiveRoute: route,
    });
  };

  const markHasAccount = () => {
    setVisitorData({
      ...visitorData,
      hasAccount: true,
      type: 'active-user',
    });
  };

  return {
    visitorData,
    currentVisitType,
    trackInterest,
    trackRouteVisit,
    markHasAccount,
    removeVisitorData,
  };
};