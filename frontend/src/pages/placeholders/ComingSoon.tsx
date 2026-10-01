export default function ComingSoon({ title }: { title: string }) {
  return (
    <section>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="opacity-70">This page will be built once its Figma design and Notion logic are ready.</p>
    </section>
  );
}
