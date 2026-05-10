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
const POLL_MS = 5000;
const COPY_RESET_MS = 2500;

type PixWithExpiry = PixResponse & { expires_at: number };

type Phase =
  | { type: 'loading' }
  | { type: 'error'; message: string }
  | { type: 'ready'; pix: PixWithExpiry }
  | { type: 'expired' }
  | { type: 'confirmed' };

export default function StepPayment({
  formData,
  cachedPix,
  onPixGenerated,
  onConfirm,
}: {
  formData: DonationData;
  cachedPix: PixWithExpiry | null;
  onPixGenerated: (pix: PixWithExpiry) => void;
  onConfirm: () => void;
}) {
  const [phase, setPhase] = useState<Phase>(
    cachedPix && cachedPix.expires_at > Date.now()
      ? { type: 'ready', pix: cachedPix }
      : { type: 'loading' }
  );

  const [timeLeft, setTimeLeft] = useState(0);
  const [copied, setCopied] = useState(false);

  const pollRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const donationIdRef = useRef<number | null>(cachedPix?.id ?? null);

  const startTimer = useCallback((expiresAt: number) => {
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      const remaining = expiresAt - Date.now();
      if (remaining <= 0) {
        clearInterval(timerRef.current);
        setPhase({ type: 'expired' });
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);
  }, []);

  const startPolling = useCallback((id: number) => {
    if (pollRef.current) clearInterval(pollRef.current);

    pollRef.current = setInterval(async () => {
      const { status } = await getDonationStatus(id);
      if (status === 'approved') {
        clearInterval(pollRef.current);
        setPhase({ type: 'confirmed' });
        onConfirm();
      }
    }, POLL_MS);
  }, [onConfirm]);

  const applyPix = useCallback((pix: PixWithExpiry) => {
    donationIdRef.current = pix.id;
    setPhase({ type: 'ready', pix });
    onPixGenerated(pix);
    startPolling(pix.id);
    startTimer(pix.expires_at);
  }, [onPixGenerated, startPolling, startTimer]);

  useEffect(() => {
    if (cachedPix && cachedPix.expires_at > Date.now()) {
      applyPix(cachedPix);
      return;
    }

    const run = async () => {
      setPhase({ type: 'loading' });

      const data = await createDonation(formData);

      const pix: PixWithExpiry = {
        ...data,
        expires_at: Date.now() + PIX_TTL_MS,
      };

      applyPix(pix);
    };

    run();

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    const id = donationIdRef.current;
    if (!id) return;

    updateDonation(id, {
      name: formData.name,
      email: formData.email,
      cpf: formData.cpf,
    });
  }, [formData]);

  const handleCopy = useCallback(async () => {
    if (phase.type !== 'ready') return;
    await navigator.clipboard.writeText(phase.pix.pix_copy_paste);
    setCopied(true);
    setTimeout(() => setCopied(false), COPY_RESET_MS);
  }, [phase]);

  if (phase.type !== 'ready') return null;

  const { pix } = phase;

  return (
    <section className="space-y-4">
      <h2>Pagamento via PIX</h2>

      <Image
        src={`data:image/png;base64,${pix.pix_qr_code}`}
        alt="QR Code PIX"
        width={180}
        height={180}
      />

      <button onClick={handleCopy}>
        {copied ? 'Copiado' : 'Copiar PIX'}
      </button>
    </section>
  );
}
