import React, { useState } from 'react';

const departments = [
  'Information Technology',
  'Information System',
  'Architecture',
  'Quantity Survey',
  'Industrial And Quality Management',
  'Survey Sciences'
];

function AssistantCreateLecturer() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    departmentName: '',
    appointmentDate: ''
  });
  const [msg, setMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg('');
    const res = await fetch('http://localhost:5000/api/ma/create-lecturer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    setMsg(data.message || 'Error');
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: 20 }}>
      <h2>Create Lecturer Account</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
          style={{ width: '100%', marginBottom: 10 }}
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          style={{ width: '100%', marginBottom: 10 }}
        />
        <div style={{ position: 'relative', marginBottom: 10 }}>
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            style={{ 
              width: '100%', 
              paddingRight: '40px',
              boxSizing: 'border-box'
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              padding: '0',
              color: '#666',
            }}
          >
            {showPassword ? "👁️" : "👁️‍🗨️"}
          </button>
        </div>
        <select
          name="departmentName"
          value={form.departmentName}
          onChange={handleChange}
          required
          style={{ width: '100%', marginBottom: 10 }}
        >
          <option value="">Select Department</option>
          {departments.map(dep => (
            <option key={dep} value={dep}>{dep}</option>
          ))}
        </select>
        <input
          name="appointmentDate"
          type="date"
          value={form.appointmentDate}
          onChange={handleChange}
          required
          style={{ width: '100%', marginBottom: 10 }}
        />
        <button type="submit" style={{ width: '100%' }}>Create Lecturer</button>
      </form>
      {msg && <p>{msg}</p>}
    </div>
  );
}

export default AssistantCreateLecturer;