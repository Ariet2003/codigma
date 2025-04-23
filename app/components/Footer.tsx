"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, FileText } from "lucide-react";

export const Footer = () => {
  const [isSupportOpen, setSupportOpen] = useState(false);
  const [isReportOpen, setReportOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [supportForm, setSupportForm] = useState({
    question: "",
    contactType: "",
    contact: "",
  });
  const [reportForm, setReportForm] = useState({
    description: "",
  });

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(supportForm),
      });

      if (!response.ok) {
        throw new Error("Ошибка при отправке");
      }

      toast.success("Ваш вопрос успешно отправлен");
      setSupportOpen(false);
      setSupportForm({
        question: "",
        contactType: "",
        contact: "",
      });
    } catch (error) {
      toast.error("Не удалось отправить сообщение");
    } finally {
      setLoading(false);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reportForm),
      });

      if (!response.ok) {
        throw new Error("Ошибка при отправке");
      }

      toast.success("Ваше сообщение о проблеме успешно отправлено");
      setReportOpen(false);
      setReportForm({
        description: "",
      });
    } catch (error) {
      toast.error("Не удалось отправить сообщение");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap justify-center md:justify-start gap-6">
            <Dialog open={isSupportOpen} onOpenChange={setSupportOpen}>
              <DialogTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  Помощь и поддержка
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Помощь и поддержка</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSupportSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="question">Ваш вопрос</Label>
                    <Textarea
                      id="question"
                      placeholder="Опишите ваш вопрос..."
                      value={supportForm.question}
                      onChange={(e) =>
                        setSupportForm({ ...supportForm, question: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactType">Предпочитаемый способ связи</Label>
                    <Select
                      value={supportForm.contactType}
                      onValueChange={(value) =>
                        setSupportForm({ ...supportForm, contactType: value })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите способ связи" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="telegram">Telegram</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact">Контактные данные</Label>
                    <Input
                      id="contact"
                      placeholder={
                        supportForm.contactType === "email"
                          ? "example@mail.com"
                          : supportForm.contactType === "telegram"
                          ? "@username"
                          : "+996 555 555 555"
                      }
                      value={supportForm.contact}
                      onChange={(e) =>
                        setSupportForm({ ...supportForm, contact: e.target.value })
                      }
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Отправка...
                      </>
                    ) : (
                      "Отправить"
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isReportOpen} onOpenChange={setReportOpen}>
              <DialogTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  Сообщить о проблеме
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Сообщить о проблеме</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleReportSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="description">Описание проблемы</Label>
                    <Textarea
                      id="description"
                      placeholder="Опишите возникшую проблему..."
                      value={reportForm.description}
                      onChange={(e) =>
                        setReportForm({ ...reportForm, description: e.target.value })
                      }
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Отправка...
                      </>
                    ) : (
                      "Отправить"
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Link
              href="/privacy-policy"
              className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Политика конфиденциальности
            </Link>
          </div>
          <div className="text-muted-foreground text-sm">
            © 2025 Codigma. Все права защищены.
          </div>
        </div>
      </div>
    </footer>
  );
}; 