"use client";

import { Shield, Lock, Eye, UserCheck, Server, Trash2, Clock, FileCheck, HelpCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function PrivacyPolicy() {
  const sections = [
    {
      icon: <Shield className="w-6 h-6 text-primary" />,
      title: "Общие положения",
      content: "Мы уважаем вашу конфиденциальность и стремимся защитить ваши персональные данные. Эта политика объясняет, как мы собираем, используем и защищаем вашу информацию при использовании нашей платформы."
    },
    {
      icon: <Lock className="w-6 h-6 text-primary" />,
      title: "Безопасность данных",
      content: "Мы используем современные технологии шифрования и безопасности для защиты ваших данных. Вся информация передается по защищенным каналам и хранится на серверах с высоким уровнем безопасности."
    },
    {
      icon: <Eye className="w-6 h-6 text-primary" />,
      title: "Сбор информации",
      content: "Мы собираем только необходимую информацию для функционирования платформы, включая данные профиля, статистику решения задач и информацию об использовании сервиса."
    },
    {
      icon: <UserCheck className="w-6 h-6 text-primary" />,
      title: "Использование данных",
      content: "Собранная информация используется для улучшения нашего сервиса, персонализации вашего опыта и предоставления технической поддержки."
    },
    {
      icon: <Server className="w-6 h-6 text-primary" />,
      title: "Хранение данных",
      content: "Ваши данные хранятся на защищенных серверах и обрабатываются в соответствии с законодательством о защите персональных данных."
    },
    {
      icon: <Trash2 className="w-6 h-6 text-primary" />,
      title: "Удаление данных",
      content: "Вы имеете право запросить удаление своих данных из нашей системы. После подтверждения запроса, все ваши персональные данные будут безвозвратно удалены."
    },
    {
      icon: <Clock className="w-6 h-6 text-primary" />,
      title: "Срок действия",
      content: "Эта политика конфиденциальности действует с момента регистрации на платформе и до удаления вашего аккаунта или обновления политики."
    },
    {
      icon: <FileCheck className="w-6 h-6 text-primary" />,
      title: "Согласие",
      content: "Используя нашу платформу, вы соглашаетесь с условиями этой политики конфиденциальности и даете согласие на обработку ваших персональных данных."
    },
    {
      icon: <HelpCircle className="w-6 h-6 text-primary" />,
      title: "Вопросы и поддержка",
      content: "Если у вас есть вопросы относительно нашей политики конфиденциальности, вы можете связаться с нами через форму поддержки."
    }
  ];

  return (
    <div className="container py-8 md:py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Политика конфиденциальности</h1>
          <p className="text-muted-foreground">
            Мы ценим ваше доверие и защищаем ваши данные
          </p>
        </div>

        <div className="grid gap-6">
          {sections.map((section, index) => (
            <Card key={index} className="p-6 transition-all hover:shadow-lg">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  {section.icon}
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">{section.title}</h2>
                  <p className="text-muted-foreground">{section.content}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>Последнее обновление: {new Date().toLocaleDateString('ru-RU')}</p>
        </div>
      </div>
    </div>
  )
} 