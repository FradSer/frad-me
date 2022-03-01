import classNames from 'classnames';

type IWorkImageProps = {
  underH2?: boolean;
};

function WorkImage({ underH2 }: IWorkImageProps) {
  const workImageClass = classNames(
    'col-span-16 mt-0 h-32 bg-black md:col-span-5',
    {
      'md:mt-[-3.25rem]': underH2,
    }
  );
  return <div className={workImageClass}></div>;
}

WorkImage.defaultProps = {
  underH2: true,
};

export default WorkImage;
