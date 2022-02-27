export default function WorkInfomation(props: {
  title: string;
  data?: [string];
}) {
  if (!props.data) return null;
  return (
    <div className="col-span-3">
      <p className="uppercase">{props.title}</p>
      {props.data.map((item) => (
        <p key={item} className="text-gray-500 dark:text-gray-700">
          {item}
        </p>
      ))}
    </div>
  );
}
