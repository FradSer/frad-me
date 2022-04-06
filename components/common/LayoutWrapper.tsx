import { ReactNode } from 'react';

import useLoading from '../../hooks/useLoading';
import Loading from './Loading';

interface ILayoutWrapperProps {
  children: ReactNode;
}

function LayoutWrapper({ children }: ILayoutWrapperProps) {
  const loading = useLoading();
  return loading.isLoading ? (
    <Loading />
  ) : (
    <div className="flex flex-col items-center justify-center bg-white dark:bg-black">
      {children}
    </div>
  );
}

export default LayoutWrapper;
