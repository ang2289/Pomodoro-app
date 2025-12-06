// src/pages/tools/shopee-video/components/SectionCard.tsx

interface SectionCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export default function SectionCard({ title, children, className = "" }: SectionCardProps) {
  return (
    <div className={`bg-white rounded-2xl shadow-md p-8 ${className}`}>
      {title && (
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
      )}
      {children}
    </div>
  );
}

