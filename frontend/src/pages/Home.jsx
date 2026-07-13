import {Link} from 'react-router-dom'
import {
  UploadSimple,
  Target,
  ChartBar,
  ChatCircleText,
  ArrowRight,
} from '@phosphor-icons/react'

import {LANDING} from '../constants/testIds'

const featuresList = [
  {
    icon: UploadSimple,
    title: 'Upload Your Resume',
    description:
      'Drop in your PDF resume — we extract and structure the text instantly.',
  },
  {
    icon: Target,
    title: 'ATS Score',
    description:
      'Get an objective 0-100 match score against any job description.',
  },
  {
    icon: ChartBar,
    title: 'Skill Gap Analysis',
    description:
      'See exactly which skills match and which ones you are missing.',
  },
  {
    icon: ChatCircleText,
    title: 'Interview Prep',
    description:
      'Receive tailored interview questions generated for the exact role.',
  },
]

const stepsList = [
  {
    number: '01',
    title: 'Upload resume + paste job description',
  },
  {
    number: '02',
    title: 'AI retrieves relevant context via semantic search',
  },
  {
    number: '03',
    title: 'Get your ATS score, skill gaps & interview prep',
  },
]

const Home = () => (
  <div className="bg-white">
    <section
      className="relative overflow-hidden border-b border-slate-200"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.94), rgba(255,255,255,0.94)), url('https://images.unsplash.com/photo-1572635148687-307f8ca9b737?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2ODl8MHwxfHNlYXJjaHwyfHxtaW5pbWFsJTIwd2hpdGUlMjBnZW9tZXRyaWMlMjB0ZXh0dXJlfGVufDB8fHx3aGl0ZXwxNzgzNDAyODY2fDA&ixlib=rb-4.1.0&q=85')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="mx-auto max-w-7xl px-6 py-24 text-center sm:py-32">
        <p className="mb-6 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
          GenAI-Powered ATS Platform
        </p>

        <h1
          data-testid={LANDING.heroTitle}
          className="mx-auto max-w-4xl font-heading text-4xl font-black tracking-tighter text-slate-900 sm:text-5xl lg:text-6xl"
        >
          Know your resume&apos;s score before recruiters do.
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
          Upload your resume, paste the job description, and get an instant
          AI-driven ATS score, skill-gap analysis, and personalized interview
          questions — powered by retrieval-augmented AI.
        </p>

        <div className="mt-10 flex items-center justify-center">
          <Link
            to="/analyze"
            data-testid={LANDING.heroAnalyzeCta}
            className="inline-flex items-center gap-2 bg-primary px-8 py-4 text-sm font-bold uppercase tracking-wide text-white transition-all duration-200 hover:bg-[#002277]"
          >
            Analyze My Resume
            <ArrowRight size={18} weight="bold" />
          </Link>
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-7xl">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {featuresList.map(eachFeature => {
          const FeatureIcon = eachFeature.icon

          return (
            <div
              key={eachFeature.title}
              data-testid={LANDING.featureCard}
              className="border-b border-r border-slate-200 p-8 transition-colors duration-200 hover:bg-slate-50 last:border-r-0 lg:[&:nth-child(4n)]:border-r-0"
            >
              <FeatureIcon
                size={32}
                weight="bold"
                className="mb-4 text-primary"
              />

              <h2 className="mb-2 font-heading text-xl font-bold tracking-tight text-slate-900">
                {eachFeature.title}
              </h2>

              <p className="text-sm leading-relaxed text-slate-600">
                {eachFeature.description}
              </p>
            </div>
          )
        })}
      </div>
    </section>

    <section className="mx-auto max-w-7xl border-t border-slate-200 px-6 py-20">
      <p className="mb-4 text-center text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
        How it works
      </p>

      <h2 className="mb-14 text-center font-heading text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        From resume to results in seconds
      </h2>

      <div className="grid grid-cols-1 gap-1 md:grid-cols-3">
        {stepsList.map(eachStep => (
          <div
            key={eachStep.number}
            data-testid={LANDING.howItWorksStep}
            className="border border-slate-200 p-8"
          >
            <p className="font-heading text-5xl font-light tracking-tighter text-slate-300">
              {eachStep.number}
            </p>

            <p className="mt-4 text-base font-medium text-slate-900">
              {eachStep.title}
            </p>
          </div>
        ))}
      </div>
    </section>
  </div>
)

export default Home