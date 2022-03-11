import { ReactNode } from 'react';

import Header from '../Header';

interface ILayoutWrapperProps {
  children: ReactNode;
}

function LayoutWrapper({ children }: ILayoutWrapperProps) {
  return (
    <div className="flex flex-col items-center justify-center bg-white dark:bg-black">
      {children}
    </div>
  );
}

export default LayoutWrapper;
