import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const cardVariants = cva(
  "flex flex-col rounded-lg transition-colors duration-200",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground border border-border shadow-sm",
        gradient: "bg-card text-card-foreground border border-border shadow-sm",
        glass: "bg-background/50 text-card-foreground border border-border/50 backdrop-blur-sm",
        "glass-enhanced": "bg-background/80 text-card-foreground border border-border/50 backdrop-blur-sm",
        floating: "bg-card text-card-foreground border border-border shadow-sm",
        perspective: "bg-card text-card-foreground border border-border shadow-sm",
        layered: "bg-card text-card-foreground border border-border shadow-sm",
        energy: "bg-card text-card-foreground border border-accent/30 shadow-sm",
        concert: "bg-card text-card-foreground border border-border shadow-sm",
        "neon-glow": "bg-card text-card-foreground border border-primary/30 shadow-sm",
        "vibrant-3d": "bg-card text-card-foreground border border-border shadow-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Card({ 
  className, 
  variant,
  ...props 
}: React.ComponentProps<"div"> & VariantProps<typeof cardVariants>) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ variant, className }))}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-4 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-4",
        // Override padding when p-0 is explicitly set
        className?.includes('p-0') && "px-0 py-0",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-4", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-4 [.border-t]:pt-4", className)}
      {...props}
    />
  )
}

export {
    Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
}

