import 'styled-components';
import { Theme } from './themes/theme';

declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}
