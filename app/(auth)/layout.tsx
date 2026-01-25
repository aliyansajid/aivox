import { AudioLines } from "lucide-react";
import { Inter } from "next/font/google";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${inter.className} flex min-h-screen flex-col items-center justify-center gap-8 bg-linear-to-br from-orange-50 via-white to-amber-50 px-4 py-8`}
    >
      <Link href="/" className="flex items-center gap-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
          <AudioLines color="white" />
        </div>
        <span className="text-2xl font-bold text-[#0e0e0e] dark:text-primary">
          AIVOX
        </span>
      </Link>

      {children}
    </div>
  );
}
