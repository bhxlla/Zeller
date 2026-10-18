import { fireEvent, screen, userEvent } from '@testing-library/react-native';

import type { ApiZellerCustomer } from '@/features/customers/api/listZellerCustomers';
import type { Customer } from '@/features/customers/domain/customer';

import { renderApp } from '../../../support/renderApp';

const ann: ApiZellerCustomer = { id: '1', name: 'Ann Lee', email: null, role: 'Admin' };
const bob: ApiZellerCustomer = { id: '2', name: 'Bob Stone', email: null, role: 'Manager' };
const cara: ApiZellerCustomer = { id: '3', name: 'Cara Diaz', email: null, role: 'Admin' };

const saved: Customer = { id: '9', name: 'Saved Sam', email: null, role: 'Manager' };

describe('CustomerListScreen', () => {
  it('shows customers from the server, grouped by initial', async () => {
    await renderApp({ server: [bob, ann] });

    expect(await screen.findByText('Ann Lee')).toBeOnTheScreen();
    expect(screen.getByText('Bob Stone')).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: 'A' })).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: 'B' })).toBeOnTheScreen();
  });

  it('keeps showing saved customers when the sync fails', async () => {
    await renderApp({ stored: [saved], server: new Error('Network down') });

    expect(await screen.findByRole('alert')).toHaveTextContent(
      "Couldn't refresh. Showing saved customers.",
    );
    expect(screen.getByText('Saved Sam')).toBeOnTheScreen();
  });

  it('clears the error when pull to refresh succeeds', async () => {
    const { fetchPage } = await renderApp({ stored: [saved], server: new Error('Network down') });
    await screen.findByRole('alert');

    fetchPage.mockResolvedValueOnce({ items: [ann], nextToken: null });
    await fireEvent(screen.getByTestId('customer-list'), 'refresh');

    expect(await screen.findByText('Ann Lee')).toBeOnTheScreen();
    expect(screen.queryByRole('alert')).not.toBeOnTheScreen();
  });

  it('shows only the selected role on each tab', async () => {
    const user = userEvent.setup();
    await renderApp({ server: [ann, bob, cara] });
    await screen.findByText('Ann Lee');

    await user.press(screen.getByRole('tab', { name: 'Admin' }));
    expect(screen.getByRole('tab', { name: 'Admin' })).toBeSelected();
    expect(screen.getByText('Ann Lee')).toBeOnTheScreen();
    expect(screen.getByText('Cara Diaz')).toBeOnTheScreen();
    expect(screen.queryByText('Bob Stone')).not.toBeOnTheScreen();

    await user.press(screen.getByRole('tab', { name: 'Manager' }));
    expect(screen.getByText('Bob Stone')).toBeOnTheScreen();
    expect(screen.queryByText('Ann Lee')).not.toBeOnTheScreen();
  });

  it('filters by name while searching, and shows everyone again when search closes', async () => {
    const user = userEvent.setup();
    await renderApp({ server: [ann, bob, cara] });
    await screen.findByText('Ann Lee');

    await user.press(screen.getByLabelText('Search customers'));
    await user.type(screen.getByLabelText('Search by name'), 'dia');

    expect(await screen.findByText('Cara Diaz')).toBeOnTheScreen();
    expect(screen.queryByText('Ann Lee')).not.toBeOnTheScreen();

    await user.clear(screen.getByLabelText('Search by name'));
    await user.type(screen.getByLabelText('Search by name'), 'zed');
    expect(await screen.findByText('No customers match "zed".')).toBeOnTheScreen();

    await user.press(screen.getByLabelText('Close search'));
    expect(await screen.findByText('Ann Lee')).toBeOnTheScreen();
    expect(screen.getByText('Bob Stone')).toBeOnTheScreen();
  });

  it('shows an empty state when there are no customers', async () => {
    await renderApp({ server: [] });

    expect(await screen.findByText('No customers yet.')).toBeOnTheScreen();
  });
});
