/**
 * Unit tests for compression utilities
 * 
 * Tests compression, decompression, and error handling for backup data.
 */

import { describe, it, expect } from 'vitest';
import { compressData, decompressData, getCompressionRatio } from './compression';

describe('compressData', () => {
  it('should compress string data', async () => {
    const data = 'Hello, World!';
    const compressed = await compressData(data);
    
    expect(Buffer.isBuffer(compressed)).toBe(true);
    expect(compressed.length).toBeGreaterThan(0);
  });

  it('should compress Buffer data', async () => {
    const data = Buffer.from('Hello, World!', 'utf-8');
    const compressed = await compressData(data);
    
    expect(Buffer.isBuffer(compressed)).toBe(true);
    expect(compressed.length).toBeGreaterThan(0);
  });

  it('should compress large JSON data', async () => {
    const largeData = JSON.stringify({
      tables: Array(1000).fill(null).map((_, i) => ({
        id: i,
        name: `Table ${i}`,
        data: 'Some data that repeats and should compress well',
      })),
    });
    
    const compressed = await compressData(largeData);
    
    expect(Buffer.isBuffer(compressed)).toBe(true);
    expect(compressed.length).toBeLessThan(Buffer.byteLength(largeData));
  });

  it('should compress empty string', async () => {
    const data = '';
    const compressed = await compressData(data);
    
    expect(Buffer.isBuffer(compressed)).toBe(true);
    expect(compressed.length).toBeGreaterThan(0); // gzip header is present
  });

  it('should handle compression errors gracefully', async () => {
    // Pass invalid input to trigger error
    const invalidData = null as any;
    
    await expect(compressData(invalidData)).rejects.toThrow('Failed to compress data');
  });
});

describe('decompressData', () => {
  it('should decompress compressed data', async () => {
    const originalData = 'Hello, World!';
    const compressed = await compressData(originalData);
    const decompressed = await decompressData(compressed);
    
    expect(decompressed.toString('utf-8')).toBe(originalData);
  });

  it('should decompress large JSON data', async () => {
    const originalData = JSON.stringify({
      tables: Array(100).fill(null).map((_, i) => ({
        id: i,
        name: `Table ${i}`,
        data: 'Some data',
      })),
    });
    
    const compressed = await compressData(originalData);
    const decompressed = await decompressData(compressed);
    
    expect(decompressed.toString('utf-8')).toBe(originalData);
    expect(JSON.parse(decompressed.toString('utf-8'))).toEqual(JSON.parse(originalData));
  });

  it('should handle empty compressed data', async () => {
    const originalData = '';
    const compressed = await compressData(originalData);
    const decompressed = await decompressData(compressed);
    
    expect(decompressed.toString('utf-8')).toBe(originalData);
  });

  it('should throw error for invalid compressed data', async () => {
    const invalidData = Buffer.from('not gzip data', 'utf-8');
    
    await expect(decompressData(invalidData)).rejects.toThrow('Failed to decompress data');
  });

  it('should throw error for non-Buffer input', async () => {
    const invalidData = 'not a buffer' as any;
    
    await expect(decompressData(invalidData)).rejects.toThrow('Input must be a Buffer');
  });

  it('should throw error for corrupted gzip data', async () => {
    // Create a valid gzip header but corrupt the data
    const validCompressed = await compressData('test data');
    const corrupted = Buffer.concat([
      validCompressed.slice(0, 10),
      Buffer.from('corrupted'),
      validCompressed.slice(-5),
    ]);
    
    await expect(decompressData(corrupted)).rejects.toThrow('Failed to decompress data');
  });
});

describe('round-trip compression', () => {
  it('should preserve data through compress-decompress cycle', async () => {
    const testCases = [
      'Simple string',
      'String with special characters: áéíóú ñ ç',
      JSON.stringify({ key: 'value', nested: { array: [1, 2, 3] } }),
      'A'.repeat(10000), // Large repetitive data
      '{"unicode":"🎉🎊🎈"}', // Unicode characters
    ];

    for (const testData of testCases) {
      const compressed = await compressData(testData);
      const decompressed = await decompressData(compressed);
      
      expect(decompressed.toString('utf-8')).toBe(testData);
    }
  });

  it('should preserve binary data', async () => {
    const binaryData = Buffer.from([0, 1, 2, 3, 255, 254, 253]);
    const compressed = await compressData(binaryData);
    const decompressed = await decompressData(compressed);
    
    expect(Buffer.compare(decompressed, binaryData)).toBe(0);
  });
});

describe('getCompressionRatio', () => {
  it('should calculate compression ratio correctly', () => {
    expect(getCompressionRatio(1000, 300)).toBe(70); // 70% reduction
    expect(getCompressionRatio(1000, 500)).toBe(50); // 50% reduction
    expect(getCompressionRatio(1000, 900)).toBe(10); // 10% reduction
  });

  it('should return 0 for zero original size', () => {
    expect(getCompressionRatio(0, 0)).toBe(0);
    expect(getCompressionRatio(0, 100)).toBe(0);
  });

  it('should return 0 for no compression', () => {
    expect(getCompressionRatio(1000, 1000)).toBe(0);
  });

  it('should handle negative compression (expansion)', () => {
    // When compressed size is larger than original
    expect(getCompressionRatio(100, 150)).toBe(0); // Clamped to 0
  });

  it('should clamp ratio to 100% maximum', () => {
    expect(getCompressionRatio(1000, 0)).toBe(100);
  });
});

describe('compression effectiveness', () => {
  it('should achieve compression on repetitive data', async () => {
    const repetitiveData = 'A'.repeat(10000);
    const compressed = await compressData(repetitiveData);
    
    const originalSize = Buffer.byteLength(repetitiveData);
    const compressedSize = compressed.length;
    
    expect(compressedSize).toBeLessThan(originalSize);
    
    const ratio = getCompressionRatio(originalSize, compressedSize);
    expect(ratio).toBeGreaterThan(90); // Should achieve >90% compression on repetitive data
  });

  it('should achieve compression on JSON data', async () => {
    const jsonData = JSON.stringify({
      tables: Array(100).fill(null).map((_, i) => ({
        id: i,
        name: `Table ${i}`,
        description: 'This is a description that repeats',
        data: Array(10).fill('repeated value'),
      })),
    });
    
    const compressed = await compressData(jsonData);
    
    const originalSize = Buffer.byteLength(jsonData);
    const compressedSize = compressed.length;
    
    expect(compressedSize).toBeLessThan(originalSize);
    
    const ratio = getCompressionRatio(originalSize, compressedSize);
    expect(ratio).toBeGreaterThan(50); // Should achieve >50% compression on structured JSON
  });

  it('should handle random data with minimal compression', async () => {
    // Random data doesn't compress well
    const randomData = Buffer.from(
      Array(1000).fill(null).map(() => Math.floor(Math.random() * 256))
    );
    
    const compressed = await compressData(randomData);
    
    // Random data might not compress much, but should not fail
    expect(Buffer.isBuffer(compressed)).toBe(true);
  });
});
