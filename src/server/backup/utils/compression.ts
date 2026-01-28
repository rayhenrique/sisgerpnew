/**
 * Compression utilities for backup module
 * 
 * Provides gzip compression and decompression functions for backup data.
 * Uses Node.js built-in zlib module for compression operations.
 * 
 * Requirements: 1.8, 15.4
 */

import { gzip, gunzip } from 'zlib';
import { promisify } from 'util';

// Promisify zlib functions for async/await usage
const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);

/**
 * Compress data using gzip compression
 * 
 * @param data - Buffer or string to compress
 * @returns Promise resolving to compressed Buffer
 * @throws Error if compression fails
 * 
 * @example
 * const data = JSON.stringify({ tables: [...] });
 * const compressed = await compressData(data);
 */
export async function compressData(data: Buffer | string): Promise<Buffer> {
  try {
    // Convert string to Buffer if needed
    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf-8');
    
    // Compress using gzip
    const compressed = await gzipAsync(buffer);
    
    return compressed;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to compress data: ${message}`);
  }
}

/**
 * Decompress gzip-compressed data
 * 
 * @param compressedData - Compressed Buffer to decompress
 * @returns Promise resolving to decompressed Buffer
 * @throws Error if decompression fails
 * 
 * @example
 * const decompressed = await decompressData(compressedBuffer);
 * const data = JSON.parse(decompressed.toString('utf-8'));
 */
export async function decompressData(compressedData: Buffer): Promise<Buffer> {
  try {
    // Validate input is a Buffer
    if (!Buffer.isBuffer(compressedData)) {
      throw new Error('Input must be a Buffer');
    }
    
    // Decompress using gunzip
    const decompressed = await gunzipAsync(compressedData);
    
    return decompressed;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to decompress data: ${message}`);
  }
}

/**
 * Get compression ratio as a percentage
 * 
 * @param originalSize - Original data size in bytes
 * @param compressedSize - Compressed data size in bytes
 * @returns Compression ratio as percentage (0-100)
 * 
 * @example
 * const ratio = getCompressionRatio(1000, 300); // Returns 70 (70% reduction)
 */
export function getCompressionRatio(originalSize: number, compressedSize: number): number {
  if (originalSize === 0) {
    return 0;
  }
  
  const ratio = ((originalSize - compressedSize) / originalSize) * 100;
  return Math.max(0, Math.min(100, ratio)); // Clamp between 0 and 100
}
