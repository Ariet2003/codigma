export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-full max-w-[400px] p-6">
        {children}
      </div>
    </div>
  );
} 