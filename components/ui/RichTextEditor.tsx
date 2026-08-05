'use client';

import { useEffect, useState } from 'react';
import {
  Bold,
  Check,
  Heading2,
  Italic,
  LinkIcon,
  List,
  ListOrdered,
  Redo2,
  RemoveFormatting,
  Undo2,
  Unlink,
  X,
} from 'lucide-react';

import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
}

const editorClassName = [
  'min-h-[340px]',
  'px-4',
  'py-3',
  'text-base',
  'leading-relaxed',
  'text-gray-800',
  'outline-none',
  'break-words',
  '[overflow-wrap:anywhere]',
  '[&>p]:mb-4',
  '[&>p:last-child]:mb-0',
  '[&>h2]:mb-3',
  '[&>h2]:mt-5',
  '[&>h2]:text-2xl',
  '[&>h2]:font-bold',
  '[&>h2]:text-gray-950',
  '[&>h3]:mb-2',
  '[&>h3]:mt-4',
  '[&>h3]:text-xl',
  '[&>h3]:font-bold',
  '[&>ul]:mb-4',
  '[&>ul]:ml-6',
  '[&>ul]:list-disc',
  '[&>ol]:mb-4',
  '[&>ol]:ml-6',
  '[&>ol]:list-decimal',
  '[&_a]:text-primary',
  '[&_a]:underline',
  '[&_a]:underline-offset-4',
].join(' ');

function toolbarButtonClass(active = false) {
  return [
    'inline-flex h-9 min-w-9 items-center justify-center rounded-md border px-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40',
    active
      ? 'border-primary bg-primary text-white'
      : 'border-gray-200 bg-white text-gray-600 hover:border-primary/30 hover:bg-primary/10 hover:text-primary',
  ].join(' ');
}

function normalizeUrl(value: string) {
  const cleanUrl = value.trim();

  if (!cleanUrl) {
    return '';
  }

  if (
    cleanUrl.startsWith('http://') ||
    cleanUrl.startsWith('https://')
  ) {
    return cleanUrl;
  }

  return `https://${cleanUrl}`;
}

