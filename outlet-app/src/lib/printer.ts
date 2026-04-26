/**
 * ESC/POS Printer Service using Web Serial API
 * Advanced Spooler with Graphical Support and Queuing
 */

export interface PrintJob {
  id: string;
  type: 'kot' | 'bill' | 'custom';
  data: Uint8Array | any;
  status: 'pending' | 'printing' | 'failed' | 'completed';
  timestamp: number;
}

export class PrinterService {
  private port: any | null = null;
  private writer: any | null = null;
  private queue: PrintJob[] = [];
  private isProcessing = false;

  async connect() {
    try {
      // @ts-ignore
      this.port = await navigator.serial.requestPort();
      await this.port.open({ baudRate: 9600 });
      this.writer = this.port.writable.getWriter();
      console.log('Printer connected via Serial');
      return true;
    } catch (err) {
      console.error('Failed to connect to printer:', err);
      return false;
    }
  }

  async disconnect() {
    if (this.writer) {
      await this.writer.releaseLock();
      this.writer = null;
    }
    if (this.port) {
      await this.port.close();
      this.port = null;
    }
  }

  /**
   * Core print method - called by the spooler
   */
  private async writeRaw(data: Uint8Array) {
    if (!this.writer) {
      const connected = await this.connect();
      if (!connected) throw new Error('Printer not connected');
    }
    await this.writer.write(data);
  }

  /**
   * Adds a job to the spooler queue
   */
  async enqueue(type: 'kot' | 'bill' | 'custom', data: any) {
    const job: PrintJob = {
      id: Math.random().toString(36).substring(7),
      type,
      data,
      status: 'pending',
      timestamp: Date.now()
    };
    this.queue.push(job);
    if (!this.isProcessing) {
      this.processQueue();
    }
    return job.id;
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const job = this.queue[0];
      job.status = 'printing';
      try {
        if (job.type === 'kot') {
          await this.generateAndPrintKOT(job.data);
        } else if (job.type === 'bill') {
          await this.generateAndPrintBill(job.data);
        } else {
          await this.writeRaw(job.data);
        }
        job.status = 'completed';
      } catch (err) {
        console.error('Print Job Failed:', err);
        job.status = 'failed';
      } finally {
        this.queue.shift();
      }
    }

