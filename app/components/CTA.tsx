import Link from "next/link";

export function CTA() {
  return (
    <section className="bg-white dark:bg-[#020817] py-6 md:py-10">
      <div className="flex flex-col md:flex-row p-4 relative items-center m-auto text-center gap-4 max-w-[1024px] border-[1px] rounded-xl bg-gradient-to-t from-[] to-[#a4a3a3] dark:from-[#020817] dark:to-[#0F172A] animate-fade-in hover-glow">
        <div className="flex flex-col w-full md:w-1/2 text-start items-start gap-4 m-4 animate-slide-in">
          <div className="text-xl font-bold">
            Готовы повысить свои{" "}
            <span className="text-[#4E7AFF]">навыки программирования?</span>
          </div>
          <div className="text-gray-600">
            Погрузитесь в мир сложных конкурсов, обширных библиотек задач и таблиц лидеров в реальном времени. 
            Независимо от того, хотите ли вы улучшить свои навыки или соревноваться с лучшими, 
            Codigma — это ваша платформа для роста и достижения целей.
          </div>
          <Link
            href="/api/auth/signin"
            className="px-6 py-3 rounded-lg bg-[#4E7AFF] text-white font-medium transition-all hover:bg-[#4E7AFF]/90 hover:scale-105 text-center"
          >
            Присоединяйтесь сейчас
          </Link>
        </div>
        <div className="flex grow h-60 md:h-auto"></div>
        <img 
          className="absolute right-0 bottom-0 hidden dark:block animate-float" 
          src="/A2-dark.svg" 
          alt="A2 dark" 
        />
        <img 
          className="absolute right-0 bottom-0 block dark:hidden animate-float" 
          src="/A2-dark.svg" 
          alt="A2 light" 
        />
      </div>
    </section>
  );
} 