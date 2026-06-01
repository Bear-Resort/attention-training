import { Return } from "@/components/Return";
import { Menu } from "@/components/Menu";

export function Header() {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between bg-background/95 px-4 py-4 backdrop-blur sm:border-b">
      <Return />
      <Menu />
    </div>
  );
}
