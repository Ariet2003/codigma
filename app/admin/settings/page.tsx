"use client";

import {
  Settings,
  User,
  Shield,
  Mail,
  Bell,
  Database,
  Layout,
  Palette,
  FileText,
  Globe,
  Key,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const SettingCard = ({
  icon: Icon,
  title,
  description,
  href,
}: {
  icon: any;
  title: string;
  description: string;
  href: string;
}) => (
  <Link href={href}>
    <Card className="p-6 hover:border-[#4E7AFF]/30 transition-colors group cursor-pointer">
      <div className="flex items-center gap-4">
        <div className="bg-[#4E7AFF]/10 p-2 rounded-lg group-hover:bg-[#4E7AFF]/20 transition-colors">
          <Icon className="w-6 h-6 text-[#4E7AFF]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
      </div>
    </Card>
  </Link>
);

const settingsConfig = [
  {
    icon: User,
    title: "Профиль администратора",
    description: "Управление данными профиля",
    href: "/admin/settings/profile",
  },
  {
    icon: Shield,
    title: "Безопасность",
    description: "Настройки безопасности и доступа",
    href: "/admin/settings/security",
  },
  {
    icon: Bell,
    title: "Уведомления",
    description: "Настройка системы уведомлений",
    href: "/admin/settings/notifications",
  },
  {
    icon: Mail,
    title: "Почтовые настройки",
    description: "Настройка почтовых уведомлений",
    href: "/admin/settings/mail",
  },
  {
    icon: Database,
    title: "База данных",
    description: "Управление базой данных",
    href: "/admin/settings/database",
  },
  {
    icon: Layout,
    title: "Интерфейс",
    description: "Настройка интерфейса системы",
    href: "/admin/settings/interface",
  },
  {
    icon: Palette,
    title: "Оформление",
    description: "Настройка внешнего вида",
    href: "/admin/settings/appearance",
  },
  {
    icon: Globe,
    title: "Локализация",
    description: "Языковые настройки системы",
    href: "/admin/settings/localization",
  },
  {
    icon: FileText,
    title: "Логи системы",
    description: "Просмотр системных логов",
    href: "/admin/settings/logs",
  },
];

export default function SettingsPage() {
  const [openaiKey, setOpenaiKey] = useState("");
  const [rapidapiKey, setRapidapiKey] = useState("");
  const [originalOpenaiKey, setOriginalOpenaiKey] = useState("");
  const [originalRapidapiKey, setOriginalRapidapiKey] = useState("");
  const [isLoadingOpenAI, setIsLoadingOpenAI] = useState(false);
  const [isLoadingRapidAPI, setIsLoadingRapidAPI] = useState(false);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await api.get("/api/settings");
        const openAiKey = settings.find((s: any) => s.key === "OPENAI_API_KEY");
        const rapidApiKey = settings.find((s: any) => s.key === "RAPIDAPI_KEY");
        if (openAiKey) {
          setOpenaiKey(openAiKey.value);
          setOriginalOpenaiKey(openAiKey.value);
        }
        if (rapidApiKey) {
          setRapidapiKey(rapidApiKey.value);
          setOriginalRapidapiKey(rapidApiKey.value);
        }
      } catch (error) {
        toast.error("Не удалось загрузить настройки");
      }
    };

    fetchSettings();
  }, []);

  const validateOpenAIKey = (key: string) => {
    if (!key.startsWith('sk-')) {
      toast.error("OpenAI API ключ должен начинаться с 'sk-'");
      return false;
    }
    return true;
  };

  const handleSaveOpenAI = async () => {
    if (!validateOpenAIKey(openaiKey)) {
      return;
    }

    try {
      setIsLoadingOpenAI(true);
      await api.post("/api/settings", {
        key: "OPENAI_API_KEY",
        value: openaiKey,
      });
      
      setOriginalOpenaiKey(openaiKey);
      toast.success("OpenAI API ключ сохранен");
    } catch (error) {
      console.error("Failed to save OpenAI key:", error);
      toast.error("Не удалось сохранить OpenAI API ключ");
    } finally {
      setIsLoadingOpenAI(false);
    }
  };

  const handleSaveRapidAPI = async () => {
    try {
      setIsLoadingRapidAPI(true);
      await api.post("/api/settings", {
        key: "RAPIDAPI_KEY",
        value: rapidapiKey,
      });
      
      setOriginalRapidapiKey(rapidapiKey);
      toast.success("RapidAPI ключ сохранен");
    } catch (error) {
      console.error("Failed to save RapidAPI key:", error);
      toast.error("Не удалось сохранить RapidAPI ключ");
    } finally {
      setIsLoadingRapidAPI(false);
    }
  };

  const handleVerifyCurrentPassword = async () => {
    try {
      setIsLoadingAdmin(true);
      const response = await fetch("/api/admin/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: currentPassword }),
      });

      if (!response.ok) {
        toast.error("Введен неверный текущий пароль");
        return;
      }

      setShowAdminForm(true);
      setCurrentPassword("");
      toast.success("Пароль подтвержден");
    } catch (error) {
      toast.error("Произошла ошибка при проверке пароля");
    } finally {
      setIsLoadingAdmin(false);
    }
  };

  const handleUpdateAdmin = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Введенные пароли не совпадают");
      return;
    }

    try {
      setIsLoadingAdmin(true);
      const response = await fetch("/api/admin/update-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newEmail,
          password: newPassword,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.message || "Не удалось обновить учетные данные");
        return;
      }

      toast.success("Учетные данные успешно обновлены");
      setShowAdminForm(false);
      setNewEmail("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error("Произошла ошибка при обновлении данных");
    } finally {
      setIsLoadingAdmin(false);
    }
  };

  const isOpenAIChanged = openaiKey !== originalOpenaiKey;
  const isRapidAPIChanged = rapidapiKey !== originalRapidapiKey;

  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 flex">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center gap-3">
          <div className="bg-[#4E7AFF]/10 p-2 rounded-lg">
            <Settings className="w-6 h-6 text-[#4E7AFF]" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-[#4E7AFF] to-[#4E7AFF]/60 bg-clip-text text-transparent">
              Настройки
            </h2>
            <p className="text-muted-foreground mt-2">
              Управление настройками системы
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Admin Credentials Card */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="bg-[#4E7AFF]/10 p-2 rounded-lg">
                <Shield className="w-6 h-6 text-[#4E7AFF]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Учетные данные администратора</h3>
                <p className="text-muted-foreground text-sm">
                  Изменение логина и пароля администратора
                </p>
              </div>
            </div>

            {!showAdminForm ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Текущий пароль</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Введите текущий пароль"
                  />
                </div>
                <Button
                  onClick={handleVerifyCurrentPassword}
                  disabled={!currentPassword || isLoadingAdmin}
                  className="w-full sm:w-auto"
                >
                  {isLoadingAdmin ? "Проверка..." : "Продолжить"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newEmail">Новый email</Label>
                  <Input
                    id="newEmail"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Введите новый email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Новый пароль</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Введите новый пароль"
                    className={newPassword && confirmPassword && newPassword !== confirmPassword ? "border-red-500" : ""}
                  />
                  {newPassword && confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-sm text-red-500 mt-1">
                      Пароли не совпадают
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Подтвердите новый пароль"
                    className={newPassword && confirmPassword && newPassword !== confirmPassword ? "border-red-500" : ""}
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleUpdateAdmin}
                    disabled={
                      !newEmail || 
                      !newPassword || 
                      !confirmPassword || 
                      isLoadingAdmin || 
                      newPassword !== confirmPassword
                    }
                    className="w-full sm:w-auto"
                  >
                    {isLoadingAdmin ? "Сохранение..." : "Сохранить"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAdminForm(false);
                      setNewEmail("");
                      setNewPassword("");
                      setConfirmPassword("");
                    }}
                    className="w-full sm:w-auto"
                  >
                    Отмена
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* OpenAI API Key Card */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="bg-[#4E7AFF]/10 p-2 rounded-lg">
                <Key className="w-6 h-6 text-[#4E7AFF]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">OpenAI API Key</h3>
                <p className="text-muted-foreground text-sm">
                  API ключ используется для генерации тест-кейсов, описаний заданий и хакатонов
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="openaiKey">OpenAI API Ключ</Label>
              <Input
                id="openaiKey"
                type="password"
                placeholder="sk-..."
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                className={!openaiKey || openaiKey.startsWith('sk-') ? '' : 'border-red-500'}
              />
              {openaiKey && !openaiKey.startsWith('sk-') && (
                <p className="text-sm text-red-500 mt-1">
                  API ключ должен начинаться с 'sk-'
                </p>
              )}
            </div>

            <Button
              onClick={handleSaveOpenAI}
              disabled={!openaiKey || isLoadingOpenAI || !openaiKey.startsWith('sk-') || !isOpenAIChanged}
              className="w-full sm:w-auto"
            >
              {isLoadingOpenAI ? "Сохранение..." : "Сохранить"}
            </Button>
          </div>
        </Card>

        {/* RapidAPI Key Card */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="bg-[#4E7AFF]/10 p-2 rounded-lg">
                <Key className="w-6 h-6 text-[#4E7AFF]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">RapidAPI Key</h3>
                <p className="text-muted-foreground text-sm">
                  API ключ используется для тестирования решений через Judge0
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rapidapiKey">RapidAPI Ключ</Label>
              <Input
                id="rapidapiKey"
                type="password"
                placeholder="Введите RapidAPI ключ..."
                value={rapidapiKey}
                onChange={(e) => setRapidapiKey(e.target.value)}
              />
            </div>

            <Button
              onClick={handleSaveRapidAPI}
              disabled={!rapidapiKey || isLoadingRapidAPI || !isRapidAPIChanged}
              className="w-full sm:w-auto"
            >
              {isLoadingRapidAPI ? "Сохранение..." : "Сохранить"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
} 