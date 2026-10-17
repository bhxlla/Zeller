import { render, screen } from '@testing-library/react-native';

import App from '@/app/App';

// Sanity check for the Jest + RNTL setup. Replace once real screens exist.
describe('App', () => {
  it('renders', async () => {
    await render(<App />);

    expect(screen.getByText(/open up app\.tsx/i)).toBeOnTheScreen();
  });
});
