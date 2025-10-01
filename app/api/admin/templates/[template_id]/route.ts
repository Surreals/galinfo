import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/app/lib/db';

export interface TemplateSchema {
  id: number;
  template_id: string;
  name: string;
  description: string;
  schema_json: any;
  created_at: string;
  updated_at: string;
}

// GET - Fetch specific template by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { template_id: string } }
) {
  try {
    const { template_id } = params;

    const query = `
      SELECT id, template_id, name, description, schema_json, created_at, updated_at
      FROM template_schemas
      WHERE template_id = ?
    `;

    const [templates] = await executeQuery<TemplateSchema>(query, [template_id]);

    if (templates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: templates[0],
    });
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}

// PUT - Update specific template
export async function PUT(
  request: NextRequest,
  { params }: { params: { template_id: string } }
) {
  try {
    const { template_id } = params;
    const body = await request.json();
    const { name, description, schema_json } = body;

    if (!name || !schema_json) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, schema_json' },
        { status: 400 }
      );
    }

    const updateQuery = `
      UPDATE template_schemas 
      SET name = ?, description = ?, schema_json = ?, updated_at = CURRENT_TIMESTAMP
      WHERE template_id = ?
    `;

    const [result] = await executeQuery(updateQuery, [
      name, 
      description || '', 
      JSON.stringify(schema_json), 
      template_id
    ]);

    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Template updated successfully',
      data: { template_id, name, description, schema_json }
    });
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update template' },
      { status: 500 }
    );
  }
}

// DELETE - Delete specific template
export async function DELETE(
  request: NextRequest,
  { params }: { params: { template_id: string } }
) {
  try {
    const { template_id } = params;

    const deleteQuery = 'DELETE FROM template_schemas WHERE template_id = ?';
    const [result] = await executeQuery(deleteQuery, [template_id]);

    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}

