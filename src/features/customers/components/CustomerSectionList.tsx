import { memo, useCallback, useMemo } from 'react';
import {
  RefreshControl,
  SectionList,
  type SectionListRenderItem,
  StyleSheet,
  Text,
} from 'react-native';

import { colors, sizes, spacing, typography } from '@/shared/theme';

import type { Customer } from '../domain/customer';
import type { CustomerSection } from '../domain/sections';
import CustomerRow from './CustomerRow';

type Props = {
  sections: CustomerSection[];
  onPressCustomer: (customer: Customer) => void;
  refreshing: boolean;
  onRefresh: () => void;
  /** Shown when there are no sections; `null` shows nothing. */
  emptyMessage: string | null;
};

// Defined once, outside render: SectionList re-renders its rows when these props change identity.
const keyExtractor = (customer: Customer) => customer.id;

const renderSectionHeader = ({ section }: { section: CustomerSection }) => (
  <Text style={styles.sectionHeader}>{section.title}</Text>
);

const refreshColors = [colors.primary];

/** A–Z sectioned customer list with pull-to-refresh. */
function CustomerSectionList({
  sections,
  onPressCustomer,
  refreshing,
  onRefresh,
  emptyMessage,
}: Props) {
  const renderItem: SectionListRenderItem<Customer, CustomerSection> = useCallback(
    ({ item }) => <CustomerRow customer={item} onPress={onPressCustomer} />,
    [onPressCustomer],
  );

  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        tintColor={colors.primary}
        colors={refreshColors}
      />
    ),
    [refreshing, onRefresh],
  );

  return (
    <SectionList
      sections={sections}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      stickySectionHeadersEnabled={false}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      ListEmptyComponent={emptyMessage ? <Text style={styles.message}>{emptyMessage}</Text> : null}
      refreshControl={refreshControl}
    />
  );
}

export default memo(CustomerSectionList);

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    // Room to scroll the last row clear of the floating button.
    paddingBottom: sizes.fab + spacing.xxl,
  },
  sectionHeader: {
    ...typography.label,
    color: colors.textSecondary,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
  },
  message: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    paddingTop: spacing.xxl,
  },
});
