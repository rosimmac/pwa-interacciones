export function SectionTitle({ children }: React.PropsWithChildren) {
  return (
    <h2 className="px-4 mt-6 mb-2 font-bold text-lg text-gray-800">
      {children}
    </h2>
  );
}
