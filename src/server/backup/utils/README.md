# Backup Utilities

This directory contains utility functions for the backup module.

## compression.ts

Provides gzip compression and decompression functions for backup data using Node.js built-in `zlib` module.

### Functions

#### `compressData(data: Buffer | string): Promise<Buffer>`

Compresses data using gzip compression.

- **Parameters:**
  - `data`: Buffer or string to compress
- **Returns:** Promise resolving to compressed Buffer
- **Throws:** Error if compression fails

**Example:**
```typescript
const data = JSON.stringify({ tables: [...] });
const compressed = await compressData(data);
```

#### `decompressData(compressedData: Buffer): Promise<Buffer>`

Decompresses gzip-compressed data.

- **Parameters:**
  - `compressedData`: Compressed Buffer to decompress
- **Returns:** Promise resolving to decompressed Buffer
- **Throws:** Error if decompression fails or input is invalid

**Example:**
```typescript
const decompressed = await decompressData(compressedBuffer);
const data = JSON.parse(decompressed.toString('utf-8'));
```

#### `getCompressionRatio(originalSize: number, compressedSize: number): number`

Calculates compression ratio as a percentage.

- **Parameters:**
  - `originalSize`: Original data size in bytes
  - `compressedSize`: Compressed data size in bytes
- **Returns:** Compression ratio as percentage (0-100)

**Example:**
```typescript
const ratio = getCompressionRatio(1000, 300); // Returns 70 (70% reduction)
```

### Error Handling

All functions handle errors gracefully:
- `compressData`: Throws descriptive error if compression fails
- `decompressData`: Validates input is a Buffer and throws descriptive error if decompression fails
- Both functions wrap underlying zlib errors with user-friendly messages

### Testing

Comprehensive unit tests cover:
- String and Buffer compression
- Large JSON data compression
- Empty data handling
- Error handling for invalid inputs
- Round-trip compression (compress → decompress)
- Binary data preservation
- Compression effectiveness on different data types
- Compression ratio calculations

Run tests:
```bash
npm test -- src/server/backup/utils/compression.test.ts
```

### Requirements

Implements requirements:
- **1.8**: Compress backup data to reduce storage space
- **15.4**: Use gzip compression for backup files

## format.ts

Provides formatting functions for file sizes, dates, and durations in human-readable formats. Follows Brazilian Portuguese conventions for date formatting.

### Functions

#### `formatFileSize(bytes: number | null): string`

Formats file size in bytes to human-readable format with appropriate units.

- **Parameters:**
  - `bytes`: File size in bytes (can be null)
- **Returns:** Formatted string with size and unit (e.g., "1.50 MB")
- **Units:** B, KB, MB, GB, TB
- **Precision:** 2 decimal places (except for bytes)

**Examples:**
```typescript
formatFileSize(1024)      // Returns "1.00 KB"
formatFileSize(1572864)   // Returns "1.50 MB"
formatFileSize(null)      // Returns "-"
formatFileSize(0)         // Returns "0 B"
```

#### `formatDateTime(dateString: string | null): string`

Formats ISO date strings to Brazilian Portuguese format with date and time.

- **Parameters:**
  - `dateString`: ISO date string (e.g., "2024-01-15T10:30:00Z")
- **Returns:** Formatted date string in pt-BR format (DD/MM/YYYY HH:MM)
- **Handles:** null values, invalid dates, empty strings

**Example:**
```typescript
formatDateTime("2024-01-15T10:30:00Z") // Returns "15/01/2024 10:30"
formatDateTime(null)                    // Returns "-"
```

#### `formatDate(dateString: string | null): string`

Formats ISO date strings to Brazilian Portuguese date format (without time).

- **Parameters:**
  - `dateString`: ISO date string
- **Returns:** Formatted date string in pt-BR format (DD/MM/YYYY)

**Example:**
```typescript
formatDate("2024-01-15T10:30:00Z") // Returns "15/01/2024"
```

#### `formatTime(dateString: string | null): string`

Formats ISO date strings to time format only.

- **Parameters:**
  - `dateString`: ISO date string
- **Returns:** Formatted time string (HH:MM:SS)

**Example:**
```typescript
formatTime("2024-01-15T10:30:45Z") // Returns "10:30:45"
```

#### `formatDuration(milliseconds: number | null): string`

Formats duration in milliseconds to human-readable format with appropriate units.

- **Parameters:**
  - `milliseconds`: Duration in milliseconds
- **Returns:** Formatted duration string
- **Units:** ms, s, min, h
- **Precision:** 2 decimal places (except for milliseconds)

**Examples:**
```typescript
formatDuration(500)      // Returns "500 ms"
formatDuration(5000)     // Returns "5.00 s"
formatDuration(65000)    // Returns "1.08 min"
formatDuration(3600000)  // Returns "1.00 h"
```

### Error Handling

All formatting functions handle edge cases gracefully:
- Return "-" for null, undefined, or invalid inputs
- Return "-" for negative values (where applicable)
- Validate dates before formatting
- Handle timezone conversions automatically

### Testing

Comprehensive unit tests cover:
- File size formatting for all units (B, KB, MB, GB, TB)
- Date and time formatting in Brazilian Portuguese
- Duration formatting for all time units
- Null and invalid input handling
- Edge cases (zero values, boundaries between units)
- Negative value handling

Run tests:
```bash
npm test -- src/server/backup/utils/format.test.ts
```

### Requirements

Implements requirements:
- **3.7**: Format backup sizes in human-readable units (KB, MB, GB)
