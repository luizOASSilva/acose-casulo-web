'use client';

import { useMemo, useState } from 'react';
import {
  Brush,
  Building2,
  CheckCircle2,
  ExternalLink,
  Globe2,
  MapPin,
  Plus,
  RefreshCcw,
  Save,
  Settings,
  ShieldCheck,
  Trash2,
  X,
  Pencil,
} from 'lucide-react';

import MediaPicker from '@/components/admin/MediaPicker';
import UserBadge from '@/components/ui/UserBadge';

import type {
  AdminRole,
  AdminUser,
  CreateAdminDTO,
  SettingItem,
  UpdateAdminDTO,
} from '@/types/settings';

import {
  clearSettingsCache,
  createAdmin,
  deleteAdmin,
  updateAdmin,
  updateSettings,
} from '@/services/admin/settings';

import { uploadMediaFile } from '@/services/admin/media-library';
import { settingsSchema } from '@/schemas/settings.schema';
import { useConfirmDialog } from '@/context/ConfirmDialogContext';

interface ClientSettingsProps {
  currentAdmin: AdminUser | null;
  initialAdmins?: AdminUser[];
  initialSettings?: SettingItem[];
}

type SectionId =
  | 'geral'
  | 'contato'
  | 'redes'
  | 'doacoes'
  | 'area-sensivel';

type SettingErrors = Record<string, string>;

type UserFormErrors = Partial<{
  name: string;
  email: string;
  role: string;
  is_active: string;
}>;

type UserForm = {
  name: string;
  email: string;
  role: AdminRole;
  is_active: boolean;
};

const sections: {
  id: SectionId;
  label: string;
  description: string;
  icon: typeof Settings;
  masterOnly?: boolean;
}[] = [
  {
    id: 'geral',
    label: 'Geral',
    description: 'Identidade e informações principais.',
    icon: Brush,
  },
  {
    id: 'contato',
    label: 'Contato',
    description: 'WhatsApp, e-mail, endereço e atendimento.',
    icon: MapPin,
  },
  {
    id: 'redes',
    label: 'Redes sociais',
    description: 'Links oficiais exibidos no site.',
    icon: Globe2,
  },
  {
    id: 'doacoes',
    label: 'Doações',
    description: 'Mensagem pública da campanha.',
    icon: Building2,
  },
  {
    id: 'area-sensivel',
    label: 'Área sensível',
    description: 'Ações críticas do sistema.',
    icon: ShieldCheck,
    masterOnly: true,
  },
];

const IMAGE_SETTING_KEYS = [
  'site_logo_url',
  'site_footer_logo_url',
  'site_og_image_url',
  'og_image_url',
];

