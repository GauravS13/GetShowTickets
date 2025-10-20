import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 transition-all duration-300 overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-primary text-primary-foreground shadow-sm hover:shadow-glow hover:shadow-primary/25",
        secondary:
          "border-transparent bg-gradient-secondary text-secondary-foreground shadow-sm hover:shadow-glow-secondary hover:shadow-secondary/25",
        destructive:
          "border-transparent bg-destructive text-white shadow-sm hover:shadow-glow hover:shadow-destructive/25",
        outline:
          "text-foreground border-border/50 hover:bg-accent/10 hover:text-accent-foreground",
        purple:
          "border-transparent bg-purple text-purple-foreground shadow-sm hover:shadow-glow hover:shadow-purple/25",
        cyan:
          "border-transparent bg-cyan text-cyan-foreground shadow-sm hover:shadow-glow-secondary hover:shadow-cyan/25",
        orange:
          "border-transparent bg-orange text-orange-foreground shadow-sm hover:shadow-glow-accent hover:shadow-orange/25",
        pink:
          "border-transparent bg-pink text-pink-foreground shadow-sm hover:shadow-glow hover:shadow-pink/25",
        gradient:
          "border-transparent bg-gradient-entertainment text-white shadow-sm hover:shadow-glow hover:shadow-primary/25",
        glass:
          "glass-effect text-foreground border-glass-border hover:bg-accent/10",
        energy:
          "border-transparent bg-gradient-accent text-accent-foreground shadow-sm hover:shadow-glow-accent hover:shadow-accent/25 energy-pulse",
        live:
          "border-transparent bg-gradient-accent text-accent-foreground shadow-sm hover:shadow-glow-accent hover:shadow-accent/25 animate-pulse",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }

