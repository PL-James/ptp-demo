import { Batch } from '@pharmaledgerassoc/ptp-toolkit/shared';

describe('Batches', () => {
  it('creates a batch for the product', async () => {
    const batchNumber = Math.random().toString(36).replace('.', '').toUpperCase().slice(5);
    const productCode = '00000000000017';
    const date = new Date();
    const toCreate = new Batch({
      id: `${productCode}:${batchNumber}`,
      productCode,
      batchNumber: batchNumber,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      createdAt: date,
      updatedAt: date,
    });
    expect(toCreate).toBeDefined();
    expect(toCreate.hasErrors()).toBeUndefined();
    expect(batchNumber).toEqual(toCreate.batchNumber);
  });
});