function isImageSetting(key: string) {
  return IMAGE_SETTING_KEYS.includes(key);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function fieldClass(error?: string, className = '') {
  return `
    ${className}
    transition selection:bg-primary selection:text-white
    ${
      error
        ? 'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-500/20'
        : 'border-zinc-300 focus:border-primary focus:ring-2 focus:ring-primary/15'
    }
  `;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return <p className="mt-1 text-[11px] font-medium text-red-600">{message}</p>;
}

function getSortOrder(setting: SettingItem): number {
  return Number((setting as any).sort_order ?? (setting as any).order ?? 0);
}

function getSectionByGroup(group: string): SectionId {
  if (group === 'branding' || group === 'general') return 'geral';
  if (group === 'contact') return 'contato';
  if (group === 'social') return 'redes';
  if (group === 'donation') return 'doacoes';

  return 'geral';
}

function getGroupTitle(group: string): string {
  const titles: Record<string, string> = {
    branding: 'Identidade visual',
    general: 'Informações gerais',
    contact: 'Contato e localização',
    social: 'Redes sociais',
    donation: 'Doações',
  };

  return titles[group] ?? group;
}

function roleBadgeClass(role?: string) {
  if (role === 'master') {
    return 'bg-black/10 text-black';
  }

  return 'bg-primary/10 text-primary';
}

function statusBadgeClass(isActive?: boolean) {
  return isActive
    ? 'bg-emerald-50 text-emerald-700'
    : 'bg-zinc-100 text-zinc-500';
}

function getAdminIsActive(admin: AdminUser): boolean {
  return (admin as any).is_active === undefined
    ? true
    : Boolean((admin as any).is_active);
}

export default function ClientSettings({
  currentAdmin,
  initialAdmins = [],
  initialSettings = [],
}: ClientSettingsProps) {
  const { confirm } = useConfirmDialog();

  const isMaster = Boolean(
    currentAdmin?.is_master || currentAdmin?.role === 'master'
  );

  const [settings, setSettings] = useState<SettingItem[]>(
    Array.isArray(initialSettings) ? initialSettings : []
  );

  const [admins, setAdmins] = useState<AdminUser[]>(
    Array.isArray(initialAdmins) ? initialAdmins : []
  );

  const [settingErrors, setSettingErrors] = useState<SettingErrors>({});
  const [pendingSettingFiles, setPendingSettingFiles] = useState<
    Record<string, File | null>
  >({});
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);

  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [editingAdminId, setEditingAdminId] = useState<number | null>(null);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [userErrors, setUserErrors] = useState<UserFormErrors>({});

  const [userForm, setUserForm] = useState<UserForm>({
    name: '',
    email: '',
    role: 'admin',
    is_active: true,
  });

  const visibleSections = useMemo(() => {
    return sections.filter((section) => !section.masterOnly || isMaster);
  }, [isMaster]);

  const sortedAdmins = useMemo(() => {
    const safeAdmins = Array.isArray(admins) ? admins : [];

    return [...safeAdmins].sort((a, b) => {
      if (a.role === 'master' && b.role !== 'master') return -1;
      if (a.role !== 'master' && b.role === 'master') return 1;

      return a.name.localeCompare(b.name);
    });
  }, [admins]);

  const settingsBySection = useMemo(() => {
    const grouped: Record<SectionId, Record<string, SettingItem[]>> = {
      geral: {},
      contato: {},
      redes: {},
      doacoes: {},
      'area-sensivel': {},
    };

    const safeSettings = Array.isArray(settings) ? settings : [];

    safeSettings.forEach((setting) => {
      if (!setting?.group) return;

      const section = getSectionByGroup(setting.group);

      grouped[section][setting.group] = grouped[section][setting.group] || [];
      grouped[section][setting.group].push(setting);
    });

    Object.values(grouped).forEach((groups) => {
      Object.values(groups).forEach((items) => {
        items.sort((a, b) => getSortOrder(a) - getSortOrder(b));
      });
    });

    return grouped;
  }, [settings]);

  const donationSettings = settingsBySection.doacoes.donation ?? [];

  const donationMessageSettings = donationSettings.filter(
    (setting) => setting.key !== 'donation_enabled'
  );

  const donationEnabledSetting = donationSettings.find(
    (setting) => setting.key === 'donation_enabled'
  );

  const updateSettingValue = (key: string, value: string) => {
    setSettings((current) =>
      current.map((setting) =>
        setting.key === key ? { ...setting, value } : setting
      )
    );

    setSettingErrors((current) => {
      if (!current[key]) return current;

      const next = { ...current };
      delete next[key];

      return next;
    });
  };

  const clearSettingError = (key: string) => {
    setSettingErrors((current) => {
      if (!current[key]) return current;

      const next = { ...current };
      delete next[key];

      return next;
    });
  };

  const validateSettings = (
    settingsToValidate: SettingItem[] = settings
  ): SettingErrors => {
    const payload = {
      settings: settingsToValidate.map((setting) => ({
        key: setting.key,
        type: setting.type,
        value: setting.value?.trim() || null,
      })),
    };

    const parsed = settingsSchema.safeParse(payload);

    if (parsed.success) return {};

    const nextErrors: SettingErrors = {};

    parsed.error.issues.forEach((issue) => {
      const index =
        issue.path[0] === 'settings' && typeof issue.path[1] === 'number'
          ? issue.path[1]
          : typeof issue.path[0] === 'number'
            ? issue.path[0]
            : null;

      if (index === null) return;

      const setting = settingsToValidate[index];

      if (!setting?.key) return;

      nextErrors[setting.key] = issue.message;
    });

    return nextErrors;
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);

    try {
      let nextSettings = [...settings];

      for (const [key, file] of Object.entries(pendingSettingFiles)) {
        if (!file) continue;

        const uploaded = await uploadMediaFile('general', file);

        if (!uploaded?.url) {
          throw new Error(
            `Não foi possível enviar a imagem da configuração ${key}.`
          );
        }

        nextSettings = nextSettings.map((setting) =>
          setting.key === key
            ? {
                ...setting,
                value: uploaded.url,
              }
            : setting
        );
      }

      const nextErrors = validateSettings(nextSettings);

      if (Object.keys(nextErrors).length > 0) {
        setSettingErrors(nextErrors);
        setIsSavingSettings(false);
        return;
      }

      const success = await updateSettings({
        settings: nextSettings.map((setting) => ({
          key: setting.key,
          value: setting.value?.trim() || null,
        })),
      });

      setIsSavingSettings(false);

      if (!success) {
        await confirm({
          title: 'Erro ao salvar',
          description:
            'Não foi possível salvar as configurações agora. Tente novamente em alguns instantes.',
          confirmText: 'Entendi',
          cancelText: 'Fechar',
          variant: 'danger',
        });
        return;
      }

      setSettings(nextSettings);
      setPendingSettingFiles({});
      setSettingErrors({});

      await confirm({
        title: 'Configurações salvas',
        description: 'As alterações foram salvas com sucesso.',
        confirmText: 'Entendi',
        cancelText: 'Fechar',
        variant: 'success',
      });
    } catch (error) {
      setIsSavingSettings(false);

      await confirm({
        title: 'Erro ao salvar',
        description:
          error instanceof Error
            ? error.message
            : 'Não foi possível salvar as configurações agora.',
        confirmText: 'Entendi',
        cancelText: 'Fechar',
        variant: 'danger',
      });
    }
  };

  const handleClearCache = async () => {
    const confirmed = await confirm({
      title: 'Limpar cache?',
      description:
        'As configurações públicas serão recarregadas. Use isso caso alguma alteração ainda não esteja aparecendo no site.',
      confirmText: 'Limpar cache',
      cancelText: 'Cancelar',
      variant: 'danger',
    });

    if (!confirmed) return;

    setIsClearingCache(true);

    const success = await clearSettingsCache();

    setIsClearingCache(false);

    if (!success) {
      await confirm({
        title: 'Erro ao limpar cache',
        description:
          'Não foi possível limpar o cache agora. Tente novamente em alguns instantes.',
        confirmText: 'Entendi',
        cancelText: 'Fechar',
        variant: 'danger',
      });
      return;
    }

    await confirm({
      title: 'Cache limpo',
      description: 'O cache de configurações foi limpo com sucesso.',
      confirmText: 'Entendi',
      cancelText: 'Fechar',
      variant: 'success',
    });
  };

  const resetUserForm = () => {
    setUserForm({
      name: '',
      email: '',
      role: 'admin',
      is_active: true,
    });

    setUserErrors({});
    setEditingAdminId(null);
    setIsUserFormOpen(false);
  };

  const openCreateUserForm = () => {
    setEditingAdminId(null);
    setUserErrors({});

    setUserForm({
      name: '',
      email: '',
      role: 'admin',
      is_active: true,
    });

    setIsUserFormOpen(true);
  };

  const openEditUserForm = (admin: AdminUser) => {
    setEditingAdminId(admin.id);
    setUserErrors({});

    setUserForm({
      name: admin.name,
      email: admin.email,
      role: admin.role,
      is_active: getAdminIsActive(admin),
    });

    setIsUserFormOpen(true);
  };

  const clearUserError = (field: keyof UserFormErrors) => {
    setUserErrors((current) => {
      if (!current[field]) return current;

      const next = { ...current };
      delete next[field];

      return next;
    });
  };

  const validateUserForm = (): UserFormErrors => {
    const nextErrors: UserFormErrors = {};

    if (!userForm.name.trim()) {
      nextErrors.name = 'Nome é obrigatório.';
    } else if (userForm.name.trim().length < 3) {
      nextErrors.name = 'Nome deve ter ao menos 3 caracteres.';
    }

    if (!userForm.email.trim()) {
      nextErrors.email = 'E-mail é obrigatório.';
    } else if (!isValidEmail(userForm.email.trim())) {
      nextErrors.email = 'Informe um e-mail válido.';
    }

    if (!['master', 'admin'].includes(userForm.role)) {
      nextErrors.role = 'Nível inválido.';
    }

    if (typeof userForm.is_active !== 'boolean') {
      nextErrors.is_active = 'Status inválido.';
    }

    return nextErrors;
  };

  const handleSaveUser = async () => {
    const isEdit = editingAdminId !== null;
    const nextErrors = validateUserForm();

    if (Object.keys(nextErrors).length > 0) {
      setUserErrors(nextErrors);
      return;
    }

    setIsSavingUser(true);

    const payload = {
      name: userForm.name.trim(),
      email: userForm.email.trim(),
      role: userForm.role as AdminRole,
      is_active: userForm.is_active,
    };

    const response = isEdit
      ? await updateAdmin(editingAdminId, payload as UpdateAdminDTO)
      : await createAdmin(payload as CreateAdminDTO);

    setIsSavingUser(false);

    if (!response) {
      await confirm({
        title: 'Erro ao salvar usuário',
        description:
          'Não foi possível salvar o usuário agora. Verifique os dados e tente novamente.',
        confirmText: 'Entendi',
        cancelText: 'Fechar',
        variant: 'danger',
      });
      return;
    }

    setAdmins((current) => {
      if (isEdit) {
        return current.map((admin) =>
          admin.id === response.id ? response : admin
        );
      }

      return [...current, response];
    });

    resetUserForm();

    await confirm({
      title: isEdit ? 'Usuário atualizado' : 'Usuário criado',
      description: isEdit
        ? 'O usuário administrativo foi atualizado com sucesso.'
        : 'O novo usuário administrativo foi criado com sucesso. Para criar ou trocar a senha, ele deve usar “Esqueceu sua senha?” na tela de login.',
      confirmText: 'Entendi',
      cancelText: 'Fechar',
      variant: 'success',
    });
  };

  const handleDeleteUser = async (admin: AdminUser) => {
    if (currentAdmin?.id === admin.id) {
      await confirm({
        title: 'Ação não permitida',
        description: 'Você não pode remover o próprio usuário logado.',
        confirmText: 'Entendi',
        cancelText: 'Fechar',
        variant: 'danger',
      });
      return;
    }

    const confirmed = await confirm({
      title: 'Remover usuário?',
      description: `O usuário ${admin.name} perderá acesso ao painel administrativo. Essa ação não pode ser desfeita.`,
      confirmText: 'Remover usuário',
      cancelText: 'Cancelar',
      variant: 'danger',
    });

    if (!confirmed) return;

    const success = await deleteAdmin(admin.id);

    if (!success) {
      await confirm({
        title: 'Erro ao remover usuário',
        description:
          'Não foi possível remover o usuário agora. Tente novamente em alguns instantes.',
        confirmText: 'Entendi',
        cancelText: 'Fechar',
        variant: 'danger',
      });
      return;
    }

    setAdmins((current) => current.filter((item) => item.id !== admin.id));

    await confirm({
      title: 'Usuário removido',
      description: 'O usuário foi removido com sucesso.',
      confirmText: 'Entendi',
      cancelText: 'Fechar',
      variant: 'success',
    });
  };

  const renderSettingInput = (setting: SettingItem) => {
    const error = settingErrors[setting.key];

    if (isImageSetting(setting.key)) {
      return (
        <div className="space-y-3">
          <MediaPicker
            collection="general"
            value={setting.value ?? ''}
            pendingFile={pendingSettingFiles[setting.key] ?? null}
            onPendingFileChange={(file) => {
              setPendingSettingFiles((current) => ({
                ...current,
                [setting.key]: file,
              }));

              clearSettingError(setting.key);
            }}
            onChange={(url) => {
              updateSettingValue(setting.key, url);

              setPendingSettingFiles((current) => ({
                ...current,
                [setting.key]: null,
              }));

              clearSettingError(setting.key);
            }}
            label={setting.label || 'Imagem'}
            helperText="Escolha uma imagem existente ou selecione uma nova do computador. O upload acontece ao salvar."
          />
        </div>
      );
    }

    if (setting.type === 'textarea') {
      return (
        <textarea
          value={setting.value ?? ''}
          onChange={(event) =>
            updateSettingValue(setting.key, event.target.value)
          }
          placeholder={
            setting.key === 'donation_message'
              ? 'Digite aqui a mensagem exibida na área pública de doações...'
              : undefined
          }
          className={fieldClass(
            error,
            'min-h-20 w-full resize-none rounded-md border bg-white px-3 py-2 text-sm text-zinc-800 outline-none'
          )}
          maxLength={2048}
        />
      );
    }

    if (setting.type === 'boolean') {
      return (
        <select
          value={setting.value ?? '0'}
          onChange={(event) =>
            updateSettingValue(setting.key, event.target.value)
          }
          className={fieldClass(
            error,
            'w-full rounded-md border bg-white px-3 py-2 text-sm text-zinc-800 outline-none'
          )}
        >
          <option value="1">Ativo</option>
          <option value="0">Inativo</option>
        </select>
      );
    }

    return (
      <>
        <input
          type={
            setting.type === 'email'
              ? 'email'
              : setting.type === 'url'
                ? 'url'
                : 'text'
          }
          value={setting.value ?? ''}
          onChange={(event) =>
            updateSettingValue(setting.key, event.target.value)
          }
          className={fieldClass(
            error,
            'w-full rounded-md border bg-white px-3 py-2 text-sm text-zinc-800 outline-none'
          )}
          maxLength={2048}
        />

        {setting.type === 'url' && setting.value && (
          <a
            href={setting.value}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary"
          >
            Abrir link
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </>
    );
  };

  const renderSettingsRows = (items: SettingItem[]) => {
    if (items.length === 0) {
      return (
        <div className="px-5 py-8">
          <div className="rounded-md border border-dashed border-zinc-300 bg-zinc-50 p-5 text-center">
            <p className="text-sm font-medium text-zinc-800">
              Nenhuma configuração encontrada.
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              Verifique se o seeder rodou e se o usuário tem permissão.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="divide-y divide-zinc-100">
        {items.map((setting) => (
          <div
            key={setting.key}
            className="grid grid-cols-1 gap-4 px-5 py-4 lg:grid-cols-[235px_1fr]"
          >
            <div>
              <label className="text-[13px] font-semibold text-zinc-900">
                {setting.label}
              </label>

              {setting.description && (
                <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                  {setting.description}
                </p>
              )}

              <FieldError message={settingErrors[setting.key]} />

              <p className="mt-2 text-[11px] font-mono text-zinc-400">
                {setting.key}
              </p>
            </div>

            <div>{renderSettingInput(setting)}</div>
          </div>
        ))}
      </div>
    );
  };

  const renderSettingsCard = (
    sectionId: Exclude<SectionId, 'area-sensivel'>,
    Icon: typeof Settings,
    title: string,
    description: string,
    customItems?: SettingItem[]
  ) => {
    const groups = settingsBySection[sectionId];
    const entries = Object.entries(groups);

    return (
      <section
        id={sectionId}
        className="scroll-mt-8 rounded-md border border-zinc-200 bg-white shadow-sm"
      >
        <header className="border-b border-zinc-100 px-5 py-4">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
                {title}
              </h2>

              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-zinc-500">
                {description}
              </p>
            </div>
          </div>
        </header>

        {customItems ? (
          renderSettingsRows(customItems)
        ) : entries.length > 0 ? (
          <div className="divide-y divide-zinc-100">
            {entries.map(([group, items]) => (
              <div key={group}>
                {entries.length > 1 && (
                  <div className="bg-zinc-50 px-5 py-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      {getGroupTitle(group)}
                    </h3>
                  </div>
                )}

                {renderSettingsRows(items)}
              </div>
            ))}
          </div>
        ) : (
          renderSettingsRows([])
        )}
      </section>
    );
  };

  const renderUserForm = () => {
    if (!isUserFormOpen) return null;

    return (
      <div className="border-t border-red-100 bg-red-500/5 px-5 py-5">
        <div className="rounded-md border border-zinc-200 bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-zinc-900">
                {editingAdminId ? 'Editar usuário' : 'Criar usuário'}
              </h3>

              <p className="mt-1 text-sm text-zinc-600">
                {editingAdminId
                  ? 'Atualize acesso, e-mail e status do administrador.'
                  : 'Adicione um novo acesso administrativo.'}
              </p>
            </div>

            <button
              type="button"
              onClick={resetUserForm}
              className="rounded-md bg-zinc-100 p-2 text-zinc-600 transition"
              aria-label="Fechar formulário"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-600">
                Nome
              </label>

              <input
                type="text"
                value={userForm.name}
                onChange={(event) => {
                  setUserForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }));
                  clearUserError('name');
                }}
                className={fieldClass(
                  userErrors.name,
                  'w-full rounded-md border bg-white px-3 py-2 text-sm text-zinc-800 outline-none'
                )}
              />

              <FieldError message={userErrors.name} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-600">
                E-mail
              </label>

              <input
                type="email"
                value={userForm.email}
                onChange={(event) => {
                  setUserForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }));
                  clearUserError('email');
                }}
                className={fieldClass(
                  userErrors.email,
                  'w-full rounded-md border bg-white px-3 py-2 text-zinc-800 outline-none'
                )}
              />

              <FieldError message={userErrors.email} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-600">
                Nível
              </label>

              <select
                value={userForm.role}
                onChange={(event) => {
                  setUserForm((current) => ({
                    ...current,
                    role: event.target.value as AdminRole,
                  }));
                  clearUserError('role');
                }}
                className={fieldClass(
                  userErrors.role,
                  'w-full rounded-md border bg-white px-3 py-2 text-zinc-800 outline-none'
                )}
              >
                <option value="admin">Admin</option>
                <option value="master">Master</option>
              </select>

              <FieldError message={userErrors.role} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-600">
                Status
              </label>

              <select
                value={userForm.is_active ? '1' : '0'}
                onChange={(event) => {
                  setUserForm((current) => ({
                    ...current,
                    is_active: event.target.value === '1',
                  }));
                  clearUserError('is_active');
                }}
                className={fieldClass(
                  userErrors.is_active,
                  'w-full rounded-md border bg-white px-3 py-2 text-zinc-800 outline-none'
                )}
              >
                <option value="1">Ativo</option>
                <option value="0">Inativo</option>
              </select>

              <FieldError message={userErrors.is_active} />
            </div>

            <div className="rounded-md border border-orange-100 bg-orange-50 px-4 py-3 md:col-span-2">
              <p className="text-xs leading-relaxed text-orange-800">
                Senhas não são definidas pelo painel. O administrador deve usar
                “Esqueceu sua senha?” na tela de login para criar ou trocar a
                própria senha.
              </p>
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-3 border-t border-zinc-100 pt-4">
            <button
              type="button"
              onClick={resetUserForm}
              disabled={isSavingUser}
              className="rounded-md bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-700 transition disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSaveUser}
              disabled={isSavingUser}
              className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isSavingUser ? 'Salvando...' : 'Salvar usuário'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <section className="relative overflow-hidden py-4">
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl">
                Configurações do Sistema
              </h1>

              <p className="mt-3 text-base leading-relaxed text-zinc-600">
                Gerencie informações públicas, canais de contato, redes sociais,
                usuários administrativos e recursos do sistema.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={isSavingSettings || settings.length === 0}
              className="inline-flex w-fit items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isSavingSettings ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[270px_1fr]">
          <aside className="h-fit rounded-md border border-zinc-200 bg-white p-2 shadow-sm lg:sticky lg:top-8">
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Navegação
            </p>

            <nav className="space-y-1">
              {visibleSections.map((section) => {
                const isSensitive = section.id === 'area-sensivel';

                return (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className={`block rounded-md border px-3 py-2.5 text-sm font-medium transition ${
                      isSensitive
                        ? 'border-red-200 bg-red-50/80 text-red-700 hover:bg-red-100'
                        : 'border-transparent text-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    <span className="block">{section.label}</span>

                    <span
                      className={`mt-0.5 block text-[11px] font-normal leading-relaxed ${
                        isSensitive ? 'text-red-700/75' : 'text-zinc-500'
                      }`}
                    >
                      {section.description}
                    </span>
                  </a>
                );
              })}
            </nav>
          </aside>

          <div className="space-y-8">
            {renderSettingsCard(
              'geral',
              Brush,
              'Geral',
              'Controle a identidade principal exibida no site.'
            )}

            {renderSettingsCard(
              'contato',
              MapPin,
              'Contato',
              'Atualize WhatsApp, e-mail, endereço, localização e atendimento.'
            )}

            {renderSettingsCard(
              'redes',
              Globe2,
              'Redes sociais',
              'Gerencie os links oficiais exibidos no site.'
            )}

            {renderSettingsCard(
              'doacoes',
              Building2,
              'Doações',
              'Configure a mensagem pública exibida no fluxo de doações.',
              donationMessageSettings
            )}

            {isMaster && (
              <section
                id="area-sensivel"
                className="scroll-mt-8 overflow-hidden rounded-md border border-red-200 bg-red-50/80 shadow-sm"
              >
                <header className="border-b border-red-200 bg-red-50 px-5 py-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-600/10 text-red-700">
                      <ShieldCheck className="h-5 w-5" />
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold tracking-tight text-red-700">
                        Área sensível
                      </h2>

                      <p className="mt-1 max-w-2xl text-sm leading-relaxed text-red-800/80">
                        Ações críticas que podem afetar doações, acessos
                        administrativos e comportamento do sistema.
                      </p>
                    </div>
                  </div>
                </header>

                <div className="divide-y divide-red-100">
                  {donationEnabledSetting && (
                    <div className="grid grid-cols-1 gap-4 px-5 py-5 lg:grid-cols-[235px_1fr]">
                      <div>
                        <label className="text-[13px] font-semibold text-zinc-950">
                          {donationEnabledSetting.label}
                        </label>

                        <p className="mt-1 text-xs leading-relaxed text-zinc-700">
                          Use apenas para pausar doações em manutenção,
                          emergência ou erro operacional.
                        </p>

                        <p className="mt-2 text-[11px] font-mono text-zinc-500">
                          {donationEnabledSetting.key}
                        </p>
                      </div>

                      <div>{renderSettingInput(donationEnabledSetting)}</div>
                    </div>
                  )}

                  <div className="px-5 py-5">
                    <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="text-[13px] font-semibold text-zinc-950">
                          Usuários administrativos
                        </h3>

                        <p className="mt-1 text-xs leading-relaxed text-zinc-700">
                          Gerencie quem pode acessar o painel e alterar
                          informações do site.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={openCreateUserForm}
                        className="inline-flex w-fit items-center justify-center gap-2 rounded-md border border-primary bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-white hover:text-primary"
                      >
                        <Plus className="h-4 w-4" />
                        Novo usuário
                      </button>
                    </div>

                    <div className="overflow-hidden rounded-md border border-red-100 bg-white/90">
                      <div className="divide-y divide-zinc-100">
                        {sortedAdmins.length > 0 ? (
                          sortedAdmins.map((admin) => {
                            const isActive = getAdminIsActive(admin);

                            return (
                              <div
                                key={admin.id}
                                className="grid grid-cols-1 gap-4 px-5 py-4 md:grid-cols-[1fr_auto]"
                              >
                                <div className="flex min-w-0 items-start gap-4">
                                  <UserBadge
                                    name={admin.name}
                                    subtitle={admin.email}
                                    size="md"
                                  />

                                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                                    <span
                                      className={`rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase ${roleBadgeClass(
                                        admin.role
                                      )}`}
                                    >
                                      {admin.role}
                                    </span>

                                    <span
                                      className={`rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase ${statusBadgeClass(
                                        isActive
                                      )}`}
                                    >
                                      {isActive ? 'Ativo' : 'Inativo'}
                                    </span>

                                    {currentAdmin?.id === admin.id && (
                                      <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold uppercase text-emerald-700">
                                        Você
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => openEditUserForm(admin)}
                                    className="
                                      rounded-xl p-2.5 transition-all active:scale-95
                                      text-gray-600 bg-gray-100
                                      hover:bg-orange-500/20 hover:text-orange-600
                                    "
                                    title="Editar usuário"
                                  >
                                    <Pencil className="h-5 w-5" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteUser(admin)}
                                    className="
                                      rounded-xl p-2.5 transition-all active:scale-95
                                      text-red-600 bg-red-500/10
                                      hover:bg-red-500/20
                                    "
                                    title="Remover usuário"
                                  >
                                    <Trash2 className="h-5 w-5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="px-5 py-8 text-center">
                            <p className="text-sm font-medium text-zinc-800">
                              Nenhum usuário cadastrado.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {renderUserForm()}

                  <div className="grid grid-cols-1 gap-4 px-5 py-5 md:grid-cols-[1fr_auto]">
                    <div>
                      <h3 className="text-[13px] font-semibold text-zinc-950">
                        Cache de configurações
                      </h3>

                      <p className="mt-1 text-xs leading-relaxed text-zinc-700">
                        Limpa as configurações armazenadas em cache para forçar
                        atualização imediata.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleClearCache}
                      disabled={isClearingCache}
                      className="inline-flex w-fit items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-50"
                    >
                      <RefreshCcw className="h-4 w-4" />
                      {isClearingCache ? 'Limpando...' : 'Limpar cache'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 px-5 py-5 md:grid-cols-[1fr_auto]">
                    <div>
                      <h3 className="text-[13px] font-semibold text-zinc-950">
                        Sessão atual
                      </h3>

                      <p className="mt-1 text-xs leading-relaxed text-zinc-700">
                        Administrador autenticado neste painel.
                      </p>
                    </div>

                    <div className="inline-flex w-fit items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />
                      {currentAdmin?.name || 'Admin'}
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}