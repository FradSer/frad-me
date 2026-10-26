interface IMDXComponentProviderProps {
  children: React.ReactNode;
  className?: string;
}

function MDXComponentProvider(props: Readonly<IMDXComponentProviderProps>) {
  return <div className={props.className}>{props.children}</div>;
}

export default MDXComponentProvider;
