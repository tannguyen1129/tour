import Voucher from '../../models/Voucher.js';

const voucherResolvers = {
  Query: {
   vouchers: async () => {
  return await Voucher.find().sort({ createdAt: -1 }); 
},
    voucher: async (_, { id }) => await Voucher.findById(id),
  },

  Mutation: {
    createVoucher: async (_, args, { user }) => {
      const voucher = new Voucher({
        ...args,
        createdBy: user?.id,
        updatedBy: user?.id,
      });
      return await voucher.save();
    },

    updateVoucher: async (_, { id, ...updateFields }, { user }) => {
      const voucher = await Voucher.findById(id);
      if (!voucher) throw new Error('Voucher not found');
      Object.assign(voucher, updateFields, { updatedBy: user?.id });
      return await voucher.save();
    },

    deleteVoucher: async (_, { id }) => {
      const res = await Voucher.findByIdAndDelete(id);
      return !!res;
    },
  },
};

export default voucherResolvers;
