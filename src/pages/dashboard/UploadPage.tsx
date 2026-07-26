import React, { useState, useEffect, useCallback } from "react";
import { UploadCloud, FileText, Trash2, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import type { Document } from "@/lib/types";

export default function UploadPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const fetchDocuments = useCallback(async () => {
    try {
      const { data } = await api.get<Document[]>("/documents");
      setDocuments(data);
    } catch (err) {
      console.error("Failed to load documents", err);
    }
  }, []);

  useEffect(() => {
    void fetchDocuments();
  }, [fetchDocuments]);

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post("/documents/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      await fetchDocuments();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to upload document.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext === "pdf" || ext === "txt") {
        await uploadFile(file);
      } else {
        setError("Only PDF and TXT files are supported.");
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await uploadFile(e.target.files[0]);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/documents/${id}`);
      setDocuments((prev) => prev.filter((d: Document) => d.id !== id));
    } catch (err) {
      console.error("Failed to delete document", err);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Upload Documents</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Add PDF or TXT contracts, leases, and regulatory guidelines for AI analysis.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Upload Panel */}
        <div className="lg:col-span-1">
          <label
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`glass-panel flex flex-col items-center justify-center p-8 text-center cursor-pointer border-2 border-dashed transition-colors duration-200 block ${
              isDragActive ? "border-neon bg-neon/5" : "border-white/10 hover:border-white/20"
            }`}
          >
            <input
              type="file"
              accept=".pdf,.txt"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neon/10 text-neon mb-4">
              <UploadCloud size={24} />
            </div>
            {isDragActive ? (
              <p className="text-sm font-medium text-neon">Drop your file here...</p>
            ) : (
              <div className="space-y-1">
                <p className="text-sm font-medium text-ink">Click to upload or drag & drop</p>
                <p className="text-xs text-ink-muted">PDF or TXT (up to 10MB)</p>
              </div>
            )}
          </label>

          {isUploading && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-neon font-medium">
              <Loader2 size={16} className="animate-spin" />
              Uploading and analyzing...
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-lg bg-red-500/10 p-3 text-xs text-red-400">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Documents List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold text-ink uppercase tracking-wider">Your Files ({documents.length})</h2>

          {documents.length === 0 ? (
            <div className="glass-panel p-8 text-center text-ink-muted text-sm">
              No files uploaded yet. Add a PDF or TXT to get started.
            </div>
          ) : (
            <div className="grid gap-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="glass-panel p-4 flex items-center justify-between gap-4 border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-ink-muted">
                      <FileText size={20} />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-medium text-ink truncate" title={doc.filename}>
                        {doc.filename}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-ink-muted">
                        <span>{formatBytes(doc.file_size)}</span>
                        <span>•</span>
                        <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Status Badge */}
                    {doc.status === "completed" && (
                      <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                        <CheckCircle2 size={14} /> Ready
                      </span>
                    )}
                    {doc.status === "processing" && (
                      <span className="flex items-center gap-1 text-xs text-neon font-medium">
                        <Loader2 size={14} className="animate-spin" /> Processing
                      </span>
                    )}
                    {doc.status === "failed" && (
                      <span className="flex items-center gap-1 text-xs text-red-400 font-medium">
                        <AlertCircle size={14} /> Failed
                      </span>
                    )}

                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-2 text-ink-faint hover:text-red-400 rounded-lg hover:bg-white/[0.04] transition-colors"
                      title="Delete document"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
