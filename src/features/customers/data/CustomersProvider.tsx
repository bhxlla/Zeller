import { useMemo, type PropsWithChildren } from 'react';

import { CustomersContext, type CustomersDependencies } from './CustomersContext';

type CustomersProviderProps = PropsWithChildren<CustomersDependencies>;

/** Supplies the customers feature's storage and API to every screen and hook below it. */
function CustomersProvider({ repository, fetchPage, children }: CustomersProviderProps) {
  const dependencies = useMemo(() => ({ repository, fetchPage }), [repository, fetchPage]);

  return <CustomersContext.Provider value={dependencies}>{children}</CustomersContext.Provider>;
}

export default CustomersProvider;
