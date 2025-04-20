"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Medal, Search, Users, ChevronLeft, ChevronRight, Trophy, CheckCircle2, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import type { SortType } from "@/app/api/rating/route";

type User = {
  id: string;
  name: string;
  image: string | null;
  totalScore: number;
  tasksCompleted: number;
  hackathonsParticipated: number;
  position: number;
};

type PaginationData = {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  currentUserPosition: number | null;
  currentUserPage: number | null;
};

const sortOptions: { value: SortType; label: string }[] = [
  { value: "score", label: "По баллам" },
  { value: "tasks", label: "По решенным задачам" },
  { value: "hackathons", label: "По участию в хакатонах" },
];

export default function RatingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortType>("score");
  
  const debouncedSearch = useDebounce(searchQuery, 300);

  const fetchRating = async (page: number, search: string, sort: SortType) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/rating?page=${page}&search=${encodeURIComponent(search)}&sortBy=${sort}`
      );
      if (!response.ok) throw new Error("Failed to fetch rating");
      const data = await response.json();
      console.log('API Response:', data);
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching rating:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const page = searchParams.get("page");
    const sort = searchParams.get("sortBy") as SortType;
    if (page) {
      setCurrentPage(parseInt(page));
    }
    if (sort) {
      setSortBy(sort);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchRating(currentPage, debouncedSearch, sortBy);
  }, [currentPage, debouncedSearch, sortBy]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    router.push(`/u/rating?page=${newPage}&sortBy=${sortBy}`);
  };

  const handleSortChange = (newSort: SortType) => {
    setSortBy(newSort);
    setCurrentPage(1);
    router.push(`/u/rating?page=1&sortBy=${newSort}`);
  };

  const handleFindMe = () => {
    if (pagination?.currentUserPage) {
      handlePageChange(pagination.currentUserPage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <div className="container py-8 space-y-8">
        {/* Заголовок и поиск */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold tracking-tight text-foreground/90">
              Рейтинг пользователей
            </h1>
            {session && pagination?.currentUserPosition && (
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleFindMe}
              >
                <Users className="w-4 h-4" />
                Найти меня
              </Button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Поиск по имени..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              {sortOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={sortBy === option.value ? "default" : "outline"}
                  onClick={() => handleSortChange(option.value)}
                  className="whitespace-nowrap"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Список пользователей */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Пользователи не найдены
            </div>
          ) : (
            <div className="grid gap-4">
              {users.map((user) => {
                console.log('User data:', user);
                return (
                  <div
                    key={user.id}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-lg bg-card/50 backdrop-blur-sm border border-primary/10 transition-all duration-300",
                      user.id === session?.user?.id &&
                      "bg-primary/10 border-primary border-2 shadow-[0_0_15px_rgba(var(--primary),.15)] relative before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/10 before:to-transparent before:rounded-lg before:-z-10"
                    )}
                  >
                    {/* Место */}
                    <div className="flex items-center justify-center w-8">
                      <span
                        className={cn(
                          "text-lg font-medium",
                          user.id === session?.user?.id
                            ? "text-primary font-bold"
                            : "text-muted-foreground",
                          user.position === 1 && "text-yellow-500 text-2xl",
                          user.position === 2 && "text-zinc-400 text-xl",
                          user.position === 3 && "text-amber-600 text-xl"
                        )}
                      >
                        {user.position === 1 ? (
                          <Medal className="w-6 h-6 text-yellow-500" />
                        ) : user.position === 2 ? (
                          <Medal className="w-5 h-5 text-zinc-400" />
                        ) : user.position === 3 ? (
                          <Medal className="w-5 h-5 text-amber-600" />
                        ) : (
                          user.position
                        )}
                      </span>
                    </div>

                    {/* Аватар */}
                    <Avatar className="w-10 h-10">
                      {user.image ? (
                        <AvatarImage src={user.image} />
                      ) : (
                        <AvatarFallback>
                          {user.name?.charAt(0)}
                        </AvatarFallback>
                      )}
                    </Avatar>

                    {/* Информация */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <div className="font-medium">{user.name}</div>
                        {user.id === session?.user?.id && (
                          <div className="text-xs text-primary">Это вы</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-primary" />
                        <div className="text-sm">
                          <span className="font-medium">{user.totalScore.toFixed(2)}</span>
                          <span className="text-muted-foreground ml-1">баллов</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        <div className="text-sm">
                          <span className="font-medium">{user.tasksCompleted}</span>
                          <span className="text-muted-foreground ml-1">задач решено</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-primary" />
                        <div className="text-sm">
                          <span className="font-medium">{user.hackathonsParticipated}</span>
                          <span className="text-muted-foreground ml-1">хакатонов</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Пагинация */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-muted-foreground">
                Страница {currentPage} из {pagination.totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 