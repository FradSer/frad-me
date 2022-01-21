import React from 'react';

function Loading(props) {
  const classNames = props.loading
    ? 'w-full h-full flex items-center justify-center'
    : 'hidden';

  return <div className={classNames}>loading</div>;
}

export default Loading;
