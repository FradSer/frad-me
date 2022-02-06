import { useContext } from 'react';

import { MouseContext } from '../contexts/Mouse/MouseContext';

export default function useMouseContext() {
  return useContext(MouseContext);
}
