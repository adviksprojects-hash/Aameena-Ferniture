"use server";

import { db } from "../lib/prisma.js";
import { revalidatePath } from "next/cache";

/**
 * Fetch all employees from database
 */
export async function getEmployees() {
  try {
    const employees = await db.employee.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: employees };
  } catch (error) {
    console.error("Error fetching employees:", error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Add a new employee
 */
export async function createEmployee(data) {
  try {
    const { name, email, phone, department, roleTitle } = data;
    if (!name || !email || !department || !roleTitle) {
      return { success: false, error: "Name, email, department, and designation are required." };
    }

    const created = await db.employee.create({
      data: {
        name,
        email,
        phone: phone || null,
        department,
        roleTitle,
        status: "ACTIVE",
      },
    });

    revalidatePath("/admin/employees");
    return { success: true, data: created };
  } catch (error) {
    console.error("Error creating employee:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetch job postings
 */
export async function getJobPostings(activeOnly = false) {
  try {
    const where = activeOnly ? { isActive: true } : {};
    const jobs = await db.jobPosting.findMany({
      where,
      include: {
        applications: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: jobs };
  } catch (error) {
    console.error("Error in getJobPostings:", error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Create a new job opening (Admin)
 */
export async function createJobPosting(data) {
  try {
    const {
      title,
      department = "Carpentry & Woodcraft",
      location = "Bandra West, Mumbai",
      type = "Full Time",
      experience = "3+ Years",
      salaryRange = "₹45,000 - ₹65,000 / month",
      description = "",
      requirements = [],
    } = data;

    if (!title) {
      return { success: false, error: "Job title is required." };
    }

    const created = await db.jobPosting.create({
      data: {
        title,
        department,
        location,
        type,
        experience,
        salaryRange,
        description,
        requirements,
        isActive: true,
      },
    });

    revalidatePath("/careers");
    revalidatePath("/admin/employees");

    return { success: true, data: created };
  } catch (error) {
    console.error("Error creating job posting:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Toggle job opening active/inactive status (Admin)
 */
export async function toggleJobStatus(jobId, currentStatus) {
  try {
    const updated = await db.jobPosting.update({
      where: { id: jobId },
      data: { isActive: !currentStatus },
    });

    revalidatePath("/careers");
    revalidatePath("/admin/employees");

    return { success: true, data: updated };
  } catch (error) {
    console.error("Error toggling job status:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a job opening (Admin)
 */
export async function deleteJobPosting(jobId) {
  try {
    await db.jobPosting.delete({
      where: { id: jobId },
    });

    revalidatePath("/careers");
    revalidatePath("/admin/employees");

    return { success: true };
  } catch (error) {
    console.error("Error deleting job posting:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Submit candidate job application (Public User on /careers)
 */
export async function applyForJob(data) {
  try {
    const {
      jobId,
      fullName,
      email,
      phone,
      experience,
      portfolioUrl,
      coverNotes,
    } = data;

    if (!fullName || !phone || !email || !jobId) {
      return { success: false, error: "Full Name, Phone, and Email are required." };
    }

    const application = await db.jobApplication.create({
      data: {
        jobId,
        fullName,
        email,
        phone,
        experience: experience || "Not specified",
        portfolioUrl: portfolioUrl || null,
        coverNotes: coverNotes || null,
        status: "PENDING",
      },
      include: {
        job: true,
      },
    });

    // Generate HR WhatsApp notification link
    const hrPhone = "919876500001";
    const msg = `Hello Aameena Furniture HR, I have applied for the position "${application.job?.title}" via your Careers Portal.
- Applicant Name: ${fullName}
- Phone: ${phone}
- Experience: ${experience || "Experienced"}
Looking forward to discussing this opportunity.`;

    const whatsappUrl = `https://wa.me/${hrPhone}?text=${encodeURIComponent(msg)}`;

    revalidatePath("/admin/employees");

    return { success: true, data: application, whatsappUrl };
  } catch (error) {
    console.error("Error submitting job application:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetch candidate applications (Admin)
 */
export async function getJobApplications(jobId = null) {
  try {
    const where = jobId ? { jobId } : {};
    const applications = await db.jobApplication.findMany({
      where,
      include: {
        job: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: applications };
  } catch (error) {
    console.error("Error fetching applications:", error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Update candidate application status (Admin)
 */
export async function updateApplicationStatus(applicationId, status) {
  try {
    const updated = await db.jobApplication.update({
      where: { id: applicationId },
      data: { status },
    });

    revalidatePath("/admin/employees");
    return { success: true, data: updated };
  } catch (error) {
    console.error("Error updating application status:", error);
    return { success: false, error: error.message };
  }
}
