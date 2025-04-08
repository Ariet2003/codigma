"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ParticipationRequest {
  id: string;
  userId: string;
  hackathonId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  message?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface ParticipationRequestsProps {
  hackathonId: string;
}

const ParticipationRequests: React.FC<ParticipationRequestsProps> = ({ hackathonId }) => {
  const [requests, setRequests] = useState<ParticipationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"PENDING" | "APPROVED" | "REJECTED">("PENDING");

  useEffect(() => {
    fetchRequests();
  }, [hackathonId]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/hackathons/${hackathonId}/participation-requests`);
      
      if (!response.ok) {
        throw new Error("Не удалось загрузить заявки");
      }
      
      const data = await response.json();
      setRequests(data.requests || []);
    } catch (error) {
      console.error("Ошибка при загрузке заявок:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requestId: string, action: "approve" | "reject") => {
    try {
      setActionLoading(requestId);
      const response = await fetch(`/api/hackathons/${hackathonId}/participation-requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: action === "approve" ? "APPROVED" : "REJECTED" }),
      });

      if (!response.ok) {
        throw new Error(`Не удалось ${action === "approve" ? "одобрить" : "отклонить"} заявку`);
      }

      // Обновляем список заявок
      fetchRequests();
    } catch (error) {
      console.error(`Ошибка при ${action === "approve" ? "одобрении" : "отклонении"} заявки:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">На рассмотрении</Badge>;
      case "APPROVED":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Одобрено</Badge>;
      case "REJECTED":
        return <Badge variant="outline" className="bg-red-100 text-red-800">Отклонено</Badge>;
      default:
        return <Badge variant="outline">Неизвестно</Badge>;
    }
  };

  const filteredRequests = requests.filter(request => request.status === activeTab);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Заявки на участие
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "PENDING" | "APPROVED" | "REJECTED")} className="mb-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="PENDING">На рассмотрении</TabsTrigger>
            <TabsTrigger value="APPROVED">Одобренные</TabsTrigger>
            <TabsTrigger value="REJECTED">Отклоненные</TabsTrigger>
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#4E7AFF]" />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {activeTab === "PENDING" ? "Нет заявок на рассмотрении" :
             activeTab === "APPROVED" ? "Нет одобренных заявок" :
             "Нет отклоненных заявок"}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Пользователь</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Сообщение</TableHead>
                <TableHead>Дата заявки</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.user.name}</TableCell>
                  <TableCell>{request.user.email}</TableCell>
                  <TableCell>{request.message || "-"}</TableCell>
                  <TableCell>
                    {format(new Date(request.createdAt), "dd MMMM yyyy", { locale: ru })}
                  </TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {request.status === "PENDING" && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleAction(request.id, "approve")}
                            disabled={actionLoading === request.id}
                          >
                            {actionLoading === request.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => handleAction(request.id, "reject")}
                            disabled={actionLoading === request.id}
                          >
                            {actionLoading === request.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                          </Button>
                        </>
                      )}
                      {request.status === "APPROVED" && (
                        <Button
                          size="sm"
                          variant="default"
                          className="bg-red-600 hover:bg-red-700 text-white"
                          onClick={() => handleAction(request.id, "reject")}
                          disabled={actionLoading === request.id}
                        >
                          {actionLoading === request.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      {request.status === "REJECTED" && (
                        <Button
                          size="sm"
                          variant="default"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleAction(request.id, "approve")}
                          disabled={actionLoading === request.id}
                        >
                          {actionLoading === request.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default ParticipationRequests; 