import { useHover } from "@/hooks/useHover";
import clsx from "clsx";
import { GraduationCap, HelpCircle, Home, ListChecks, LogOut, Menu, UserRound } from "lucide-react";
import { useState } from "react";
import { Logo } from "./Logo";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";

interface MenuButtonProps {
  link: string;
  icon: React.ReactNode;
  text: string;
  currentPath: string;
  expanded: boolean;
}

const MenuButton: React.FC<MenuButtonProps> = ({
  link,
  icon,
  text,
  currentPath,
  expanded,
}) => {
  const [ref, hovering] = useHover<HTMLButtonElement>();

  const isActive = currentPath === link;
  const textColor = isActive
    ? "text-blue-600"
    : hovering
      ? "text-blue-500"
      : "text-gray-900";

  return (
    <Button
      variant="ghost"
      ref={ref}
      url={link}
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

interface SidebarProps {
  currentPath: string;
  expanded: boolean;
  onToggle: () => void;
  userName: string;
  userAvatar: string;
}

export function StudentSidebar({ currentPath, expanded, onToggle, userName, userAvatar }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuList = [
    {
      link: "/student/dashboard",
      icon: <Home className="w-7 h-7" />,
      text: "Dashboard",
    },
    {
      link: "/student/exams",
      icon: <ListChecks className="w-7 h-7" />,
      text: "Avaliações",
    },
    {
      link: "/student/foruns",
      icon: <HelpCircle className="w-7 h-7" />,
      text: "Fóruns",
    },
    {
      link: "/student/classes",
      icon: <GraduationCap className="w-7 h-7" />,
      text: "Turmas",
    },
    {
      link: "/student/profile",
      icon: <UserRound className="w-7 h-7" />,
      text: "Perfil",
    }
  ];

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 p-4">
        <Button variant="ghost" onClick={() => setMobileOpen(!mobileOpen)}>
          <Menu className="w-7 h-7" />
        </Button>
      </div>

      <div
        onMouseEnter={() => onToggle()}
        onMouseLeave={() => onToggle()}
        className={clsx(
          "fixed top-0 left-0 h-full bg-slate-100 border-r transition-all duration-500 ease-in-out",
          expanded ? "w-[280px]" : "w-[80px]",
          "hidden lg:flex flex-col justify-between"
        )}
      >
        <div>
          <Button variant="ghost" className="w-full mt-6 px-5">
            <Logo expanded={expanded} />
          </Button>

          {/* <div className="flex flex-col items-center">
            <Avatar src={userAvatar} alt="User Avatar" />
            <span className="font-medium text-gray-900">
              Bem-vindo, {userName}!
            </span>
          </div> */}
        </div>

        <div>
          {menuList.map((option, index) => (
            <MenuButton
              key={index}
              {...option}
              currentPath={currentPath}
              expanded={expanded}
            />
          ))}
        </div>
        <div className="mb-6">
          <MenuButton
            icon={<LogOut className="w-7 h-7" />}
            currentPath={currentPath}
            expanded={expanded} link="/" text="Logout" />
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="fixed top-0 left-0 h-full w-[300px] bg-slate-100 p-4">
            <Button
              variant="ghost"
              className="w-full mt-6 px-5"
              onClick={() => setMobileOpen(false)}
            >
              <Logo expanded={true} />
            </Button>

            <div className="">
              {menuList.map((option, index) => (
                <MenuButton
                  key={index}
                  {...option}
                  currentPath={currentPath}
                  expanded={true}
                />
              ))}
            </div>

            <div className="flex flex-col items-center mt-6">
              <Avatar>
                <AvatarImage src={userAvatar} />
                <AvatarFallback>{userName.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="mt-2 text-gray-900">{userName}</span>
            </div>

            <Button variant="ghost" className="mt-6 mb-4">
              <LogOut className="w-7 h-7" />
              <span className="ml-2">Logout</span>
            </Button>

            <div className="mb-20"></div>
          </div>
        </div>
      )}
    </>
  );
}
