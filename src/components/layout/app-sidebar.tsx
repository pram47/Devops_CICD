import { ChevronDown, ChevronRight, LogOut } from "lucide-react";
import JobbyLogo from "@/assets/icons/JobbyLogo.svg?react";
import { RiFileList3Fill } from "react-icons/ri";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { clearAuthStore } from "@/services/authClient";
import { apiSignOut } from "@/services/authService";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";

const items1 = [
  {
    title: "Main Profile",
    url: "/profile",
  },
];

const items2 = [
  {
    title: "Apply Monitor",
    url: "/applymonitor",
  },
  {
    title: "Job Monitor",
    url: "/jobmonitor",
  },
  {
    title: "Create Job",
    url: "/createjob",
  },
  {
    title: "Message",
    url: "/message",
  },
  {
    title: "Scouting",
    url: "/scout",
  },
];

const items3 = [
  {
    title: "Account Management",
    url: "/account",
  },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await apiSignOut();
    clearAuthStore();
    navigate("/sign-in");
  };

  const normalize = (p: string) => (p === "/" ? "/" : p.replace(/\/$/, ""));
  const isItemActive = (url: string) => {
    if (!url || !url.startsWith("/")) return false;
    const path = normalize(location.pathname);
    const target = normalize(url);
    const isActive = path === target || path.startsWith(target + "/");
    return isActive;
  };

  const group1Active = items1.some((item) => isItemActive(item.url));
  const group2Active = items2.some((item) => isItemActive(item.url));
  const group3Active = items3.some((item) => isItemActive(item.url));

  return (
    <Sidebar>
      <SidebarHeader>
        <JobbyLogo height={45} />
      </SidebarHeader>
      <SidebarContent>
        <Collapsible defaultOpen className="group/collapsible1">
          <SidebarGroup>
            <SidebarGroupLabel
              asChild
              className={
                group1Active
                  ? "[--sidebar-foreground:var(--sidebar)]"
                  : undefined
              }
            >
              <CollapsibleTrigger
                className={[
                  "flex items-center gap-2 rounded-md px-3 py-2 transition-colors",
                  group1Active
                    ? "bg-primary text-sidebar"
                    : "text-sidebar-foreground hover:bg-muted",
                ].join(" ")}
              >
                <RiFileList3Fill />
                Profile
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible1:rotate-180 " />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items1.map((item) => {
                    const active = isItemActive(item.url);
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          className={
                            active
                              ? "[--sidebar-accent:var(--light-primary)] [--sidebar-accent-foreground:var(--primary)]"
                              : undefined
                          }
                        >
                          <Link
                            to={item.url}
                            className="w-full block"
                            aria-current={active ? "page" : undefined}
                          >
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        <Collapsible defaultOpen className="group/collapsible2">
          <SidebarGroup>
            <SidebarGroupLabel
              asChild
              className={
                group2Active
                  ? "[--sidebar-foreground:var(--sidebar)]"
                  : undefined
              }
            >
              <CollapsibleTrigger
                className={[
                  "flex items-center gap-2 rounded-md px-3 py-2 transition-colors",
                  group2Active
                    ? "bg-primary text-sidebar"
                    : "text-sidebar-foreground hover:bg-muted",
                ].join(" ")}
              >
                <RiFileList3Fill />
                Apply
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible2:rotate-180 " />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items2.map((item) => {
                    const active = isItemActive(item.url);
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          className={
                            active
                              ? "[--sidebar-accent:var(--light-primary)] [--sidebar-accent-foreground:var(--primary)]"
                              : undefined
                          }
                        >
                          <Link
                            to={item.url}
                            className="w-full block"
                            aria-current={active ? "page" : undefined}
                          >
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        <Collapsible defaultOpen className="group/collapsible3">
          <SidebarGroup>
            <SidebarGroupLabel
              asChild
              className={
                group3Active
                  ? "[--sidebar-foreground:var(--sidebar)]"
                  : undefined
              }
            >
              <CollapsibleTrigger
                className={[
                  "flex items-center gap-2 rounded-md px-3 py-2 transition-colors",
                  group3Active
                    ? "bg-primary text-sidebar"
                    : "text-sidebar-foreground hover:bg-muted",
                ].join(" ")}
              >
                <RiFileList3Fill />
                Employee
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible3:rotate-180 " />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items3.map((item) => {
                    const active = isItemActive(item.url);
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          className={
                            active
                              ? "[--sidebar-accent:var(--light-primary)] [--sidebar-accent-foreground:var(--primary)]"
                              : undefined
                          }
                        >
                          <Link
                            to={item.url}
                            className="w-full block"
                            aria-current={active ? "page" : undefined}
                          >
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>

      <SidebarFooter className="mt-auto border-t">
        <div
          className="flex items-center gap-3 px-3 py-3 rounded-md hover:bg-muted cursor-pointer"
          onClick={() => navigate("/profile")}
        >
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
            U
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-medium truncate">Username</span>
            <span className="text-xs text-muted-foreground truncate">
              email@example.com
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div
                role="button"
                aria-label="Account options"
                className="p-1 rounded hover:bg-accent"
                onClick={(e) => e.stopPropagation()}
              >
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="end" className="w-52">
              <DropdownMenuItem
                className="text-destructive focus:text-destructive cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
