import { NextRequest, NextResponse } from 'next/server';
import { existsSync, accessSync, constants } from 'fs';
import { join } from 'path';

/**
 * Diagnostic endpoint to check media storage configuration
 * Access at: /api/admin/check-storage
 */
export async function GET(request: NextRequest) {
  try {
    const mediaPath = process.env.MEDIA_STORAGE_PATH;
    const publicMediaUrl = process.env.NEXT_PUBLIC_MEDIA_URL;
    const projectPublicPath = join(process.cwd(), 'public', 'media');

    const diagnostics = {
      environment: {
        MEDIA_STORAGE_PATH: mediaPath || '(not set)',
        NEXT_PUBLIC_MEDIA_URL: publicMediaUrl || '/media (default)',
        NODE_ENV: process.env.NODE_ENV,
      },
      paths: {
        externalPath: mediaPath || 'Not configured',
        projectPath: projectPublicPath,
        usingExternal: !!mediaPath,
      },
      checks: {
        externalPathExists: false,
        externalPathWritable: false,
        projectPathExists: false,
        projectPathWritable: false,
      },
      recommendations: [] as string[],
    };

    // Check external path
    if (mediaPath) {
      try {
        diagnostics.checks.externalPathExists = existsSync(mediaPath);
        if (diagnostics.checks.externalPathExists) {
          try {
            accessSync(mediaPath, constants.W_OK);
            diagnostics.checks.externalPathWritable = true;
          } catch {
            diagnostics.checks.externalPathWritable = false;
            diagnostics.recommendations.push(
              `External path exists but is not writable. Grant write permissions to: ${mediaPath}`
            );
          }
        } else {
          diagnostics.recommendations.push(
            `External path does not exist. Create it with: mkdir ${mediaPath}`
          );
        }
      } catch (error) {
        diagnostics.recommendations.push(
          `Error checking external path: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    } else {
      diagnostics.recommendations.push(
        'MEDIA_STORAGE_PATH is not set. Files will be saved to project directory (public/media).'
      );
      diagnostics.recommendations.push(
        'To use external storage, add MEDIA_STORAGE_PATH to your .env.local file'
      );
    }

    // Check project path
    try {
      diagnostics.checks.projectPathExists = existsSync(projectPublicPath);
      if (diagnostics.checks.projectPathExists) {
        try {
          accessSync(projectPublicPath, constants.W_OK);
          diagnostics.checks.projectPathWritable = true;
        } catch {
          diagnostics.checks.projectPathWritable = false;
        }
      }
    } catch (error) {
      // Ignore project path errors if using external storage
    }

    // Add status
    const isConfiguredCorrectly = mediaPath 
      ? diagnostics.checks.externalPathExists && diagnostics.checks.externalPathWritable
      : diagnostics.checks.projectPathWritable;

    return NextResponse.json({
      success: true,
      status: isConfiguredCorrectly ? 'OK' : 'NEEDS_ATTENTION',
      message: isConfiguredCorrectly 
        ? 'Media storage is configured correctly' 
        : 'Media storage needs configuration',
      diagnostics,
    });

  } catch (error) {
    console.error('Error checking storage:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to check storage configuration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

