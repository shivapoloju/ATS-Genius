import {useCallback, useState, useRef} from 'react'
import {useNavigate} from 'react-router-dom'

import {
  FilePdf,
  UploadSimple,
  WarningCircle,
  X,
} from '@phosphor-icons/react'

import {Input} from '../components/ui/input'
import {Textarea} from '../components/ui/textarea'
import {Label} from '../components/ui/label'

import {analyzeResume} from '../lib/api'

import {ANALYZE} from '../constants/testIds'

const Analyze = () => {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [selectedResumeFile, setSelectedResumeFile] = useState(null)
  const [jobTitle, setJobTitle] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleFileUpload = useCallback(file => {
    if (!file) {
      return
    }

    if (file.type !== 'application/pdf') {
      setErrorMessage('Please upload a PDF file.')
      return
    }

    setErrorMessage('')
    setSelectedResumeFile(file)
  }, [])

  const onDropResume = event => {
    event.preventDefault()

    setIsDragging(false)

    handleFileUpload(event.dataTransfer.files?.[0])
  }

  const onDragOverResume = event => {
    event.preventDefault()
    setIsDragging(true)
  }

  const onDragLeaveResume = () => {
    setIsDragging(false)
  }

  const onChangeResume = event => {
    handleFileUpload(event.target.files?.[0])
  }

  const onChangeJobTitle = event => {
    setJobTitle(event.target.value)
  }

  const onChangeJobDescription = event => {
    setJobDescription(event.target.value)
  }

  const onRemoveResume = () => {
    setSelectedResumeFile(null)
  }

  const onSubmitForm = async event => {
    event.preventDefault()

    if (!selectedResumeFile) {
      setErrorMessage('Please upload your resume as a PDF.')
      return
    }

    if (jobDescription.trim().length < 30) {
      setErrorMessage(
        'Please paste a more complete job description (at least 30 characters).',
      )
      return
    }

    setErrorMessage('')
    setIsLoading(true)

    try {
      const result = await analyzeResume({
        file: selectedResumeFile,
        jobTitle,
        jobDescription,
      })

      navigate(`/results/${result.id}`)
    } catch (error) {
      setErrorMessage(
        error?.response?.data?.detail ||
          'Something went wrong. Please try again.',
      )

      setIsLoading(false)
    }
  }

  const onClickDropzone = () => {
    fileInputRef.current?.click()
  }

  if (isLoading) {
    return (
      <div
        data-testid={ANALYZE.loadingState}
        className="max-w-2xl mx-auto px-6 py-32 text-center"
      >
        <p className="mb-6 text-xs font-bold uppercase tracking-[0.2em] text-primary">
          Analyzing
        </p>

        <h1 className="mb-4 font-heading text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Retrieving context & scoring your resume...
        </h1>

        <p className="mb-10 text-sm text-slate-500">
          Running semantic search, ATS scoring, skill-gap analysis and interview
          preparation. This usually takes 10–20 seconds.
        </p>

        <div className="h-1.5 w-full overflow-hidden bg-slate-100">
          <div className="h-full w-1/3 bg-primary animate-[loading-bar_1.2s_ease-in-out_infinite]" />
        </div>
      </div>
    )
  }

  return (
    <div
      data-testid={ANALYZE.page}
      className="mx-auto max-w-5xl px-6 py-16 sm:py-20"
    >
      <div className="mb-10 pb-8 border-b border-slate-200">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
          ATS Scanner
        </p>
        <h1 className="font-heading text-3xl font-black tracking-tighter text-slate-900 sm:text-4xl">
          Analyze Your Resume
        </h1>
        <p className="mt-4 text-base text-slate-600 max-w-2xl">
          Upload your resume in PDF format and paste the job description below to perform an instant GenAI-powered ATS matching scan.
        </p>
      </div>

      <form onSubmit={onSubmitForm} className="space-y-8">
        <div className="flex flex-col gap-2">
          <Label className="text-slate-900 font-semibold">Resume (PDF format only)</Label>
          
          {!selectedResumeFile ? (
            <div
              data-testid={ANALYZE.dropzone}
              onDragOver={onDragOverResume}
              onDragLeave={onDragLeaveResume}
              onDrop={onDropResume}
              onClick={onClickDropzone}
              className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
                isDragging
                  ? 'border-primary bg-blue-50/50'
                  : 'border-slate-300 hover:border-primary hover:bg-slate-50/50'
              }`}
            >
              <UploadSimple size={40} className="text-slate-400 mb-4" />
              <p className="text-sm font-semibold text-slate-800">
                Drag & drop your resume PDF here, or click to browse files
              </p>
              <p className="text-xs text-slate-500 mt-1">
                PDF only (Max size 5MB)
              </p>
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                data-testid={ANALYZE.fileInput}
                onChange={onChangeResume}
                ref={fileInputRef}
              />
            </div>
          ) : (
            <div className="flex items-center justify-between border border-slate-200 p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center min-w-0">
                <FilePdf size={32} className="text-primary mr-3 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {selectedResumeFile.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {(selectedResumeFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onRemoveResume}
                data-testid={ANALYZE.removeFileButton}
                className="p-2 text-slate-500 hover:text-red-600 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="job-title" className="text-slate-900 font-semibold">
            Target Job Title (Optional)
          </Label>
          <Input
            id="job-title"
            type="text"
            data-testid={ANALYZE.jobTitleInput}
            value={jobTitle}
            onChange={onChangeJobTitle}
            placeholder="e.g. Software Engineer"
            className="w-full mt-1 border-slate-300 focus:border-primary focus:ring-primary"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="job-desc" className="text-slate-900 font-semibold">
            Job Description
          </Label>
          <Textarea
            id="job-desc"
            data-testid={ANALYZE.jobDescriptionTextarea}
            value={jobDescription}
            onChange={onChangeJobDescription}
            placeholder="Paste the full job description here..."
            className="w-full min-h-[200px] mt-1 border-slate-300 focus:border-primary focus:ring-primary"
            required
          />
        </div>

        {errorMessage && (
          <div
            data-testid={ANALYZE.errorAlert}
            className="flex items-start gap-3 text-red-700 bg-red-50 border border-red-200 p-4 rounded-lg text-sm"
          >
            <WarningCircle size={20} className="shrink-0 mt-0.5" />
            <p className="font-medium">{errorMessage}</p>
          </div>
        )}

        <div>
          <button
            type="submit"
            data-testid={ANALYZE.submitButton}
            className="w-full md:w-auto bg-primary text-white px-8 py-4 text-sm font-bold uppercase tracking-wide hover:bg-[#002277] transition-all duration-200"
          >
            Analyze Resume
          </button>
        </div>
      </form>
    </div>
  )
}

export default Analyze