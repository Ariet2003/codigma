import Link from "next/link";

export function Hero() {
  return (
    <section className="bg-white dark:bg-[#020817] m-4 md:m-0 py-4 md:py-6">
      <div className="mx-auto px-4 md:px-6 flex flex-col justify-center items-center gap-0">
        <div className="flex flex-col justify-center text-center gap-3 animate-slide-in">
            <div className="block w-96 mx-auto animate-float">
              <img
                className="hidden dark:block mx-auto"
                src="/Codigma-logo-dark.svg"
                alt="Codigma logo dark"
              />
              <img
                className="block dark:hidden mx-auto"
                src="/Codigma-logo-light.svg"
                alt="Codigma logo light"
              />
            </div>
          <div className="text-6xl font-bold">
            Взломай свои границы с
          </div>
          <div className="text-6xl text-[#4E7AFF] font-bold">
            Codigma
          </div>
          <div className="text-sm text-gray-600">
            Стань частью сообщества кодеров, решай задачи и покоряй топы лидеров на Codigma 🚀{" "}
          </div>
          <div className="flex justify-center flex-col md:flex-row gap-4 mt-4">
            <Link
              href={"/api/auth/signin"}
              className="border-[1px] border-gray-600 px-6 py-3 rounded-lg bg-[#4E7AFF] hover-lift hover-glow transition-all font-medium shadow-lg hover:shadow-[#4E7AFF]/20"
            >
              Начать решать{" "}
            </Link>
            <Link
              href={"/#features"}
              className="border-[1px] border-gray-600 px-6 py-3 rounded-lg hover-lift transition-all font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Посмотреть возможности
            </Link>
          </div>
        </div>
        
          {/* Light Mode Image */}
          <img
            className="block dark:hidden animate-float"
            src="/HeroSectionLightImage.svg"
            alt="Light mode hero image"
            style={{ animationDelay: '1s' }}
          />
          {/* Dark Mode Image */}
          <img
            className="hidden dark:block animate-float"
            src="/HeroSectionDarkImage.svg"
            alt="Dark mode hero image"
            style={{ animationDelay: '1s' }}
          />
      </div>
    </section>
  );
} 