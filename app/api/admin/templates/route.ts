import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';

// Import schema objects dynamically since they are .js files
const desktopSchema = require('@/app/lib/schema').desktopSchema;
const mobileSchema = require('@/app/lib/schema').mobileSchema;
const categoryDesktopSchema = require('@/app/lib/categorySchema').categoryDesktopSchema;
const categoryMobileSchema = require('@/app/lib/categorySchema').categoryMobileSchema;
const heroSchema = require('@/app/lib/heroSchema').heroSchema;
const heroInfoSchema = require('@/app/lib/heroSchema').heroInfoSchema;
const heroInfoMobileSchema = require('@/app/lib/heroSchema').heroInfoMobileSchema;
const articlePageDesktopSchema = require('@/app/lib/articlePageSchema').articlePageDesktopSchema;
const articlePageMobileSchema = require('@/app/lib/articlePageSchema').articlePageMobileSchema;

export interface TemplateSchema {
  id: number;
  template_id: string;
  name: string;
  description: string;
  schema_json: any;
  created_at: string;
  updated_at: string;
}

// Function to ensure the table exists
async function ensureTableExists() {
  try {
    // Try to create the table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS template_schemas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        template_id VARCHAR(100) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        schema_json JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_template_id (template_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await executeQuery(createTableQuery);
  } catch (error) {
    console.error('Error ensuring table exists:', error);
    throw error;
  }
}

// GET - Fetch all templates
export async function GET(request: NextRequest) {
  try {
    // First, try to create the table if it doesn't exist
    await ensureTableExists();

    const query = `
      SELECT id, template_id, name, description, schema_json, created_at, updated_at
      FROM template_schemas
      ORDER BY template_id
    `;

    const [templates] = await executeQuery<TemplateSchema>(query);

    return NextResponse.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

// POST - Create or update a template
export async function POST(request: NextRequest) {
  try {
    // First, ensure the table exists
    await ensureTableExists();

    const body = await request.json();
    const { template_id, name, description, schema_json } = body;

    if (!template_id || !name || !schema_json) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: template_id, name, schema_json' },
        { status: 400 }
      );
    }

    // Check if template exists
    const checkQuery = 'SELECT id FROM template_schemas WHERE template_id = ?';
    const [existing] = await executeQuery<{ id: number }>(checkQuery, [template_id]);

    if (existing.length > 0) {
      // Update existing template
      const updateQuery = `
        UPDATE template_schemas 
        SET name = ?, description = ?, schema_json = ?, updated_at = CURRENT_TIMESTAMP
        WHERE template_id = ?
      `;
      
      await executeQuery(updateQuery, [name, description, JSON.stringify(schema_json), template_id]);
      
      return NextResponse.json({
        success: true,
        message: 'Template updated successfully',
        data: { template_id, name, description, schema_json }
      });
    } else {
      // Create new template
      const insertQuery = `
        INSERT INTO template_schemas (template_id, name, description, schema_json)
        VALUES (?, ?, ?, ?)
      `;
      
      await executeQuery(insertQuery, [template_id, name, description, JSON.stringify(schema_json)]);
      
      return NextResponse.json({
        success: true,
        message: 'Template created successfully',
        data: { template_id, name, description, schema_json }
      });
    }
  } catch (error) {
    console.error('Error saving template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save template' },
      { status: 500 }
    );
  }
}

