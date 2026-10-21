import Link from "next/link";

// Rendered inside the [lang] layout, so header, footer and the emergency bar stay visible.
export default function NotFound() {
  return (
    <div className="container-page section">
      <h1 className="text-3xl">Page not found · पेज नहीं मिला</h1>
      <p className="mt-3 text-ink-soft">
        <Link href="/en" className="text-go-700 underline">Home</Link> ·{" "}
        <Link href="/hi" className="text-go-700 underline">होम</Link>
      </p>
    </div>
  );
}
