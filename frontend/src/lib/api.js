import axios from 'axios'

const BACKEND_URL = (process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000').replace(/\/$/, '')

export const API = `${BACKEND_URL}/api`

const api = axios.create({
  baseURL: API,
})

const getSessionId = () => {
  let sessionId = localStorage.getItem('resume_ats_session_id')

  if (!sessionId) {
    sessionId = crypto.randomUUID()
    localStorage.setItem('resume_ats_session_id', sessionId)
  }

  return sessionId
}

const analyzeResume = async ({file, jobTitle, jobDescription}) => {
  const formData = new FormData()

  formData.append('resume', file)
  formData.append('job_description', jobDescription)
  formData.append('session_id', getSessionId())

  if (jobTitle) {
    formData.append('job_title', jobTitle)
  }

  const {data} = await api.post('/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return data
}

const fetchAnalyses = async () => {
  const {data} = await api.get('/analyses', {
    params: {
      session_id: getSessionId(),
    },
  })

  return data
}

const fetchAnalysis = async id => {
  const {data} = await api.get(`/analyses/${id}`)

  return data
}

const deleteAnalysis = async id => {
  const {data} = await api.delete(`/analyses/${id}`)

  return data
}

export {
  analyzeResume,
  fetchAnalyses,
  fetchAnalysis,
  deleteAnalysis,
}

export default api