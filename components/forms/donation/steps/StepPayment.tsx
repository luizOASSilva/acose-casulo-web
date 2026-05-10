'use client';

import { useEffect, useRef, useState, useCallback, useId } from 'react';
import { DonationData } from '@/types/donation';
import {
  PixResponse,
  createDonation,
  getDonationStatus,
  updateDonationPix,
  updateDonation,
} from '@/services/donation';
import Image from 'next/image';

const PIX_TTL_MS = 15 * 60 * 1000;
const POLL_MS = 5_000;
const COPY_RESET_MS = 2_500;

type PixWithExpiry = PixResponse & { expires_at: number };

type Phase =
  | { type: 'loading' }
  | { type: 'error'; message: string }
  | { type: 'ready'; pix: PixWithExpiry }
  | { type: 'expired' }
  | { type: 'confirmed' };

interface StepPaymentProps {
  formData: DonationData;
  cachedPix: PixWithExpiry | null;
  onPixGenerated: (pix: PixWithExpiry) => void;
  onConfirm: () => void;
}

export default function StepPayment({
  formData,
  cachedPix,
  onPixGenerated,
  onConfirm,
}: StepPaymentProps) {
  const [phase, setPhase] = useState<Phase>(
    cachedPix && cachedPix.expires_at > Date.now()
      ? { type: 'ready', pix: cachedPix }
      : { type: 'loading' }
  );

  const [timeLeft, setTimeLeft] = useState(0);
  const [copied, setCopied] = useState(false);

  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const donationIdRef = useRef<number | null>(cachedPix?.id ?? null);
  const pixRef = useRef<PixWithExpiry | null>(cachedPix ?? null);

  const onConfirmRef = useRef(onConfirm);
  const onPixGeneratedRef = useRef(onPixGenerated);

  const initializedRef = useRef(false);
  const regeneratingRef = useRef(false);
  const prevAmountRef = useRef<number | null>(null);

  const timerId = useId();

  useEffect(() => {
    onConfirmRef.current = onConfirm;
    onPixGeneratedRef.current = onPixGenerated;
  }, [onConfirm, onPixGenerated]);

  const clearTimers = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    pollRef.current = null;
    timerRef.current = null;
  }, []);

  const startTimer = useCallback((expiresAt: number) => {
    if (timerRef.current) clearInterval(timerRef.current);

    const tick = () => {
      const remaining = expiresAt - Date.now();

      if (remaining <= 0) {
        clearTimers();
        setPhase({ type: 'expired' });
        setTimeLeft(0);
        return;
      }

      setTimeLeft(remaining);
    };

    tick();
    timerRef.current = setInterval(tick, 1000);
  }, [clearTimers]);

  const startPolling = useCallback((id: number) => {
    if (pollRef.current) clearInterval(pollRef.current);

    pollRef.current = setInterval(async () => {
      try {
        const { status } = await getDonationStatus(id);

        if (status === 'approved') {
          clearTimers();
          setPhase({ type: 'confirmed' });
          onConfirmRef.current();
        }

        if (status === 'expired') {
          clearTimers();
          setPhase({ type: 'expired' });
        }
      } catch {}
    }, POLL_MS);
  }, [clearTimers]);

  const applyPix = useCallback((pix: PixWithExpiry) => {
    donationIdRef.current = pix.id;
    pixRef.current = pix;

    setPhase({ type: 'ready', pix });

    onPixGeneratedRef.current(pix);

    startPolling(pix.id);
    startTimer(pix.expires_at);
  }, [startPolling, startTimer]);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    prevAmountRef.current = formData.amount;

    if (cachedPix && cachedPix.expires_at > Date.now()) {
      applyPix(cachedPix);
      return;
    }

    const generate = async () => {
      setPhase({ type: 'loading' });

      try {
        const data = await createDonation(formData);

        const pix: PixWithExpiry = {
          ...data,
          expires_at: Date.now() + PIX_TTL_MS,
        };

        applyPix(pix);
      } catch (err: any) {
        setPhase({
          type: 'error',
          message: err?.message ?? 'Erro ao gerar PIX',
        });
      }
    };

    generate();

    return clearTimers;
  }, []);

  useEffect(() => {
    const id = donationIdRef.current;
    if (!id) return;

    updateDonation(id, {
      name: formData.name,
      email: formData.email,
      cpf: formData.cpf,
    }).catch(() => {});
  }, [formData.name, formData.email, formData.cpf]);

  useEffect(() => {
    if (prevAmountRef.current === null) return;
    if (prevAmountRef.current === formData.amount) return;

    prevAmountRef.current = formData.amount;

    const id = donationIdRef.current;
    if (!id || regeneratingRef.current) return;

    const run = async () => {
      regeneratingRef.current = true;

      setPhase({ type: 'loading' });
      clearTimers();

      try {
        const data = await updateDonationPix(id, formData.amount);

        const pix: PixWithExpiry = {
          ...data,
          expires_at: Date.now() + PIX_TTL_MS,
        };

        applyPix(pix);
      } catch (err: any) {
        setPhase({
          type: 'error',
          message: err?.message ?? 'Erro ao atualizar PIX',
        });
      } finally {
        regeneratingRef.current = false;
      }
    };

    run();
  }, [formData.amount]);

  const handleCopy = useCallback(async () => {
    const pix = pixRef.current;
    if (!pix?.pix_copy_paste) return;

    await navigator.clipboard.writeText(pix.pix_copy_paste);
    setCopied(true);
    setTimeout(() => setCopied(false), COPY_RESET_MS);
  }, []);

  if (phase.type === 'loading') {
    return (
      <section className="flex flex-col items-center gap-4 py-20">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500">Gerando seu Pix…</p>
      </section>
    );
  }

  if (phase.type === 'error') {
    return (
      <section className="text-center py-20">
        <p className="text-red-500">{phase.message}</p>
      </section>
    );
  }

  if (phase.type !== 'ready') return null;

  const { pix } = phase;

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">Pagamento via PIX</h2>

      <div className="bg-secondary rounded-md p-6">
        <p className="text-white">R$ {formData.amount}</p>
      </div>

      <div className="bg-primary text-white p-3 rounded-md flex justify-between">
        <span>PIX</span>
        <span>{Math.floor(timeLeft / 1000)}s</span>
      </div>

      <div className="bg-secondary p-8 flex flex-col items-center gap-4">
        {pix.pix_qr_code && (
          <Image
            src={`data:image/png;base64,${pix.pix_qr_code}`}
            alt="QR Code"
            width={180}
            height={180}
          />
        )}

        <button
          onClick={handleCopy}
          className="bg-primary text-white px-4 py-2 rounded"
        >
          {copied ? 'Copiado!' : 'Copiar PIX'}
        </button>
      </div>
    </section>
  );
}
