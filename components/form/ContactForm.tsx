"use client";

import { useState } from "react";
import { FormWrapper } from "@/components/ui/FormWrapper";

const fieldClass = `
  bg-white/10 border border-white/20 text-white placeholder:text-white/40
  w-full rounded-md px-4 py-3 text-sm
  transition-all duration-200
  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
  hover:border-white/40
`;

export function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");

    try {
      const data = Object.fromEntries(new FormData(e.currentTarget));

      await fetch("https://sua-api.com", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      setStatus("success");
      (e.target as HTMLFormElement).reset();
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <FormWrapper onSubmit={handleSubmit} loading={loading}>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="nome" className="text-sm font-medium text-white/80">
            Nome <span aria-hidden="true" className="text-red-400">*</span>
          </label>
          <input
            id="nome"
            name="nome"
            type="text"
            autoComplete="name"
            required
            aria-required="true"
            placeholder="Seu nome completo"
            className={fieldClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-white/80">
            E-mail <span aria-hidden="true" className="text-red-400">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-required="true"
            placeholder="seu@email.com"
            className={fieldClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="subject" className="text-sm font-medium text-white/80">
            Assunto <span aria-hidden="true" className="text-red-400">*</span>
          </label>
          <input
            id="subject"
            name="subject"
            type="text"
            required
            aria-required="true"
            placeholder="Como podemos ajudar?"
            className={fieldClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="message" className="text-sm font-medium text-white/80">
            Mensagem <span aria-hidden="true" className="text-red-400">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            required
            aria-required="true"
            placeholder="Descreva sua dúvida ou mensagem..."
            className={`${fieldClass} resize-none`}
          />
        </div>
      </FormWrapper>

      <div role="status" aria-live="polite" aria-atomic="true" className="text-sm mt-2">
        {status === "success" && (
          <p className="text-green-400 font-medium">
            ✓ Mensagem enviada com sucesso! Entraremos em contato em breve.
          </p>
        )}
        {status === "error" && (
          <p className="text-red-400 font-medium">
            ✗ Erro ao enviar. Tente novamente ou nos contate por e-mail.
          </p>
        )}
      </div>
    </>
  );
}
