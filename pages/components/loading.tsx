import React from 'react';

// https://www.bhagyamudgal.me/blog/how-to-make-custom-loading-screen-in-nextjs-project

function Loading(props) {
  const classNames = props.loading
    ? 'w-full h-full flex items-center justify-center'
    : 'hidden';

  return <div className={classNames}>loading</div>;
}

export default Loading;
