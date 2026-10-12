import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { videoService } from '../services/videoService';
import { UploadCloud, FileVideo, CheckCircle2, AlertCircle, Sparkles, Layers, Zap } from 'lucide-react';

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genres, setGenres] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      selectFile(e.dataTransfer.files[0]);
    }
  };

  const selectFile = (selectedFile: File) => {
    setFile(selectedFile);
    if (!title) {
      const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, '');
      setTitle(nameWithoutExt.replace(/[-_]/g, ' '));
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) {
      setError('Please provide a file and a title');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const uploadedVideo = await videoService.uploadVideoWithChunks(
        file,
        {
          title: title.trim(),
          description: description.trim(),
          genres: genres.trim(),
        },
        (progress) => setUploadProgress(progress)
      );

      navigate('/my-uploads');
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(err.response?.data?.message || err.message || 'Failed to upload video');
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="mb-8 text-center sm:text-left">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-brand-400 mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Media Pipeline</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">Upload to Media Library</h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Upload your personal or licensed media. Our background pipeline automatically creates multi-bitrate HLS streams (360p, 480p, 720p) and thumbnails.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleUpload} className="space-y-6">
        
        {/* Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleFileDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative p-8 md:p-12 rounded-3xl border-2 border-dashed cursor-pointer text-center transition-all flex flex-col items-center justify-center ${
            isDragOver
              ? 'border-brand-500 bg-brand-500/10'
              : file
              ? 'border-emerald-500/50 bg-emerald-950/20'
              : 'border-white/15 bg-cinema-card/60 hover:border-brand-500/50 hover:bg-white/5'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/mkv,video/quicktime"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                selectFile(e.target.files[0]);
              }
            }}
          />

          {file ? (
            <div className="space-y-2 flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <span className="text-sm font-bold text-white truncate max-w-sm">{file.name}</span>
              <span className="text-xs text-slate-400">
                {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload & transcode
              </span>
              <span className="text-[11px] text-brand-400 underline">Click to choose a different file</span>
            </div>
          ) : (
            <div className="space-y-3 flex flex-col items-center">
              <div className="w-16 h-16 rounded-3xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center shadow-glow-brand">
                <UploadCloud className="w-8 h-8" />
              </div>
              <div>
                <span className="text-sm font-bold text-white block">Drag & drop your video file here</span>
                <span className="text-xs text-slate-400 mt-0.5 block">Supports MP4, MOV, MKV, WebM (Any size)</span>
              </div>
              <span className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-colors">
                Browse Files
              </span>
            </div>
          )}
        </div>

        {/* Metadata Inputs */}
        <div className="p-6 rounded-3xl bg-cinema-card border border-white/10 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
              Title <span className="text-brand-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Inception (2010)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 text-sm transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
              Genres & Tags
            </label>
            <input
              type="text"
              placeholder="e.g. Sci-Fi, Thriller, Action"
              value={genres}
              onChange={(e) => setGenres(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 text-sm transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
              Synopsis / Description
            </label>
            <textarea
              rows={3}
              placeholder="Brief summary of the video content..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 text-sm transition-colors resize-none"
            />
          </div>
        </div>

        {/* Upload Progress Bar */}
        {uploading && (
          <div className="p-5 rounded-2xl bg-brand-950/40 border border-brand-500/30 space-y-2 animate-pulse">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-brand-300 flex items-center space-x-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Chunked Uploading & Queueing Transcoding...</span>
              </span>
              <span className="font-mono font-bold text-white">{uploadProgress}%</span>
            </div>
            <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-500 via-pink-500 to-indigo-500 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!file || !title.trim() || uploading}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-500 via-pink-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-bold text-sm shadow-glow-brand hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
        >
          <UploadCloud className="w-5 h-5" />
          <span>{uploading ? `Uploading (${uploadProgress}%)...` : 'Upload & Start Transcoding'}</span>
        </button>
      </form>
    </div>
  );
};

export default UploadPage;
