import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const DocumentUploader = ({ ngo, onUpload, isSubmitting = false }) => {
  const [files, setFiles] = useState({
    registration_certificate: null,
    government_id: null,
    ngo_license: null,
    organization_logo: null,
  });

  const handleFileChange = (field, event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Size limit check: 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast.error('File size exceeds the maximum limit of 10 MB.');
      event.target.value = null; // Clear
      return;
    }

    // Allowed extensions check
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowed.includes(file.type)) {
      toast.error('Invalid format. Only PDF, JPG, and PNG are allowed.');
      event.target.value = null; // Clear
      return;
    }

    setFiles((prev) => ({ ...prev, [field]: file }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const hasFiles = Object.values(files).some((f) => f !== null);
    if (!hasFiles) {
      toast.error('Please select at least one document to upload.');
      return;
    }

    const formData = new FormData();
    Object.entries(files).forEach(([key, file]) => {
      if (file) {
        formData.append(key, file);
      }
    });

    onUpload(formData);
  };

  const fields = [
    {
      key: 'registration_certificate',
      label: 'Registration Certificate *',
      description: 'Official incorporation or trust deed document.',
      existing: ngo?.registration_certificate,
    },
    {
      key: 'government_id',
      label: 'Authorized Rep Government ID *',
      description: 'Identity validation of the NGO coordinator.',
      existing: ngo?.government_id,
    },
    {
      key: 'ngo_license',
      label: 'Food Operation / NGO Tax License',
      description: 'License authorizing food collection activities.',
      existing: ngo?.ngo_license,
    },
    {
      key: 'organization_logo',
      label: 'Organization Logo',
      description: 'Profile display logo for platform branding.',
      existing: ngo?.organization_logo,
    },
  ];

  return (
    <div className="bg-card border border-border p-6 rounded-xl shadow-sm space-y-6">
      <div className="border-b border-border pb-3">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Upload className="w-5 h-5 text-primary" /> Verification Documents Uploader
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Upload PDF, JPG, or PNG files. Maximum size limit is 10 MB per file.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {fields.map((field) => (
            <div key={field.key} className="p-4 border border-dashed border-border rounded-lg bg-background/50 hover:bg-background transition-all">
              <span className="text-sm font-semibold text-foreground block">{field.label}</span>
              <span className="text-xs text-muted-foreground block mt-0.5">{field.description}</span>

              {/* Upload field input */}
              <div className="mt-3 flex items-center gap-3">
                <label className="cursor-pointer bg-secondary hover:bg-secondary/80 text-secondary-foreground text-xs font-semibold py-1.5 px-3 rounded-md transition-colors flex items-center gap-1.5 border border-border">
                  <Upload className="w-3.5 h-3.5" /> Choose File
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(field.key, e)}
                  />
                </label>
                <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                  {files[field.key] ? files[field.key].name : 'No file chosen'}
                </span>
              </div>

              {/* Existing file link */}
              {field.existing && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-green-500 bg-green-500/5 p-2 rounded-md border border-green-500/10">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <a
                    href={field.existing}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-green-600 truncate font-semibold"
                  >
                    View Uploaded Document
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end border-t border-border pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/95 transition-all shadow-md disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-1">
                <Loader2 className="w-4 h-4 animate-spin" /> Uploading Documents
              </span>
            ) : (
              'Upload and Submit'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DocumentUploader;
