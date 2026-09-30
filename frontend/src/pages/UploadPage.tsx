import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Film, CheckCircle, AlertCircle, Sparkles, Layers, ArrowRight } from 'lucide-react';
import { videoService } from '../services/videoService';
import { useAuth } from '../context/AuthContext';
import { Video } from '../types';

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genres, setGenres] = useState('Animation,Sci-Fi');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedVideo, setUploadedVideo] = useState<Video | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (!title) {
        const cleanName = selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      setFile(selectedFile);
      if (!title) {
        const cleanName = selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) return;

    try {
      setIsUploading(true);
      setError(null);
      setUploadProgress(0);

      let videoRes: Video;
      if (file.size > 10 * 1024 * 1024) {
        // Chunked upload for files > 10MB
        videoRes = await videoService.uploadChunked(
          file,
          title.trim(),
          description.trim(),
          genres.trim(),
          2 * 1024 * 1024,
          (percent) => setUploadProgress(percent)
        );
      } else {
        // Direct upload for smaller files
        videoRes = await videoService.uploadDirect(
          file,
          title.trim(),
          description.trim(),
          genres.trim(),
          (percent) => setUploadProgress(percent)
        );
      }

      setUploadedVideo(videoRes);
      setUploadProgress(100);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 lg:px-8 max-w-3xl mx-auto py-10">
      
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-pink-500 p-0.5 mx-auto mb-3 flex items-center justify-center shadow-lg shadow-brand-500/20">
          <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
            <Upload className="w-6 h-6 text-brand-400" />
          </div>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Upload Licensed Media</h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Upload any legally owned video. Our FFmpeg pipeline automatically transcodes it to multi-bitrate HLS (360p, 480p, 720p).
        </p>
      </div>

      {uploadedVideo ? (
        /* Upload Success State */
        <div className="p-8 bg-slate-900/80 border border-emerald-500/40 rounded-3xl text-center space-y-6 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-xl">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Media Uploaded Successfully!</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Transcoding pipeline has begun processing multi-resolution streams & thumbnail.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Title:</span>
              <span className="text-white font-semibold">{uploadedVideo.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Status:</span>
              <span className="text-amber-400 font-semibold">{uploadedVideo.status}</span>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate(`/video/${uploadedVideo.id}`)}
              className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-brand-500/20"
            >
              <span>View Stream</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setUploadedVideo(null);
                setFile(null);
                setTitle('');
                setDescription('');
                setUploadProgress(0);
              }}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl text-xs font-semibold transition-colors"
            >
              Upload Another
            </button>
          </div>
        </div>
      ) : (
        /* Upload Form */
        <form onSubmit={handleUpload} className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-6 shadow-2xl">
          
          {error && (
            <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Drag & Drop Box */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer ${
              file
                ? 'border-brand-500/80 bg-brand-950/20'
                : 'border-slate-700/80 hover:border-brand-500/50 bg-slate-950/50'
            }`}
          >
            <input
              type="file"
              accept="video/mp4,video/x-matroska,video/quicktime,video/webm"
              onChange={handleFileChange}
              id="file-upload"
              className="hidden"
            />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
              <Film className={`w-12 h-12 mb-3 ${file ? 'text-brand-400' : 'text-slate-500'}`} />
              {file ? (
                <div>
                  <p className="text-sm font-bold text-white">{file.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to upload
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    Drag and drop your video file here, or <span className="text-brand-400 underline">browse</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Supports MP4, MKV, MOV, WEBM (Chunked multi-part upload for large files)
                  </p>
                </div>
              )}
            </label>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Video Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Interstellar Journey"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description</label>
              <textarea
                rows={3}
                placeholder="Short synopsis or notes about this media..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Genre Tags (comma-separated)</label>
              <input
                type="text"
                placeholder="e.g. Sci-Fi, Action, Drama"
                value={genres}
                onChange={(e) => setGenres(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-2 p-4 bg-slate-950 rounded-2xl border border-slate-800">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <span>Uploading chunks...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-500 to-pink-500 transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!file || !title.trim() || isUploading}
            className="w-full py-3.5 px-6 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-2xl text-sm font-bold transition-all shadow-xl shadow-brand-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Start Upload &amp; Transcoding</span>
              </>
            )}
          </button>
        </form>
      )}

    </div>
  );
};
