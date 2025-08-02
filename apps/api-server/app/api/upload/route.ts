/**
 * File Upload API Route
 *
 * Handle file uploads for drone data processing
 */

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { nanoid } from 'nanoid';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const UPLOAD_DIR = process.env.UPLOAD_DIR || './data/storage';

// Ensure upload directory exists
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureUploadDir();

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const uploadResults = [];

    for (const file of files) {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            error: `File ${file.name} too large. Maximum size is ${MAX_FILE_SIZE} bytes`,
            filename: file.name,
            size: file.size,
          },
          { status: 413 }
        );
      }

      // Validate file type
      const allowedExtensions = [
        '.tif',
        '.tiff',
        '.jpg',
        '.jpeg',
        '.png',
        '.laz',
        '.las',
        '.ply',
      ];
      const fileExtension = file.name
        .toLowerCase()
        .slice(file.name.lastIndexOf('.'));

      if (!allowedExtensions.includes(fileExtension)) {
        return NextResponse.json(
          {
            error: `File type ${fileExtension} not supported`,
            filename: file.name,
            allowedTypes: allowedExtensions,
          },
          { status: 400 }
        );
      }

      // Create unique filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const uniqueId = nanoid(8);
      const safeFilename = `${timestamp}_${uniqueId}_${file.name}`;
      const filepath = join(UPLOAD_DIR, safeFilename);

      // Save file
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filepath, buffer);

      // Determine file type for metadata
      let fileType: 'dsm' | 'orthomosaic' | 'pointcloud' | 'image' = 'image';
      if (fileExtension === '.tif' || fileExtension === '.tiff') {
        fileType = file.name.toLowerCase().includes('dsm')
          ? 'dsm'
          : 'orthomosaic';
      } else if (
        fileExtension === '.laz' ||
        fileExtension === '.las' ||
        fileExtension === '.ply'
      ) {
        fileType = 'pointcloud';
      }

      uploadResults.push({
        filename: file.name,
        filepath: filepath,
        safeFilename: safeFilename,
        size: file.size,
        type: fileType,
        uploadTime: new Date().toISOString(),
        metadata: {
          originalName: file.name,
          mimeType: file.type,
          extension: fileExtension,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        files: uploadResults,
        totalFiles: uploadResults.length,
        totalSize: uploadResults.reduce((sum, file) => sum + file.size, 0),
      },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  } catch (error) {
    console.error('File upload error:', error);

    return NextResponse.json(
      {
        error: 'File upload failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
