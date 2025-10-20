import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 hover:scale-105 active:scale-95",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-primary text-primary-foreground shadow-lg hover:shadow-glow hover:shadow-primary/25",
        gradient:
          "bg-gradient-entertainment text-white shadow-lg hover:shadow-glow hover:shadow-primary/25",
        destructive:
          "bg-destructive text-white shadow-lg hover:bg-destructive/90 hover:shadow-glow hover:shadow-destructive/25 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border-2 border-primary/20 bg-background/80 backdrop-blur-sm text-primary hover:bg-primary/10 hover:border-primary/40 hover:shadow-glow hover:shadow-primary/10",
        secondary:
          "bg-gradient-secondary text-secondary-foreground shadow-lg hover:shadow-glow-secondary hover:shadow-secondary/25",
        ghost:
          "hover:bg-accent/10 hover:text-accent-foreground dark:hover:bg-accent/20",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80",
        glass:
          "glass-effect text-foreground hover:bg-accent/10 hover:shadow-glow hover:shadow-primary/10",
        energy:
          "bg-gradient-accent text-accent-foreground shadow-lg hover:shadow-glow-accent hover:shadow-accent/25 energy-pulse",
      },
      size: {
        default: "h-10 px-6 py-2 has-[>svg]:px-4",
        sm: "h-8 rounded-md gap-1.5 px-4 has-[>svg]:px-3",
        lg: "h-12 rounded-lg px-8 text-base has-[>svg]:px-6",
        icon: "size-10",
        xl: "h-14 rounded-xl px-10 text-lg has-[>svg]:px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

