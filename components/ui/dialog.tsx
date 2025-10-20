"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogCloseProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Dialog({ open, children, className }: DialogProps) {
  useEffect(() => {
    if (open) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      
      // Prevent scroll with keyboard
      const handleKeyDown = (e: KeyboardEvent) => {
        if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(e.key)) {
          e.preventDefault();
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      
      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className={cn("fixed inset-0 z-50", className)}>
          {children}
        </div>
      )}
    </AnimatePresence>
  );
}

export function DialogContent({ children, className }: DialogContentProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Find the closest Dialog parent and close it
        const dialog = dialogRef.current?.closest('[data-dialog]');
        if (dialog) {
          const closeButton = dialog.querySelector('[data-dialog-close]') as HTMLButtonElement;
          closeButton?.click();
        }
      }
    };

    if (dialogRef.current) {
      document.addEventListener("keydown", handleEscape);
      // Focus the dialog content
      dialogRef.current.focus();
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 min-h-screen overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const closeButton = dialogRef.current?.querySelector('[data-dialog-close]') as HTMLButtonElement;
          closeButton?.click();
        }
      }}
    >
      <motion.div
        ref={dialogRef}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={cn(
          "relative z-50 w-full max-w-2xl bg-background p-6 shadow-xl rounded-xl border border-border/50 mx-auto",
          className
        )}
        data-dialog
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export function DialogHeader({ children, className }: DialogHeaderProps) {
  return (
    <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}>
      {children}
    </div>
  );
}

export function DialogTitle({ children, className }: DialogTitleProps) {
  return (
    <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)}>
      {children}
    </h2>
  );
}

export function DialogClose({ children, className, onClick }: DialogCloseProps) {
  return (
    <button
      data-dialog-close
      className={cn(
        "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none",
        className
      )}
      onClick={onClick}
    >
      {children}
      <span className="sr-only">Close</span>
    </button>
  );
}
