export function Features() {
  const Features = [
    {
      heading: "Соревнования по программированию",
      description:
        "Регулярно участвуйте в сложных конкурсах по программированию, проверяя свои навыки в борьбе с лучшими. Улучшайте свои способности к решению задач и поднимайтесь в рейтинге с каждым соревнованием.",
      icon: "/icons/trophy.svg"
    },
    {
      heading: "Таблицы лидеров в реальном времени",
      description:
        "Отслеживайте свой прогресс с помощью динамических таблиц лидеров, которые обновляются в реальном времени. Узнайте, какое место вы занимаете в мировом сообществе программистов, и стремитесь улучшить свой рейтинг.",
      icon: "/icons/leaderboard.svg"
    },
    {
      heading: "Обширная библиотека задач",
      description:
        "Получите доступ к разнообразной коллекции задач по программированию на различные темы и уровни сложности. Испытайте себя на задачах от начального до экспертного уровня и совершенствуйте свои навыки.",
      icon: "/icons/library.svg"
    },
    {
      heading: "Подробные описания задач",
      description:
        "Каждая задача сопровождается чётким и подробным описанием, включая примеры ввода и вывода. Понимайте суть задачи и подходите к её решению с уверенностью.",
      icon: "/icons/document.svg"
    },
    {
      heading: "Интерактивная среда для программирования",
      description:
        "Пишите код прямо на платформе в интерактивной среде. Создавайте, тестируйте и отправляйте свои решения без необходимости использовать сторонние инструменты.",
      icon: "/icons/code.svg"
    },
    {
      heading: "Многоязычная поддержка",
      description:
        "Решайте задачи на предпочитаемом вами языке программирования. Наша платформа поддерживает несколько языков, что позволяет вам кодить с комфортом на том языке, в котором вы чувствуете себя уверенно.",
      icon: "/icons/languages.svg"
    },
  ];

  return (
    <section className="bg-white dark:bg-[#020817] py-6 md:py-10" id="features">
      <div className="flex flex-col items-center m-auto text-center gap-4 max-w-[1024px]">
        <div className="text-5xl font-bold">
          Возможности <span className="text-[#4E7AFF]">платформы</span>
        </div>
        <div className="text-sm text-gray-500 w-full md:w-2/3">
          Раскройте весь потенциал соревновательного программирования с помощью этих ключевых функций
        </div>
        <div className="grid gap-2 grid-cols-1 md:grid-cols-2 p-2">
          {Features.map((feature: any, index: number) => (
            <div
              className={`border-[1px] rounded-md p-4 text-start gap-2 flex flex-col hover-lift hover-glow transition-all ${
                index % 2 === 0 ? "mr-0" : "ml-0"
              }`}
              key={index}
            >
              <div className="flex gap-3 items-center">
                <div className="animate-pulse-slow bg-[#4E7AFF]/10 p-2 rounded-lg">
                  <img src={feature.icon} alt={feature.heading} className="w-6 h-6" />
                </div>
                <div className="font-bold">{feature.heading}</div>
              </div>
              <div className="text-gray-500">{feature.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 