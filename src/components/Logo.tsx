import { cn } from "@/lib/utils";
import { BookOpen } from 'lucide-react';

interface LogoProps {
  dark?: boolean;
  asChild?: boolean;
  expanded: boolean;
}

function Logo({
  className,
  expanded,
  ...props
}: LogoProps & React.ComponentProps<"div">) {
  return (
    <div className={cn("flex items-center justify-center gap-3 transition-all duration-300 ease-in-out", className, {
      "w-16 h-16": !expanded, // tamanho reduzido na versão não expandida
      "w-full h-full": expanded, // tamanho normal quando expandida
    })}>
      <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
        <BookOpen className="w-7 h-7 text-white" />
      </div>
      {expanded && (
        <span className="text-3xl font-bold text-gray-900">
          ProvEx
        </span>
      )}
    </div>
  );
}

export { Logo };

