import { SQLiteProvider, type SQLiteOpenOptions } from 'expo-sqlite';
import type { PropsWithChildren } from 'react';

import { migrate } from './migrations';

const DATABASE_NAME = 'zeller.db';

// The change listener lets queries re-run when rows change.
const options: SQLiteOpenOptions = { enableChangeListener: true };

/** Opens the database and runs migrations before rendering children. */
function DatabaseProvider({ children }: PropsWithChildren) {
  return (
    <SQLiteProvider databaseName={DATABASE_NAME} onInit={migrate} options={options}>
      {children}
    </SQLiteProvider>
  );
}

export default DatabaseProvider;
