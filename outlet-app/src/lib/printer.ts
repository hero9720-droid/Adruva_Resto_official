/**
 * ESC/POS Printer Service using Web Serial API
 * Allows direct thermal printing from the browser to USB printers
 */

export class PrinterService {
  private port: any | null = null;
  private writer: any | null = null;

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

  async print(data: Uint8Array) {
    if (!this.writer) {
      const connected = await this.connect();
      if (!connected) throw new Error('Printer not connected');
    }
    await this.writer.write(data);
  }

  // Common ESC/POS Commands
  static COMMANDS = {
    INIT: new Uint8Array([0x1b, 0x40]),
    FEED_CUT: new Uint8Array([0x1d, 0x56, 0x42, 0x00]),
    ALIGN_CENTER: new Uint8Array([0x1b, 0x61, 0x01]),
    ALIGN_LEFT: new Uint8Array([0x1b, 0x61, 0x00]),
    BOLD_ON: new Uint8Array([0x1b, 0x45, 0x01]),
    BOLD_OFF: new Uint8Array([0x1b, 0x45, 0x00]),
    TEXT_LARGE: new Uint8Array([0x1b, 0x21, 0x30]),
    TEXT_NORMAL: new Uint8Array([0x1b, 0x21, 0x00]),
  };

  async printKOT(order: any) {
    const encoder = new TextEncoder();
    const chunks: Uint8Array[] = [];

    // Initialize
    chunks.push(PrinterService.COMMANDS.INIT);
    
    // Header
    chunks.push(PrinterService.COMMANDS.ALIGN_CENTER);
    chunks.push(PrinterService.COMMANDS.TEXT_LARGE);
    chunks.push(encoder.encode(`KOT: #${order.order_number || 'NEW'}\n`));
    chunks.push(PrinterService.COMMANDS.TEXT_NORMAL);
    chunks.push(encoder.encode(`Table: ${order.table_name || 'N/A'}\n`));
    chunks.push(encoder.encode(`Time: ${new Date().toLocaleTimeString()}\n`));
    chunks.push(encoder.encode('--------------------------------\n\n'));

    // Items
    chunks.push(PrinterService.COMMANDS.ALIGN_LEFT);
    chunks.push(PrinterService.COMMANDS.BOLD_ON);
    chunks.push(encoder.encode('QTY  ITEM\n'));
    chunks.push(PrinterService.COMMANDS.BOLD_OFF);
    
    order.items.forEach((item: any) => {
      const qty = item.quantity.toString().padEnd(5);
      chunks.push(encoder.encode(`${qty}${item.name}\n`));
      if (item.notes) {
        chunks.push(encoder.encode(`     * ${item.notes}\n`));
      }
    });

    chunks.push(encoder.encode('\n--------------------------------\n'));
    chunks.push(encoder.encode(`Total Items: ${order.items.length}\n`));
    
    // Footer & Cut
    chunks.push(new Uint8Array([0x0a, 0x0a, 0x0a, 0x0a, 0x0a])); // 5 line feeds
    chunks.push(PrinterService.COMMANDS.FEED_CUT);

    // Merge and Print
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const combined = new Uint8Array(totalLength);
    let offset = 0;
    chunks.forEach(chunk => {
      combined.set(chunk, offset);
      offset += chunk.length;
    });

    await this.print(combined);
  }
}

export const printer = new PrinterService();
