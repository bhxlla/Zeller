import type { ComponentProps } from 'react';
import type PagerView from 'react-native-pager-view';
import type { PagerViewOnPageScrollEventData } from 'react-native-pager-view';
import { useEvent, useSharedValue } from 'react-native-reanimated';

/**
 * A pager's live scroll position in pages (e.g. 1.5 mid-swipe between the 2nd and 3rd), updated
 * on the UI thread. Pass `onPageScroll` to a pager made with `Animated.createAnimatedComponent`.
 */
export function usePagerPosition() {
  const position = useSharedValue(0);

  const onPageScroll = useEvent<PagerViewOnPageScrollEventData>(
    (event) => {
      'worklet';
      position.value = event.position + event.offset;
    },
    ['onPageScroll'],
  );

  return {
    position,
    onPageScroll: onPageScroll as unknown as ComponentProps<typeof PagerView>['onPageScroll'],
  };
}
