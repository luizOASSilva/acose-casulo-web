'use client';

import { useEffect, useState } from 'react';
import { DonationData, PixResponse } from '@/types/donation';

interface StepPaymentProps {
  formData: DonationData;
  onConfirm: () => void;
}

export default function StepPayment({ formData, onConfirm }: StepPaymentProps) {
  const [pix, setPix] = useState<PixResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const generate = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/donations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error('Erro na resposta');
        const data: PixResponse = await res.json();
        setPix(data);
      } catch {
        setError('Não foi possível gerar o Pix. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };
    generate();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCopy = async () => {
    if (!pix?.pix_copy_paste) return;
    await navigator.clipboard.writeText(pix.pix_copy_paste);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const formatBRL = (v: number) =>
    v.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 animate-in fade-in duration-500">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-gray-500 text-sm">Gerando seu Pix...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 space-y-4 animate-in fade-in duration-500">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-primary underline text-sm"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-black">Pagamento</h2>

      <div className="bg-secondary rounded-md overflow-hidden">
        <div className="flex justify-between px-6 py-4 border-b border-white/30">
          <span className="text-white">Doação</span>
          <span className="text-primary font-bold">R$ {formatBRL(formData.amount)}</span>
        </div>
        <div className="flex justify-between px-6 py-4">
          <span className="text-white font-bold">Total</span>
          <span className="text-primary font-bold">R$ {formatBRL(formData.amount)}</span>
        </div>
      </div>

      <div className="bg-primary rounded-md px-4 py-3">
        <span className="text-white font-bold tracking-widest text-sm">PIX</span>
      </div>

      <div className="bg-secondary rounded-md p-8 flex flex-col items-center gap-5">
        <p className="text-gray-300 text-sm">Escaneie o QR Code ou copie a chave</p>

        {pix?.pix_qr_code && (
          <div className="bg-white p-3 rounded-md">
            <img
              src={`data:image/png;base64,${pix.pix_qr_code}`}
              alt="QR Code PIX"
              className="w-44 h-44"
            />
          </div>
        )}

        {pix?.pix_key && (
          <p className="text-gray-400 text-xs">{pix.pix_key}</p>
        )}

        <button
          onClick={handleCopy}
          className="w-full bg-primary font-medium text-white py-3 rounded-md transition active:scale-[.98] cursor-pointer"
        >
          {copied ? '✓ Copiado!' : 'Copiar chave pix'}
        </button>
      </div>

      <button
        onClick={onConfirm}
        className="w-full bg-primary text-white font-bold py-4 rounded-md transition active:scale-[.98] cursor-pointer"
      >
        Já realizei o pagamento
      </button>
    </div>
  );
}