export default function RichTextEditor({
  value,
  onChange,
  error,
  placeholder = 'Digite o conteúdo...',
}: RichTextEditorProps) {
  const [isLinkInputOpen, setIsLinkInputOpen] = useState(false);
  const [linkValue, setLinkValue] = useState('');

  const editor = useEditor({
    immediatelyRender: false,

    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),

      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,

        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
    ],

    content: value || '<p></p>',

    editorProps: {
      attributes: {
        class: editorClassName,
      },
    },

    onUpdate({ editor: updatedEditor }) {
      const html = updatedEditor.getHTML();

      if (html === '<p></p>') {
        onChange('');
        return;
      }

      onChange(html);
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    const currentHtml = editor.getHTML();
    const nextHtml = value || '<p></p>';

    if (currentHtml !== nextHtml) {
      editor.commands.setContent(nextHtml, {
        emitUpdate: false,
      });
    }
  }, [editor, value]);

  if (!editor) {
    return (
      <div className="min-h-[390px] rounded-md border border-gray-200 bg-white" />
    );
  }

  // A partir daqui o TypeScript sabe que o editor não é nulo.
  const activeEditor = editor;
  const isEmpty = !activeEditor.getText().trim();

  function openLinkInput() {
    const currentLink = activeEditor.getAttributes('link').href as
      | string
      | undefined;

    setLinkValue(currentLink || '');
    setIsLinkInputOpen(true);
  }

  function applyLink() {
    const url = normalizeUrl(linkValue);

    if (!url) {
      activeEditor
        .chain()
        .focus()
        .extendMarkRange('link')
        .unsetLink()
        .run();

      setIsLinkInputOpen(false);
      setLinkValue('');

      return;
    }

    const { from, to, empty } = activeEditor.state.selection;

    if (empty) {
      activeEditor
        .chain()
        .focus()
        .insertContent({
          type: 'text',
          text: url,
          marks: [
            {
              type: 'link',
              attrs: {
                href: url,
                target: '_blank',
                rel: 'noopener noreferrer',
              },
            },
          ],
        })
        .run();
    } else {
      activeEditor
        .chain()
        .focus()
        .setTextSelection({
          from,
          to,
        })
        .setLink({
          href: url,
          target: '_blank',
          rel: 'noopener noreferrer',
        })
        .run();
    }

    setIsLinkInputOpen(false);
    setLinkValue('');
  }

  function cancelLinkInput() {
    setIsLinkInputOpen(false);
    setLinkValue('');
  }

  return (
    <div
      className={[
        'overflow-hidden rounded-md border bg-white transition',
        error
          ? 'border-red-500 focus-within:ring-2 focus-within:ring-red-500/20'
          : 'border-gray-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20',
      ].join(' ')}
    >
      <div className="flex flex-wrap gap-1 border-b border-gray-100 bg-gray-50 p-2">
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() =>
            activeEditor.chain().focus().toggleBold().run()
          }
          className={toolbarButtonClass(
            activeEditor.isActive('bold'),
          )}
          title="Negrito"
          aria-label="Negrito"
        >
          <Bold size={15} />
        </button>

        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() =>
            activeEditor.chain().focus().toggleItalic().run()
          }
          className={toolbarButtonClass(
            activeEditor.isActive('italic'),
          )}
          title="Itálico"
          aria-label="Itálico"
        >
          <Italic size={15} />
        </button>

        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() =>
            activeEditor
              .chain()
              .focus()
              .toggleHeading({
                level: 2,
              })
              .run()
          }
          className={toolbarButtonClass(
            activeEditor.isActive('heading', {
              level: 2,
            }),
          )}
          title="Título"
          aria-label="Título"
        >
          <Heading2 size={15} />
        </button>

        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() =>
            activeEditor.chain().focus().toggleBulletList().run()
          }
          className={toolbarButtonClass(
            activeEditor.isActive('bulletList'),
          )}
          title="Lista"
          aria-label="Lista"
        >
          <List size={15} />
        </button>

        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() =>
            activeEditor.chain().focus().toggleOrderedList().run()
          }
          className={toolbarButtonClass(
            activeEditor.isActive('orderedList'),
          )}
          title="Lista numerada"
          aria-label="Lista numerada"
        >
          <ListOrdered size={15} />
        </button>

        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={openLinkInput}
          className={toolbarButtonClass(
            activeEditor.isActive('link'),
          )}
          title="Adicionar link"
          aria-label="Adicionar link"
        >
          <LinkIcon size={15} />
        </button>

        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() =>
            activeEditor.chain().focus().unsetLink().run()
          }
          disabled={!activeEditor.isActive('link')}
          className={toolbarButtonClass()}
          title="Remover link"
          aria-label="Remover link"
        >
          <Unlink size={15} />
        </button>

        <span className="mx-1 h-9 w-px bg-gray-200" />

        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() =>
            activeEditor.chain().focus().undo().run()
          }
          disabled={!activeEditor.can().undo()}
          className={toolbarButtonClass()}
          title="Desfazer"
          aria-label="Desfazer"
        >
          <Undo2 size={15} />
        </button>

        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() =>
            activeEditor.chain().focus().redo().run()
          }
          disabled={!activeEditor.can().redo()}
          className={toolbarButtonClass()}
          title="Refazer"
          aria-label="Refazer"
        >
          <Redo2 size={15} />
        </button>

        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() =>
            activeEditor
              .chain()
              .focus()
              .clearNodes()
              .unsetAllMarks()
              .run()
          }
          className="ml-auto inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          title="Limpar formatação"
          aria-label="Limpar formatação"
        >
          <RemoveFormatting size={15} />
          Limpar
        </button>
      </div>

      {isLinkInputOpen && (
        <div className="flex flex-col gap-2 border-b border-gray-100 bg-white p-3 sm:flex-row sm:items-center">
          <input
            type="url"
            value={linkValue}
            onChange={(event) =>
              setLinkValue(event.target.value)
            }
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                applyLink();
              }

              if (event.key === 'Escape') {
                event.preventDefault();
                cancelLinkInput();
              }
            }}
            placeholder="https://exemplo.com"
            className="h-10 min-w-0 flex-1 rounded-md border border-gray-200 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            autoFocus
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={applyLink}
              className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-4 text-sm font-semibold text-white transition hover:brightness-95 sm:flex-none"
            >
              <Check size={15} />
              Aplicar
            </button>

            <button
              type="button"
              onClick={cancelLinkInput}
              className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-md border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 sm:flex-none"
            >
              <X size={15} />
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="relative">
        {isEmpty && (
          <span className="pointer-events-none absolute left-4 top-3 text-base text-gray-400">
            {placeholder}
          </span>
        )}

        <EditorContent editor={activeEditor} />
      </div>
    </div>
  );
}
