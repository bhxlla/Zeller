import { fireEvent, screen, userEvent, waitFor } from '@testing-library/react-native';
import { Alert, type AlertButton } from 'react-native';

import type { ApiZellerCustomer } from '@/features/customers/api/listZellerCustomers';

import { renderApp } from '../../../support/renderApp';

const ann: ApiZellerCustomer = {
  id: '1',
  name: 'Ann Lee',
  email: 'ann@example.com',
  role: 'Admin',
};
const bob: ApiZellerCustomer = { id: '2', name: 'Bob Stone', email: null, role: 'Manager' };

/** Answers the next native confirm dialog by pressing the button with this text. */
function answerNextAlert(buttonText: string) {
  jest.spyOn(Alert, 'alert').mockImplementationOnce((_title, _message, buttons?: AlertButton[]) => {
    buttons?.find((button) => button.text === buttonText)?.onPress?.();
  });
}

async function openCustomer(user: ReturnType<typeof userEvent.setup>, name: string) {
  await user.press(await screen.findByText(name));
  await screen.findByText('Edit User');
}

describe('CustomerFormScreen', () => {
  afterEach(() => jest.restoreAllMocks());

  describe('creating', () => {
    it('shows what is missing when saving an empty form, and stays open', async () => {
      const user = userEvent.setup();
      await renderApp();

      await user.press(screen.getByLabelText('Add customer'));
      await user.press(await screen.findByRole('button', { name: 'Create User' }));

      expect(screen.getByText('Required')).toBeOnTheScreen();
      expect(screen.getByText('Choose a role')).toBeOnTheScreen();
      expect(screen.getByText('New User')).toBeOnTheScreen();
    });

    it('shows a field error once the field is left', async () => {
      const user = userEvent.setup();
      await renderApp();

      await user.press(screen.getByLabelText('Add customer'));
      await user.type(await screen.findByLabelText('First Name'), 'Zoe2');
      await user.type(screen.getByLabelText('Email'), 'not-an-email');

      expect(screen.getByText('Only letters and spaces are allowed')).toBeOnTheScreen();
      expect(screen.getByText('Enter a valid email address')).toBeOnTheScreen();
      // Untouched fields stay quiet until save.
      expect(screen.queryByText('Choose a role')).not.toBeOnTheScreen();
    });

    it('adds the customer to the list under its role', async () => {
      const user = userEvent.setup();
      await renderApp({ server: [bob] });

      await user.press(screen.getByLabelText('Add customer'));
      await user.type(await screen.findByLabelText('First Name'), 'Zoe');
      await user.type(screen.getByLabelText('Last Name'), 'Park');
      await user.press(screen.getByRole('tab', { name: 'Admin' }));
      await user.press(screen.getByRole('button', { name: 'Create User' }));

      expect(await screen.findByText('Zoe Park')).toBeOnTheScreen();

      await user.press(screen.getByRole('tab', { name: 'Admin' }));
      expect(screen.getByText('Zoe Park')).toBeOnTheScreen();
      expect(screen.queryByText('Bob Stone')).not.toBeOnTheScreen();
    });

    it('discards the form when closed', async () => {
      const user = userEvent.setup();
      await renderApp({ server: [bob] });

      await user.press(screen.getByLabelText('Add customer'));
      await user.type(await screen.findByLabelText('First Name'), 'Zoe');
      await user.press(screen.getByLabelText('Close'));

      expect(await screen.findByText('Bob Stone')).toBeOnTheScreen();
      expect(screen.queryByText('Zoe')).not.toBeOnTheScreen();
    });

    it('keeps a customer created offline once the server list arrives', async () => {
      const user = userEvent.setup();
      const { fetchPage } = await renderApp({ server: new Error('Network down') });
      await screen.findByRole('alert');

      await user.press(screen.getByLabelText('Add customer'));
      await user.type(await screen.findByLabelText('First Name'), 'Zoe');
      await user.press(screen.getByRole('tab', { name: 'Admin' }));
      await user.press(screen.getByRole('button', { name: 'Create User' }));
      expect(await screen.findByText('Zoe')).toBeOnTheScreen();

      // Back online: the server's list doesn't include Zoe.
      fetchPage.mockResolvedValueOnce({ items: [bob], nextToken: null });
      await fireEvent(screen.getByTestId('customer-list'), 'refresh');

      expect(await screen.findByText('Bob Stone')).toBeOnTheScreen();
      expect(screen.getByText('Zoe')).toBeOnTheScreen();
      expect(screen.queryByRole('alert')).not.toBeOnTheScreen();
    });
  });

  describe('editing', () => {
    it('opens with the customer filled in', async () => {
      const user = userEvent.setup();
      await renderApp({ server: [ann] });

      await openCustomer(user, 'Ann Lee');

      expect(screen.getByLabelText('First Name')).toHaveDisplayValue('Ann');
      expect(screen.getByLabelText('Last Name')).toHaveDisplayValue('Lee');
      expect(screen.getByLabelText('Email')).toHaveDisplayValue('ann@example.com');
      expect(screen.getByRole('tab', { name: 'Admin' })).toBeSelected();
    });

    it('saves changes back to the list', async () => {
      const user = userEvent.setup();
      await renderApp({ server: [ann, bob] });

      await openCustomer(user, 'Ann Lee');
      await user.clear(screen.getByLabelText('Last Name'));
      await user.type(screen.getByLabelText('Last Name'), 'Smith');
      await user.press(screen.getByRole('tab', { name: 'Manager' }));
      await user.press(screen.getByRole('button', { name: 'Save Changes' }));

      expect(await screen.findByText('Ann Smith')).toBeOnTheScreen();
      expect(screen.queryByText('Ann Lee')).not.toBeOnTheScreen();

      await user.press(screen.getByRole('tab', { name: 'Manager' }));
      expect(screen.getByText('Ann Smith')).toBeOnTheScreen();
    });

    it('keeps local edits when the server sends the old version again', async () => {
      const user = userEvent.setup();
      const { fetchPage } = await renderApp({ server: [ann] });

      await openCustomer(user, 'Ann Lee');
      await user.clear(screen.getByLabelText('Last Name'));
      await user.type(screen.getByLabelText('Last Name'), 'Smith');
      await user.press(screen.getByRole('button', { name: 'Save Changes' }));
      await screen.findByText('Ann Smith');

      // Pull to refresh: the server still has "Ann Lee".
      await fireEvent(screen.getByTestId('customer-list'), 'refresh');
      expect(fetchPage).toHaveBeenCalledTimes(2);
      expect(await screen.findByText('Ann Smith')).toBeOnTheScreen();
      expect(screen.queryByText('Ann Lee')).not.toBeOnTheScreen();
    });
  });

  describe('deleting', () => {
    it('removes the customer after confirming', async () => {
      const user = userEvent.setup();
      await renderApp({ server: [ann, bob] });

      await openCustomer(user, 'Ann Lee');
      answerNextAlert('Delete');
      await user.press(screen.getByRole('button', { name: 'Delete User' }));

      expect(await screen.findByText('Bob Stone')).toBeOnTheScreen();
      await waitFor(() => expect(screen.queryByText('Ann Lee')).not.toBeOnTheScreen());
    });

    it('keeps the customer when cancelled', async () => {
      const user = userEvent.setup();
      await renderApp({ server: [ann] });

      await openCustomer(user, 'Ann Lee');
      answerNextAlert('Cancel');
      await user.press(screen.getByRole('button', { name: 'Delete User' }));

      expect(screen.getByText('Edit User')).toBeOnTheScreen();
      await user.press(screen.getByLabelText('Close'));
      expect(await screen.findByText('Ann Lee')).toBeOnTheScreen();
    });
  });
});
