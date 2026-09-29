import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderOpen, Upload, FileText, CheckCircle, Clock,
  AlertCircle, Eye, Download, Trash2, ShieldCheck, Plus, X
} from 'lucide-react';
import toast from 'react-hot-toast';

interface DocItem {
  id: string;
  name: string;
  category: string;
  fileName: string;
  fileSize: string;
  uploadDate: string;
  status: 'VERIFIED' | 'PENDING' | 'ACTION_REQUIRED';
}

const INITIAL_DOCS: DocItem[] = [
  {
    id: '1',
    name: 'Aadhaar Card (Identity Proof)',
    category: 'Identity Proof',
    fileName: 'aadhaar_card_masked.pdf',
    fileSize: '1.2 MB',
    uploadDate: '2026-09-15',
    status: 'VERIFIED',
  },
  {
    id: '2',
    name: 'Bachelor Degree Certificate',
    category: 'Educational Document',
    fileName: 'degree_certificate_btech.pdf',
    fileSize: '2.4 MB',
    uploadDate: '2026-09-18',
    status: 'VERIFIED',
  },
  {
    id: '3',
    name: 'Maharashtra Domicile Certificate',
    category: 'Residency Proof',
    fileName: 'domicile_certificate_mh.pdf',
    fileSize: '1.8 MB',
    uploadDate: '2026-09-20',
    status: 'PENDING',
  },
  {
    id: '4',
    name: 'Income & Asset Certificate',
    category: 'Socio-Economic Certificate',
    fileName: 'income_cert_2025_26.pdf',
    fileSize: '950 KB',
    uploadDate: '2026-09-22',
    status: 'PENDING',
  },
];

export default function Documents() {
  const [docs, setDocs] = useState<DocItem[]>(INITIAL_DOCS);
  const [modalOpen, setModalOpen] = useState(false);
  const [uploadCategory, setUploadCategory] = useState('Educational Document');
  const [uploadName, setUploadName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadName) {
      toast.error('Please specify document title');
      return;
    }
    setUploading(true);
    setTimeout(() => {
      const newDoc: DocItem = {
        id: Date.now().toString(),
        name: uploadName,
        category: uploadCategory,
        fileName: selectedFile ? selectedFile.name : `${uploadName.toLowerCase().replace(/\s+/g, '_')}.pdf`,
        fileSize: selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : '1.5 MB',
        uploadDate: new Date().toISOString().slice(0, 10),
        status: 'PENDING',
      };
      setDocs([newDoc, ...docs]);
      setUploading(false);
      setModalOpen(false);
      setUploadName('');
      setSelectedFile(null);
      toast.success('Document uploaded successfully for official verification');
    }, 1200);
  };

  const handleDelete = (id: string, name: string) => {
    if (!window.confirm(`Remove ${name}?`)) return;
    setDocs(docs.filter(d => d.id !== id));
    toast.success('Document removed');
  };

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            <FolderOpen size={14} /> Digilocker-Integrated Vault
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Document Management</h1>
          <p className="text-gray-500 text-sm">
            Upload and maintain your identity, domicile, and academic certificates for instant verification
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary flex items-center gap-2 text-sm shadow-md self-start md:self-auto"
        >
          <Upload size={16} /> Upload New Document
        </button>
      </div>

      {/* Security Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-xl text-blue-700 shrink-0">
          <ShieldCheck size={20} />
        </div>
        <div className="text-xs text-blue-800">
          <strong>256-Bit Encrypted Storage:</strong> All uploaded credentials are stored with AES-256 encryption
          and only accessible to authorized Maharashtra Government verification officers for scheme and course compliance.
        </div>
      </div>

      {/* Document List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {docs.map(doc => (
          <div
            key={doc.id}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm leading-snug">{doc.name}</h3>
                    <div className="text-[11px] text-gray-400">{doc.category}</div>
                  </div>
                </div>

                {doc.status === 'VERIFIED' && (
                  <span className="badge-green text-[10px]">
                    <CheckCircle size={11} className="mr-1" /> Verified
                  </span>
                )}
                {doc.status === 'PENDING' && (
                  <span className="badge-yellow text-[10px]">
                    <Clock size={11} className="mr-1" /> Pending
                  </span>
                )}
              </div>

              <div className="bg-gray-50 rounded-xl p-3 mt-3 text-xs text-gray-500 space-y-1 font-mono">
                <div className="truncate"><span className="text-gray-400">File:</span> {doc.fileName}</div>
                <div className="flex justify-between text-[11px]">
                  <span>Size: {doc.fileSize}</span>
                  <span>Uploaded: {doc.uploadDate}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 text-xs">
              <span className="text-gray-400 text-[11px]">e-Gov Verified</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toast.success(`Viewing document ${doc.fileName}`)}
                  className="p-1.5 text-gray-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                  title="View Document"
                >
                  <Eye size={15} />
                </button>
                <button
                  onClick={() => toast.success(`Downloading ${doc.fileName}...`)}
                  className="p-1.5 text-gray-500 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                  title="Download Copy"
                >
                  <Download size={15} />
                </button>
                <button
                  onClick={() => handleDelete(doc.id, doc.name)}
                  className="p-1.5 text-gray-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Document"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-base font-bold text-gray-900">Upload Official Document</h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="label text-xs">Document Type / Title *</label>
                  <input
                    type="text"
                    required
                    value={uploadName}
                    onChange={e => setUploadName(e.target.value)}
                    placeholder="e.g. Master's Degree Transcript"
                    className="input-field text-sm"
                  />
                </div>

                <div>
                  <label className="label text-xs">Category</label>
                  <select
                    value={uploadCategory}
                    onChange={e => setUploadCategory(e.target.value)}
                    className="input-field text-sm"
                  >
                    <option value="Educational Document">Educational Document</option>
                    <option value="Identity Proof">Identity Proof</option>
                    <option value="Residency Proof">Residency / Domicile</option>
                    <option value="Socio-Economic Certificate">Income / Caste Certificate</option>
                    <option value="Skill Certificate">Prior Certification / License</option>
                  </select>
                </div>

                <div>
                  <label className="label text-xs">Choose File (PDF, PNG, JPG up to 5MB)</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                    <input
                      type="file"
                      id="doc-file"
                      className="hidden"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={e => {
                        if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
                      }}
                    />
                    <label htmlFor="doc-file" className="cursor-pointer block">
                      <Upload size={24} className="mx-auto text-blue-600 mb-2" />
                      <div className="text-xs font-semibold text-gray-800">
                        {selectedFile ? selectedFile.name : 'Click to browse or drop file here'}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-1">Supports PDF, JPEG up to 5 MB</div>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 border rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="btn-primary text-xs py-2 px-5"
                  >
                    {uploading ? 'Encrypting & Uploading...' : 'Upload Document'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
