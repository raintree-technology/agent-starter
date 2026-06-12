import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "rounded-lg text-sm font-medium",
    "transition-all duration-200 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:scale-[0.98]",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-primary text-primary-foreground",
          "shadow-[var(--shadow-sm)]",
          "hover:bg-primary/90 hover:shadow-[var(--shadow-md)]",
        ].join(" "),
        destructive: [
          "bg-destructive text-destructive-foreground",
          "shadow-[var(--shadow-sm)]",
          "hover:bg-destructive/90 hover:shadow-[var(--shadow-md)]",
        ].join(" "),
        outline: [
          "border border-input bg-background",
          "shadow-[var(--shadow-sm)]",
          "hover:bg-accent hover:text-accent-foreground hover:border-accent",
        ].join(" "),
        secondary: ["bg-secondary text-secondary-foreground", "hover:bg-secondary/80"].join(" "),
        ghost: ["hover:bg-accent hover:text-accent-foreground", "rounded-lg"].join(" "),
        link: ["text-primary underline-offset-4", "hover:underline"].join(" "),
      },
      size: {
        default: "h-10 px-5 py-2.5",
        sm: "h-8 px-3.5 text-xs rounded-md",
        lg: "h-11 px-8 text-base rounded-xl",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
