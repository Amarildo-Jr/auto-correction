'use client';

import { useAppContext } from "@/contexts/AppContext";
import { useHover } from "@/hooks/useHover";
import clsx from "clsx";
import {
  BarChart3,
  BookUser,
  GraduationCap,
  HelpCircle,
  Home,
  ListChecks,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  UserRound
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "./Logo";
import { Button } from "./ui/button";

interface MenuButtonProps {
  link: string;
  icon: React.ReactNode;
  text: string;
  currentPath: string;
  expanded: boolean;
  onClick?: () => void;
}

const MenuButton: React.FC<MenuButtonProps> = ({
  link,
  icon,
  text,
  currentPath,
  expanded,
  onClick
}) => {
  const [ref, hovering] = useHover<HTMLButtonElement>();
  const router = useRouter();

  const isActive = currentPath.startsWith(link);
  const textColor = isActive
    ? "text-blue-600"
    : hovering
      ? "text-blue-500"
      : "text-gray-900";

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push(link);
    }
  };

  return (
    <Button
      variant="ghost"
      ref={ref}
      onClick={handleClick}
      className={clsx(
        "w-full flex items-center text-xl justify-start gap-x-3 py-6 transition-all duration-300 ease-in-out",
        expanded ? "pl-10" : "justify-start ml-2"
      )}
    >
      <span className={clsx("transition-colors duration-300", textColor)}>
        {icon}
      </span>
      <span
        className={clsx(
          "transition-all duration-300 ease-in-out",
          textColor,
          expanded ? "opacity-100" : "opacity-0"
        )}
      >
        {text}
      </span>
    </Button>
  );
};

interface DynamicSidebarProps {
  currentPath: string;
  expanded: boolean;
  onToggle: () => void;
}

export function DynamicSidebar({ currentPath, expanded, onToggle }: DynamicSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAppContext();
  const router = useRouter();

  // Definir menus baseado no tipo de usuário
  const getMenuList = () => {
    if (!user) return [];

    switch (user.role) {
      case 'admin':
        return [
          {
            link: "/admin/dashboard",
            icon: <Home className="w-7 h-7" />,
            text: "Dashboard",
          },
          {
            link: "/admin/exams",
            icon: <ListChecks className="w-7 h-7" />,
            text: "Provas",
          },
          {
            link: "/admin/questions",
            icon: <HelpCircle className="w-7 h-7" />,
            text: "Questões",
          },
          {
            link: "/admin/classes",
            icon: <BookUser className="w-7 h-7" />,
            text: "Turmas",
          },
          {
            link: "/admin/reports",
            icon: <BarChart3 className="w-7 h-7" />,
            text: "Relatórios",
          },
          {
            link: "/admin/settings",
            icon: <Settings className="w-7 h-7" />,
            text: "Configurações",
          }
        ];

      case 'professor':
        return [
          {
            link: "/admin/dashboard",
            icon: <Home className="w-7 h-7" />,
            text: "Dashboard",
          },
          {
            link: "/admin/exams",
            icon: <ListChecks className="w-7 h-7" />,
            text: "Provas",
          },
          {
            link: "/admin/questions",
            icon: <HelpCircle className="w-7 h-7" />,
            text: "Questões",
          },
          {
            link: "/admin/classes",
            icon: <BookUser className="w-7 h-7" />,
            text: "Turmas",
          },
          {
            link: "/admin/reports",
            icon: <BarChart3 className="w-7 h-7" />,
            text: "Relatórios",
          }
        ];

      case 'student':
        return [
          {
            link: "/student/dashboard",
            icon: <Home className="w-7 h-7" />,
            text: "Dashboard",
          },
          {
            link: "/student/exams",
            icon: <ListChecks className="w-7 h-7" />,
            text: "Provas",
          },
          {
            link: "/student/classes",
            icon: <GraduationCap className="w-7 h-7" />,
            text: "Minhas Turmas",
          },
          {
            link: "/student/results",
            icon: <BarChart3 className="w-7 h-7" />,
            text: "Resultados",
          },
          {
            link: "/student/forum",
            icon: <MessageSquare className="w-7 h-7" />,
            text: "Fórum",
          }
        ];

      default:
        return [];
    }
  };

  const menuList = getMenuList();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const profileLink = user?.role === 'student' ? '/student/profile' : '/admin/profile';

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 p-4 z-50">
        <Button variant="ghost" onClick={() => setMobileOpen(!mobileOpen)}>
          <Menu className="w-7 h-7" />
        </Button>
      </div>

      {/* Desktop sidebar */}
      <div
        onMouseEnter={() => onToggle()}
        onMouseLeave={() => onToggle()}
        className={clsx(
          "fixed top-0 left-0 h-full bg-slate-100 border-r transition-all duration-500 ease-in-out z-40",
          expanded ? "w-[280px]" : "w-[80px]",
          "hidden lg:flex flex-col justify-between"
        )}
      >
        <div>
          <Button variant="ghost" className="w-full mt-6 px-5">
            <Logo expanded={expanded} />
          </Button>

          {/* User info when expanded */}
          {expanded && user && (
            <div className="px-6 py-4 border-b border-gray-200">
              <p className="text-sm text-gray-600">Bem-vindo,</p>
              <p className="font-semibold text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
          )}

          <nav className="mt-4">
            {menuList.map((option, index) => (
              <MenuButton
                key={index}
                {...option}
                currentPath={currentPath}
                expanded={expanded}
              />
            ))}
          </nav>
        </div>

        <div className="mb-6">
          <MenuButton
            link={profileLink}
            icon={<UserRound className="w-7 h-7" />}
            text="Perfil"
            currentPath={currentPath}
            expanded={expanded}
          />
          <MenuButton
            link=""
            icon={<LogOut className="w-7 h-7" />}
            text="Logout"
            currentPath={currentPath}
            expanded={expanded}
            onClick={handleLogout}
          />
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="fixed top-0 left-0 h-full w-[300px] bg-slate-100 p-4 overflow-y-auto">
            <Button
              variant="ghost"
              className="w-full mt-6 px-5"
              onClick={() => setMobileOpen(false)}
            >
              <Logo expanded={true} />
            </Button>

            {/* User info */}
            {user && (
              <div className="px-6 py-4 border-b border-gray-200">
                <p className="text-sm text-gray-600">Bem-vindo,</p>
                <p className="font-semibold text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
            )}

            <nav className="mt-4">
              {menuList.map((option, index) => (
                <MenuButton
                  key={index}
                  {...option}
                  currentPath={currentPath}
                  expanded={true}
                  onClick={() => {
                    setMobileOpen(false);
                    router.push(option.link);
                  }}
                />
              ))}
            </nav>

            <div className="mt-6 border-t border-gray-200 pt-4">
              <MenuButton
                link={profileLink}
                icon={<UserRound className="w-7 h-7" />}
                text="Perfil"
                currentPath={currentPath}
                expanded={true}
                onClick={() => {
                  setMobileOpen(false);
                  router.push(profileLink);
                }}
              />
              <MenuButton
                link=""
                icon={<LogOut className="w-7 h-7" />}
                text="Logout"
                currentPath={currentPath}
                expanded={true}
                onClick={() => {
                  setMobileOpen(false);
                  handleLogout();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
} 