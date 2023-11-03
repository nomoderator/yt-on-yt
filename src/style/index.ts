import { PropsOf } from '@emotion/react';
import { Notifications } from '@mantine/notifications';

export const BrandColorYellow = '#ffba00';

export const BrandColorBlack = '#303030';

export const notificationProps: PropsOf<typeof Notifications> = {
  position: 'top-center',
  zIndex: 9999,
};
