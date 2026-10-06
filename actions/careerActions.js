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
 * Fetch job postings with expiry and capacity checks
 */
export async function getJobPostings(activeOnly = false) {
  try {
    const where = activeOnly ? { isActive: true } : {};
    let jobs = await db.jobPosting.findMany({
      where,
      include: {
        applications: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (activeOnly) {
      const now = new Date();
      jobs = jobs.filter((job) => {
        // Exclude if expired
        if (job.expiresAt && new Date(job.expiresAt) < now) return false;
        // Exclude if sufficient applications received
        if (job.maxApplications && job.applications.length >= job.maxApplications) return false;
        // Exclude if required hired number achieved
        if (job.hiredTarget && job.hiredCount >= job.hiredTarget) return false;
        return true;
      });
    }

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
      location = "Solapur Facility",
      type = "Full Time",
      experience = "3+ Years",
      salaryRange = "₹45,000 - ₹65,000 / month",
      description = "",
      requirements = [],
      expiresAt = null,
      maxApplications = 10,
      hiredTarget = 1,
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
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        maxApplications: maxApplications ? parseInt(maxApplications) : 10,
        hiredTarget: hiredTarget ? parseInt(hiredTarget) : 1,
        hiredCount: 0,
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

    // Verify job is still active and open
    const job = await db.jobPosting.findUnique({
      where: { id: jobId },
      include: { applications: true },
    });

    if (!job || !job.isActive) {
      return { success: false, error: "This position is no longer accepting applications." };
    }

    if (job.expiresAt && new Date(job.expiresAt) < new Date()) {
      return { success: false, error: "This job position has expired." };
    }

    if (job.maxApplications && job.applications.length >= job.maxApplications) {
      return { success: false, error: "Application limit for this position has been reached." };
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
        status: "ON_PROCESS",
        isArchived: false,
      },
      include: {
        job: true,
      },
    });

    // Auto-close job if maxApplications reached
    if (job.maxApplications && job.applications.length + 1 >= job.maxApplications) {
      await db.jobPosting.update({
        where: { id: jobId },
        data: { isActive: false },
      });
    }

    // Generate HR WhatsApp notification link
    const hrPhone = "918600570542";
    const msg = `Hello Aameena Furniture HR, I have applied for the position "${application.job?.title}" via your Careers Portal.
- Applicant Name: ${fullName}
- Phone: ${phone}
- Experience: ${experience || "Experienced"}
Looking forward to discussing this opportunity.`;

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${hrPhone}&text=${encodeURIComponent(msg)}`;

    revalidatePath("/admin/employees");
    revalidatePath("/careers");

    return { success: true, data: application, whatsappUrl };
  } catch (error) {
    console.error("Error submitting job application:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetch candidate applications (Admin) with archive support
 */
export async function getJobApplications(filters = {}) {
  try {
    const { jobId, includeArchived = false, archivedOnly = false } = filters;
    const where = {};
    if (jobId) where.jobId = jobId;

    if (archivedOnly) {
      where.isArchived = true;
    } else if (!includeArchived) {
      where.isArchived = false;
    }

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
 * Update candidate application status (Admin) - strictly 3 stages: ON_PROCESS, SELECTED, REJECTED
 */
export async function updateApplicationStatus(applicationId, status) {
  try {
    const validStatuses = ["ON_PROCESS", "SELECTED", "REJECTED"];
    if (!validStatuses.includes(status)) {
      return { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` };
    }

    const currentApp = await db.jobApplication.findUnique({
      where: { id: applicationId },
      include: { job: true },
    });

    if (!currentApp) {
      return { success: false, error: "Application not found" };
    }

    const updated = await db.jobApplication.update({
      where: { id: applicationId },
      data: { status },
      include: { job: true },
    });

    // If SELECTED, increment hiredCount on the job posting
    if (status === "SELECTED" && currentApp.status !== "SELECTED" && currentApp.jobId) {
      const job = await db.jobPosting.findUnique({ where: { id: currentApp.jobId } });
      if (job) {
        const nextHired = (job.hiredCount || 0) + 1;
        const autoClose = job.hiredTarget && nextHired >= job.hiredTarget;
        await db.jobPosting.update({
          where: { id: currentApp.jobId },
          data: {
            hiredCount: nextHired,
            isActive: autoClose ? false : job.isActive,
          },
        });
      }
    }

    revalidatePath("/admin/employees");
    revalidatePath("/careers");

    return { success: true, data: updated };
  } catch (error) {
    console.error("Error updating application status:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Archive a rejected candidate application
 */
export async function archiveJobApplication(applicationId) {
  try {
    const app = await db.jobApplication.findUnique({ where: { id: applicationId } });
    if (!app) return { success: false, error: "Application not found" };

    if (app.status !== "REJECTED") {
      return { success: false, error: "Only REJECTED candidates can be archived." };
    }

    const updated = await db.jobApplication.update({
      where: { id: applicationId },
      data: { isArchived: true },
    });

    revalidatePath("/admin/employees");
    return { success: true, data: updated };
  } catch (error) {
    console.error("Error archiving application:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Restore an archived candidate application
 */
export async function restoreJobApplication(applicationId) {
  try {
    const updated = await db.jobApplication.update({
      where: { id: applicationId },
      data: { isArchived: false },
    });

    revalidatePath("/admin/employees");
    return { success: true, data: updated };
  } catch (error) {
    console.error("Error restoring application:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a candidate application permanently
 */
export async function deleteJobApplication(applicationId) {
  try {
    await db.jobApplication.delete({
      where: { id: applicationId },
    });

    revalidatePath("/admin/employees");
    return { success: true };
  } catch (error) {
    console.error("Error deleting application:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Update an employee's details (Admin Only)
 */
export async function updateEmployee(id, data) {
  try {
    const { name, email, phone, department, roleTitle, status } = data;
    const updatePayload = {};
    if (name) updatePayload.name = name.trim();
    if (email) updatePayload.email = email.trim();
    if (phone !== undefined) updatePayload.phone = phone ? phone.trim() : null;
    if (department) updatePayload.department = department.trim();
    if (roleTitle) updatePayload.roleTitle = roleTitle.trim();
    if (status) updatePayload.status = status;

    const updated = await db.employee.update({
      where: { id },
      data: updatePayload,
    });

    revalidatePath("/admin/employees");
    revalidatePath("/manager/employees");
    return { success: true, data: updated };
  } catch (error) {
    console.error("Error updating employee:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete an employee from the workforce (Admin Only)
 */
export async function deleteEmployee(id) {
  try {
    await db.employee.delete({
      where: { id },
    });

    revalidatePath("/admin/employees");
    revalidatePath("/manager/employees");
    return { success: true };
  } catch (error) {
    console.error("Error deleting employee:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Update a job opening details anytime (Admin Only)
 */
export async function updateJobPosting(jobId, data) {
  try {
    const {
      title,
      department,
      location,
      type,
      experience,
      salaryRange,
      description,
      expiresAt,
      maxApplications,
      hiredTarget,
      isActive,
    } = data;

    const updatePayload = {};
    if (title !== undefined) updatePayload.title = title.trim();
    if (department !== undefined) updatePayload.department = department.trim();
    if (location !== undefined) updatePayload.location = location.trim();
    if (type !== undefined) updatePayload.type = type;
    if (experience !== undefined) updatePayload.experience = experience.trim();
    if (salaryRange !== undefined) updatePayload.salaryRange = salaryRange ? salaryRange.trim() : null;
    if (description !== undefined) updatePayload.description = description.trim();
    if (expiresAt !== undefined) {
      updatePayload.expiresAt = expiresAt ? new Date(expiresAt) : null;
    }
    if (maxApplications !== undefined) {
      updatePayload.maxApplications = maxApplications ? parseInt(maxApplications, 10) : null;
    }
    if (hiredTarget !== undefined) {
      updatePayload.hiredTarget = hiredTarget ? parseInt(hiredTarget, 10) : 1;
    }
    if (isActive !== undefined) updatePayload.isActive = Boolean(isActive);

    const updated = await db.jobPosting.update({
      where: { id: jobId },
      data: updatePayload,
    });

    revalidatePath("/careers");
    revalidatePath("/admin/employees");
    revalidatePath("/manager/employees");

    return { success: true, data: updated };
  } catch (error) {
    console.error("Error updating job posting:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Hire a candidate directly from the pipeline into the Active Staff workforce directory (Admin Only)
 */
export async function hireCandidateAsEmployee(applicationId, employeeData = {}) {
  try {
    const application = await db.jobApplication.findUnique({
      where: { id: applicationId },
      include: { job: true },
    });

    if (!application) {
      return { success: false, error: "Candidate application not found." };
    }

    const name = (employeeData.name || application.fullName).trim();
    const rawEmail = (employeeData.email || application.email).trim();
    const phone = employeeData.phone || application.phone || null;
    const department = (employeeData.department || application.job?.department || "Carpentry & Joinery").trim();
    const roleTitle = (employeeData.roleTitle || application.job?.title || "Staff Member").trim();

    // Check if email already exists in employees table
    let finalEmail = rawEmail;
    const existing = await db.employee.findUnique({ where: { email: finalEmail } });
    if (existing) {
      const parts = rawEmail.split("@");
      finalEmail = `${parts[0]}.${Date.now().toString().slice(-4)}@${parts[1] || "aameenafurniture.com"}`;
    }

    const newEmployee = await db.employee.create({
      data: {
        name,
        email: finalEmail,
        phone: phone ? phone.trim() : null,
        department,
        roleTitle,
        status: "ACTIVE",
      },
    });

    // Mark candidate application as SELECTED
    await db.jobApplication.update({
      where: { id: applicationId },
      data: { status: "SELECTED" },
    });

    // Increment hired count on job posting if attached
    if (application.jobId) {
      const job = await db.jobPosting.findUnique({ where: { id: application.jobId } });
      if (job) {
        const nextHired = (job.hiredCount || 0) + 1;
        const autoClose = job.hiredTarget && nextHired >= job.hiredTarget;
        await db.jobPosting.update({
          where: { id: application.jobId },
          data: {
            hiredCount: nextHired,
            isActive: autoClose ? false : job.isActive,
          },
        });
      }
    }

    revalidatePath("/admin/employees");
    revalidatePath("/manager/employees");
    revalidatePath("/careers");

    return { success: true, data: newEmployee };
  } catch (error) {
    console.error("Error hiring candidate as employee:", error);
    return { success: false, error: error.message };
  }
}

