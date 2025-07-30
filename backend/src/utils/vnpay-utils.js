import crypto from 'crypto';
import qs from 'qs';

export const sortObject = (obj) => {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  for (const key of keys) {
    sorted[key] = obj[key];
  }
  return sorted;
};

export const createVNPayUrl = (payment, booking, clientIp) => {
  const tmnCode = process.env.VNPAY_TMNCODE;
  const hashSecret = process.env.VNPAY_HASH_SECRET;
  const vnpUrl = process.env.VNPAY_URL;
  const returnUrl = process.env.VNPAY_RETURN_URL;

  let vnp_Params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: tmnCode,
    vnp_Amount: payment.amount * 100,
    vnp_CurrCode: 'VND',
    vnp_TxnRef: payment._id.toString(),
    vnp_OrderInfo: `Thanh toan booking ${booking._id}`,
    vnp_Locale: 'vn',
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: clientIp,
    vnp_CreateDate: new Date().toISOString().replace(/[-T:\.Z]/g, '').slice(0, 14)
  };

  vnp_Params = sortObject(vnp_Params);
  const signData = qs.stringify(vnp_Params, { encode: false });

  console.log('🔹 VNPay Params before hash:', vnp_Params);
  console.log('🔹 String to hash:', signData);

  const hmac = crypto.createHmac('sha512', hashSecret);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  console.log('🔹 Generated SecureHash:', signed);

  vnp_Params.vnp_SecureHash = signed;

  const payUrl = `${vnpUrl}?${qs.stringify(vnp_Params, { encode: true })}`;
  console.log('🔹 Final VNPay URL:', payUrl);

  return payUrl;
};


export const verifyVNPayChecksum = (params, secureHash) => {
  const hashSecret = process.env.VNPAY_HASH_SECRET;
  const cleanParams = { ...params };
  delete cleanParams.vnp_SecureHash;
  delete cleanParams.vnp_SecureHashType;

  const sortedParams = sortObject(cleanParams);
  const signData = qs.stringify(sortedParams, { encode: false });

  console.log('🔹 VNPay verify - Params:', sortedParams);
  console.log('🔹 VNPay verify - String to hash:', signData);

  const hmac = crypto.createHmac('sha512', hashSecret);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  console.log('🔹 VNPay verify - Generated hash:', signed);
  console.log('🔹 VNPay verify - Provided hash:', secureHash);

  return signed === secureHash;
};

