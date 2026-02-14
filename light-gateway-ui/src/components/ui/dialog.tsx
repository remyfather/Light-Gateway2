"use client";

import * as React from "react";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
        aria-hidden
      />
      <div className="relative z-50 bg-[var(--mongo-bg-dark)] border border-[var(--mongo-border)] rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-6 py-4 border-b border-[var(--mongo-border)] bg-[var(--mongo-bg-medium)]">
      {children}
    </div>
  );
}

export function DialogTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-base font-semibold text-white">{children}</h2>;
}

export function DialogContent({ children }: { children: React.ReactNode }) {
  return <div className="flex-1 overflow-auto p-6">{children}</div>;
}

export function DialogFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-6 py-4 border-t border-[var(--mongo-border)] flex justify-end gap-2 bg-[var(--mongo-bg-medium)]">
      {children}
    </div>
  );
}
