import { ArrowLeft, ArrowRight, Check, Loader2, Minus, Plus, Search, X } from 'lucide-react';
import type { ForwardRefExoticComponent, RefAttributes, SVGProps } from 'react';
import coinbaseWallet from '@/assets/svg/coinbase-wallet.svg';
import metamask from '@/assets/svg/metamask.svg';
import walletConnect from '@/assets/svg/wallet-connect.svg';

const IconList = {
  arrowLeft: ArrowLeft,
  arrowRight: ArrowRight,
  x: X,
  minus: Minus,
  plus: Plus,
  spinner: Loader2,
  check: Check,
  search: Search,
  walletConnect,
  coinbaseWallet,
  metamask,
};

type SVGAttributes = Partial<SVGProps<SVGSVGElement>>;
type ComponentAttributes = RefAttributes<SVGSVGElement> & SVGAttributes;
interface IconProps extends ComponentAttributes {
  size?: string | number;
  absoluteStrokeWidth?: boolean;
  width?: number;
  height?: number;
}

export type Icon = ForwardRefExoticComponent<IconProps>;

export const Icons = IconList as Record<keyof typeof IconList, Icon>;
