"use client";

import { useHover } from "@uidotdev/usehooks";
import clsx from "clsx";
import {
  HelpCircle,
  Home,
  ListChecks,
  LogOut,
  NotepadText,
  Settings,
} from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

interface SidebarProps {
  currentPath: string;
}

export function Sidebar(props: SidebarProps) {
  const menuList = [
    {
      link: "/dashboard",
      icon: <Home className="w-7 h-7" />,
      text: "Dashboard",
    },
    {
      link: "/",
      icon: <ListChecks className="w-7 h-7" />,
      text: "Exams",
    },
    {
      link: "/",
      icon: <NotepadText className="w-7 h-7" />,
      text: "Reports",
    },
    {
      link: "/",
      icon: <HelpCircle className="w-7 h-7" />,
      text: "Questions",
    },
  ];

  const [ref, hovering] = useHover();

  return (
    <div className="fixed top-0 left-0 flex justify-between flex-col gap-4 w-[300px] min-w-[300px] border-r min-h-screen bg-indigo-600">
      <Button variant="ghost" className="w-full h-20 px-5 hover:bg-opacity-5">
        <Logo />
      </Button>
      <div className="">
        {menuList.map((option, index) => (
          <Button
            key={index}
            variant="ghost"
            ref={props.currentPath === option.link ? ref : undefined}
            className={clsx(
              "w-full flex text-xl text-white justify-start pl-12 gap-x-3 py-6 ",
              {
                "pl-0": props.currentPath === option.link,
              }
            )}
          >
            {props.currentPath === option.link && (
              <Separator
                orientation="vertical"
                className={clsx(
                  "w-1 h-7 mr-8 bg-white rounded-md",
                  hovering ? "bg-slate-900" : "bg-white"
                )}
              />
            )}
            {option.icon}
            {option.text}
          </Button>
        ))}
      </div>
      <div className=" mb-20">
        <Button
          variant="ghost"
          className="w-full flex text-xl text-white justify-start pl-12 gap-x-3 py-6"
        >
          <Settings className="w-7 h-7" />
          Settings
        </Button>
        <Button
          variant="ghost"
          className="w-full flex text-xl text-white justify-start pl-12 gap-x-3 py-6"
        >
          <LogOut className="w-7 h-7" />
          Sair
        </Button>
      </div>
    </div>
  );
}
