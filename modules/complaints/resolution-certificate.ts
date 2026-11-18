"use client";

import { jsPDF } from "jspdf";
import { formatComplaintCategory } from "@/lib/utils";
import type { TResolutionCertificateData } from "./types";

const PAGE_MARGIN = 16; // mm
const CONTENT_WIDTH = 210 - PAGE_MARGIN * 2; // A4 width minus margins

function safeText(value: string | null | undefined): string {
  return (value ?? "").replace(/\r\n/g, "\n").trim();
}

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

/**
 * Builds the official "Complaint Resolution Certificate" PDF entirely in the
 * browser. The signature is embedded from the in-memory canvas data URL and is
 * never persisted to the database or server.
 */
export const generateResolutionCertificateService = (
  data: TResolutionCertificateData,
): jsPDF => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageHeight = doc.internal.pageSize.getHeight();
  let cursorY = PAGE_MARGIN;

  // ─── Header ────────────────────────────────────────────────────────────────
  doc.setFillColor(24, 24, 27); // zinc-900
  doc.rect(0, 0, 210, 34, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("SmartProctor", PAGE_MARGIN, 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(212, 212, 216); // zinc-300
  doc.text("Student Proctoring System — Complaint Resolution Certificate", PAGE_MARGIN, 21);

  doc.setFontSize(8);
  doc.setTextColor(161, 161, 170); // zinc-400
  doc.text(`Reference: ${data.referenceId}`, PAGE_MARGIN, 27);

  cursorY = 44;

  // ─── Complaint metadata ────────────────────────────────────────────────────
  doc.setTextColor(24, 24, 27);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(safeText(data.subject) || "Complaint", PAGE_MARGIN, cursorY);
  cursorY += 6;

  doc.setFontSize(9);
  const metaRows: Array<[string, string]> = [
    ["Complaint ID", data.referenceId],
    ["Category", formatComplaintCategory(data.category)],
    ["Status", data.status.replace("_", " ").toUpperCase()],
    ["Submitted By", safeText(data.studentName) || "Unknown Student"],
    ["Assigned Faculty", safeText(data.assignedFacultyName) || "Unassigned"],
    ["Submitted On", formatDateTime(data.createdAt)],
    ["Resolved On", formatDateTime(data.resolvedAt)],
  ];

  metaRows.forEach(([label, value], index) => {
    const isLeftColumn = index % 2 === 0;
    const x = isLeftColumn ? PAGE_MARGIN : 210 / 2 + 4;
    // 10mm row pitch: label baseline sits at cursorY and its value baseline
    // 4mm below, so the next row must start well clear of the value text.
    if (isLeftColumn && index > 0) cursorY += 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(113, 113, 122); // zinc-500
    doc.text(`${label.toUpperCase()}`, x, cursorY);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(39, 39, 42); // zinc-800
    doc.text(value, x, cursorY + 4);
  });
  cursorY += 10;

  // ─── Section helper ────────────────────────────────────────────────────────
  const drawSectionTitle = (title: string) => {
    doc.setDrawColor(228, 228, 231); // zinc-200
    doc.setLineWidth(0.3);
    doc.line(PAGE_MARGIN, cursorY, 210 - PAGE_MARGIN, cursorY);
    cursorY += 5;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(24, 24, 27);
    doc.text(title.toUpperCase(), PAGE_MARGIN, cursorY);
    cursorY += 5;
  };

  // ─── Description ───────────────────────────────────────────────────────────
  drawSectionTitle("Grievance Description");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(63, 63, 70); // zinc-700
  const descriptionLines = doc.splitTextToSize(
    safeText(data.description) || "No description provided.",
    CONTENT_WIDTH,
  );
  doc.text(descriptionLines, PAGE_MARGIN, cursorY);
  cursorY += descriptionLines.length * 4.8;

  // ─── Resolution notes ──────────────────────────────────────────────────────
  drawSectionTitle("Resolution & Authority Notes");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(63, 63, 70);
  const resolutionLines = doc.splitTextToSize(
    safeText(data.resolution) || "No resolution notes recorded.",
    CONTENT_WIDTH,
  );
  doc.text(resolutionLines, PAGE_MARGIN, cursorY);
  cursorY += resolutionLines.length * 4.8 + 4;

  // Keep signature block on the same page when possible
  const signatureBlockHeight = 52;
  if (cursorY + signatureBlockHeight > pageHeight - PAGE_MARGIN) {
    doc.addPage();
    cursorY = PAGE_MARGIN;
  }

  // ─── Declaration ───────────────────────────────────────────────────────────
  doc.setFillColor(244, 244, 245); // zinc-100
  doc.roundedRect(
    PAGE_MARGIN,
    cursorY,
    CONTENT_WIDTH,
    16,
    2,
    2,
    "F",
  );
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8.5);
  doc.setTextColor(82, 82, 91); // zinc-600
  const declaration = doc.splitTextToSize(
    "This certificate was generated electronically by the SmartProctor Student Proctoring System. The electronic signature below was applied by the authorised authority to confirm that the above grievance has been reviewed and resolved.",
    CONTENT_WIDTH - 8,
  );
  doc.text(declaration, PAGE_MARGIN + 4, cursorY + 6);
  cursorY += 22;

  // ─── Signature block (signature stays client-side only) ───────────────────
  drawSectionTitle("Authorised Authority Signature");
  const signatureImageProps = doc.getImageProperties(data.signatureDataUrl);
  const signatureAspectRatio =
    signatureImageProps.height / signatureImageProps.width;
  const signatureWidth = 70;
  const signatureHeight = signatureWidth * signatureAspectRatio;
  const signatureY = cursorY + 4;

  doc.addImage(
    data.signatureDataUrl,
    signatureImageProps.fileType || "PNG",
    PAGE_MARGIN,
    signatureY,
    signatureWidth,
    signatureHeight,
  );

  doc.setDrawColor(212, 212, 216);
  doc.setLineWidth(0.4);
  doc.line(
    PAGE_MARGIN,
    signatureY + signatureHeight + 2,
    PAGE_MARGIN + signatureWidth,
    signatureY + signatureHeight + 2,
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(24, 24, 27);
  doc.text(safeText(data.authority.name) || "Admin Authority", PAGE_MARGIN, signatureY + signatureHeight + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(113, 113, 122);
  doc.text(
    `${safeText(data.authority.email)}  •  ${data.authority.role.toUpperCase()}`,
    PAGE_MARGIN,
    signatureY + signatureHeight + 11,
  );

  doc.setFontSize(7.5);
  doc.setTextColor(161, 161, 170);
  doc.text(
    `Electronically signed on ${new Date().toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}`,
    PAGE_MARGIN,
    signatureY + signatureHeight + 16,
  );

  return doc;
};

/** Standardised file name for resolution certificates */
export const getResolutionCertificateFileName = (referenceId: string): string =>
  `resolution-certificate-${referenceId}.pdf`;
