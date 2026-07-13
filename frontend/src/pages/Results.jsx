import {useEffect, useState} from 'react'
import {Link, useParams} from 'react-router-dom'

import {
  ArrowRight,
  CheckCircle,
  ClockCounterClockwise,
  Lightbulb,
  XCircle,
} from '@phosphor-icons/react'

import {fetchAnalysis} from '../lib/api'

import {RESULTS} from '../constants/testIds'

const BREAKDOWN_LABELS = {
  skills_match: 'Skills Match',
  experience_match: 'Experience Match',
  education_match: 'Education Match',
  keyword_match: 'Keyword Match',
}

const getScoreTextColor = score => {
  if (score >= 75) {
    return 'text-emerald-600'
  }

  if (score >= 50) {
    return 'text-amber-600'
  }

  return 'text-red-600'
}

const getScoreBarColor = score => {
  if (score >= 75) {
    return 'bg-emerald-600'
  }

  if (score >= 50) {
    return 'bg-amber-500'
  }

  return 'bg-red-600'
}

const Results = () => {
  const {id} = useParams()

  const [analysisData, setAnalysisData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAnalysisNotFound, setIsAnalysisNotFound] = useState(false)

  useEffect(() => {
    let isMounted = true

    const getAnalysis = async () => {
      setIsLoading(true)
      setIsAnalysisNotFound(false)

      try {
        const response = await fetchAnalysis(id)

        if (isMounted) {
          setAnalysisData(response)
        }
      } catch {
        if (isMounted) {
          setIsAnalysisNotFound(true)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    getAnalysis()

    return () => {
      isMounted = false
    }
  }, [id])

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-24 text-center text-slate-500">
        Loading report...
      </div>
    )
  }

  if (isAnalysisNotFound || !analysisData) {
    return (
      <div
        data-testid={RESULTS.notFound}
        className="max-w-2xl mx-auto px-6 py-24 text-center"
      >
        <h2 className="mb-3 font-heading text-2xl font-bold text-slate-900">
          Analysis not found
        </h2>

        <p className="mb-8 text-slate-600">
          This report may have been deleted or the link is incorrect.
        </p>

        <Link
          to="/analyze"
          className="font-semibold text-primary underline"
        >
          Run a new analysis
        </Link>
      </div>
    )
  }

  const {
    ats_score,
    score_breakdown,
    matched_skills,
    missing_skills,
    skill_gap_analysis,
    interview_questions,
    career_recommendations,
    summary,
    job_title,
    resume_filename,
    created_at,
  } = analysisData

  const renderScoreBreakdown = () =>
    Object.entries(score_breakdown || {}).map(([key, value]) => (
      <div
        key={key}
        data-testid={RESULTS.breakdownItem}
        className="p-6 border-r border-b border-slate-200 sm:border-b-0 [&:nth-child(2n)]:border-r sm:[&:nth-child(2n)]:border-r [&:nth-child(4n)]:border-r-0"
      >
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
          {BREAKDOWN_LABELS[key] || key}
        </p>

        <p
          className={`font-heading text-3xl font-bold ${getScoreTextColor(
            value,
          )}`}
        >
          {value}
        </p>

        <div className="mt-3 h-1 w-full overflow-hidden bg-slate-100">
          <div
            className={`h-full ${getScoreBarColor(value)}`}
            style={{width: `${value}%`}}
          />
        </div>
      </div>
    ))

  const renderMatchedSkills = () => {
    if (!matched_skills?.length) {
      return (
        <p className="text-sm text-slate-500">
          No strong matches found.
        </p>
      )
    }

    return matched_skills.map(eachSkill => (
      <span
        key={eachSkill}
        data-testid={RESULTS.matchedSkillChip}
        className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
      >
        {eachSkill}
      </span>
    ))
  }

  const renderMissingSkills = () => {
    if (!missing_skills?.length) {
      return (
        <p className="text-sm text-slate-500">
          No major gaps found.
        </p>
      )
    }

    return missing_skills.map(eachSkill => (
      <span
        key={eachSkill}
        data-testid={RESULTS.missingSkillChip}
        className="px-3 py-1.5 text-xs font-semibold bg-red-50 text-red-800 border border-red-200"
      >
        {eachSkill}
      </span>
    ))
  }

  const renderInterviewQuestions = () => {
    if (!interview_questions?.length) {
      return null
    }

    return interview_questions.map((eachQuestion, index) => (
      <div
        key={index}
        data-testid={RESULTS.interviewQuestionItem}
        className="border-l-2 border-primary pl-4"
      >
        <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-primary">
          {eachQuestion.category}
        </p>

        <p className="text-sm leading-relaxed text-slate-700">
          {eachQuestion.question}
        </p>
      </div>
    ))
  }

  const renderRecommendations = () => {
    if (!career_recommendations?.length) {
      return null
    }

    return career_recommendations.map((eachRecommendation, index) => (
      <li
        key={index}
        data-testid={RESULTS.recommendationItem}
        className="flex items-start gap-3 text-sm leading-relaxed text-slate-700"
      >
        <ArrowRight
          size={16}
          weight="bold"
          className="mt-0.5 shrink-0 text-primary"
        />

        {eachRecommendation}
      </li>
    ))
  }
    return (
    <div
      data-testid={RESULTS.page}
      className="mx-auto max-w-6xl px-6 py-16"
    >
      <div className="mb-10 flex flex-col gap-4 border-b border-slate-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
            Analysis Report
          </p>

          <h1 className="font-heading text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {job_title || 'Untitled Role'}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {resume_filename} &middot;{' '}
            {new Date(created_at).toLocaleDateString()}
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            to="/analyze"
            data-testid={RESULTS.analyzeAnotherButton}
            className="border border-slate-300 px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-slate-700 transition-colors duration-200 hover:bg-slate-50"
          >
            Analyze Another
          </Link>

          <Link
            to="/history"
            data-testid={RESULTS.viewHistoryButton}
            className="inline-flex items-center gap-2 bg-primary px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-colors duration-200 hover:bg-[#002277]"
          >
            <ClockCounterClockwise size={16} weight="bold" />
            History
          </Link>
        </div>
      </div>

      <div className="mb-1 grid grid-cols-1 gap-1 border border-slate-200 lg:grid-cols-3">
        <div className="flex flex-col items-center justify-center border-b border-slate-200 p-10 text-center lg:col-span-1 lg:border-b-0 lg:border-r">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
            ATS Match Score
          </p>

          <span
            data-testid={RESULTS.scoreMetric}
            className={`font-heading text-6xl font-light tracking-tighter md:text-7xl ${getScoreTextColor(
              ats_score,
            )}`}
          >
            {ats_score}%
          </span>

          <div className="mt-6 h-1.5 w-full max-w-[220px] overflow-hidden bg-slate-100">
            <div
              data-testid={RESULTS.scoreProgressBar}
              className={`h-full transition-all duration-700 ${getScoreBarColor(
                ats_score,
              )}`}
              style={{width: `${ats_score}%`}}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:col-span-2">
          {renderScoreBreakdown()}
        </div>
      </div>

      <div className="mb-1 grid grid-cols-1 gap-1 border border-t-0 border-slate-200 lg:grid-cols-2">
        <div className="border-b border-slate-200 p-8 lg:border-b-0 lg:border-r">
          <h3 className="mb-4 flex items-center gap-2 font-heading text-lg font-bold text-slate-900">
            <CheckCircle
              size={20}
              weight="bold"
              className="text-emerald-600"
            />
            Matched Skills
          </h3>

          <div className="flex flex-wrap gap-2">
            {renderMatchedSkills()}
          </div>
        </div>

        <div className="p-8">
          <h3 className="mb-4 flex items-center gap-2 font-heading text-lg font-bold text-slate-900">
            <XCircle size={20} weight="bold" className="text-red-600" />
            Missing Skills
          </h3>

          <div className="flex flex-wrap gap-2">
            {renderMissingSkills()}
          </div>
        </div>
      </div>

      <div className="mb-1 border border-t-0 border-slate-200 p-8">
        <h3 className="mb-3 font-heading text-lg font-bold text-slate-900">
          Skill Gap Analysis
        </h3>

        <p
          data-testid={RESULTS.skillGapText}
          className="text-base leading-relaxed text-slate-600"
        >
          {skill_gap_analysis}
        </p>
      </div>

      <div className="mb-1 grid grid-cols-1 gap-1 border border-t-0 border-slate-200 lg:grid-cols-2">
        <div className="border-b border-slate-200 p-8 lg:border-b-0 lg:border-r">
          <h3 className="mb-5 font-heading text-lg font-bold text-slate-900">
            Interview Questions
          </h3>

          <div className="flex flex-col gap-4">
            {renderInterviewQuestions()}
          </div>
        </div>

        <div className="p-8">
          <h3 className="mb-5 flex items-center gap-2 font-heading text-lg font-bold text-slate-900">
            <Lightbulb
              size={20}
              weight="bold"
              className="text-amber-500"
            />
            Career Recommendations
          </h3>

          <ul className="flex flex-col gap-3">
            {renderRecommendations()}
          </ul>
        </div>
      </div>

      <div className="border border-t-0 border-slate-200 bg-slate-50 p-8">
        <h3 className="mb-3 font-heading text-lg font-bold text-slate-900">
          Overall Summary
        </h3>

        <p
          data-testid={RESULTS.summaryText}
          className="text-base leading-relaxed text-slate-600"
        >
          {summary}
        </p>
      </div>
    </div>
  )
}

export default Results