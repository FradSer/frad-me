import { motion } from 'framer-motion';

import { CursorProvider, CursorType } from '../common/CursorProvider';

export default function FLogo() {
  return (
    <CursorProvider targetCursorType={CursorType.headerLinkHovered}>
      <svg
        viewBox="0 0 1024 1024"
        className="h-12 w-12 fill-black hover:cursor-pointer dark:fill-white"
      >
        <path d="M359.274 448.928a19.96 19.96 0 0 0-18.75 13.118l-19.117 52.395c-4.751 13.021 4.89 26.802 18.75 26.802h233.461a19.959 19.959 0 0 0 18.751-13.119l19.117-52.395c4.751-13.021-4.89-26.801-18.751-26.801H359.274ZM618.032 767.902a19.96 19.96 0 0 0-18.751 13.118l-19.117 52.395c-4.751 13.021 4.89 26.802 18.751 26.802h49.821a19.961 19.961 0 0 0 18.751-13.119l19.117-52.395c4.751-13.021-4.89-26.801-18.751-26.801h-49.821Z" />
        <path d="M370.751 860.217a9.98 9.98 0 0 0 9.381-6.574l128.136-353.896 23.087-65.729 32.451-87.735a342.268 342.268 0 0 1 16.549-37.674c6.224-12.118 13.705-22.442 22.442-30.971 8.736-8.529 18.8-14.778 30.192-18.748 11.392-3.97 24.407-4.665 39.046-2.083 7.93 1.398 14.989 3.272 21.178 5.622 2.395.909 5.625 2.296 8.684 3.653 5.111 2.269 11.137.035 13.413-5.073l22.806-51.155c2.319-5.203-.177-11.27-5.541-13.189-10.76-3.849-28.231-9.682-41.221-11.972-28.668-5.055-54.259-4.376-76.773 2.039-22.515 6.414-42.392 16.597-59.632 30.549-17.24 13.952-31.86 30.884-43.862 50.794a384.195 384.195 0 0 0-30.379 62.612l-32.612 88.65-23.087 65.73-130.977 361.764c-2.362 6.508 2.458 13.386 9.381 13.386h67.338Z" />
      </svg>
    </CursorProvider>
  );
}
