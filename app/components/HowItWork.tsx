export function HowItWork() {
  const steps = [
    {
      heading: 'Зарегистрируйтесь или Войдите',
      description:
        'Создайте аккаунт, зарегистрировавшись с помощью электронной почты, Google или GitHub. Если вы уже зарегистрированы, просто войдите в систему, чтобы получить доступ к своему профилю и сразу начать программировать.',
    },
    {
      heading: 'Выберите конкурс или задачу',
      description:
        'Изучите наши регулярные конкурсы по программированию и выберите тот, который соответствует вашему уровню навыков или интересам. Либо погрузитесь в нашу обширную библиотеку задач, чтобы решать задачи в удобном для вас темпе.',
    },
    {
      heading: 'Начните программировать',
      description:
        'Используйте нашу интерактивную среду для программирования, чтобы писать, тестировать и отправлять свои решения прямо на платформе. Получайте мгновенную обратную связь, чтобы улучшить свой подход.',
    },
    {
      heading: 'Отслеживайте свой прогресс',
      description:
        'Отслеживайте свой рейтинг в таблицах лидеров в реальном времени и анализируйте свою работу с помощью подробной аналитики. Эта информация поможет вам понять свои сильные стороны и выявить области для улучшения.',
    },
  ];

  return (
    <section id="how-it-works" className="bg-white bg-gradient-to-t dark:from-[#020817] dark:to-[#0F172A] py-6 md:py-10">
      <div className="flex flex-col items-center m-auto text-center gap-4 max-w-[1024px]">
        <div className="text-5xl font-bold">
          Как это <span className="text-[#4E7AFF]">работает?</span>
        </div>
        <div className="text-sm text-gray-500 w-2/3">
          Выполните эти простые шаги, чтобы начать, участвовать в соревнованиях и отслеживать свой прогресс на Codigma.
        </div>
        <div className="grid gap-3 grid-cols-1 md:grid-cols-2 p-2">
          {steps.map((step: any, index: number) => (
            <div
              className={`border-[1px] rounded-md p-4 text-start gap-2 flex flex-col ${
                index % 2 === 0 ? 'mr-0' : 'ml-0'
              }`}
              key={index}
            >
              <div className="flex flex-col gap-1 items-start">
                <div className="flex py-[2px] px-4 rounded-3xl bg-[#4E7AFF] text-white">
                  Шаг {index + 1}
                </div>
                <div className="font-bold">{step.heading}</div>
              </div>
              <div className="text-gray-500">{step.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 