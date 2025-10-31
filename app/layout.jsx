import "./../styles/globals.css";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export const metadata = {
  title: "Photo Analytica",
  description: "Analyze your photo collection visually, without AI.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex bg-gray-50 text-gray-900">
        <Sidebar />
        <main className="flex-1 min-h-screen">
          <Navbar />
          <div className="p-6">{children}</div>
        </main>
      </body>
    </html>
  );
}
