'use client';

import React, { useEffect, useState, useRef } from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';

interface FormSection {
  /** Section ID (should match the section element's id attribute) */
  id: string;
  /** Section title for display */
  title: string;
  /** Whether this section is required */
  required?: boolean;
}

interface FormProgressIndicatorProps {
  /** List of form sections */
  sections: FormSection[];
  /** Current active section ID */
  activeSection?: string;
  /** Completed section IDs */
  completedSections?: string[];
  /** Container element to observe for scroll */
  containerRef?: React.RefObject<HTMLElement>;
  /** Callback when section is clicked */
  onSectionClick?: (sectionId: string) => void;
  /** Position of the indicator */
  position?: 'left' | 'right' | 'top';
  /** Additional class name */
  className?: string;
}

/**
 * Form progress indicator showing which sections are completed
 * Can be used in vertical (sidebar) or horizontal (top) mode
 */
export function FormProgressIndicator({
  sections,
  activeSection: controlledActiveSection,
  completedSections = [],
  containerRef,
  onSectionClick,
  position = 'right',
  className = '',
}: FormProgressIndicatorProps) {
  const [activeSection, setActiveSection] = useState<string>(controlledActiveSection || sections[0]?.id || '');
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Use controlled active section if provided
  useEffect(() => {
    if (controlledActiveSection) {
      setActiveSection(controlledActiveSection);
    }
  }, [controlledActiveSection]);

  // Set up intersection observer to track visible sections
  useEffect(() => {
    if (controlledActiveSection) return; // Don't auto-detect if controlled

    const observerCallback: IntersectionObserverCallback = (entries) => {
      const visibleEntries = entries.filter(entry => entry.isIntersecting);
      if (visibleEntries.length > 0) {
        // Find the topmost visible section
        const topEntry = visibleEntries.reduce((prev, curr) => {
          return prev.boundingClientRect.top < curr.boundingClientRect.top ? prev : curr;
        });
        setActiveSection(topEntry.target.id);
      }
    };

    observerRef.current = new IntersectionObserver(observerCallback, {
      root: containerRef?.current || null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0,
    });

    // Observe all sections
    sections.forEach(section => {
      const element = document.getElementById(section.id);
      if (element) {
        observerRef.current?.observe(element);
      }
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [sections, containerRef, controlledActiveSection]);

  const handleSectionClick = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    onSectionClick?.(sectionId);
  };

  const completedCount = completedSections.length;
  const totalCount = sections.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Horizontal (top) layout
  if (position === 'top') {
    return (
      <div className={`bg-white border-b border-slate-200 px-8 py-4 ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-medium text-slate-600">İlerleme</span>
          <span className="text-sm text-slate-400">{progressPercent}%</span>
        </div>
        <div className="flex items-center gap-1">
          {sections.map((section, index) => {
            const isActive = activeSection === section.id;
            const isCompleted = completedSections.includes(section.id);

            return (
              <React.Fragment key={section.id}>
                <button
                  type="button"
                  onClick={() => handleSectionClick(section.id)}
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all
                    ${isActive
                      ? 'bg-slate-900 text-white'
                      : isCompleted
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }
                  `}
                >
                  {isCompleted && !isActive && (
                    <CheckIcon className="w-3 h-3" />
                  )}
                  <span>{section.title}</span>
                </button>
                {index < sections.length - 1 && (
                  <div className={`w-4 h-0.5 ${isCompleted ? 'bg-emerald-300' : 'bg-slate-200'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  }

  // Vertical (sidebar) layout
  return (
    <div className={`${position === 'left' ? 'pr-4 border-r' : 'pl-4 border-l'} border-slate-200 ${className}`}>
      {/* Progress summary */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-600 uppercase tracking-wider">İlerleme</span>
          <span className="text-xs text-slate-500">{completedCount}/{totalCount}</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Section list */}
      <nav className="space-y-1">
        {sections.map((section, index) => {
          const isActive = activeSection === section.id;
          const isCompleted = completedSections.includes(section.id);

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => handleSectionClick(section.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all
                ${isActive
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }
              `}
            >
              {/* Step indicator */}
              <div className={`
                flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                ${isCompleted
                  ? 'bg-emerald-500 text-white'
                  : isActive
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-200 text-slate-500'
                }
              `}>
                {isCompleted ? (
                  <CheckIcon className="w-3.5 h-3.5" />
                ) : (
                  index + 1
                )}
              </div>

              {/* Section title */}
              <div className="flex-1 min-w-0">
                <span className={`block text-sm truncate ${isActive ? 'font-medium' : ''}`}>
                  {section.title}
                </span>
                {section.required && !isCompleted && (
                  <span className="text-xs text-red-400">Zorunlu</span>
                )}
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default FormProgressIndicator;
