import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CreateStatementSchema } from '@/lib/validations';

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

    return NextResponse.json({ data: statement });
  } catch (error) {
    console.error('GET /api/statements/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch tax invoice' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = CreateStatementSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      statementNumber,
      invoiceDate,
      financialYear,
      customerName,
      customerAddress,
      customerGstin,
      items,
    } = parsed.data;

    const existing = await prisma.statement.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Tax Invoice not found' }, { status: 404 });
    }

    const parsedInvoiceDate = invoiceDate ? new Date(invoiceDate) : new Date();

    // 8% Total GST (4% CGST + 4% SGST)
    const totalTaxableValue = items.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
    const cgstAmount = Math.round(totalTaxableValue * 0.04 * 100) / 100;
    const sgstAmount = Math.round(totalTaxableValue * 0.04 * 100) / 100;
    const grandTotal = Math.round((totalTaxableValue + cgstAmount + sgstAmount) * 100) / 100;

    const updated = await prisma.$transaction(async (tx) => {
      await tx.statementItem.deleteMany({ where: { statementId: id } });

      return tx.statement.update({
        where: { id },
        data: {
          statementNumber: statementNumber || existing.statementNumber,
          invoiceDate: parsedInvoiceDate,
          financialYear: financialYear || '2026 - 2027',
          customerName,
          customerAddress,
          customerGstin: customerGstin || null,
          totalTaxableValue,
          cgstAmount,
          sgstAmount,
          grandTotal,
          amountInWords: body.amountInWords || '',
          items: {
            create: items.map((item, idx) => ({
              serialNumber: idx + 1,
              description: item.description,
              hsnSac: item.hsnSac || null,
              details: item.details || null,
              amount: Number(item.amount) || 0,
            })),
          },
        },
        include: { items: { orderBy: { serialNumber: 'asc' } } },
      });
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('PUT /api/statements/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update tax invoice' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.statement.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Tax Invoice not found' }, { status: 404 });
    }

    await prisma.statement.delete({ where: { id } });

    return NextResponse.json({ message: 'Tax Invoice deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/statements/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete tax invoice' }, { status: 500 });
  }
}
