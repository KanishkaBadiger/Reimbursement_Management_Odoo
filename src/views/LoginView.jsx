import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { initCompany } from '../api';

export default function LoginView({ onLoginSuccess, needsInit, session }) {
  const [isLogin, setIsLogin] = useState(!needsInit);
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Signup State
  const [companyName, setCompanyName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [country, setCountry] = useState('India');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (needsInit && session) {
        // They just need to create the workspace!
        await initCompany({
          company_name: companyName,
          admin_name: adminName,
          country: country,
        });
        onLoginSuccess();
        return;
      }

      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        // The App component will detect auth change and reload user profile
        onLoginSuccess();
      } else {
        // Sign up
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        
        // Let supabase get session
        if (!data.session) throw new Error("Please check your email to verify your account.");
        
        // Init company through backend
        await initCompany({
          company_name: companyName,
          admin_name: adminName,
          country: country,
        });
        
        onLoginSuccess();
      }
    } catch (err) {
      if (err.message.includes("rate limit")) {
        setError("Too many signup attempts. Supabase email rate limit exceeded. Please try testing with a different email, or disable Email Confirmations in your Supabase Auth Providers settings during development.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9f9fb', padding: '2rem' }}>
      <div style={{ backgroundColor: 'white', padding: '3rem', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', width: '100%', maxWidth: '440px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ margin: 0, color: '#111827', fontSize: '1.5rem', fontWeight: '700' }}>
            {isLogin ? 'Welcome back' : 'Create your workspace'}
          </h1>
          <p style={{ margin: '0.5rem 0 0', color: '#6B7280', fontSize: '0.95rem' }}>
            {isLogin ? 'Sign in to access ReimburseOS' : 'Setup ReimburseOS for your company'}
          </p>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', backgroundColor: '#FEF2F2', color: '#B91C1C', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* If the user is ALREADY authenticated (needsInit=true), we don't ask for email/password again. */}
          {(!isLogin || needsInit) && (
            <>
              <div>
                <label style={labelStyle}>Admin Name</label>
                <input required type="text" style={inputStyle} value={adminName} onChange={e => setAdminName(e.target.value)} placeholder="John Doe" />
              </div>
              <div>
                <label style={labelStyle}>Company Name</label>
                <input required type="text" style={inputStyle} value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Acme Inc" />
              </div>
              <div>
                <label style={labelStyle}>Country</label>
                <select required style={inputStyle} value={country} onChange={e => setCountry(e.target.value)}>
                  <option value="India">India</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  <option value="Japan">Japan</option>
                </select>
                <p style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '4px' }}>Used to set your company's default currency.</p>
              </div>
            </>
          )}

          {!needsInit && (
            <>
              <div>
                <label style={labelStyle}>Email</label>
                <input required type="email" style={inputStyle} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" />
              </div>

              <div>
                <label style={labelStyle}>Password</label>
                <input required type="password" style={inputStyle} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
            </>
          )}

          <button disabled={loading} type="submit" style={{ ...btnStyle, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Processing...' : (needsInit ? 'Complete Setup' : (isLogin ? 'Sign In' : 'Create Workspace'))}
          </button>
        </form>

        {!needsInit && (
          <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: '#6B7280' }}>
            {isLogin ? "Don't have a workspace? " : "Already have an account? "}
            <button 
              type="button" 
              onClick={() => setIsLogin(!isLogin)}
              style={{ background: 'none', border: 'none', color: '#6366F1', fontWeight: '600', cursor: 'pointer', padding: 0 }}
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: '0.875rem',
  fontWeight: '600',
  color: '#374151',
  marginBottom: '0.5rem'
};

const inputStyle = {
  width: '100%',
  padding: '0.75rem 1rem',
  borderRadius: '8px',
  border: '1px solid #D1D5DB',
  fontSize: '0.95rem',
  outline: 'none',
  transition: 'border-color 0.2s',
  boxSizing: 'border-box'
};

const btnStyle = {
  width: '100%',
  padding: '0.875rem',
  backgroundColor: '#111827',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  fontSize: '0.95rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  marginTop: '0.5rem'
};