    this.isProcessing = false;
  }

  // Common ESC/POS Commands
  static COMMANDS = {
    INIT: new Uint8Array([0x1b, 0x40]),
    FEED_CUT: new Uint8Array([0x1d, 0x56, 0x42, 0x00]),
    ALIGN_CENTER: new Uint8Array([0x1b, 0x61, 0x01]),
    ALIGN_LEFT: new Uint8Array([0x1b, 0x61, 0x00]),
    ALIGN_RIGHT: new Uint8Array([0x1b, 0x61, 0x02]),
    BOLD_ON: new Uint8Array([0x1b, 0x45, 0x01]),
    BOLD_OFF: new Uint8Array([0x1b, 0x45, 0x00]),
    TEXT_LARGE: new Uint8Array([0x1b, 0x21, 0x30]),
    TEXT_NORMAL: new Uint8Array([0x1b, 0x21, 0x00]),
  };

  /**
   * Prints KOT (Kitchen Order Ticket)
   */
  private async generateAndPrintKOT(order: any) {
    const encoder = new TextEncoder();
    const chunks: Uint8Array[] = [];

    chunks.push(PrinterService.COMMANDS.INIT);
    chunks.push(PrinterService.COMMANDS.ALIGN_CENTER);
    chunks.push(PrinterService.COMMANDS.TEXT_LARGE);
    chunks.push(encoder.encode(`KOT: #${order.order_number || 'NEW'}\n`));
    chunks.push(PrinterService.COMMANDS.TEXT_NORMAL);
    chunks.push(encoder.encode(`Table: ${order.table_name || 'N/A'}\n`));
    chunks.push(encoder.encode(`Time: ${new Date().toLocaleTimeString()}\n`));
    chunks.push(encoder.encode('--------------------------------\n\n'));

    chunks.push(PrinterService.COMMANDS.ALIGN_LEFT);
    chunks.push(PrinterService.COMMANDS.BOLD_ON);
    chunks.push(encoder.encode('QTY  ITEM\n'));
    chunks.push(PrinterService.COMMANDS.BOLD_OFF);
    
    order.items.forEach((item: any) => {
      const qty = item.quantity.toString().padEnd(5);
      const name = item.menu_item_name || item.name || 'Item';
      chunks.push(encoder.encode(`${qty}${name}\n`));
      
      // Render Modifiers
      if (item.modifiers_json || item.modifiers) {
        const mods = item.modifiers_json || item.modifiers;
        Object.values(mods).flat().forEach((mod: any) => {
          chunks.push(encoder.encode(`     + ${mod.name}\n`));
        });
      }

      if (item.notes) {
        chunks.push(encoder.encode(`     * NOTE: ${item.notes}\n`));
      }
    });

    chunks.push(encoder.encode('\n--------------------------------\n'));
    chunks.push(new Uint8Array([0x0a, 0x0a, 0x0a, 0x0a, 0x0a])); 
    chunks.push(PrinterService.COMMANDS.FEED_CUT);

    await this.writeRaw(this.combineChunks(chunks));
  }

  /**
   * Prints a Customer Bill / Receipt
   */
  private async generateAndPrintBill(data: { bill: any, outlet: any }) {
    const { bill, outlet } = data;
    const encoder = new TextEncoder();
    const chunks: Uint8Array[] = [];

    chunks.push(PrinterService.COMMANDS.INIT);
    
    // Logo (if available)
    if (outlet.logo_url) {
      try {
        const logoData = await this.getImageBitmask(outlet.logo_url);
        chunks.push(PrinterService.COMMANDS.ALIGN_CENTER);
        chunks.push(logoData);
      } catch (e) {
        console.warn('Logo printing failed, skipping:', e);
      }
    }

    // Header
    chunks.push(PrinterService.COMMANDS.ALIGN_CENTER);
    chunks.push(PrinterService.COMMANDS.BOLD_ON);
    chunks.push(PrinterService.COMMANDS.TEXT_LARGE);
    chunks.push(encoder.encode(`${outlet.name || 'Adruva Resto'}\n`));
    chunks.push(PrinterService.COMMANDS.TEXT_NORMAL);
    chunks.push(PrinterService.COMMANDS.BOLD_OFF);
    chunks.push(encoder.encode(`${outlet.address || ''}\n`));
    chunks.push(encoder.encode(`Ph: ${outlet.phone || ''}\n`));
    if (outlet.gstin) chunks.push(encoder.encode(`GSTIN: ${outlet.gstin}\n`));
    chunks.push(encoder.encode('--------------------------------\n'));

    // Bill Info
    chunks.push(PrinterService.COMMANDS.ALIGN_LEFT);
    chunks.push(encoder.encode(`Bill #: ${bill.bill_number}\n`));
    chunks.push(encoder.encode(`Date  : ${new Date(bill.created_at).toLocaleString()}\n`));
    chunks.push(encoder.encode(`Table : ${bill.table_name || 'N/A'}\n`));
    chunks.push(encoder.encode('--------------------------------\n'));

    // Items
    chunks.push(encoder.encode('ITEM            QTY   PRICE   TOTAL\n'));
    bill.items?.forEach((item: any) => {
      const name = (item.item_name || item.name || 'Item').substring(0, 15).padEnd(16);
      const qty = item.quantity.toString().padStart(3);
      const price = (item.unit_price_paise / 100).toFixed(0).padStart(7);
      const total = (item.total_paise / 100).toFixed(0).padStart(7);
      chunks.push(encoder.encode(`${name}${qty}${price}${total}\n`));
    });

    chunks.push(encoder.encode('--------------------------------\n'));

    // Totals
    chunks.push(PrinterService.COMMANDS.ALIGN_RIGHT);
    chunks.push(encoder.encode(`Subtotal:  ₹${(bill.subtotal_paise / 100).toFixed(2)}\n`));
    if (bill.discount_paise > 0) chunks.push(encoder.encode(`Discount: -₹${(bill.discount_paise / 100).toFixed(2)}\n`));
    if (bill.gst_5_paise > 0) chunks.push(encoder.encode(`GST (5%):  ₹${(bill.gst_5_paise / 100).toFixed(2)}\n`));
    chunks.push(PrinterService.COMMANDS.BOLD_ON);
    chunks.push(encoder.encode(`GRAND TOTAL: ₹${(bill.total_paise / 100).toFixed(2)}\n`));
    chunks.push(PrinterService.COMMANDS.BOLD_OFF);
    chunks.push(encoder.encode('--------------------------------\n'));

    // Footer
    chunks.push(PrinterService.COMMANDS.ALIGN_CENTER);
    chunks.push(encoder.encode('Thank You! Visit Again\n'));
    chunks.push(encoder.encode('Powered by Adruva Resto\n'));
    
    chunks.push(new Uint8Array([0x0a, 0x0a, 0x0a, 0x0a, 0x0a])); 
    chunks.push(PrinterService.COMMANDS.FEED_CUT);

    await this.writeRaw(this.combineChunks(chunks));
  }

  private async getImageBitmask(url: string): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('No canvas context');

        const width = 200;
        const scale = width / img.width;
        const height = img.height * scale;
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        const imageData = ctx.getImageData(0, 0, width, height);
        const pixels = imageData.data;
        
        const widthBytes = Math.ceil(width / 8);
        const bitmask = new Uint8Array(8 + (widthBytes * height));
        
        bitmask[0] = 0x1d;
        bitmask[1] = 0x76;
        bitmask[2] = 0x30;
        bitmask[3] = 0x00; 
        bitmask[4] = widthBytes % 256;
        bitmask[5] = Math.floor(widthBytes / 256);
        bitmask[6] = height % 256;
        bitmask[7] = Math.floor(height / 256);
        
        let pos = 8;
        for (let y = 0; y < height; y++) {
          for (let xb = 0; xb < widthBytes; xb++) {
            let byte = 0;
            for (let bit = 0; bit < 8; bit++) {
              const x = (xb * 8) + bit;
              if (x < width) {
                const idx = (y * width + x) * 4;
                const r = pixels[idx];
                const g = pixels[idx + 1];
                const b = pixels[idx + 2];
                const avg = (r + g + b) / 3;
                if (avg < 128) {
                  byte |= (1 << (7 - bit));
                }
              }
            }
            bitmask[pos++] = byte;
          }
        }
        resolve(bitmask);
      };
      img.onerror = () => reject('Image load failed');
      img.src = url;
    });
  }

  private combineChunks(chunks: Uint8Array[]): Uint8Array {
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const combined = new Uint8Array(totalLength);
    let offset = 0;
    chunks.forEach(chunk => {
      combined.set(chunk, offset);
      offset += chunk.length;
    });
    return combined;
  }
}

export const printer = new PrinterService();
