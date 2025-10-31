import Link from "next/link";

const links = [
  { name: "Home", path: "/" },
  { name: "Gallery", path: "/gallery" },
  { name: "Timeline", path: "/timeline" },
  { name: "Camera", path: "/camera" },
  { name: "Map", path: "/map" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-6 space-y-4">
      <h1 className="text-2xl font-bold mb-6">📊 Dashboard</h1>
      <nav className="flex flex-col gap-3">
        {links.map((link) => (
          <Link
            key={link.path}
            href={link.path}
            className="hover:text-yellow-300 transition"
          >
            {link.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
