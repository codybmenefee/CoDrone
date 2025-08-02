/**
 * File Management API Route
 *
 * List, delete, and manage uploaded files
 */

import { NextRequest, NextResponse } from 'next/server';
import { readdir, stat, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './data/storage';

export async function GET(req: NextRequest) {
  try {
    if (!existsSync(UPLOAD_DIR)) {
      return NextResponse.json({
        files: [],
        totalFiles: 0,
        totalSize: 0,
      });
    }

    const files = await readdir(UPLOAD_DIR);
    const fileDetails = [];

    for (const filename of files) {
      try {
        const filepath = join(UPLOAD_DIR, filename);
        const stats = await stat(filepath);

        if (stats.isFile()) {
          // Parse filename to extract metadata
          const parts = filename.split('_');
          let originalName = filename;
          let uploadTime = stats.mtime.toISOString();

          if (parts.length >= 3) {
            originalName = parts.slice(2).join('_');
            uploadTime = parts[0].replace(/-/g, ':');
          }

          // Determine file type
          const extension = filename
            .toLowerCase()
            .slice(filename.lastIndexOf('.'));
          let fileType: 'dsm' | 'orthomosaic' | 'pointcloud' | 'image' =
            'image';

          if (extension === '.tif' || extension === '.tiff') {
            fileType = filename.toLowerCase().includes('dsm')
              ? 'dsm'
              : 'orthomosaic';
          } else if (['.laz', '.las', '.ply'].includes(extension)) {
            fileType = 'pointcloud';
          }

          fileDetails.push({
            filename: originalName,
            filepath: filepath,
            safeFilename: filename,
            size: stats.size,
            type: fileType,
            uploadTime: uploadTime,
            lastModified: stats.mtime.toISOString(),
            metadata: {
              extension: extension,
              isReadable: true,
            },
          });
        }
      } catch (fileError) {
        console.warn(`Error processing file ${filename}:`, fileError);
      }
    }

    // Sort by upload time (newest first)
    fileDetails.sort(
      (a, b) =>
        new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime()
    );

    return NextResponse.json(
      {
        files: fileDetails,
        totalFiles: fileDetails.length,
        totalSize: fileDetails.reduce((sum, file) => sum + file.size, 0),
      },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  } catch (error) {
    console.error('File listing error:', error);

    return NextResponse.json(
      {
        error: 'Failed to list files',
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

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json(
        { error: 'Filename parameter required' },
        { status: 400 }
      );
    }

    const filepath = join(UPLOAD_DIR, filename);

    if (!existsSync(filepath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    await unlink(filepath);

    return NextResponse.json(
      {
        success: true,
        message: `File ${filename} deleted successfully`,
        filename: filename,
      },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('File deletion error:', error);

    return NextResponse.json(
      {
        error: 'File deletion failed',
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
      'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
