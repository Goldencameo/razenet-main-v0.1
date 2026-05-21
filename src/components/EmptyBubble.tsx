interface EmptyBubbleProps {
  text: string;
}

export default function EmptyBubble({ text }: EmptyBubbleProps) {
  return (
    <div className="bg-muted/50 border border-border border-dashed rounded-xl p-6 flex items-center justify-center">
      <p className="text-sm text-muted-foreground text-center">{text}</p>
    </div>
  );
}
