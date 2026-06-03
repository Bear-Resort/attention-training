import { Header } from "@/components/Header";
import { HomeProgress } from "@/components/HomeProgress";
import { InfinityMode } from "@/components/InfinityMode";
import { LevelMap } from "@/components/LevelMap";
import { useLanguage } from "@/lib/useLanguage";

const ATTENTION_PAPER_URL = "https://arxiv.org/abs/1706.03762";
const CITATION = "Vaswani et al., 2017";

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
          <h2 className="text-center text-xl">
            {subtitle}{" "}
            [
            <a
              href={ATTENTION_PAPER_URL}
              target="_blank"
              rel="noopener noreferrer"
              title="Attention Is All You Need"
              className="underline-offset-4 transition-colors hover:text-primary hover:underline"
            >
              {CITATION}
            </a>
            ]
          </h2>
        </div>
        <HomeProgress />
        <LevelMap />
        <InfinityMode />
      </div>
    </>
  );
}
