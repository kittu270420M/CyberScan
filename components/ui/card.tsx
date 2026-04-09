import { cn } from "@/lib/utils";

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "glass rounded-xs border border-border/80 p-6 shadow-[0_20px_60px_rgb(3_10_22/0.45)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
