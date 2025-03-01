"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { 
  Search, 
  BarChart2, 
  Users, 
  Settings, 
  Menu, 
  X, 
  LogOut,
  User
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (!session) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 모바일 헤더 */}
      <header className="lg:hidden flex items-center justify-between p-4 border-b bg-white">
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <Menu className="h-6 w-6" />
        </Button>
        <Link href="/dashboard" className="font-bold text-xl">
          유튜브 영상 검색
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session.user?.image || ""} alt={session.user?.name || "사용자"} />
                <AvatarFallback>{session.user?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{session.user?.name || "사용자"}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">프로필</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/membership">멤버십</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
              로그아웃
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <div className="flex h-screen lg:h-auto overflow-hidden">
        {/* 사이드바 */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b lg:h-16">
            <Link href="/dashboard" className="font-bold text-xl">
              유튜브 영상 검색
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="lg:hidden"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          <nav className="p-4 space-y-2">
            <Link
              href="/dashboard"
              className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                isActive("/dashboard")
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              <BarChart2 className="h-5 w-5" />
              <span>대시보드</span>
            </Link>
            <Link
              href="/search"
              className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                isActive("/search")
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              <Search className="h-5 w-5" />
              <span>키워드 검색</span>
            </Link>
            <Link
              href="/history"
              className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                isActive("/history")
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              <BarChart2 className="h-5 w-5" />
              <span>검색 기록</span>
            </Link>
            {session.user?.user_tp === "20" && (
              <Link
                href="/admin"
                className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                  pathname.startsWith("/admin")
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                <Settings className="h-5 w-5" />
                <span>관리자</span>
              </Link>
            )}
          </nav>
          <div className="absolute bottom-0 w-full p-4 border-t">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={session.user?.image || ""} alt={session.user?.name || "사용자"} />
                <AvatarFallback>{session.user?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {session.user?.name || "사용자"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {session.user?.email || ""}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut({ callbackUrl: "/" })}
                title="로그아웃"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </aside>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 overflow-auto">
          {/* 데스크톱 헤더 */}
          <header className="hidden lg:flex items-center justify-end h-16 px-6 border-b bg-white">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user?.image || ""} alt={session.user?.name || "사용자"} />
                    <AvatarFallback>{session.user?.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <span>{session.user?.name || "사용자"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>프로필</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/membership" className="flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    <span>멤버십</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })} className="flex items-center">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>로그아웃</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          {/* 콘텐츠 */}
          <div className="p-6">{children}</div>
        </main>
      </div>

      {/* 모바일 사이드바 오버레이 */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
} 