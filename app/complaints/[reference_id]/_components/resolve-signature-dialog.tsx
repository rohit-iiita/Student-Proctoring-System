"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, FileDown, Loader2 } from "lucide-react";
import { DrawSignatureComponent } from "@/components/draw-signature";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import {
  generateResolutionCertificateService,
  getResolutionCertificateFileName,
} from "@/modules/complaints/resolution-certificate";
import type {
  TComplaintDetail,
  TComplaintStatus,
  TResolveAuthority,
} from "@/modules/complaints/types";
import type { jsPDF } from "jspdf";

interface ResolveSignatureDialogProps {
  complaint: TComplaintDetail;
  authority: TResolveAuthority;
  status: TComplaintStatus;
  resolution: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<{ success: boolean; message?: string }>;
}

/**
 * Flattens the drawn canvas into a theme-proof PNG data URL: every inked
 * pixel becomes pure black on a white background so the signature stays
 * visible on the PDF regardless of the admin's colour theme. The result
 * lives in memory only — it is never sent to the server or database.
 */
function getInkDataUrl(source: HTMLCanvasElement): string | null {
  const ctx = source.getContext("2d");
  if (!ctx) return null;

  const { width, height } = source;
  const imageData = ctx.getImageData(0, 0, width, height);
  const { data } = imageData;
  let hasInk = false;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] > 0) {
      data[i] = 0; // R
      data[i + 1] = 0; // G
      data[i + 2] = 0; // B
      hasInk = true;
    }
  }

  if (!hasInk) return null;

  const inkCanvas = document.createElement("canvas");
  inkCanvas.width = width;
  inkCanvas.height = height;
  inkCanvas.getContext("2d")?.putImageData(imageData, 0, 0);

  const paperCanvas = document.createElement("canvas");
  paperCanvas.width = width;
  paperCanvas.height = height;
  const paperCtx = paperCanvas.getContext("2d");
  if (!paperCtx) return null;
  paperCtx.fillStyle = "#ffffff";
  paperCtx.fillRect(0, 0, width, height);
  paperCtx.drawImage(inkCanvas, 0, 0);

  return paperCanvas.toDataURL("image/png");
}

