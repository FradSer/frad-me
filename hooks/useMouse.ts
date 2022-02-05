import { useContext } from 'react';

import { MouseContext } from '../context/Mouse/MouseContext';

export default function useMouse() {
  return useContext(MouseContext);
}
