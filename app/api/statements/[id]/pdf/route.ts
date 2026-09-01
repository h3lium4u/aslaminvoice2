import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pdf } from '@react-pdf/renderer';
import { StockStatementDocument } from '@/lib/pdf-generator';
import { Statement } from '@/types';

export const runtime = 'nodejs';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const statement = await prisma.statement.findUnique({
      where: { id },
      include: {
        items: { orderBy: { serialNumber: 'asc' } },
      },
    });

    if (!statement) {
      return NextResponse.json({ error: 'Tax Invoice not found' }, { status: 404 });
    }

    const formattedStatement: Statement = {
      ...statement,
      invoiceDate: statement.invoiceDate ? statement.invoiceDate.toISOString() : undefined,
      totalTaxableValue: Number(statement.totalTaxableValue),
      cgstAmount: Number(statement.cgstAmount),
      sgstAmount: Number(statement.sgstAmount),
      grandTotal: Number(statement.grandTotal),
      createdAt: statement.createdAt.toISOString(),
      updatedAt: statement.updatedAt.toISOString(),
      items: statement.items.map((item) => ({
        ...item,
        amount: Number(item.amount),
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      })),
    };

    const generatedAt = new Date();
    const pdfBlob = await pdf(
      StockStatementDocument({ statement: formattedStatement, generatedAt })
    ).toBlob();

    const buffer = Buffer.from(await pdfBlob.arrayBuffer());
    const filename = `${statement.statementNumber}.pdf`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('GET /api/statements/[id]/pdf error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
