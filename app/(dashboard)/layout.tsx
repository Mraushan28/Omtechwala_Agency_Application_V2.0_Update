import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex min-h-screen flex-col bg-slate-950">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    );
}