export function ResolveSignatureDialog({
  complaint,
  authority,
  status,
  resolution,
  open,
  onOpenChange,
  onConfirm,
}: ResolveSignatureDialogProps) {
  const [signatureDataUrl, setSignatureDataUrl] = React.useState<
    string | null
  >(null);
  const [isConfirming, setIsConfirming] = React.useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState("");
  const [confirmationError, setConfirmationError] = React.useState("");
  const [pdfError, setPdfError] = React.useState("");
  const [isStatusSaved, setIsStatusSaved] = React.useState(false);

  const certificateRef = React.useRef<jsPDF | null>(null);

  const resetState = React.useCallback(() => {
    setSignatureDataUrl(null);
    setIsConfirming(false);
    setIsGeneratingPdf(false);
    setIsUploading(false);
    setUploadError("");
    setConfirmationError("");
    setPdfError("");
    setIsStatusSaved(false);
    certificateRef.current = null;
  }, []);

  const handleOpenChange = (nextOpen: boolean) => {
    if (isConfirming || isGeneratingPdf || isUploading) return;
    if (!nextOpen) resetState();
    onOpenChange(nextOpen);
  };

  // Capture the signature as an in-memory data URL the moment signing finishes
  const handleSignatureFinish = (canvas: HTMLCanvasElement | null) => {
    setPdfError("");
    setSignatureDataUrl(canvas ? getInkDataUrl(canvas) : null);
  };

  const buildCertificate = React.useCallback((): jsPDF => {
    return generateResolutionCertificateService({
      referenceId: complaint.referenceId,
      category: complaint.category,
      subject: complaint.subject,
      description: complaint.description,
      status,
      studentName: complaint.studentName,
      assignedFacultyName: complaint.assignedFacultyName,
      createdAt: complaint.createdAt,
      resolvedAt: complaint.resolvedAt ?? new Date().toISOString(),
      resolution,
      authority,
      signatureDataUrl: signatureDataUrl ?? "",
    });
  }, [
    complaint,
    status,
    resolution,
    authority,
    signatureDataUrl,
  ]);

  // "Save Status & Notes" — persist the resolution, then build the signed PDF
  const handleConfirm = async () => {
    if (!signatureDataUrl) {
      setPdfError("Please draw and finish your signature first.");
      return;
    }

    setConfirmationError("");
    setPdfError("");
    setIsConfirming(true);

    try {
      const response = await onConfirm();
      if (!response.success) {
        setConfirmationError(
          response.message ?? "Failed to save the complaint status.",
        );
        return;
      }

      const doc = buildCertificate();
      certificateRef.current = doc;
      setIsStatusSaved(true);

      // Publish the signed certificate so the student, assigned faculty and
      // admins can download it later. A failure never undoes the resolution —
      // the admin can retry the upload while the dialog stays open.
      await handleUploadCertificate(doc);
    } catch {
      setConfirmationError("Something went wrong while saving. Try again.");
    } finally {
      setIsConfirming(false);
    }
  };

  // Upload the built certificate PDF to the private resolution-certificates
  // bucket. RLS restricts uploads to admins; the student/faculty download it
  // via signed URLs from the complaint detail page.
  const handleUploadCertificate = async (doc: jsPDF) => {
    setUploadError("");
    setIsUploading(true);

    try {
      const pdfBlob = doc.output("blob");
      const fileName = getResolutionCertificateFileName(complaint.referenceId);
      const filePath = `${complaint.id}/${fileName}`;
      const supabase = createSupabaseBrowserClient();

      const { error } = await supabase.storage
        .from("resolution-certificates")
        .upload(filePath, pdfBlob, {
          contentType: "application/pdf",
          upsert: true,
        });

      if (error) throw error;
    } catch (error) {
      console.error("Certificate upload failed:", error);
      setUploadError(
        "The certificate could not be published for the student. Use Republish before closing this dialog.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Download the generated certificate (builds it on demand if needed)
  const handleDownloadPdf = () => {
    setPdfError("");

    if (!signatureDataUrl) {
      setPdfError("Please draw and finish your signature first.");
      return;
    }

    setIsGeneratingPdf(true);

    try {
      const doc = certificateRef.current ?? buildCertificate();
      certificateRef.current = doc;
      doc.save(getResolutionCertificateFileName(complaint.referenceId));
    } catch (error) {
      console.error("Resolution certificate generation failed:", error);
      setPdfError(
        "Could not generate the resolution certificate. Please try again.",
      );
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold text-zinc-900">
            Resolve Complaint — {complaint.referenceId}
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-500">
            Draw the authorised authority signature to certify this complaint
            as resolved. The signature is embedded directly into the generated
            PDF; only the signed certificate is stored so the student and
            assigned faculty can download it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-zinc-700">
              Authority Signature
            </Label>
            <DrawSignatureComponent
              onFinish={handleSignatureFinish}
              startLabel="Draw Signature"
              finishLabel="Finish Signing"
              doneLabel="Signature Captured"
            />
          </div>

          {confirmationError && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-800">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{confirmationError}</span>
            </div>
          )}

          {pdfError && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-800">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{pdfError}</span>
            </div>
          )}

          {uploadError && (
            <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-800">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
              <span>{uploadError}</span>
            </div>
          )}

          {isStatusSaved && !confirmationError && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>
                Complaint resolved. The certificate has been published — the
                student and assigned faculty can download it from this page.
              </span>
            </div>
          )}
        </div>

        <DialogFooter>
          {uploadError && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (certificateRef.current) {
                  handleUploadCertificate(certificateRef.current);
                }
              }}
              disabled={!isStatusSaved || isUploading || isConfirming}
              className="text-xs font-medium"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="h-4 w-4" />
              )}
              {isUploading ? "Publishing..." : "Republish Certificate"}
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={handleDownloadPdf}
            disabled={
              !isStatusSaved || !signatureDataUrl || isGeneratingPdf ||
              isConfirming
            }
            className="text-xs font-medium"
          >
            {isGeneratingPdf ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileDown className="h-4 w-4" />
            )}
            {isGeneratingPdf ? "Generating PDF..." : "Download Signed PDF"}
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={
              !signatureDataUrl || isConfirming || isGeneratingPdf ||
              isStatusSaved
            }
            className="bg-zinc-900 text-xs font-medium text-white hover:bg-zinc-800"
          >
            {isConfirming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            {isConfirming ? "Saving..." : "Save Status & Notes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
