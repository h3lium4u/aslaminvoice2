import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CreateStatementSchema } from '@/lib/validations';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const financialYear = searchParams.get('financialYear');
    const sort = searchParams.get('sort') || 'recent';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = {};

    if (financialYear) where.financialYear = financialYear;

    if (search) {
      where.OR = [
        { statementNumber: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerGstin: { contains: search, mode: 'insensitive' } },
        { customerAddress: { contains: search, mode: 'insensitive' } },
        {
          items: {
            some: {
              OR: [
                { description: { contains: search, mode: 'insensitive' } },
                { hsnSac: { contains: search, mode: 'insensitive' } },
                { details: { contains: search, mode: 'insensitive' } },
              ],
            },
          },
        },
      ];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'oldest') {
      orderBy = { createdAt: 'asc' };
    } else if (sort === 'updated') {
      orderBy = { updatedAt: 'desc' };
    } else if (sort === 'statement_num') {
      orderBy = { statementNumber: 'asc' };
    }

    const [statements, total] = await Promise.all([
      prisma.statement.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          _count: { select: { items: true } },
        },
      }),
      prisma.statement.count({ where }),
    ]);

    return NextResponse.json({
      data: statements,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('GET /api/statements error:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const finalInvoiceNumber = statementNumber || `INV-${Date.now().toString().slice(-6)}`;
    const parsedInvoiceDate = invoiceDate ? new Date(invoiceDate) : new Date();

    // 18% Total GST (9% CGST + 9% SGST)
    const totalTaxableValue = items.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
    const cgstAmount = Math.round(totalTaxableValue * 0.09 * 100) / 100;
    const sgstAmount = Math.round(totalTaxableValue * 0.09 * 100) / 100;
    const grandTotal = Math.round((totalTaxableValue + cgstAmount + sgstAmount) * 100) / 100;

    const statement = await prisma.statement.create({
      data: {
        statementNumber: finalInvoiceNumber,
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
        status: 'saved',
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

    return NextResponse.json({ data: statement }, { status: 201 });
  } catch (error) {
    console.error('POST /api/statements error:', error);
    return NextResponse.json({ error: 'Failed to create tax invoice' }, { status: 500 });
  }
}
