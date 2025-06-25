import { cn } from "@/lib/utils";
import { CheckCircle } from 'lucide-react';

interface LogoProps {
  dark?: boolean;
  asChild?: boolean;
  expanded: boolean;
}

function Logo({
  className,
  expanded,
  ...props
}: LogoProps & React.ComponentProps<"img">) {
  return (
    <span className={cn("flex items-center justify-center gap-2 transition-all duration-300 ease-in-out text-slate-800", className, {
      "w-16 h-16": !expanded, // tamanho reduzido na versão não expandida
      "w-full h-full": expanded, // tamanho normal quando expandida
    })}>
      <CheckCircle className="w-12 h-12" />
      {expanded && (
        <span className="text-4xl font-bold font-mono">
          ProvEx
        </span>
      )}
    </span>
  );
}

export { Logo };

