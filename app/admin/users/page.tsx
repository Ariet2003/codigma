"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Users,
  Pencil,
  Trash2,
  Trophy,
  Code,
  Mail,
  User,
  Search,
  Swords,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string | null;
  email: string | null;
  totalScore: number;
  tasksCompleted: number;
  hackathonsParticipated: number;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  pageSize: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    pageSize: 100
  });

  useEffect(() => {
    fetchUsers();
  }, [pagination.currentPage]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Ошибка загрузки данных');
      const data = await response.json();
      
      setUsers(data);
      updateFilteredUsers(data, searchQuery, pagination.currentPage, pagination.pageSize);

      // Обновляем пагинацию
      const totalUsers = data.length;
      const totalPages = Math.ceil(totalUsers / pagination.pageSize);
      setPagination(prev => ({
        ...prev,
        totalPages,
        totalUsers,
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Ошибка при загрузке пользователей');
    }
  };

  // Вспомогательная функция для обновления отфильтрованных пользователей
  const updateFilteredUsers = (allUsers: User[], query: string, page: number, pageSize: number) => {
    let filtered = allUsers;
    
    // Сначала применяем поиск
    if (query) {
      const lowercaseQuery = query.toLowerCase();
      filtered = allUsers.filter(user => 
        (user.name?.toLowerCase().includes(lowercaseQuery) || false) || 
        (user.email?.toLowerCase().includes(lowercaseQuery) || false)
      );
    }

    // Затем применяем пагинацию
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setFilteredUsers(filtered.slice(startIndex, endIndex));

    // Обновляем пагинацию если есть поиск
    if (query) {
      const totalFilteredUsers = filtered.length;
      const totalFilteredPages = Math.ceil(totalFilteredUsers / pageSize);
      setPagination(prev => ({
        ...prev,
        totalPages: totalFilteredPages,
        totalUsers: totalFilteredUsers,
      }));
    }
  };

  // Эффект для обновления при изменении поиска или страницы
  useEffect(() => {
    if (users.length > 0) {
      updateFilteredUsers(users, searchQuery, pagination.currentPage, pagination.pageSize);
    }
  }, [searchQuery, pagination.currentPage, users]);

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Сброс на первую страницу при поиске
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setNewName(user.name || '');
    setIsEditDialogOpen(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName }),
      });

      if (!response.ok) throw new Error('Ошибка обновления');

      toast.success('Пользователь успешно обновлен');
      setIsEditDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Ошибка при обновлении пользователя');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Ошибка удаления');

      toast.success('Пользователь успешно удален');
      setIsDeleteDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Ошибка при удалении пользователя');
    } finally {
      setIsLoading(false);
    }
  };

  const PaginationControls = () => {
    const startItem = users.length > 0 ? ((pagination.currentPage - 1) * pagination.pageSize) + 1 : 0;
    const endItem = Math.min(startItem + users.length - 1, pagination.totalUsers);

    return (
      <div className="flex items-center justify-between px-2 py-4">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            {users.length > 0 ? (
              `Показано ${startItem} - ${endItem} из ${pagination.totalUsers}`
            ) : (
              "Нет данных"
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(1)}
            disabled={pagination.currentPage === 1}
            className="h-8 w-8"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              Страница {pagination.currentPage} из {pagination.totalPages}
            </span>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(pagination.totalPages)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="h-8 w-8"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-[#4E7AFF]/10 p-2 rounded-lg">
            <Users className="w-6 h-6 text-[#4E7AFF]" />
          </div>
          <h1 className="text-2xl font-bold text-[#4E7AFF]">Пользователи</h1>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Поиск по ФИО или email..."
            value={searchQuery}
            onChange={handleSearch}
            className="pl-10"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    ФИО
                  </div>
                </TableHead>
                <TableHead className="w-[250px]">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </div>
                </TableHead>
                <TableHead className="w-[150px]">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    Общий балл
                  </div>
                </TableHead>
                <TableHead className="w-[150px]">
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    Решено задач
                  </div>
                </TableHead>
                <TableHead className="w-[150px]">
                  <div className="flex items-center gap-2">
                    <Swords className="h-4 w-4" />
                    Хакатоны
                  </div>
                </TableHead>
                <TableHead className="w-[100px] text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium py-4">{user.name || 'Без имени'}</TableCell>
                  <TableCell className="py-4">{user.email}</TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      {user.totalScore.toFixed(1)}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">{user.tasksCompleted}</TableCell>
                  <TableCell className="py-4">{user.hackathonsParticipated}</TableCell>
                  <TableCell className="text-right py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(user)}
                        className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(user)}
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                    Пользователи не найдены
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <PaginationControls />
        </CardContent>
      </Card>

      {/* Диалог редактирования */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать пользователя</DialogTitle>
            <DialogDescription>
              Измените ФИО пользователя. Нажмите сохранить, когда закончите.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">ФИО</Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Введите ФИО"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isLoading}
            >
              Отмена
            </Button>
            <Button
              onClick={handleUpdateUser}
              disabled={isLoading}
              className="bg-[#4E7AFF] hover:bg-[#4E7AFF]/90"
            >
              {isLoading ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог удаления */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить пользователя</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить пользователя {selectedUser?.name || 'Без имени'}?
              Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isLoading}
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={isLoading}
            >
              {isLoading ? 'Удаление...' : 'Удалить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 