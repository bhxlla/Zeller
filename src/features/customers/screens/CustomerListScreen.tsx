import { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import PagerView, { type PagerViewOnPageSelectedEvent } from 'react-native-pager-view';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackScreenProps } from '@/app/navigation/types';
import { usePagerPosition } from '@/shared/hooks/usePagerPosition';
import { colors, spacing, typography } from '@/shared/theme';
import Fab from '@/shared/ui/Fab';
import IconButton from '@/shared/ui/IconButton';
import SearchField from '@/shared/ui/SearchField';
import SegmentedControl from '@/shared/ui/SegmentedControl';

import CustomerSectionList from '../components/CustomerSectionList';
import { filterByRole, ROLE_FILTERS, type Customer, type RoleFilter } from '../domain/customer';
import { groupByInitial } from '../domain/sections';
import { useCustomerSync } from '../hooks/useCustomerSync';
import { useCustomers } from '../hooks/useCustomers';

const AnimatedPagerView = Animated.createAnimatedComponent(PagerView);

const SAFE_AREA_EDGES = ['top'] as const;

function CustomerListScreen({ navigation }: RootStackScreenProps<'CustomerList'>) {
  const [isSearching, setIsSearching] = useState(false);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<RoleFilter>('All');
  // One query for every tab; each page shows its slice, so tabs can never disagree.
  const customers = useCustomers({ role: 'All', search });
  const { refresh, status } = useCustomerSync();

  const pagerRef = useRef<PagerView>(null);
  const { position: pagePosition, onPageScroll } = usePagerPosition();

  const pages = useMemo(
    () =>
      ROLE_FILTERS.map((filter) => ({
        filter,
        sections: Array.isArray(customers) ? groupByInitial(filterByRole(customers, filter)) : [],
      })),
    [customers],
  );

  // Tap: select right away (label colour), then scroll the pager, which moves the indicator.
  const selectTab = useCallback((filter: RoleFilter) => {
    setRole(filter);
    pagerRef.current?.setPage(ROLE_FILTERS.indexOf(filter));
  }, []);

  // Swipe: select once the pager settles on a page.
  const onPageSelected = useCallback((event: PagerViewOnPageSelectedEvent) => {
    setRole(ROLE_FILTERS[event.nativeEvent.position] ?? 'All');
  }, []);

  const openCustomer = useCallback(
    (customer: Customer) => navigation.navigate('CustomerForm', { customerId: customer.id }),
    [navigation],
  );

  const openNewCustomer = useCallback(() => navigation.navigate('CustomerForm'), [navigation]);

  const openSearch = useCallback(() => setIsSearching(true), []);

  const closeSearch = useCallback(() => {
    setSearch('');
    setIsSearching(false);
  }, []);

  const emptyMessage =
    status === 'syncing'
      ? null
      : search.trim()
        ? `No customers match "${search.trim()}".`
        : 'No customers yet.';

  return (
    <SafeAreaView style={styles.screen} edges={SAFE_AREA_EDGES}>
      <View style={styles.header}>
        {isSearching ? (
          <SearchField
            value={search}
            onChangeText={setSearch}
            onClose={closeSearch}
            placeholder="Search by name"
          />
        ) : (
          <>
            <View style={styles.tabs}>
              <SegmentedControl
                options={ROLE_FILTERS}
                value={role}
                onChange={selectTab}
                position={pagePosition}
              />
            </View>
            <IconButton icon="search" accessibilityLabel="Search customers" onPress={openSearch} />
          </>
        )}
      </View>

      {status instanceof Error && (
        <Text style={styles.syncError} accessibilityRole="alert">
          {"Couldn't refresh. Showing saved customers."}
        </Text>
      )}

      {customers === 'loading' ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : customers instanceof Error ? (
        <View style={styles.centered}>
          <Text style={styles.message}>{"Couldn't load customers."}</Text>
        </View>
      ) : (
        <AnimatedPagerView
          ref={pagerRef}
          style={styles.pager}
          initialPage={0}
          onPageScroll={onPageScroll}
          onPageSelected={onPageSelected}
        >
          {pages.map(({ filter, sections }) => (
            <View key={filter} style={styles.pager} collapsable={false}>
              <CustomerSectionList
                sections={sections}
                onPressCustomer={openCustomer}
                refreshing={status === 'syncing'}
                onRefresh={refresh}
                emptyMessage={emptyMessage}
              />
            </View>
          ))}
        </AnimatedPagerView>
      )}

      <Fab icon="add" accessibilityLabel="Add customer" onPress={openNewCustomer} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  tabs: {
    flex: 1,
  },
  pager: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    ...typography.body,
    color: colors.textMuted,
  },
  syncError: {
    ...typography.label,
    color: colors.danger,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
});

export default CustomerListScreen;
