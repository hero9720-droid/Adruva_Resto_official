'use client';

import { forwardRef } from 'react';

interface ReceiptProps {
  bill: any;
  outlet: any;
}

const ThermalReceipt = forwardRef<HTMLDivElement, ReceiptProps>(({ bill, outlet }, ref) => {
  if (!bill) return null;

  return (
    <div ref={ref} className="w-[80mm] p-4 bg-white text-black font-mono text-sm print:block hidden">
      <div className="text-center border-b border-dashed pb-4 mb-4">
        <h2 className="text-lg font-bold uppercase">{outlet?.name || 'ADRUVA RESTO'}</h2>
        <p className="text-xs">{outlet?.address || '123 Main St, City'}</p>
        <p className="text-xs">GSTIN: {outlet?.gstin || 'NOT PROVIDED'}</p>
        <p className="text-xs">Tel: {outlet?.phone || '000-000-0000'}</p>
      </div>

      <div className="flex justify-between mb-4 text-xs">
        <div>
          <p>Bill: {bill.bill_number}</p>
          <p>Date: {new Date(bill.created_at).toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p>Staff: {bill.staff_name || 'Cashier'}</p>
        </div>
      </div>

      <div className="border-b border-dashed mb-4 pb-2">
        <div className="flex justify-between font-bold mb-1">
          <span className="w-1/2">Item</span>
          <span className="w-1/4 text-center">Qty</span>
          <span className="w-1/4 text-right">Amt</span>
        </div>
        {(bill.items || bill.orders?.flatMap((o: any) => o.items))?.map((item: any, idx: number) => (
          <div key={idx} className="flex justify-between py-1 text-xs">
            <span className="w-1/2 truncate">{item.menu_item_name || item.name}</span>
            <span className="w-1/4 text-center">{item.quantity}</span>
            <span className="w-1/4 text-right">₹{(item.total_paise / 100).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="space-y-1 text-xs mb-4">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>₹{(bill.subtotal_paise / 100).toFixed(2)}</span>
        </div>
        {bill.tax_paise > 0 && (
          <div className="flex justify-between">
            <span>Tax (GST)</span>
            <span>₹{(bill.tax_paise / 100).toFixed(2)}</span>
          </div>
        )}
        {bill.discount_paise > 0 && (
          <div className="flex justify-between text-red-600">
            <span>Discount</span>
            <span>-₹{(bill.discount_paise / 100).toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-lg border-t border-dashed pt-2 mt-2">
          <span>GRAND TOTAL</span>
          <span>₹{(bill.total_paise / 100).toFixed(2)}</span>
        </div>
      </div>

      <div className="text-center text-xs mt-8 italic border-t border-dashed pt-4">
        <p>Thank you for visiting!</p>
        <p>Powered by AdruvaResto</p>
      </div>
    </div>
  );
});

ThermalReceipt.displayName = 'ThermalReceipt';

export default ThermalReceipt;
