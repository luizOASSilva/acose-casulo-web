const BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

export interface ContactFormPayload {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;

  website: string;
  started_at: number;
}

export interface ContactFormResponse {
  message: string;
}

function getFirstValidationError(data: any): string | null {
  if (!data?.errors) return null;

  const firstField = Object.keys(data.errors)[0];
  if (!firstField) return null;

  const firstError = data.errors[firstField]?.[0];

  return firstError ? String(firstError) : null;
}

export async function sendContactMessage(
  payload: ContactFormPayload
): Promise<ContactFormResponse> {
  const response = await fetch(`${BASE}/contact`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const validationMessage = getFirstValidationError(data);

    throw new Error(
      validationMessage ||
        data?.message ||
        'Não foi possível enviar sua mensagem. Tente novamente.'
    );
  }

  return data;
}
