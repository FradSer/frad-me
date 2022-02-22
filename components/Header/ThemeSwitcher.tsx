import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import {
  primaryTransition,
  secondaryTransition,
} from '../../utils/motion/springTransitions';
import CursorProvider from '../common/CursorProvider';

export default function ThemeSwitcher() {
  // * Hooks
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  // When mounted on client, now we can show the UI
  useEffect(() => setMounted(true), []);

  // * Animation

  const hoverVariants = {
    initial: {
      scale: 1,
      transition: {
        ...primaryTransition,
      },
    },
    hover: {
      scale: 1.1,
      transition: {
        ...secondaryTransition,
      },
    },
  };

  // * Reander
  return (
    <CursorProvider>
      <motion.button
        aria-label="Toggle Dark Mode"
        type="button"
        className="flex h-8 w-8 items-center justify-center"
        onClick={() =>
          setTheme(
            theme === 'dark' || resolvedTheme === 'dark' ? 'light' : 'dark'
          )
        }
        initial="initial"
        whileHover="hover"
        variants={hoverVariants}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          className="h-6 w-6 fill-black dark:fill-white"
        >
          {mounted && (theme === 'dark' || resolvedTheme === 'dark') ? (
            <path d="M7.9043 0.898438C7.9043 0.757812 7.85352 0.638672 7.75195 0.541016C7.65039 0.439453 7.5293 0.388672 7.38867 0.388672C7.25195 0.388672 7.13281 0.439453 7.03125 0.541016C6.92969 0.638672 6.87891 0.757812 6.87891 0.898438V2.12891C6.87891 2.26953 6.92969 2.39062 7.03125 2.49219C7.13281 2.58984 7.25195 2.63867 7.38867 2.63867C7.5293 2.63867 7.65039 2.58984 7.75195 2.49219C7.85352 2.39062 7.9043 2.26953 7.9043 2.12891V0.898438ZM7.9043 11.3633C7.9043 11.2227 7.85352 11.1016 7.75195 11C7.65039 10.9023 7.5293 10.8535 7.38867 10.8535C7.25195 10.8535 7.13281 10.9023 7.03125 11C6.92969 11.1016 6.87891 11.2227 6.87891 11.3633V12.5938C6.87891 12.7344 6.92969 12.8535 7.03125 12.9512C7.13281 13.0527 7.25195 13.1035 7.38867 13.1035C7.5293 13.1035 7.65039 13.0527 7.75195 12.9512C7.85352 12.8535 7.9043 12.7344 7.9043 12.5938V11.3633ZM13.2188 7.25586C13.3594 7.25586 13.4805 7.20703 13.582 7.10938C13.6836 7.00781 13.7344 6.88672 13.7344 6.74609C13.7344 6.60938 13.6836 6.49023 13.582 6.38867C13.4805 6.28711 13.3594 6.23633 13.2188 6.23633H11.9941C11.8574 6.23633 11.7383 6.28711 11.6367 6.38867C11.5352 6.49023 11.4844 6.60938 11.4844 6.74609C11.4844 6.88672 11.5352 7.00781 11.6367 7.10938C11.7383 7.20703 11.8574 7.25586 11.9941 7.25586H13.2188ZM1.55859 6.23633C1.42188 6.23633 1.30273 6.28711 1.20117 6.38867C1.09961 6.49023 1.04883 6.60938 1.04883 6.74609C1.04883 6.88672 1.09961 7.00781 1.20117 7.10938C1.30273 7.20703 1.42188 7.25586 1.55859 7.25586H2.7832C2.92383 7.25586 3.04492 7.20703 3.14648 7.10938C3.24805 7.00781 3.29883 6.88672 3.29883 6.74609C3.29883 6.60938 3.24805 6.49023 3.14648 6.38867C3.04492 6.28711 2.92383 6.23633 2.7832 6.23633H1.55859ZM3.76758 3.85156C3.86523 3.94922 3.98438 3.99805 4.125 3.99805C4.26953 3.99805 4.39062 3.94922 4.48828 3.85156C4.58594 3.75781 4.63477 3.63867 4.63477 3.49414C4.63867 3.34961 4.5918 3.22852 4.49414 3.13086L3.62109 2.25195C3.52734 2.1582 3.4082 2.11133 3.26367 2.11133C3.12305 2.10742 3.00195 2.1543 2.90039 2.25195C2.80273 2.34961 2.75391 2.4707 2.75391 2.61523C2.75391 2.75977 2.80078 2.87891 2.89453 2.97266L3.76758 3.85156ZM10.2832 3.13086C10.1855 3.22852 10.1367 3.34961 10.1367 3.49414C10.1367 3.63477 10.1855 3.75391 10.2832 3.85156C10.3809 3.94922 10.5 4 10.6406 4.00391C10.7852 4.00391 10.9082 3.95312 11.0098 3.85156L11.8828 2.97852C11.9805 2.88086 12.0293 2.75977 12.0293 2.61523C12.0293 2.4707 11.9805 2.34961 11.8828 2.25195C11.7852 2.1543 11.666 2.10547 11.5254 2.10547C11.3848 2.10547 11.2656 2.1543 11.168 2.25195L10.2832 3.13086ZM11.0039 9.64648C10.9062 9.54883 10.7852 9.5 10.6406 9.5C10.5 9.5 10.3809 9.54883 10.2832 9.64648C10.1855 9.74414 10.1367 9.86523 10.1367 10.0098C10.1367 10.1504 10.1855 10.2695 10.2832 10.3672L11.168 11.2461C11.2656 11.3438 11.3848 11.3906 11.5254 11.3867C11.666 11.3867 11.7852 11.3379 11.8828 11.2402C11.9805 11.1426 12.0293 11.0234 12.0293 10.8828C12.0293 10.7383 11.9805 10.6172 11.8828 10.5195L11.0039 9.64648ZM2.89453 10.5137C2.79688 10.6113 2.74805 10.7324 2.74805 10.877C2.74805 11.0176 2.79492 11.1367 2.88867 11.2344C2.98633 11.332 3.10742 11.3809 3.25195 11.3809C3.39648 11.3848 3.51758 11.3379 3.61523 11.2402L4.48828 10.3672C4.58594 10.2695 4.63477 10.1504 4.63477 10.0098C4.63867 9.86523 4.5918 9.74414 4.49414 9.64648C4.39648 9.54883 4.27539 9.5 4.13086 9.5C3.98633 9.5 3.86523 9.54883 3.76758 9.64648L2.89453 10.5137ZM7.38867 3.75781C6.97852 3.75781 6.59375 3.83594 6.23438 3.99219C5.875 4.14844 5.55664 4.36328 5.2793 4.63672C5.00586 4.91016 4.79102 5.22852 4.63477 5.5918C4.47852 5.95117 4.40039 6.33594 4.40039 6.74609C4.40039 7.15625 4.47852 7.54297 4.63477 7.90625C4.79102 8.26562 5.00586 8.58398 5.2793 8.86133C5.55664 9.13477 5.875 9.34961 6.23438 9.50586C6.59375 9.66211 6.97852 9.74023 7.38867 9.74023C7.79492 9.74023 8.17773 9.66211 8.53711 9.50586C8.90039 9.34961 9.21875 9.13477 9.49219 8.86133C9.76562 8.58398 9.98047 8.26562 10.1367 7.90625C10.293 7.54297 10.3711 7.15625 10.3711 6.74609C10.3711 6.33594 10.293 5.95117 10.1367 5.5918C9.98047 5.22852 9.76562 4.91016 9.49219 4.63672C9.21875 4.36328 8.90039 4.14844 8.53711 3.99219C8.17773 3.83594 7.79492 3.75781 7.38867 3.75781Z" />
          ) : (
            <path d="M10.1133 8.80859C9.32031 8.80859 8.60352 8.68945 7.96289 8.45117C7.32617 8.21289 6.7793 7.86914 6.32227 7.41992C5.86914 6.9707 5.52148 6.42969 5.2793 5.79688C5.03711 5.16016 4.91602 4.44336 4.91602 3.64648C4.91602 3.42773 4.93164 3.18945 4.96289 2.93164C4.99805 2.66992 5.04297 2.41797 5.09766 2.17578C5.15234 1.93359 5.21484 1.73047 5.28516 1.56641C5.3125 1.5 5.33008 1.44531 5.33789 1.40234C5.3457 1.35547 5.34961 1.31836 5.34961 1.29102C5.34961 1.21289 5.32031 1.13867 5.26172 1.06836C5.20312 0.994141 5.11719 0.957031 5.00391 0.957031C4.97266 0.957031 4.92578 0.962891 4.86328 0.974609C4.80078 0.982422 4.73633 0.998047 4.66992 1.02148C3.94727 1.31055 3.31445 1.74414 2.77148 2.32227C2.22852 2.89648 1.80469 3.56055 1.5 4.31445C1.19922 5.06836 1.04883 5.85547 1.04883 6.67578C1.04883 7.53906 1.20117 8.33008 1.50586 9.04883C1.81445 9.76758 2.24219 10.3926 2.78906 10.9238C3.33984 11.4512 3.98242 11.8594 4.7168 12.1484C5.45508 12.4375 6.25195 12.582 7.10742 12.582C7.74023 12.582 8.34375 12.4922 8.91797 12.3125C9.49219 12.1367 10.0195 11.8906 10.5 11.5742C10.9805 11.2617 11.3965 10.8984 11.748 10.4844C12.0996 10.0664 12.3652 9.61914 12.5449 9.14258C12.5723 9.07227 12.5898 9.00781 12.5977 8.94922C12.6055 8.88672 12.6094 8.8418 12.6094 8.81445C12.6094 8.70508 12.5723 8.61719 12.498 8.55078C12.4238 8.48438 12.3457 8.45117 12.2637 8.45117C12.1973 8.45117 12.1133 8.46875 12.0117 8.50391C11.7852 8.57812 11.502 8.64844 11.1621 8.71484C10.8223 8.77734 10.4727 8.80859 10.1133 8.80859Z" />
          )}
        </svg>
      </motion.button>
    </CursorProvider>
  );
}
