import { z } from "zod";

export const StatementItemSchema = z.object({
  sNo: z.number().optional(),
  description: z.string().min(1, "Description is required"),
  hsnSac: z.string().optional(),
  details: z.string().optional(),
  amount: z
    .number({ message: "Amount must be a number" })
    .min(0, "Amount cannot be negative"),

  // Legacy field support (optional)
  daNumber: z.string().optional(),
  entryDate: z.string().optional(),
  partNumber: z.string().optional(),
  despatches: z.string().optional(),
  openingStock: z.number().optional(),
  closingStock: z.number().optional(),
});

export const CreateStatementSchema = z.object({
  statementNumber: z.string().optional(),
  invoiceDate: z.string().min(1, "Invoice date is required"),
  financialYear: z.string().min(1, "Financial year is required"),
  
  customerName: z.string().min(1, "Customer name is required"),
  customerAddress: z.string().min(1, "Customer address is required"),
  customerGstin: z.string().optional(),

  industryName: z.string().optional(),
  vendorName: z.string().optional(),
  vendorCode: z.string().optional(),
  month: z.number().optional(),
  year: z.number().optional(),

  items: z
    .array(StatementItemSchema)
    .min(1, "At least one service/item entry is required"),
});

export type CreateStatementInput = z.infer<typeof CreateStatementSchema>;
export type StatementItemInput = z.infer<typeof StatementItemSchema>;
