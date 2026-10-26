export default function WorkInformation(
  props: Readonly<{
    title: string;
    data?: string[];
  }>,
) {
  if (!props.data) return null;
  return (
    <div className="min-w-0 space-y-2">
      <dt className="text-sm text-gray-500 dark:text-gray-400">{props.title}</dt>
      {props.data.map((item) => (
        <dd key={item}>{item}</dd>
      ))}
    </div>
  );
}
