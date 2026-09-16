'use client';

import React, { useRef, useState } from 'react';
import {
  ShieldCheck,
  FileCheck2,
  Upload,
  RefreshCw,
  Trash2,
  AlertCircle,
  FileText,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Lock,
} from 'lucide-react';
import { Locale, getDictionary } from '@/lib/i18n';
import { VERIFIED_13_DOCS, DocumentKey, DocumentStatus, VerificationDoc } from '@/lib/constants';
import { DocumentUploadItem, PropertyType } from '@/types/seller';
import { uploadPropertyDocument } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

interface DocumentChecklistUploaderProps {
  locale: Locale;
  propertyType: PropertyType;
  documents: Record<string, DocumentUploadItem>;
  onChange: (documents: Record<string, DocumentUploadItem>) => void;
  propertyId?: string;
  className?: string;
}

export default function DocumentChecklistUploader({
  locale,
  propertyType,
  documents,
  onChange,
  propertyId,
  className = '',
}: DocumentChecklistUploaderProps) {
  const dict = getDictionary(locale);
  const isTe = locale === 'te';
  const uploaderDict = dict.sellerForm.uploader;

  const [activeUploadingKey, setActiveUploadingKey] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const { token } = useAuth();

  // Calculate stats
  const uploadedCount = Object.values(documents).filter(
    (doc) => doc.status === 'UPLOADED' || doc.status === 'VERIFIED'
  ).length;
  const totalDocs = VERIFIED_13_DOCS.length;
  const progressPercent = Math.round((uploadedCount / totalDocs) * 100);

  // Format file size helper
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '1.2 MB';
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Real upload & staging handler
  const handleFileSelect = async (key: DocumentKey, file: File) => {
    // 1. Validate file extension
    const allowed = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowed.includes(ext)) {
      onChange({
        ...documents,
        [key]: {
          key,
          status: 'FAILED',
          file,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          errorMessage:
            uploaderDict.invalidFormatError ||
            'Unsupported file format. Only PDF, JPG, JPEG, and PNG files are allowed.',
        },
      });
      return;
    }

    // 2. Validate file size (15MB limit)
    if (file.size > 15 * 1024 * 1024) {
      onChange({
        ...documents,
        [key]: {
          key,
          status: 'FAILED',
          file,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          errorMessage:
            uploaderDict.fileSizeError || 'File size exceeds 15MB limit.',
        },
      });
      return;
    }

    // 3. If real propertyId is available, upload directly to backend
    if (propertyId) {
      setActiveUploadingKey(key);
      onChange({
        ...documents,
        [key]: {
          key,
          status: 'UPLOADING',
          file,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          uploadProgress: 10,
        },
      });

      try {
        const uploadRes = await uploadPropertyDocument(
          propertyId,
          key,
          file,
          (progressPercent) => {
            onChange({
              ...documents,
              [key]: {
                key,
                status: 'UPLOADING',
                file,
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                uploadProgress: progressPercent,
              },
            });
          },
          token || undefined
        );

        onChange({
          ...documents,
          [key]: {
            key,
            status: 'UPLOADED',
            file,
            fileUrl: uploadRes.document?.fileUrl,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            uploadProgress: 100,
            uploadedAt: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
            errorMessage: undefined,
          },
        });
      } catch (err: unknown) {
        onChange({
          ...documents,
          [key]: {
            key,
            status: 'FAILED',
            file,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            errorMessage: (err as Error)?.message || 'Upload failed. Click retry.',
          },
        });
      } finally {
        setActiveUploadingKey(null);
      }
      return;
    }

    // 4. Staging mode (before property submission): hold file in state
    setActiveUploadingKey(key);
    onChange({
      ...documents,
      [key]: {
        key,
        status: 'UPLOADING',
        file,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadProgress: 40,
      },
    });

    setTimeout(() => {
      onChange({
        ...documents,
        [key]: {
          key,
          status: 'UPLOADED',
          file,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          uploadProgress: 100,
          uploadedAt: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          errorMessage: undefined,
        },
      });
      setActiveUploadingKey(null);
    }, 250);
  };

  const handleRetry = (key: DocumentKey) => {
    const existing = documents[key];
    if (existing?.file) {
      handleFileSelect(key, existing.file);
    } else {
      handleTriggerFileInput(key);
    }
  };

  const handleRemove = (key: DocumentKey) => {
    const updated = { ...documents };
    delete updated[key];
    onChange(updated);
  };

  const handleTriggerFileInput = (key: DocumentKey) => {
    const inputEl = fileInputRefs.current[key];
    if (inputEl) {
      inputEl.value = '';
      inputEl.click();
    }
  };

  // Quick helper to fill sample documents for testing
  const handlePrepopulateMockDocs = () => {
    const samplePack: Record<string, DocumentUploadItem> = {};
    VERIFIED_13_DOCS.forEach((doc, idx) => {
      // Don't auto-fill GPA if property is not GPA
      if (doc.isGpa) return;

      const ext = idx % 2 === 0 ? 'pdf' : 'jpg';
      const dummyContent = `%PDF-1.4\n% Sample verification document for ${doc.key}`;
      const dummyFile = new File([dummyContent], `${doc.key.toLowerCase()}_copy.${ext}`, {
        type: ext === 'pdf' ? 'application/pdf' : 'image/jpeg',
      });

      samplePack[doc.key] = {
        key: doc.key,
        status: 'UPLOADED',
        file: dummyFile,
        fileName: dummyFile.name,
        fileSize: dummyFile.size,
        fileType: dummyFile.type,
        uploadProgress: 100,
        uploadedAt: 'Just now',
      };
    });
    onChange(samplePack);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header & Progress Summary */}
      <div className="bg-emerald-950 text-white rounded-2xl p-5 sm:p-6 border border-emerald-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-800 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-wide">
                  {uploaderDict.heading}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-800 text-[11px] font-bold text-emerald-200">
                  {progressPercent}% Complete
                </span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-200 mt-1 max-w-xl">
                {uploaderDict.subheading}
              </p>
            </div>
          </div>

          {/* Quick Mock Fill button for tester convenience */}
          <button
            type="button"
            onClick={handlePrepopulateMockDocs}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 text-xs font-semibold border border-emerald-600/40 transition-colors tap-target"
            title="Pre-populate with sample documents for testing"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{isTe ? 'నమూనా డాక్యుమెంట్లను నింపండి' : 'Pre-fill Sample Pack'}</span>
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-4 pt-4 border-t border-emerald-900/60">
          <div className="flex items-center justify-between text-xs text-emerald-200 mb-1.5 font-medium">
            <span>
              {uploaderDict.docsUploadedCount
                .replace('{uploaded}', uploadedCount.toString())
                .replace('{total}', totalDocs.toString())}
            </span>
            <span>{totalDocs - uploadedCount} remaining</span>
          </div>
          <div className="w-full h-2.5 bg-emerald-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-300 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Trust notice box */}
      <div className="bg-slate-100/90 border border-slate-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-slate-700">
        <Lock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {uploaderDict.trustNotice}
        </p>
      </div>

      {/* The 13 Document Cards List */}
      <div className="space-y-3">
        {VERIFIED_13_DOCS.map((doc: VerificationDoc) => {
          const docState: DocumentUploadItem = documents[doc.key] || {
            key: doc.key,
            status: 'NOT_UPLOADED',
          };

          const isUploading = docState.status === 'UPLOADING';
          const isUploaded = docState.status === 'UPLOADED' || docState.status === 'VERIFIED';
          const isFailed = docState.status === 'FAILED';
          const isOptional = doc.isGpa;

          // Check if document is tailored for land vs flat
          const isLandOnly = doc.appliesTo === 'LAND';
          const isFlatOnly = doc.appliesTo === 'FLAT';
          const isRelevant = doc.appliesTo === 'BOTH' || doc.appliesTo === propertyType;

          return (
            <div
              key={doc.id}
              className={`p-4 rounded-xl border transition-all duration-200 bg-white ${
                isUploaded
                  ? 'border-emerald-200 bg-emerald-50/20 shadow-xs'
                  : isFailed
                  ? 'border-rose-200 bg-rose-50/30'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Hidden file input */}
              <input
                ref={(el) => {
                  fileInputRefs.current[doc.key] = el;
                }}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleFileSelect(doc.key, file);
                  }
                }}
              />

              {/* Row: stack vertically on mobile, side-by-side from md */}
              <div className="flex flex-col min-[560px]:flex-row min-[560px]:items-center justify-between gap-3">
                {/* Left info */}
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                      isUploaded
                        ? 'bg-emerald-100 text-emerald-800'
                        : isFailed
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {doc.id}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 truncate">
                        {isTe ? doc.nameTe : doc.nameEn}
                      </h4>

                      {/* Badges */}
                      {isOptional ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          {uploaderDict.optionalBadge}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          {uploaderDict.mandatoryBadge}
                        </span>
                      )}

                      {isLandOnly && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {uploaderDict.landSpecificBadge}
                        </span>
                      )}

                      {isFlatOnly && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-50 text-blue-800 border border-blue-200">
                          {uploaderDict.flatSpecificBadge}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                      {isTe ? doc.descTe : doc.descEn}
                    </p>

                    {/* Error display if upload failed */}
                    {isFailed && docState.errorMessage && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-700 font-medium">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>{docState.errorMessage}</span>
                      </div>
                    )}

                    {/* Uploaded File summary or progress */}
                    {isUploading && (
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-blue-700 font-semibold">
                          <span>{uploaderDict.statusUploading}</span>
                          <span>{docState.uploadProgress || 45}%</span>
                        </div>
                        {/* Full-width progress bar on all screen sizes */}
                        <div className="w-full h-1.5 bg-blue-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 transition-all duration-200"
                            style={{ width: `${docState.uploadProgress || 45}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {isUploaded && docState.fileName && (
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-emerald-800">
                        <span className="inline-flex items-center gap-1 font-semibold min-w-0">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate max-w-[160px] sm:max-w-xs">{docState.fileName}</span>
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500 font-mono text-[11px]">
                          {formatFileSize(docState.fileSize)}
                        </span>
                        {docState.uploadedAt && (
                          <>
                            <span className="text-slate-400">•</span>
                            <span className="text-slate-500 text-[11px]">
                              {docState.uploadedAt}
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Actions — self-start on mobile so they don't stretch */}
                <div className="flex items-center gap-2 self-start min-[560px]:self-center shrink-0">
                  {!isUploaded && !isUploading && !isFailed && (
                    <button
                      type="button"
                      onClick={() => handleTriggerFileInput(doc.key)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors tap-target"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploaderDict.btnChooseFile}</span>
                    </button>
                  )}

                  {isFailed && (
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-100 text-rose-800 text-xs font-bold">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>{uploaderDict.statusFailed || 'Upload Failed'}</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => handleRetry(doc.key)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold shadow-xs transition-colors tap-target"
                        title={uploaderDict.btnRetry || 'Retry'}
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>{uploaderDict.btnRetry || 'Retry'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemove(doc.key)}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-700 hover:bg-slate-100 transition-colors tap-target flex items-center justify-center"
                        title={uploaderDict.btnRemove}
                        aria-label={uploaderDict.btnRemove}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {isUploaded && (
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{uploaderDict.statusUploaded}</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => handleTriggerFileInput(doc.key)}
                        className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors tap-target flex items-center justify-center"
                        title={uploaderDict.btnReplace}
                        aria-label={uploaderDict.btnReplace}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemove(doc.key)}
                        className="p-2 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors tap-target flex items-center justify-center"
                        title={uploaderDict.btnRemove}
                        aria-label={uploaderDict.btnRemove}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center pt-2">
        <p className="text-xs text-slate-500">
          {uploaderDict.supportedFormats}
        </p>
      </div>
    </div>
  );
}
