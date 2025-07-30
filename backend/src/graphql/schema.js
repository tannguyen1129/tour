import authTypeDefs from './typeDefs/auth.js';
import tourTypeDefs from './typeDefs/tour.js';
import bookingTypeDefs from './typeDefs/booking.js';
import voucherTypeDefs from './typeDefs/voucher.js';
import reviewTypeDefs from './typeDefs/review.js';
import logTypeDefs from './typeDefs/log.js';
import categoryTypeDefs from './typeDefs/category.js';  // ✅ Thêm
import paymentTypeDefs from './typeDefs/payment.js';


import authResolvers from './resolvers/auth.js';
import tourResolvers from './resolvers/tour.js';
import bookingResolvers from './resolvers/booking.js';
import voucherResolvers from './resolvers/voucher.js';
import reviewResolvers from './resolvers/review.js';
import logResolvers from './resolvers/log.js';
import categoryResolvers from './resolvers/category.js'; // ✅ Thêm
import paymentResolvers from './resolvers/payment.js';

import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge';

export const typeDefs = mergeTypeDefs([
  authTypeDefs,
  tourTypeDefs,
  bookingTypeDefs,
  voucherTypeDefs,
  reviewTypeDefs,
  logTypeDefs,
  categoryTypeDefs,
  paymentTypeDefs 
]);

export const resolvers = mergeResolvers([
  authResolvers,
  tourResolvers,
  bookingResolvers,
  voucherResolvers,
  reviewResolvers,
  logResolvers,
  categoryResolvers,
  paymentResolvers
]);
