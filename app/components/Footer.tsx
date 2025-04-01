import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap justify-center md:justify-start gap-6">
            <Link
              className="text-muted-foreground hover:text-foreground transition-colors"
              href={"/"}
            >
              Помощь и поддержка
            </Link>
            <Link
              className="text-muted-foreground hover:text-foreground transition-colors"
              href={"/"}
            >
              Сообщить о проблеме
            </Link>
            <Link
              className="text-muted-foreground hover:text-foreground transition-colors"
              href={"/"}
            >
              Политика конфиденциальности
            </Link>
          </div>
          <div className="text-muted-foreground text-sm">
            © 2025 Codigma. Все права защищены.
          </div>
        </div>
      </div>
    </footer>
  );
}; 