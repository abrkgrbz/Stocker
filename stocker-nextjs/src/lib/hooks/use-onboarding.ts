'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useTenant } from '@/lib/tenant';

interface WizardData {
  id: string;
  wizardType: number;
  status: number;
  currentStepIndex: number;
  totalSteps: number;
  progressPercentage: number;
  requiresOnboarding: boolean;
}

interface OnboardingFormData {
  sector?: string;
  companyName: string;
  companyCode: string;
  packageId: string;
  contactPhone?: string;
}

interface CompleteOnboardingResult {
  wizardId: string;
  tenantId: string;
  isCompleted: boolean;
  provisioningStarted: boolean;
  message: string;
}

export function useOnboarding() {
  const { user, isAuthenticated } = useAuth();
  const { tenant } = useTenant();
  const [wizardData, setWizardData] = useState<WizardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user && tenant) {
      checkOnboardingStatus();
    }
  }, [isAuthenticated, user, tenant]);

  const checkOnboardingStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/onboarding/status', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to check onboarding status');
      }

      const data = await response.json();
      setWizardData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const completeOnboarding = async (formData: OnboardingFormData): Promise<CompleteOnboardingResult> => {
    try {
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          userId: user?.id,
          tenantId: tenant?.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Preserve errors object for detailed validation messages
        const error: any = new Error(errorData.message || 'Failed to complete onboarding');
        error.errors = errorData.errors;
        throw error;
      }

      const result: CompleteOnboardingResult = await response.json();

      // Don't refresh status here - let the progress modal handle it
      // The frontend will redirect to dashboard after provisioning completes

      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  return {
    wizardData,
    loading,
    error,
    requiresOnboarding: wizardData?.requiresOnboarding ?? false,
    completeOnboarding,
    refreshStatus: checkOnboardingStatus,
  };
}
