'use client';
import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_VOUCHER } from '../graphql/mutations';

export default function CreateVoucherForm() {
  const [code, setCode] = useState('');
  const [value, setValue] = useState('');
  const [createVoucher, { loading, error }] = useMutation(CREATE_VOUCHER);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createVoucher({
      variables: {
        code,
        value: parseFloat(value)
      }
    });
    alert('Voucher created!');
    setCode('');
    setValue('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 mb-4">
      <input type="text" value={code} onChange={e => setCode(e.target.value)} placeholder="Code" className="border p-2 w-full" required />
      <input type="number" value={value} onChange={e => setValue(e.target.value)} placeholder="Value" className="border p-2 w-full" required />
      <button type="submit" disabled={loading} className="bg-green-600 text-white p-2 rounded w-full">
        {loading ? 'Creating...' : 'Create Voucher'}
      </button>
      {error && <p className="text-red-500">Error creating voucher</p>}
    </form>
  );
}
