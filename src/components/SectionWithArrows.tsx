import { ReactNode } from 'react';

interface SectionWithArrowsProps {
  title: string;
  children: ReactNode;
  isEmpty?: boolean;
  emptyText?: string;
}

export default function SectionWithArrows({ title, children, isEmpty, emptyText }: SectionWithArrowsProps) {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      </div>
      {isEmpty ? (
        <div className="bg-muted/50 border border-border border-dashed rounded-xl p-6 flex items-center justify-center">
          <p className="text-sm text-muted-foreground text-center">{emptyText || 'Nothing here yet.'}</p>
        </div>
      ) : (
        children
      )}
    </section>
  );
}
