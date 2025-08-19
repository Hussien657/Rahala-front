import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-primary via-primary to-primary/80 text-primary-foreground shadow-lg hover:from-primary/90 hover:via-primary hover:to-primary/70 hover:shadow-xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700",
        destructive:
          "bg-gradient-to-r from-destructive via-destructive to-destructive/80 text-destructive-foreground shadow-lg hover:from-destructive/90 hover:via-destructive hover:to-destructive/70 hover:shadow-xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700",
        outline:
          "border border-input bg-background hover:bg-gradient-to-r hover:from-primary/90 hover:via-primary hover:to-primary/70 hover:text-primary-foreground hover:border-transparent transition-all duration-300 transform hover:scale-105 hover:shadow-lg relative overflow-hidden hover:before:absolute hover:before:inset-0 hover:before:bg-gradient-to-r hover:before:from-transparent hover:before:via-white/10 hover:before:to-transparent hover:before:animate-[shimmer_0.7s_ease-in-out]",
        secondary:
          "bg-gradient-to-r from-secondary via-secondary to-secondary/80 text-secondary-foreground shadow-lg hover:from-secondary/80 hover:via-secondary hover:to-secondary/60 hover:shadow-xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700",
        ghost: "hover:bg-gradient-to-r hover:from-primary/10 hover:via-primary/5 hover:to-primary/10 hover:text-primary transition-all duration-300",
        link: "text-primary underline-offset-4 hover:underline",
        soft: "bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 text-primary hover:from-primary/20 hover:via-primary/10 hover:to-primary/20 transition-all duration-300",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
