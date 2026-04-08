import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { submitProject } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiUploadCloud, FiCheckCircle } from 'react-icons/fi';

const DOMAINS = {
  ai: 'Artificial Intelligence',
  web: 'Web Development',
  mobile: 'App Development',
  iot: 'Hardware / IoT',
  data: 'Data Science & Analytics',
  other: 'Other Tech / Non-Tech'
};

export default function Upload() {
  const { isStudent, isHR, user, hrUser } = useAuth();
  const navigate = useNavigate();
  
  const token = (isHR ? hrUser?.token : user?.token);
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    sname: isStudent ? user?.name : '',
    semail: isStudent ? user?.email : '',
    college: '', degree: '', year: '', ptitle: '', pdesc: '', impact: '', 
    domain: 'web', skills: '', github: '', demo: '', phone: ''
  });

  const handleObj = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const next = () => {
    if (step === 1) {
      if (!formData.sname || !formData.semail) return toast.error('Student name and email are required.');
      if (!formData.college || !formData.degree || !formData.year) return toast.error('Educational details are required.');
    } else if (step === 2) {
      if (!formData.ptitle || !formData.pdesc) return toast.error('Project title and description are required.');
      if (formData.pdesc.length < 30) return toast.error('Please write a longer description.');
    }
    setStep(s => s + 1);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!isStudent && !isHR) return toast.error('Check your login session.');
    if (!formData.skills) return toast.error('Add at least one skill.');

    setLoading(true);
    try {
      const payload = {
        token: token,
        name: formData.sname,
        email: formData.semail,
        phone: formData.phone || '',
        college: formData.college,
        degree: formData.degree,
        year: formData.year,
        domain: formData.domain,
        ptitle: formData.ptitle,
        pdesc: formData.pdesc,
        impact: formData.impact || '',
        skills: formData.skills.split(',').map(s=>s.trim()).filter(Boolean),
        github: formData.github || '',
        demo: formData.demo || '',
      };
      await submitProject(payload);
      setStep(4);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit project.');
    } finally {
      setLoading(false);
    }
  };

  if (!isStudent && !isHR) {
    return (
      <div className="page active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 70px)', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center', maxWidth: 460 }}>
          <div style={{ fontSize: '3rem', marginBottom: 20 }}>🎓</div>
          <h2 className="font-display" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--ink)' }}>Portal Access Required</h2>
          <p style={{ color: 'var(--muted)', fontSize: '1.05rem', margin: '14px 0 28px' }}>Log in to submit a project, build a profile, and connect with verified student talent.</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
             <button className="btn-primary" onClick={() => navigate('/')}>Back to Home</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page active" style={{ padding: '60px 20px', background: 'var(--bg)', minHeight: 'calc(100vh - 70px)' }}>
      <div className="section-inner" style={{ maxWidth: 840 }}>
        
        {step < 4 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 40 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ width: '30%', height: 6, borderRadius: 10, background: step >= i ? 'var(--secondary)' : 'var(--border)', transition: 'background .3s' }} />
            ))}
          </div>
        )}

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card" style={{ padding: '50px 40px', background: '#fff' }}>
          
          {step === 1 && (
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
              <div style={{ fontSize: '1.8rem', marginBottom: 12 }}>🎓</div>
              <h2 className="font-display" style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 8 }}>
                {isHR ? 'Onboard New Student' : 'Educational Details'}
              </h2>
              <p style={{ color: 'var(--muted)', fontSize: '.9rem', marginBottom: 30 }}>
                {isHR ? 'Enter student credentials to add their project to the directory.' : 'Tell recruiters where you are currently studying.'}
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div className="form-field">
                    <label>Student Name <span className="req">*</span></label>
                    <input name="sname" placeholder="Full name" value={formData.sname} onChange={handleObj} readOnly={isStudent} />
                  </div>
                  <div className="form-field">
                    <label>Student Email <span className="req">*</span></label>
                    <input name="semail" type="email" placeholder="email@college.edu" value={formData.semail} onChange={handleObj} readOnly={isStudent} />
                  </div>
                </div>

                <div className="form-field">
                  <label>College Name <span className="req">*</span></label>
                  <input name="college" placeholder="e.g. Hindu College, Chennai" value={formData.college} onChange={handleObj} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div className="form-field">
                    <label>Degree / Major <span className="req">*</span></label>
                    <input name="degree" placeholder="e.g. B.Sc Computer Science" value={formData.degree} onChange={handleObj} />
                  </div>
                  <div className="form-field">
                    <label>Year of Study <span className="req">*</span></label>
                    <select name="year" value={formData.year} onChange={handleObj}>
                      <option value="">Select Year</option>
                      <option>1st Year</option><option>2nd Year</option>
                      <option>3rd Year</option><option>4th Year</option>
                      <option>Graduated</option>
                    </select>
                  </div>
                </div>
                <div className="form-field">
                  <label>Phone Number (Optional)</label>
                  <input name="phone" placeholder="For quick HR contact" value={formData.phone} onChange={handleObj} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 40 }}>
                <button className="btn-primary" onClick={next}>Next Step →</button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
              <div style={{ fontSize: '1.8rem', marginBottom: 12 }}>💡</div>
              <h2 className="font-display" style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 8 }}>Project Details</h2>
              <p style={{ color: 'var(--muted)', fontSize: '.9rem', marginBottom: 30 }}>Showcase your best project. This is what HRs will see first.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="form-field">
                  <label>Project Title <span className="req">*</span></label>
                  <input name="ptitle" placeholder="e.g. Smart Traffic Management IoT System" value={formData.ptitle} onChange={handleObj} />
                </div>
                <div className="form-field">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label>Detailed Description <span className="req">*</span></label>
                    <span style={{ fontSize: '.7rem', color: formData.pdesc.length>30?'var(--teal)':'#ef4444' }}>{formData.pdesc.length} chars</span>
                  </div>
                  <textarea name="pdesc" placeholder="Explain the problem you solved and how your application works..." value={formData.pdesc} onChange={handleObj} style={{ minHeight: 120 }} />
                </div>
                <div className="form-field">
                  <label>Project Impact / ROI (Optional)</label>
                  <input name="impact" placeholder="e.g. Reduced queue time by 40%" value={formData.impact} onChange={handleObj} />
                </div>
                <div className="form-field">
                  <label>Primary Domain <span className="req">*</span></label>
                  <select name="domain" value={formData.domain} onChange={handleObj}>
                    {Object.entries(DOMAINS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 40 }}>
                <button className="btn-secondary" onClick={()=>setStep(1)}>← Back</button>
                <button className="btn-primary" onClick={next}>Next Step →</button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
              <div style={{ fontSize: '1.8rem', marginBottom: 12 }}>🚀</div>
              <h2 className="font-display" style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 8 }}>Skills & Links</h2>
              <p style={{ color: 'var(--muted)', fontSize: '.9rem', marginBottom: 30 }}>Final touch. Add your tech stack and links to your work.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="form-field">
                  <label>Technical Skills <span className="req">*</span></label>
                  <input name="skills" placeholder="e.g. Python, React, MongoDB (Comma separated)" value={formData.skills} onChange={handleObj} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div className="form-field">
                    <label>GitHub or Code Link (Optional)</label>
                    <input name="github" placeholder="https://github.com/..." value={formData.github} onChange={handleObj} />
                  </div>
                  <div className="form-field">
                    <label>Live Demo / Video (Optional)</label>
                    <input name="demo" placeholder="https://..." value={formData.demo} onChange={handleObj} />
                  </div>
                </div>

                <div style={{ background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', border: '1px solid #bbf7d0', padding: 20, borderRadius: 16, marginTop: 10 }}>
                  <h4 style={{ fontSize: '.9rem', fontWeight: 800, color: '#166534', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}><FiCheckCircle /> Ready to publish</h4>
                  <p style={{ fontSize: '.8rem', color: '#15803d' }}>By submitting, your project will be visible in the Talent Directory for top HR recruiters.</p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 40 }}>
                <button className="btn-secondary" onClick={()=>setStep(2)}>← Back</button>
                <button className="btn-gradient" onClick={submit} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {loading ? 'Publishing...' : <><FiUploadCloud size={18} /> Publish Project to Directory</>}
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '2.4rem' }}>
                <FiCheckCircle />
              </div>
              <h2 className="font-display" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--ink)' }}>Project Published! 🎉</h2>
              <p style={{ color: 'var(--muted)', fontSize: '1.05rem', margin: '14px auto 32px', maxWidth: 400 }}>Your project is now live in the Talent Directory. HRs and recruiters can now discover and shortlist your profile.</p>
              <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
                <button className="btn-secondary" onClick={()=>navigate('/talent')}>View Talent Directory</button>
                <button className="btn-primary" onClick={()=>navigate('/')}>Go Home</button>
              </div>
            </motion.div>
          )}

        </motion.div>
      </div>
    </div>
  );
}
