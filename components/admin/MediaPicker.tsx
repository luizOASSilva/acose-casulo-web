'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { ImageIcon, ImagePlus, RefreshCcw, Upload } from 'lucide-react';

import { useConfirmDialog } from '@/context/ConfirmDialogContext';
import {
  getMediaFiles,
  type MediaCollection,
  type MediaFile,
  uploadMediaFile,
} from '@/services/admin/media-library';

interface MediaPickerProps {
  collection: MediaCollection;
  value?: string | null;
  onChange: (url: string) => void;
  label?: string;
  helperText?: string;
}

export default function MediaPicker({
  collection,
  value,
  onChange,
  label = 'Imagem',
  helperText = 'Envie ou escolha uma imagem da biblioteca.',
}: MediaPickerProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { confirm } = useConfirmDialog();

  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const selectedUrl = value?.trim() || '';

  async function loadFiles() {
    setLoading(true);

    const data = await getMediaFiles(collection);

    setFiles(data);
    setLoading(false);
  }

  useEffect(() => {
    loadFiles();
  }, [collection]);

  function handleSelectFile() {
    inputRef.current?.click();
  }

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    event.target.value = '';

    if (!file) return;

    const allowedTypes = [
      'image/svg+xml',
      'image/png',
      'image/jpeg',
      'image/webp',
    ];

    if (!allowedTypes.includes(file.type)) {
      await confirm({
        title: 'Formato inválido',
        description: 'Envie uma imagem SVG, PNG, JPG, JPEG ou WEBP.',
        confirmText: 'Entendi',
        cancelText: 'Fechar',
        variant: 'danger',
      });

      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      await confirm({
        title: 'Arquivo muito grande',
        description: 'A imagem deve ter no máximo 4MB.',
        confirmText: 'Entendi',
        cancelText: 'Fechar',
        variant: 'danger',
      });

      return;
    }

    setUploading(true);

    const uploaded = await uploadMediaFile(collection, file);

    setUploading(false);

    if (!uploaded) {
      await confirm({
        title: 'Erro ao enviar',
        description:
          'Não foi possível enviar a imagem agora. Tente novamente em alguns instantes.',
        confirmText: 'Entendi',
        cancelText: 'Fechar',
        variant: 'danger',
      });

      return;
    }

    onChange(uploaded.url);

    await loadFiles();

    await confirm({
      title: 'Imagem enviada',
      description: 'A imagem foi enviada e selecionada com sucesso.',
      confirmText: 'Entendi',
      cancelText: 'Fechar',
      variant: 'success',
    });
  }

  function handleUseFile(file: MediaFile) {
    if (file.url === selectedUrl) return;

    onChange(file.url);
  }

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept=".svg,.png,.jpg,.jpeg,.webp,image/svg+xml,image/png,image/jpeg,image/webp"
        onChange={handleUpload}
        className="hidden"
      />

      <div className="rounded-md border border-zinc-200 bg-white p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="relative flex h-24 w-36 shrink-0 items-center justify-center overflow-hidden rounded-md border border-zinc-200 bg-zinc-50">
              {selectedUrl ? (
                <Image
                  src={selectedUrl}
                  alt="Imagem selecionada"
                  fill
                  sizes="144px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <ImageIcon className="h-8 w-8 text-zinc-300" />
              )}
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-zinc-900">{label}</p>

              <p className="mt-1 max-w-md text-xs leading-relaxed text-zinc-500">
                {helperText}
              </p>

              {selectedUrl && (
                <p className="mt-2 text-xs font-medium text-primary">
                  Imagem selecionada
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSelectFile}
              disabled={uploading}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Upload className="h-4 w-4" aria-hidden="true" />
              {uploading ? 'Enviando...' : 'Enviar nova'}
            </button>

            <button
              type="button"
              onClick={loadFiles}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-md bg-zinc-100 px-3 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCcw className="h-4 w-4" aria-hidden="true" />
              {loading ? 'Atualizando...' : 'Atualizar'}
            </button>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Imagens disponíveis
          </p>

          <span className="text-[11px] text-zinc-400">
            {files.length} imagem{files.length === 1 ? '' : 's'}
          </span>
        </div>

        {files.length === 0 ? (
          <button
            type="button"
            onClick={handleSelectFile}
            disabled={uploading}
            className="flex w-full flex-col items-center justify-center rounded-md border border-dashed border-zinc-300 bg-white p-6 text-center transition hover:border-primary hover:bg-orange-50/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ImagePlus className="h-8 w-8 text-zinc-300" aria-hidden="true" />

            <p className="mt-2 text-sm font-medium text-zinc-800">
              Nenhuma imagem nesta coleção.
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              Clique para enviar a primeira imagem.
            </p>
          </button>
        ) : (
          <div className="grid max-h-[390px] grid-cols-2 gap-3 overflow-y-auto pr-1 md:grid-cols-3 xl:grid-cols-4">
            {files.map((file) => {
              const isSelected = file.url === selectedUrl;

              return (
                <button
                  key={file.id}
                  type="button"
                  onClick={() => handleUseFile(file)}
                  className={`
                    group relative aspect-[4/3] overflow-hidden rounded-md border bg-zinc-50 transition
                    ${
                      isSelected
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-zinc-200 hover:border-primary/70'
                    }
                  `}
                  title={file.original_name}
                  aria-label={
                    isSelected
                      ? 'Imagem selecionada'
                      : `Selecionar imagem ${file.original_name}`
                  }
                >
                  <Image
                    src={file.url}
                    alt={file.original_name}
                    fill
                    sizes="220px"
                    className="object-cover transition duration-200 group-hover:scale-105"
                    unoptimized
                  />

                  <span
                    className={`
                      absolute inset-0 transition
                      ${
                        isSelected
                          ? 'bg-primary/10'
                          : 'bg-black/0 group-hover:bg-black/10'
                      }
                    `}
                    aria-hidden="true"
                  />

                  {isSelected && (
                    <span className="absolute bottom-2 left-2 rounded-md bg-primary px-2 py-1 text-[11px] font-bold text-white shadow-sm">
                      Selecionada
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
