import type { ContactSchemaData } from '@/schemas/contact.schema';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function getApiUrl(): string {
  if (!API_URL) {
    throw new Error('NEXT_PUBLIC_API_URL não configurada');
  }

  return API_URL.replace(/\/$/, '');
}

export async function sendContactMessage(
  data: ContactSchemaData
): Promise<boolean> {
  try {
    const response = await fetch(`${getApiUrl()}/contact-messages`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return response.ok;
  } catch (error) {
    console.error('Erro ao enviar mensagem de contato:', error);
    return false;
  }
}
