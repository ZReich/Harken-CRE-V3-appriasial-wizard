import { ClientListDataType } from '@/components/interface/client-list-data-type';

interface ClientOption {
  value: string | number;
  label: string;
}

/**
 * Formats client data into select options with combined first and last names
 * @param data Client data from API
 * @param includeSelectOption Whether to include a default "Select" option
 * @returns Array of options with value and label properties
 */
export const formatClientOptions = (
  data: ClientListDataType | undefined,
  includeSelectOption = true
): ClientOption[] => {
  const options = Array.isArray(data?.data?.data)
    ? data.data.data.map((client) => ({
        value: client.id,
        label: `${client.first_name} ${client.last_name}`,
      }))
    : [];

  if (includeSelectOption) {
    options.unshift({
      value: '',
      label: 'Select',
    });
  }

  return options;
};