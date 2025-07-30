import { useMutation } from '@apollo/client';
import { CREATE_BOOKING } from '../graphql/mutations';

export default function useBooking() {
  const [createBooking, { loading, error, data }] = useMutation(CREATE_BOOKING);

  const bookTour = async (input) => {
    const response = await createBooking({ variables: { input } });
    return response.data.createBooking;
  };

  return {
    bookTour,
    loading,
    error,
    data
  };
}
