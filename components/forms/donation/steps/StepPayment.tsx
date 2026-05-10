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

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

function formatCountdown(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60)
    .toString()
    .padStart(2, '0');
  const s = (total % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function StepPayment({
  formData,
  cachedPix,
  onPixGenerated,
  onConfirm,
}: StepPaymentProps) {
  const [phase, setPhase] = useState<Phase>(
    cachedPix ? { type: 'ready', pix: cachedPix } : { type: 'loading' }
  );
  const [timeLeft, setTimeLeft] = useState(0);
  const [copied, setCopied] = useState(false);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const donationIdRef = useRef<number | null>(cachedPix?.id ?? null);
  const initializedRef = useRef(false);
  const regeneratingRef = useRef(false);
  const prevAmountRef = useRef(formData.amount);

  const timerId = useId();
  const statusId = useId();

  const clearTimers = useCallback(() => {
    clearInterval(pollRef.current!);
    clearInterval(timerRef.current!);
  }, []);

  const startTimer = useCallback((expiresAt: number) => {
    clearInterval(timerRef.current!);
    const tick = () => {
      const remaining = expiresAt - Date.now();
      if (remaining <= 0) {
        clearInterval(timerRef.current!);
        clearInterval(pollRef.current!);
        setPhase({ type: 'expired' });
        setTimeLeft(0);
      } else {
        setTimeLeft(remaining);
      }
    };
    tick();
    timerRef.current = setInterval(tick, 1000);
  }, []);

  const startPolling = useCallback(
    (donationId: number) => {
      clearInterval(pollRef.current!);
      pollRef.current = setInterval(async () => {
        try {
          const { status } = await getDonationStatus(donationId);
          if (status === 'approved') {
            clearTimers();
            setPhase({ type: 'confirmed' });
            onConfirm();
          } else if (status === 'expired') {
            clearTimers();
            setPhase({ type: 'expired' });
          }
        } catch {
          // Falha silenciosa no poll — o timer de expiração cobre o caso
        }
      }, POLL_MS);
    },
    [clearTimers, onConfirm]
  );

  const applyPix = useCallback(
    (pix: PixWithExpiry) => {
      donationIdRef.current = pix.id;
      setPhase({ type: 'ready', pix });
      onPixGenerated(pix);
      startPolling(pix.id);
      startTimer(pix.expires_at);
    },
    [onPixGenerated, startPolling, startTimer]
  );

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    if (cachedPix && cachedPix.expires_at > Date.now()) {
      applyPix(cachedPix);
      return;
    }

    const generate = async () => {
      setPhase({ type: 'loading' });
      try {
        const data = await createDonation(formData);
        const withExpiry: PixWithExpiry = {
          ...data,
          expires_at: Date.now() + PIX_TTL_MS,
        };
        applyPix(withExpiry);
      } catch (err: any) {
        setPhase({
          type: 'error',
          message: err.message ?? 'Não foi possível gerar o Pix.',
        });
      }
    };

    generate();
    return clearTimers;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const id = donationIdRef.current;
    if (!id || phase.type !== 'ready') return;

    updateDonation(id, {
      name: formData.name,
      email: formData.email,
      cpf: formData.cpf,
    }).catch(() => {});
  }, [formData.name, formData.email, formData.cpf]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (formData.amount === prevAmountRef.current) return;
    prevAmountRef.current = formData.amount;

    const id = donationIdRef.current;
    if (!id || phase.type !== 'ready' || regeneratingRef.current) return;

    const regenerate = async () => {
      regeneratingRef.current = true;
      setPhase({ type: 'loading' });
      clearTimers();
      try {
        const data = await updateDonationPix(id, formData.amount);
        const withExpiry: PixWithExpiry = {
          ...data,
          expires_at: Date.now() + PIX_TTL_MS,
        };
        applyPix(withExpiry);
      } catch (err: any) {
        setPhase({
          type: 'error',
          message: err.message ?? 'Erro ao atualizar Pix.',
        });
      } finally {
        regeneratingRef.current = false;
      }
    };

    regenerate();
  }, [formData.amount]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCopy = useCallback(async () => {
    if (phase.type !== 'ready' || !phase.pix.pix_copy_paste) return;
    try {
      await navigator.clipboard.writeText(phase.pix.pix_copy_paste);
      setCopied(true);
      setTimeout(() => setCopied(false), COPY_RESET_MS);
    } catch {
      // Fallback: seleciona o texto para o usuário copiar manualmente
    }
  }, [phase]);

  if (phase.type === 'loading') {
    return (
      <section
        aria-label="Gerando PIX"
        aria-live="polite"
        aria-busy="true"
        className="flex flex-col items-center gap-4 py-20"
      >
        <div
          role="status"
          className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"
          aria-label="Carregando"
        />
        <p className="text-gray-500 text-sm">Gerando seu Pix…</p>
      </section>
    );
  }

  if (phase.type === 'error') {
    return (
      <section
        aria-label="Erro ao gerar PIX"
        aria-live="assertive"
        className="text-center py-20 space-y-4"
      >
        <p role="alert" className="text-red-500">
          {phase.message}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="text-primary underline text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Tentar novamente
        </button>
      </section>
    );
  }

  if (phase.type === 'expired') {
    return (
      <section
        aria-label="PIX expirado"
        aria-live="assertive"
        className="text-center py-20 space-y-4"
      >
        <p role="alert" className="text-red-500 font-semibold">
          O código PIX expirou.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="text-primary underline text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Gerar novo Pix
        </button>
      </section>
    );
  }
  if (phase.type !== 'ready') return null;
  const { pix } = phase;
  const urgentTimer = timeLeft < 60_000;

  return (
    <section aria-labelledby={statusId} className="space-y-4">
      <h2 id={statusId} className="text-2xl font-bold text-black">
        Pagamento via PIX
      </h2>

      <dl className="bg-secondary rounded-md overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/30">
          <dt className="text-white">Doação</dt>
          <dd
            className="text-primary-light font-bold"
            aria-label={`R$ ${formatBRL(formData.amount)}`}
          >
            R$ {formatBRL(formData.amount)}
          </dd>
        </div>
      </dl>

      <div
        className="flex items-center justify-between bg-primary rounded-md px-4 py-3"
        role="status"
        aria-live="polite"
      >
        <span className="text-white font-bold text-sm">PIX</span>
        {timeLeft > 0 && (
          <span
            id={timerId}
            aria-label={`Expira em ${formatCountdown(timeLeft)}`}
            className={`text-xs font-mono transition-colors ${
              urgentTimer ? 'text-red-600' : 'text-white'
            }`}
          >
            {formatCountdown(timeLeft)}
          </span>
        )}
      </div>

      <div className="bg-secondary rounded-md p-8 flex flex-col items-center gap-5">
        {pix.pix_qr_code ? (
          <figure className="m-0">
            <Image
              src={`data:image/png;base64,${pix.pix_qr_code}`}
              alt="QR Code para pagamento PIX — aponte a câmera do seu app bancário"
              width={176}
              height={176}
              className="w-44 h-44 bg-white p-2 rounded"
            />
            <figcaption className="sr-only">
              Escaneie o QR Code com o app do seu banco para concluir a doação
            </figcaption>
          </figure>
        ) : null}

        <button
          type="button"
          onClick={handleCopy}
          aria-pressed={copied}
          aria-label={
            copied ? 'Chave PIX copiada' : 'Copiar chave PIX Copia e Cola'
          }
          className="w-full bg-primary text-white py-3 rounded transition
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
                     focus-visible:ring-primary active:scale-[.98] cursor-pointer"
        >
          {copied ? '✓ Copiado!' : 'Copiar chave PIX'}
        </button>

        <p className="text-xs text-white/60 text-center">
          Abra seu banco, escolha PIX → Copia e Cola e cole o código acima.
        </p>
      </div>

      <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside leading-relaxed">
        <li>Copie o código PIX acima ou escaneie o QR Code.</li>
        <li>
          Abra o aplicativo do seu banco e selecione{' '}
          <strong>PIX → Copia e Cola</strong>.
        </li>
        <li>
          Cole o código e confirme o valor de{' '}
          <strong>R$ {formatBRL(formData.amount)}</strong>.
        </li>
        <li>O recibo chegará no e-mail cadastrado em até 1 dia útil.</li>
      </ol>
    </section>
  );
}
