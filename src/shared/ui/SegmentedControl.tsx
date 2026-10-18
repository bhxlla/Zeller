import { memo, useCallback, useEffect, useMemo } from 'react';
import { type LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { colors, radii, sizes, typography } from '@/shared/theme';

const SLIDE_DURATION_MS = 250;

type Props<T extends string> = {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  /**
   * Where the indicator is, in option indexes (e.g. 1.5 = halfway between the 2nd and 3rd).
   * Pass a pager's scroll position to make the indicator follow a swipe. Without it, the
   * indicator animates to the selected option on its own.
   */
  position?: SharedValue<number>;
};

/** A row of equal-width options with a pill indicator that slides to the selected one. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  position,
}: Props<T>) {
  const selectedIndex = options.indexOf(value);
  const ownPosition = useSharedValue(selectedIndex);
  const indicatorPosition = position ?? ownPosition;
  const segmentWidth = useSharedValue(0);

  useEffect(() => {
    if (!position) {
      ownPosition.value = withTiming(selectedIndex, { duration: SLIDE_DURATION_MS });
    }
  }, [position, ownPosition, selectedIndex]);

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      segmentWidth.value = event.nativeEvent.layout.width / options.length;
    },
    [segmentWidth, options.length],
  );

  const indicatorStyle = useAnimatedStyle(() => ({
    width: segmentWidth.value,
    transform: [{ translateX: indicatorPosition.value * segmentWidth.value }],
  }));

  const trackIndicatorStyle = useMemo(() => [styles.indicator, indicatorStyle], [indicatorStyle]);

  return (
    <View style={styles.track} onLayout={onLayout} accessibilityRole="tablist">
      <Animated.View style={trackIndicatorStyle} />
      {options.map((option) => (
        <Segment key={option} option={option} isSelected={option === value} onSelect={onChange} />
      ))}
    </View>
  );
}

type SegmentProps<T extends string> = {
  option: T;
  isSelected: boolean;
  onSelect: (option: T) => void;
};

const Segment = memo(function Segment<T extends string>({
  option,
  isSelected,
  onSelect,
}: SegmentProps<T>) {
  const handlePress = useCallback(() => onSelect(option), [onSelect, option]);
  const accessibilityState = useMemo(() => ({ selected: isSelected }), [isSelected]);

  return (
    <Pressable
      onPress={handlePress}
      style={styles.segment}
      accessibilityRole="tab"
      accessibilityState={accessibilityState}
    >
      {/* Colour switches immediately on selection, like the reference animation. */}
      <Text style={isSelected ? styles.selectedLabel : styles.label}>{option}</Text>
    </Pressable>
  );
}) as <T extends string>(props: SegmentProps<T>) => React.JSX.Element;

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    height: sizes.tabHeight,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceMuted,
  },
  indicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...typography.body,
    color: colors.textSecondary,
  },
  selectedLabel: {
    ...typography.body,
    color: colors.primary,
  },
});
