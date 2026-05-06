'use client';

import { useState, useEffect } from 'react';
import StepValue from './steps/StepValue';
import StepData from './steps/StepData';
import StepPayment from './steps/StepPayment';
import StepConfirmation from './steps/StepConfirmation';
import { DonationData, DonationStep } from '@/types/donation';
import { PixResponse } from '@/services/donation';
import { cn } from '@/lib/cn';

const STEP_LABELS = ['Valor', 'Dados', 'Pagamento', 'Confirmação'];
const GIFT_THRESHOLD = 100;
const SESSION_KEY = 'donation_session';

const initialData: DonationData = {
  amount: 0,
  name: '',
  email: '',
  cpf: '',
  zip_code: '',
  city: '',
  street: '',
  number: '',
  neighborhood: '',
  state: '',
  size: 'M',
};

interface SessionData {
  step: DonationStep;
  formData: DonationData;
  pix?: PixResponse & { expires_at: number };
}

function saveSession(data: SessionData) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
}

function loadSession(): SessionData | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionData;
  } catch {
    return null;
  }
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

export default function DonationFlow() {
  const [step, setStep] = useState<DonationStep>(1);
  const [formData, setFormData] = useState<DonationData>(initialData);
  const [pix, setPix] = useState<(PixResponse & { expires_at: number }) | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const session = loadSession();
    if (session) {
      if (session.pix && session.pix.expires_at < Date.now()) {
        clearSession();
      } else {
        setStep(session.step);
        setFormData(session.formData);
        if (session.pix) setPix(session.pix);
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (step === 4) {
      clearSession();
      return;
    }
    saveSession({ step, formData, pix: pix ?? undefined });
  }, [step, formData, pix, hydrated]);

  const goTo = (target: DonationStep) => {
    if (target < step) setStep(target);
  };

  const handleConfirm = () => {
    clearSession();
    setStep(4);
  };

  if (!hydrated) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#f0eeeb]">
      <main className="grow flex flex-col items-center py-10 px-4">
        {step >= 2 && (
          <div className="flex items-center mb-12">
            {([1, 2, 3, 4] as DonationStep[]).map((i) => {
              const isCompleted = step > i;
              const isCurrent = step === i;
              const isClickable = i < step;

              return (
                <div key={i} className="flex items-center">
                  <button
                    onClick={() => (isClickable ? goTo(i) : undefined)}
                    disabled={!isClickable}
                    className={cn(
                      'flex flex-col sm:flex-row items-center gap-1 sm:gap-2',
                      isClickable ? 'cursor-pointer' : 'cursor-default'
                    )}
                  >
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all shrink-0',
                        isCompleted || isCurrent ? 'bg-primary text-white' : 'bg-gray-300 text-gray-500'
                      )}
                    >
                      {i}
                    </div>
                    <span
                      className={cn(
                        'text-sm sm:text-xs font-medium whitespace-nowrap',
                        isCurrent ? 'text-primary' : isCompleted ? 'text-gray-700' : 'text-gray-400'
                      )}
                    >
                      {STEP_LABELS[i - 1]}
                    </span>
                  </button>

                  {i < 4 && (
                    <div
                      className={cn(
                        'mx-2 w-6 sm:w-16 shrink-0 h-0.75 rounded-full',
                        step > i ? 'bg-primary' : 'bg-gray-300'
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className={cn('w-full', step === 1 ? 'max-w-2xl' : 'max-w-xl')}>
          {step === 1 && (
            <StepValue
              initialAmount={formData.amount}
              onNext={(amount) => {
                setFormData((prev) => ({ ...prev, amount }));
                setStep(2);
              }}
            />
          )}

          {step === 2 && (
            <StepData
              data={formData}
              isGift={formData.amount >= GIFT_THRESHOLD}
              onNext={(data) => {
                setFormData((prev) => ({ ...prev, ...data }));
                setStep(3);
              }}
            />
          )}

          {step === 3 && (
            <StepPayment
              formData={formData}
              cachedPix={pix}
              onPixGenerated={(newPix) => setPix(newPix)}
              onConfirm={handleConfirm}
            />
          )}

          {step === 4 && <StepConfirmation amount={formData.amount} />}
        </div>
      </main>
    </div>
  );
}
