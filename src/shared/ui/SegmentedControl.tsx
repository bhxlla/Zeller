import { useCallback, useEffect, useMemo, useRef } from 'react';
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
  /** `null` selects nothing and hides the indicator, e.g. a choice the user hasn't made yet. */
  value: T | null;
  onChange: (value: T) => void;
  /**
   * Where the indicator is, in option indexes (e.g. 1.5 = halfway between the 2nd and 3rd).
   * Pass a pager's scroll position to make the indicator follow a swipe. Without it, the
   * indicator animates to the selected option on its own.
   */
  position?: SharedValue<number>;
};

/** A row of equal-width options with a pill indicator that slides to the selected one. */
function SegmentedControl<T extends string>({ options, value, onChange, position }: Props<T>) {
  const selectedIndex = value === null ? -1 : options.indexOf(value);
  const hasSelection = selectedIndex !== -1;
  const ownPosition = useSharedValue(Math.max(selectedIndex, 0));
  const indicatorPosition = position ?? ownPosition;
  const segmentWidth = useSharedValue(0);
  const hadSelection = useRef(hasSelection);

  useEffect(() => {
    if (position || !hasSelection) return;
    // The first selection appears in place; later ones slide.
    ownPosition.value = hadSelection.current
      ? withTiming(selectedIndex, { duration: SLIDE_DURATION_MS })
      : selectedIndex;
    hadSelection.current = true;
  }, [position, ownPosition, selectedIndex, hasSelection]);

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
      {hasSelection ? <Animated.View style={trackIndicatorStyle} /> : null}
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

function Segment<T extends string>({ option, isSelected, onSelect }: SegmentProps<T>) {
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
}

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

export default SegmentedControl;
