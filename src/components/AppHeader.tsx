import { SidebarMenu } from "@/components/SidebarMenu";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

type PageHeaderProps = {
  title: string;
  placeholder?: string;
};

export function AppHeader({ title, placeholder }: PageHeaderProps) {
  return (
    <header className="w-full bg-blue-600 text-white px-4 py-6 flex flex-col gap-10 shadow-md">
      {/* Título + menú */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <SidebarMenu />
      </div>

      {/* Buscador */}
      <div className="w-full -mt-6">
        <div className="relative w-full text-white">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70 z-20"
          />
          <Input
            type="text"
            placeholder={placeholder ?? `Buscar ${title.toLowerCase()}...`}
            className="
              w-full pl-10 pr-4 py-3
              rounded-lg
              bg-white/20
              border border-white/10
              text-white
              placeholder:text-white/70
              backdrop-blur-sm
              focus-visible:ring-1 focus-visible:ring-white/50
            "
          />
        </div>
      </div>
    </header>
  );
}
