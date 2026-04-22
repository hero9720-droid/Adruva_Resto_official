'use client';

import { forwardRef } from 'react';

interface ReceiptProps {
  bill: any;
  outlet: any;
  type?: 'bill' | 'kot';
}

const ThermalReceipt = forwardRef<HTMLDivElement, ReceiptProps>(({ bill, outlet, type = 'bill' }, ref) => {
  if (!bill) return null;

  return (
    <div ref={ref} className="w-[80mm] p-4 bg-white text-black font-mono text-sm print:block hidden">
      <div className="text-center border-b-2 border-black pb-4 mb-4">
        <h2 className="text-xl font-black uppercase tracking-tighter">{outlet?.name || 'ADRUVA RESTO'}</h2>
        {type === 'bill' && (
          <>
            <p className="text-[10px] font-bold">{outlet?.address || '123 Main St, City'}</p>
            <p className="text-[10px] font-bold">GSTIN: {outlet?.gstin || '27AAICA1234A1Z5'}</p>
          </>
        )}
        <div className="mt-2 bg-black text-white py-1 px-3 inline-block font-black text-sm rounded-sm">
           {type === 'kot' ? 'KITCHEN TICKET' : 'TAX INVOICE'}
        </div>
      </div>

      <div className="flex justify-between mb-4 text-[11px] font-bold">
        <div>
          <p>{type === 'kot' ? 'KOT' : 'BILL'}: {bill.bill_number}</p>
          <p>TABLE: <span className="text-lg font-black">{bill.table_name || 'Counter'}</span></p>
        </div>
        <div className="text-right">
           <p>{new Date().toLocaleDateString()}</p>
           <p>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </div>

      <div className="border-b border-dashed mb-4 pb-2">
        <div className="flex justify-between font-bold mb-1">
          <span className="w-1/2">Item</span>
          <span className="w-1/4 text-center">Qty</span>
          <span className="w-1/4 text-right">Amt</span>
        </div>
        {(bill.items || bill.orders?.flatMap((o: any) => o.items))?.map((item: any, idx: number) => (
          <div key={idx} className="flex justify-between py-1.5 text-xs font-bold items-start">
            <span className="flex-1 leading-tight">{item.menu_item_name || item.name}</span>
            <span className="w-12 text-center text-sm font-black">x{item.quantity}</span>
            {type === 'bill' && (
              <span className="w-20 text-right font-black">₹{(item.total_paise / 100).toFixed(2)}</span>
            )}
          </div>
        ))}
      </div>

      {type === 'bill' && (
        <div className="space-y-1.5 text-xs mb-6 font-bold">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{(bill.subtotal_paise / 100).toFixed(2)}</span>
          </div>
          {bill.tax_paise > 0 && (
            <div className="flex justify-between">
              <span>GST (Inclusive)</span>
              <span>₹{(bill.tax_paise / 100).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-black text-xl border-t-2 border-black pt-3 mt-3">
            <span>GRAND TOTAL</span>
            <span>₹{(bill.total_paise / 100).toFixed(2)}</span>
          </div>
        </div>
      )}

      {type === 'kot' && (
        <div className="mt-4 p-2 border-2 border-black text-center font-black text-xs">
           TIME: {new Date().toLocaleTimeString()}
        </div>
      )}

      <div className="text-center mt-6 space-y-4">
        {type === 'bill' && (
          <div className="flex flex-col items-center gap-2">
             <div className="w-24 h-24 border-2 border-black p-1">
                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-[10px] text-center font-bold">QR FOR FEEDBACK</div>
             </div>
             <p className="text-[10px] font-black uppercase">Scan to get digital copy</p>
          </div>
        )}
        <div className="italic text-[10px] font-bold border-t border-dashed pt-4">
          <p>Thank you for dining with us!</p>
          <p>Powered by AdruvaResto Elite</p>
        </div>
      </div>
    </div>
  );
});

ThermalReceipt.displayName = 'ThermalReceipt';

export default ThermalReceipt;
