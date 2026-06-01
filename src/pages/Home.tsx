import { Header } from "@/components/Header";
import { HomeProgress } from "@/components/HomeProgress";
import { LevelMap } from "@/components/LevelMap";
import { useLanguage } from "@/lib/useLanguage";

const content = {
  en: {
    title: "Attention Trainer",
    subtitle: "Attention is all you need",
  },
  zh: {
    title: "注意力训练器",
    subtitle: "注意力便是你全部所需",
  },
};

export function Home() {
  const language = useLanguage();
  const { title, subtitle } = content[language];

  return (
    <>
      <Header />
      <div className="fade-in flex flex-col items-center px-4 py-24">
        <div className="mb-12 flex flex-col items-center">
          <h1 className="text-center text-3xl font-black">{title}</h1>
          <br />
          <h2 className="text-center text-xl">{subtitle}</h2>
        </div>
        <HomeProgress />
        <LevelMap />
      </div>
    </>
  );
}
