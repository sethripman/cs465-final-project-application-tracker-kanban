import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

const applicationStatusSchema = z.enum([
  "SAVED",
  "APPLIED",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
]);

const createApplicationSchema = z.object({
  company: z.string().trim().min(1, "Company is required"),
  roleTitle: z.string().trim().min(1, "Role title is required"),
  location: z.string().trim().optional().or(z.literal("")),
  url: z.url("Must be a valid URL").optional().or(z.literal("")),
  salaryRange: z.string().trim().optional().or(z.literal("")),
  status: applicationStatusSchema.default("SAVED"),
  appliedDate: z.iso.datetime().optional().or(z.literal("")),
  notes: z.string().trim().optional().or(z.literal("")),
  position: z.number().int().min(0).optional(),
});

const updateApplicationSchema = z
  .object({
    company: z.string().trim().min(1).optional(),
    roleTitle: z.string().trim().min(1).optional(),
    location: z.string().trim().optional().or(z.literal("")),
    url: z.url("Must be a valid URL").optional().or(z.literal("")),
    salaryRange: z.string().trim().optional().or(z.literal("")),
    status: applicationStatusSchema.optional(),
    appliedDate: z.iso.datetime().optional().or(z.literal("")),
    notes: z.string().trim().optional().or(z.literal("")),
    position: z.number().int().min(0).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

function normalizeOptionalString(value?: string): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === "") return null;
  return value;
}

function normalizeOptionalDate(value?: string): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === "") return null;
  return new Date(value);
}

router.use(requireAuth);

router.get("/", async (req, res) => {
  try {
    const userId = req.user!.userId;

    const applications = await prisma.application.findMany({
      where: { userId },
      orderBy: [
        { status: "asc" },
        { position: "asc" },
        { createdAt: "desc" },
      ],
    });

    res.json({ applications });
  } catch (error) {
    console.error("GET_APPLICATIONS_ERROR", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const result = createApplicationSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        error: "Invalid input",
        details: result.error.flatten(),
      });
      return;
    }

    const userId = req.user!.userId;
    const data = result.data;

    let position = data.position;

    if (position === undefined) {
      const countInStatus = await prisma.application.count({
        where: {
          userId,
          status: data.status,
        },
      });

      position = countInStatus;
    }

    const application = await prisma.application.create({
      data: {
        userId,
        company: data.company,
        roleTitle: data.roleTitle,
        location: normalizeOptionalString(data.location),
        url: normalizeOptionalString(data.url),
        salaryRange: normalizeOptionalString(data.salaryRange),
        status: data.status,
        appliedDate: normalizeOptionalDate(data.appliedDate),
        notes: normalizeOptionalString(data.notes),
        position,
      },
    });

    res.status(201).json({ application });
  } catch (error) {
    console.error("CREATE_APPLICATION_ERROR", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const paramsSchema = z.object({
      id: z.cuid(),
    });

    const paramsResult = paramsSchema.safeParse(req.params);

    if (!paramsResult.success) {
      res.status(400).json({ error: "Invalid application id" });
      return;
    }

    const bodyResult = updateApplicationSchema.safeParse(req.body);

    if (!bodyResult.success) {
      res.status(400).json({
        error: "Invalid input",
        details: bodyResult.error.flatten(),
      });
      return;
    }

    const { id } = paramsResult.data;
    const userId = req.user!.userId;
    const updates = bodyResult.data;

    const existingApplication = await prisma.application.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingApplication) {
      res.status(404).json({ error: "Application not found" });
      return;
    }

    const updatedApplication = await prisma.application.update({
      where: { id },
      data: {
        company: updates.company,
        roleTitle: updates.roleTitle,
        location: normalizeOptionalString(updates.location),
        url: normalizeOptionalString(updates.url),
        salaryRange: normalizeOptionalString(updates.salaryRange),
        status: updates.status,
        appliedDate: normalizeOptionalDate(updates.appliedDate),
        notes: normalizeOptionalString(updates.notes),
        position: updates.position,
      },
    });

    res.json({ application: updatedApplication });
  } catch (error) {
    console.error("UPDATE_APPLICATION_ERROR", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const paramsSchema = z.object({
      id: z.cuid(),
    });

    const paramsResult = paramsSchema.safeParse(req.params);

    if (!paramsResult.success) {
      res.status(400).json({ error: "Invalid application id" });
      return;
    }

    const { id } = paramsResult.data;
    const userId = req.user!.userId;

    const existingApplication = await prisma.application.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingApplication) {
      res.status(404).json({ error: "Application not found" });
      return;
    }

    await prisma.application.delete({
      where: { id },
    });

    res.json({ message: "Application deleted successfully" });
  } catch (error) {
    console.error("DELETE_APPLICATION_ERROR", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;