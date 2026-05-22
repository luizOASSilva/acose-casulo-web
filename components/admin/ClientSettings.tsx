'use client';

import { useMemo, useState } from 'react';
import {
  Brush,
  Mail,
  MapPin,
  Phone,
  Plus,
  RefreshCcw,
  Save,
  Settings,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from 'lucide-react';

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

interface ClientSettingsProps {
  currentAdmin: AdminUser | null;
  initialAdmins: AdminUser[];
  initialSettings: SettingItem[];
}

type Tab = 'general' | 'contact' | 'users' | 'system';

type SettingErrors = Record<string, string>;

type UserFormErrors = Partial<{
  name: string;
  email: string;
  role: string;
  password: string;
  password_confirmation: string;
}>;

type UserForm = CreateAdminDTO;

function fieldClass(error?: string, className = '') {
  return `
    ${className}
    selection:bg-primary selection:text-white
    transition-all
    ${
      error
        ? 'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-500/20'
        : 'border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20'
    }
  `;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p className="mt-1 text-[11px] font-semibold text-red-600">
      {message}
    </p>
  );
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function settingGroupTitle(group: string): string {
  const titles: Record<string, string> = {
    branding: 'Identidade visual',
    contact: 'Contato e localização',
    social: 'Redes sociais',
    donation: 'Doações',
  };

  return titles[group] ?? group;
}

export default function ClientSettings({
  currentAdmin,
  initialAdmins,
  initialSettings,
}: ClientSettingsProps) {
  const isMaster = Boolean(
    currentAdmin?.is_master || currentAdmin?.role === 'master'
  );

  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [admins, setAdmins] = useState<AdminUser[]>(initialAdmins);
  const [settings, setSettings] = useState<SettingItem[]>(initialSettings);

  const [settingErrors, setSettingErrors] = useState<SettingErrors>({});
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);

  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [editingAdminId, setEditingAdminId] = useState<number | null>(null);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [userErrors, setUserErrors] = useState<UserFormErrors>({});

  const [userForm, setUserForm] = useState<UserForm>({
    name: '',
    email: '',
    role: 'admin',
    password: '',
    password_confirmation: '',
  });

  const sortedAdmins = useMemo(() => {
    return [...admins].sort((a, b) => a.name.localeCompare(b.name));
  }, [admins]);

  const brandingSettings = useMemo(
    () => settings.filter((setting) => setting.group === 'branding'),
    [settings]
  );

  const contactSettings = useMemo(
    () => settings.filter((setting) => setting.group === 'contact'),
    [settings]
  );

  const socialSettings = useMemo(
    () => settings.filter((setting) => setting.group === 'social'),
    [settings]
  );

  const donationSettings = useMemo(
    () => settings.filter((setting) => setting.group === 'donation'),
    [settings]
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

  const validateSettings = (): SettingErrors => {
    const nextErrors: SettingErrors = {};

    settings.forEach((setting) => {
      const value = setting.value?.trim() ?? '';

      if (setting.type === 'email' && value && !isValidEmail(value)) {
        nextErrors[setting.key] = 'Informe um e-mail válido.';
      }

      if (setting.type === 'url' && value) {
        if (value.startsWith('/')) return;

        try {
          const url = new URL(value);

          if (!['http:', 'https:'].includes(url.protocol)) {
            nextErrors[setting.key] = 'Informe uma URL válida.';
          }
        } catch {
          nextErrors[setting.key] = 'Informe uma URL válida.';
        }
      }

      if ((setting.value ?? '').length > 2048) {
        nextErrors[setting.key] = 'O valor deve ter no máximo 2048 caracteres.';
      }
    });

    return nextErrors;
  };

  const handleSaveSettings = async () => {
    const nextErrors = validateSettings();

    if (Object.keys(nextErrors).length > 0) {
      setSettingErrors(nextErrors);
      return;
    }

    setIsSavingSettings(true);

    const success = await updateSettings({
      settings: settings.map((setting) => ({
        key: setting.key,
        value: setting.value?.trim() || null,
      })),
    });

    setIsSavingSettings(false);

    if (!success) {
      alert('Erro ao salvar configurações.');
      return;
    }

    alert('Configurações salvas com sucesso! ✔');
  };

  const handleClearCache = async () => {
    setIsClearingCache(true);

    const success = await clearSettingsCache();

    setIsClearingCache(false);

    if (!success) {
      alert('Erro ao limpar cache.');
      return;
    }

    alert('Cache limpo com sucesso! ✔');
  };

  const resetUserForm = () => {
    setUserForm({
      name: '',
      email: '',
      role: 'admin',
      password: '',
      password_confirmation: '',
    });

    setUserErrors({});
    setIsCreatingUser(false);
    setEditingAdminId(null);
  };

  const startCreateUser = () => {
    setIsCreatingUser(true);
    setEditingAdminId(null);
    setUserErrors({});
    setUserForm({
      name: '',
      email: '',
      role: 'admin',
      password: '',
      password_confirmation: '',
    });
  };

  const startEditUser = (admin: AdminUser) => {
    setIsCreatingUser(false);
    setEditingAdminId(admin.id);
    setUserErrors({});
    setUserForm({
      name: admin.name,
      email: admin.email,
      role: admin.role,
      password: '',
      password_confirmation: '',
    });
  };

  const validateUserForm = (isEdit: boolean): UserFormErrors => {
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
      nextErrors.role = 'Nível de usuário inválido.';
    }

    if (!isEdit || userForm.password.trim()) {
      if (!userForm.password.trim()) {
        nextErrors.password = 'Senha é obrigatória.';
      } else if (userForm.password.length < 8) {
        nextErrors.password = 'Senha deve ter ao menos 8 caracteres.';
      }

      if (userForm.password !== userForm.password_confirmation) {
        nextErrors.password_confirmation = 'As senhas não conferem.';
      }
    }

    return nextErrors;
  };

  const clearUserError = (field: keyof UserFormErrors) => {
    setUserErrors((current) => {
      if (!current[field]) return current;

      const next = { ...current };
      delete next[field];

      return next;
    });
  };

  const handleSaveUser = async () => {
    const isEdit = editingAdminId !== null;
    const nextErrors = validateUserForm(isEdit);

    if (Object.keys(nextErrors).length > 0) {
      setUserErrors(nextErrors);
      return;
    }

    setIsSavingUser(true);

    const basePayload = {
      name: userForm.name.trim(),
      email: userForm.email.trim(),
      role: userForm.role as AdminRole,
    };

    const response = isEdit
      ? await updateAdmin(editingAdminId, {
          ...basePayload,
          ...(userForm.password.trim()
            ? {
                password: userForm.password,
                password_confirmation: userForm.password_confirmation,
              }
            : {}),
        } as UpdateAdminDTO)
      : await createAdmin({
          ...basePayload,
          password: userForm.password,
          password_confirmation: userForm.password_confirmation,
        });

    setIsSavingUser(false);

    if (!response) {
      alert('Erro ao salvar usuário.');
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

    alert(
      isEdit
        ? 'Usuário atualizado com sucesso! ✔'
        : 'Usuário criado com sucesso! ✔'
    );
  };

  const handleDeleteUser = async (admin: AdminUser) => {
    if (currentAdmin?.id === admin.id) {
      alert('Você não pode remover o próprio usuário logado.');
      return;
    }

    const confirmed = window.confirm(
      `Tem certeza que deseja remover o usuário ${admin.name}?`
    );

    if (!confirmed) return;

    const success = await deleteAdmin(admin.id);

    if (!success) {
      alert('Erro ao remover usuário.');
      return;
    }

    setAdmins((current) => current.filter((item) => item.id !== admin.id));
    alert('Usuário removido com sucesso.');
  };

  const renderSettingField = (setting: SettingItem) => {
    const error = settingErrors[setting.key];

    return (
      <div key={setting.key} className="space-y-1.5">
        <label className="text-xs font-semibold text-gray-500">
          {setting.label}
        </label>

        {setting.type === 'textarea' ? (
          <textarea
            value={setting.value ?? ''}
            onChange={(event) =>
              updateSettingValue(setting.key, event.target.value)
            }
            className={fieldClass(
              error,
              'w-full min-h-28 resize-none rounded-md border bg-white px-3 py-3 text-sm text-gray-800 focus:outline-none'
            )}
            placeholder={setting.description ?? ''}
            maxLength={2048}
          />
        ) : setting.type === 'boolean' ? (
          <select
            value={setting.value ?? '0'}
            onChange={(event) =>
              updateSettingValue(setting.key, event.target.value)
            }
            className={fieldClass(
              error,
              'w-full rounded-md border bg-white px-3 py-3 text-sm text-gray-800 focus:outline-none'
            )}
          >
            <option value="1">Ativo</option>
            <option value="0">Inativo</option>
          </select>
        ) : (
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
              'w-full rounded-md border bg-white px-3 py-3 text-sm text-gray-800 focus:outline-none'
            )}
            placeholder={setting.description ?? ''}
            maxLength={2048}
          />
        )}

        {setting.description && (
          <p className="text-[11px] text-gray-500">
            {setting.description}
          </p>
        )}

        <FieldError message={error} />
      </div>
    );
  };

  return (
    <main className="w-[90%] max-w-6xl mx-auto py-12 md:py-20 selection:bg-primary selection:text-white">
      <header className="mb-10 space-y-3">
        <div className="inline-flex items-center gap-2 rounded-md bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
          <Settings className="h-4 w-4" />
          Configurações
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
          Configurações do Sistema
        </h1>

        <p className="max-w-2xl text-sm md:text-base text-gray-600 leading-relaxed">
          Gerencie contatos públicos, redes sociais, usuários administrativos e cache do sistema.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
        <aside className="rounded-md border border-gray-200 bg-white p-3 h-fit">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`w-full rounded-md px-4 py-3 text-left text-sm font-semibold transition-all flex items-center gap-3 ${
              activeTab === 'general'
                ? 'bg-primary text-white'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Brush className="h-4 w-4" />
            Geral
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            className={`mt-1 w-full rounded-md px-4 py-3 text-left text-sm font-semibold transition-all flex items-center gap-3 ${
              activeTab === 'contact'
                ? 'bg-primary text-white'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Phone className="h-4 w-4" />
            Contato e redes
          </button>

          {isMaster && (
            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`mt-1 w-full rounded-md px-4 py-3 text-left text-sm font-semibold transition-all flex items-center gap-3 ${
                activeTab === 'users'
                  ? 'bg-primary text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Users className="h-4 w-4" />
              Usuários
            </button>
          )}

          {isMaster && (
            <button
              type="button"
              onClick={() => setActiveTab('system')}
              className={`mt-1 w-full rounded-md px-4 py-3 text-left text-sm font-semibold transition-all flex items-center gap-3 ${
                activeTab === 'system'
                  ? 'bg-primary text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              Sistema
            </button>
          )}
        </aside>

        <section className="min-w-0">
          {activeTab === 'general' && (
            <div className="rounded-md border border-gray-200 bg-white p-6 md:p-8">
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Brush className="h-7 w-7" />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Geral
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Controle identidade visual e opções públicas principais.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5">
                {[...brandingSettings, ...donationSettings].map(
                  renderSettingField
                )}
              </div>

              <div className="mt-6 flex justify-end border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={isSavingSettings}
                  className="rounded-md bg-green-600 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-green-700 disabled:opacity-60"
                >
                  <span className="inline-flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    {isSavingSettings
                      ? 'Salvando...'
                      : 'Salvar configurações'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="rounded-md border border-gray-200 bg-white p-6 md:p-8">
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <MapPin className="h-7 w-7" />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Contato e redes
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Edite informações públicas de contato, localização e redes sociais.
                  </p>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                    {settingGroupTitle('contact')}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {contactSettings.map(renderSettingField)}
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                    {settingGroupTitle('social')}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {socialSettings.map(renderSettingField)}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={isSavingSettings}
                  className="rounded-md bg-green-600 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-green-700 disabled:opacity-60"
                >
                  <span className="inline-flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    {isSavingSettings
                      ? 'Salvando...'
                      : 'Salvar configurações'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'users' && isMaster && (
            <div className="space-y-6">
              <div className="rounded-md border border-gray-200 bg-white p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Gestão de usuários
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                      Crie, edite e remova usuários administrativos.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={startCreateUser}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-primary-light"
                  >
                    <Plus className="h-4 w-4" />
                    Novo usuário
                  </button>
                </div>

                <div className="mt-6 divide-y divide-gray-100">
                  {sortedAdmins.length > 0 ? (
                    sortedAdmins.map((admin) => (
                      <div
                        key={admin.id}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-gray-900">
                              {admin.name}
                            </p>

                            <span
                              className={`rounded-md px-2 py-0.5 text-[11px] font-bold uppercase ${
                                admin.role === 'master'
                                  ? 'bg-primary/10 text-primary'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {admin.role}
                            </span>
                          </div>

                          <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-600">
                            <Mail className="h-3.5 w-3.5" />
                            {admin.email}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => startEditUser(admin)}
                            className="rounded-md bg-gray-100 px-3 py-2 text-xs font-bold text-gray-700 transition-all hover:bg-primary/10 hover:text-primary"
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteUser(admin)}
                            className="rounded-md bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition-all hover:bg-red-100"
                          >
                            <span className="inline-flex items-center gap-1.5">
                              <Trash2 className="h-3.5 w-3.5" />
                              Remover
                            </span>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="py-6 text-sm italic text-gray-500">
                      Nenhum usuário cadastrado.
                    </p>
                  )}
                </div>
              </div>

              {(isCreatingUser || editingAdminId !== null) && (
                <div className="rounded-md border border-gray-200 bg-white p-6 md:p-8">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {editingAdminId ? 'Editar usuário' : 'Criar usuário'}
                      </h3>

                      <p className="mt-1 text-sm text-gray-600">
                        {editingAdminId
                          ? 'Atualize nome, e-mail, nível ou defina uma nova senha.'
                          : 'Cadastre um novo administrador para acessar o painel.'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={resetUserForm}
                      className="rounded-md bg-gray-100 p-2 text-gray-600 transition-all hover:bg-gray-200"
                      aria-label="Fechar formulário de usuário"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-500">
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
                          'w-full rounded-md border bg-white px-3 py-3 text-sm text-gray-800 focus:outline-none'
                        )}
                        placeholder="Nome do administrador"
                      />

                      <FieldError message={userErrors.name} />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-500">
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
                          'w-full rounded-md border bg-white px-3 py-3 text-sm text-gray-800 focus:outline-none'
                        )}
                        placeholder="email@exemplo.com"
                      />

                      <FieldError message={userErrors.email} />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-500">
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
                          'w-full rounded-md border bg-white px-3 py-3 text-sm text-gray-800 focus:outline-none'
                        )}
                      >
                        <option value="admin">Admin</option>
                        <option value="master">Master</option>
                      </select>

                      <FieldError message={userErrors.role} />
                    </div>

                    <div className="hidden md:block" />

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-500">
                        {editingAdminId ? 'Nova senha' : 'Senha'}
                      </label>

                      <input
                        type="password"
                        value={userForm.password}
                        onChange={(event) => {
                          setUserForm((current) => ({
                            ...current,
                            password: event.target.value,
                          }));
                          clearUserError('password');
                        }}
                        className={fieldClass(
                          userErrors.password,
                          'w-full rounded-md border bg-white px-3 py-3 text-sm text-gray-800 focus:outline-none'
                        )}
                        placeholder={
                          editingAdminId
                            ? 'Deixe em branco para manter'
                            : 'Senha de acesso'
                        }
                      />

                      <FieldError message={userErrors.password} />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-500">
                        Confirmar senha
                      </label>

                      <input
                        type="password"
                        value={userForm.password_confirmation}
                        onChange={(event) => {
                          setUserForm((current) => ({
                            ...current,
                            password_confirmation: event.target.value,
                          }));
                          clearUserError('password_confirmation');
                        }}
                        className={fieldClass(
                          userErrors.password_confirmation,
                          'w-full rounded-md border bg-white px-3 py-3 text-sm text-gray-800 focus:outline-none'
                        )}
                        placeholder="Repita a senha"
                      />

                      <FieldError message={userErrors.password_confirmation} />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
                    <button
                      type="button"
                      onClick={resetUserForm}
                      disabled={isSavingUser}
                      className="rounded-md bg-gray-100 px-4 py-2.5 text-sm font-bold text-gray-700 transition-all hover:bg-gray-200 disabled:opacity-60"
                    >
                      Cancelar
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveUser}
                      disabled={isSavingUser}
                      className="rounded-md bg-green-600 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-green-700 disabled:opacity-60"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        {isSavingUser ? 'Salvando...' : 'Salvar usuário'}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'system' && isMaster && (
            <div className="rounded-md border border-gray-200 bg-white p-6 md:p-8">
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ShieldCheck className="h-7 w-7" />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Sistema
                  </h2>

                  <p className="mt-1 text-sm text-gray-600">
                    Ações administrativas relacionadas ao cache e integridade das configurações.
                  </p>
                </div>
              </div>

              <div className="rounded-md border border-gray-100 bg-gray-50 p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-gray-900">
                      Cache de configurações
                    </h3>

                    <p className="mt-1 text-sm text-gray-600">
                      Limpa o cache das configurações públicas e administrativas.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleClearCache}
                    disabled={isClearingCache}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-primary-light disabled:opacity-60"
                  >
                    <RefreshCcw className="h-4 w-4" />
                    {isClearingCache ? 'Limpando...' : 'Limpar cache'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}