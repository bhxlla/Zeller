import { useCallback, useEffect, useMemo, useState } from 'react';

import { toError } from '@/shared/utils/toError';

import type { Role } from '../domain/customer';
import {
  EMPTY_CUSTOMER_FORM,
  toFormValues,
  toNewCustomer,
  validateCustomerForm,
  type CustomerFormErrors,
  type CustomerFormField,
  type CustomerFormValues,
} from '../domain/customerForm';
import { useCustomerRepository } from './useCustomerRepository';

/**
 * `loading`: fetching the customer to edit. `notFound`: it no longer exists.
 * `Error`: the last save or delete failed; the form stays editable so the user can retry.
 */
export type CustomerFormStatus = 'loading' | 'ready' | 'saving' | 'notFound' | Error;

type TextField = Exclude<CustomerFormField, 'role'>;

type TextFieldHandlers = {
  onChangeText: (text: string) => void;
  onBlur: () => void;
};

const TEXT_FIELDS: readonly TextField[] = ['firstName', 'lastName', 'email'];

/**
 * State and actions for creating (no `customerId`) or editing a customer. Errors show for a
 * field once it has been left, and for every field once save has been attempted.
 */
export function useCustomerForm(customerId?: string) {
  const repository = useCustomerRepository();
  const [values, setValues] = useState<CustomerFormValues>(EMPTY_CUSTOMER_FORM);
  const [status, setStatus] = useState<CustomerFormStatus>(customerId ? 'loading' : 'ready');
  const [touched, setTouched] = useState<ReadonlySet<CustomerFormField>>(new Set());
  const [saveAttempted, setSaveAttempted] = useState(false);

  useEffect(() => {
    if (!customerId) return;
    let cancelled = false;

    repository.getById(customerId).then(
      (customer) => {
        if (cancelled) return;
        if (customer) {
          setValues(toFormValues(customer));
          setStatus('ready');
        } else {
          setStatus('notFound');
        }
      },
      (error: unknown) => {
        if (!cancelled) setStatus(toError(error));
      },
    );

    return () => {
      cancelled = true;
    };
  }, [customerId, repository]);

  const errors = useMemo(() => {
    const all = validateCustomerForm(values);
    if (saveAttempted) return all;
    const visible: CustomerFormErrors = {};
    for (const field of touched) {
      if (all[field]) visible[field] = all[field];
    }
    return visible;
  }, [values, touched, saveAttempted]);

  // One stable pair of handlers per text field, so the screen passes no inline functions.
  const textFieldHandlers = useMemo(() => {
    const handlers = {} as Record<TextField, TextFieldHandlers>;
    for (const field of TEXT_FIELDS) {
      handlers[field] = {
        onChangeText: (text) => setValues((previous) => ({ ...previous, [field]: text })),
        onBlur: () =>
          setTouched((previous) => (previous.has(field) ? previous : new Set(previous).add(field))),
      };
    }
    return handlers;
  }, []);

  const setRole = useCallback((role: Role) => {
    setValues((previous) => ({ ...previous, role }));
  }, []);

  /** Saves the customer. Resolves `true` when saved, `false` if invalid or the save failed. */
  const save = useCallback(async (): Promise<boolean> => {
    setSaveAttempted(true);
    const customer = toNewCustomer(values);
    if (!customer) return false;

    setStatus('saving');
    try {
      if (customerId) await repository.update(customerId, customer);
      else await repository.create(customer);
      return true;
    } catch (error) {
      setStatus(toError(error));
      return false;
    }
  }, [values, customerId, repository]);

  /** Deletes the customer being edited. Resolves `true` when deleted. */
  const remove = useCallback(async (): Promise<boolean> => {
    if (!customerId) return false;
    setStatus('saving');
    try {
      await repository.remove(customerId);
      return true;
    } catch (error) {
      setStatus(toError(error));
      return false;
    }
  }, [customerId, repository]);

  return {
    isEditing: Boolean(customerId),
    values,
    errors,
    status,
    textFieldHandlers,
    setRole,
    save,
    remove,
  };
}
