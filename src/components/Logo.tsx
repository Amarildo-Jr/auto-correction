import { cn } from "@/lib/utils";
import Image from "next/image";

interface LogoProps {
  dark?: boolean;
  asChild?: boolean;
}

function Logo({
  className,
  ...props
}: LogoProps & React.ComponentProps<"img">) {
  return (
    <Image
      src={props.dark ? "/logo-black.svg" : "/logo-white.svg"}
      width={500}
      height={500}
      alt="Logo - Check Quest"
      className={cn("w-20 h-20", className)}
    />
  );
}

export { Logo };
