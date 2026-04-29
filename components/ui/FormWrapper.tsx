"use client";

import type { ReactNode } from "react";

interface FormWrapperProps {
  children: ReactNode;
  loading?: boolean;
  onSubmit: (e: React.SyntheticEvent<HTMLFormElement>) => Promise<void>;
}

export default function FormWrapper({
  children,
  loading = false,
  onSubmit,
}: FormWrapperProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 p-6 rounded-2xl flex flex-col w-full max-w-xl"
      noValidate
    >
      {children}

      <button
        type="submit"
        disabled={loading}
        className="bg-primary text-white px-6 py-3 w-full rounded-md font-semibold cursor-pointer"
      >
        {loading ? "Enviando..." : "Enviar mensagem"}
      </button>
    </form>
  );
}
