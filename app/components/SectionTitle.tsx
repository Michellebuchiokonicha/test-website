export default function SectionTitle({
  kicker,
  children,
  as: Tag = "h2",
}: {
  kicker: string;
  children: React.ReactNode;
  as?: "h1" | "h2";
}) {
  return (
    <div className="mb-10">
      <p className="text-sm font-medium uppercase tracking-widest text-accent">{kicker}</p>
      <Tag className="mt-2 font-serif text-3xl sm:text-4xl">{children}</Tag>
    </div>
  );
}
