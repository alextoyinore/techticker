"use client";

import Link from "next/link";
import {
  Bell,
  CircleUser,
  FileText,
  Globe,
  LayoutGrid,
  LayoutPanelLeft,
  LayoutList,
  LoaderCircle,
  LogOut,
  MessageSquare,
  PenSquare,
  Puzzle,
  Search,
  Settings,
  Users,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/context/auth-context";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/");
    } else {
      const allowedRoles = ['admin', 'superadmin', 'editor', 'writer'];
      if (!user.role || !allowedRoles.includes(user.role)) {
          router.push("/"); // Redirect non-admin users to a public page
      }
    }
  }, [user, loading, router]);


  if (loading || !user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <LoaderCircle className="animate-spin" />
      </div>
    )
  }
  
  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="px-4 mb-4">
          <h1 className="text-xl font-bold font-headline text-sidebar-foreground">
            TechTicker
          </h1>
        </SidebarHeader>
        <SidebarContent className="px-2">
          <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/dashboard")}
                  tooltip="Dashboard"
                  className="h-10"
                >
                  <Link href="/dashboard">
                    <LayoutGrid />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/content")}
                  tooltip="Content"
                  className="h-10"
                >
                  <Link href="/content">
                    <LayoutList />
                    <span>Content</span>
                  </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/pages")}
                  tooltip="Pages"
                  className="h-10"
                >
                  <Link href="/pages">
                    <FileText />
                    <span>Pages</span>
                  </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/layouts")}
                  tooltip="Layouts"
                  className="h-10"
                >
                  <Link href="/layouts">
                    <LayoutPanelLeft />
                    <span>Layouts</span>
                  </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/widgets")}
                  tooltip="Widgets"
                  className="h-10"
                >
                  <Link href="/widgets">
                    <Puzzle />
                    <span>Widgets</span>
                  </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/comments")}
                  tooltip="Comments"
                  className="h-10"
                >
                  <Link href="/comments">
                    <MessageSquare />
                    <span>Comments</span>
                  </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/users")} tooltip="Users" className="h-10">
                  <Link href="/users">
                    <Users />
                    <span>Users</span>
                  </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/editor")}
                  tooltip="Editor"
                  className="h-10"
                >
                  <Link href="/editor">
                    <PenSquare />
                    <span>Editor</span>
                  </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="px-4">
          <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive("/settings")}
                  tooltip="Settings"
                  className="h-10"
                >
                  <Link href="/settings">
                    <Settings />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
          <SidebarTrigger />
          <div className="w-full flex-1">
            <form>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="w-full appearance-none bg-secondary pl-8 shadow-none md:w-2/3 lg:w-1/3"
                />
              </div>
            </form>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Toggle notifications</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.photoURL ?? ""} alt={user?.displayName ?? ""} />
                  <AvatarFallback>{user?.displayName?.charAt(0)?.toUpperCase() ?? user?.email?.charAt(0)?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.displayName ?? "User"}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <CircleUser className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard">
                  <LayoutGrid className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/article">
                  <Globe className="h-4 w-4" />
                  <span>View Site</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
