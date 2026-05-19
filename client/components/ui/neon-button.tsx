import { cn } from "@/lib/utils";

export function NeonButton({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "rounded-full border border-[#f7e7b2]/35 bg-[linear-gradient(135deg,#f7e0eb_0%,#f6dce3_35%,#ead79b_100%)] px-5 py-2 text-sm font-semibold text-[#2a132f] shadow-pinkGlow transition duration-200 hover:-translate-y-0.5",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
