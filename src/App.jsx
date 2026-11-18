import React, { useEffect, useState } from "react";
import "./App.css";

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  position: "",
  qualification: "",
  experience: "",
  skills: "",
  status: "Applied",
  interviewDate: "",
  interviewTime: "",
  meetingLink: "",
  resumeName: "",
  resumeData: ""
};

function App() {
  const [applications, setApplications] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("interviewApplications")) || [];
    } catch {
      return [];
    }
  });

  const [formData, setFormData] = useState(initialForm);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [editingId, setEditingId] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [message, setMessage] = useState("");

  // Save applications automatically
  useEffect(() => {
    localStorage.setItem(
      "interviewApplications",
      JSON.stringify(applications)
    );
  }, [applications]);

  // Handle form input
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Resume upload
  const handleResume = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Please upload a PDF, DOC, or DOCX resume.");
      e.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Resume size must be below 2 MB.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        resumeName: file.name,
        resumeData: reader.result
      }));
    };

    reader.readAsDataURL(file);
  };

  // Submit and update application
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      alert("Enter a valid email address.");
      return;
    }

    if (!/^[0-9]{10}$/.test(formData.phone)) {
      alert("Enter a valid 10-digit phone number.");
      return;
    }

    if (formData.interviewDate || formData.interviewTime) {
      if (!formData.interviewDate || !formData.interviewTime) {
        alert("Please enter both interview date and time.");
        return;
      }
    }

    if (formData.meetingLink) {
      try {
        const url = new URL(formData.meetingLink);
        if (!["http:", "https:"].includes(url.protocol)) {
          throw new Error("Invalid URL");
        }
      } catch {
        alert("Enter a valid meeting link starting with https://");
        return;
      }
    }

    if (editingId !== null) {
      setApplications((prev) =>
        prev.map((app) =>
          app.id === editingId
            ? { ...formData, id: editingId, createdAt: app.createdAt }
            : app
        )
      );

      setMessage("Application updated successfully!");
    } else {
      const newApplication = {
        ...formData,
        id: Date.now(),
        createdAt: new Date().toLocaleDateString()
      };

      setApplications((prev) => [newApplication, ...prev]);
      setMessage("Application submitted successfully!");
    }

    setFormData(initialForm);
    setEditingId(null);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Edit application
  const handleEdit = (app) => {
    setFormData({ ...initialForm, ...app });
    setEditingId(app.id);
    setMessage("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete application
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this application?")) {
      setApplications((prev) =>
        prev.filter((app) => app.id !== id)
      );

      if (editingId === id) {
        setFormData(initialForm);
        setEditingId(null);
      }

      setMessage("Application deleted successfully!");
    }
  };

  // Reset form
  const handleReset = () => {
    setFormData(initialForm);
    setEditingId(null);
    setMessage("");
  };

  // Update status directly
  const updateStatus = (id, status) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === id ? { ...app, status } : app
      )
    );
  };

  // Dashboard statistics
  const stats = [
    { title: "Total Applications", value: applications.length, icon: "📁" },
    { title: "Applied", value: applications.filter(a => a.status === "Applied").length, icon: "📨" },
    { title: "Shortlisted", value: applications.filter(a => a.status === "Shortlisted").length, icon: "⭐" },
    { title: "Selected", value: applications.filter(a => a.status === "Selected").length, icon: "🎉" },
    { title: "Rejected", value: applications.filter(a => a.status === "Rejected").length, icon: "❌" }
  ];

  // Search and filter
  const filteredApplications = applications.filter((app) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      app.fullName.toLowerCase().includes(searchText) ||
      app.email.toLowerCase().includes(searchText) ||
      app.position.toLowerCase().includes(searchText);

    const matchesFilter =
      filter === "All" || app.status === filter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className={darkMode ? "app dark" : "app"}>

      {/* HEADER */}
      <header className="header">
        <div className="brand">
          <div className="brand-icon">💼</div>
          <div>
            <h2>Career<span>Track</span></h2>
            <p>Interview Management System</p>
          </div>
        </div>

        <button
          className="theme-btn"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </header>

      <main className="container">

        {/* WELCOME */}
        <section className="welcome">
          <div>
            <span className="eyebrow">YOUR CAREER JOURNEY</span>
            <h1>Interview Dashboard</h1>
            <p>Manage your job applications and track your career progress.</p>
          </div>

          <div className="welcome-icon">🚀</div>
        </section>

        {/* DASHBOARD */}
        <section className="stats-grid">
          {stats.map((stat) => (
            <div className="stat-card" key={stat.title}>
              <div className="stat-top">
                <span>{stat.title}</span>
                <span className="stat-icon">{stat.icon}</span>
              </div>

              <h2>{stat.value}</h2>
              <p>Applications overview</p>
            </div>
          ))}
        </section>

        {/* APPLICATION FORM */}
        <section className="panel form-panel" id="application-form">

          <div className="section-heading">
            <div>
              <span className="eyebrow">CANDIDATE DETAILS</span>
              <h2>{editingId !== null ? "Edit Application" : "New Application"}</h2>
              <p>Fill in your details to manage your interview process.</p>
            </div>

            <span className="heading-icon">📝</span>
          </div>

          {message && (
            <div className="alert-success">
              ✓ {message}
              <button onClick={() => setMessage("")}>×</button>
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <h3 className="form-subtitle">Personal Information</h3>

            <div className="form-grid">

              <div className="field">
                <label>Full Name *</label>
                <input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                  minLength={3}
                />
              </div>

              <div className="field">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@gmail.com"
                  required
                />
              </div>

              <div className="field">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit phone number"
                  maxLength={10}
                  pattern="[0-9]{10}"
                  required
                />
              </div>

              <div className="field">
                <label>Position Applying For *</label>
                <select
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select position</option>
                  <option>Frontend Developer</option>
                  <option>Backend Developer</option>
                  <option>Full Stack Developer</option>
                  <option>React Developer</option>
                  <option>Python Developer</option>
                  <option>Java Developer</option>
                  <option>Data Analyst</option>
                  <option>UI/UX Designer</option>
                  <option>Software Engineer</option>
                </select>
              </div>

              <div className="field">
                <label>Highest Qualification *</label>
                <select
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select qualification</option>
                  <option>Diploma</option>
                  <option>B.Sc</option>
                  <option>BCA</option>
                  <option>B.E</option>
                  <option>B.Tech</option>
                  <option>MCA</option>
                  <option>M.Tech</option>
                  <option>MBA</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="field">
                <label>Total Experience</label>
                <input
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="e.g. Fresher / 2 years"
                />
              </div>

              <div className="field">
                <label>Technical Skills *</label>
                <input
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="React, HTML, CSS, JavaScript"
                  required
                />
              </div>

              <div className="field">
                <label>Application Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option>Applied</option>
                  <option>Shortlisted</option>
                  <option>Selected</option>
                  <option>Rejected</option>
                </select>
              </div>

            </div>

            <div className="form-divider"></div>

            {/* INTERVIEW SCHEDULING */}
            <h3 className="form-subtitle">📅 Interview Scheduling</h3>

            <div className="form-grid">

              <div className="field">
                <label>Interview Date</label>
                <input
                  type="date"
                  name="interviewDate"
                  value={formData.interviewDate}
                  onChange={handleChange}
                  min={new Date().toLocaleDateString("en-CA")}
                />
              </div>

              <div className="field">
                <label>Interview Time</label>
                <input
                  type="time"
                  name="interviewTime"
                  value={formData.interviewTime}
                  onChange={handleChange}
                />
              </div>

              <div className="field full-width">
                <label>Meeting Link</label>
                <input
                  type="url"
                  name="meetingLink"
                  value={formData.meetingLink}
                  onChange={handleChange}
                  placeholder="https://meet.google.com/..."
                />
              </div>

            </div>

            <div className="form-divider"></div>

            {/* RESUME */}
            <h3 className="form-subtitle">📎 Upload Resume</h3>

            <div className="upload-box">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleResume}
                id="resume"
              />

              <label htmlFor="resume">
                <span className="upload-icon">☁️</span>
                <strong>Choose your resume</strong>
                <span>PDF, DOC, DOCX (Maximum 2 MB)</span>
              </label>

              {formData.resumeName && (
                <div className="resume-name">
                  📄 {formData.resumeName}
                  <button
                    type="button"
                    onClick={() =>
                      setFormData(prev => ({
                        ...prev,
                        resumeName: "",
                        resumeData: ""
                      }))
                    }
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleReset}
              >
                ↻ Reset
              </button>

              <button type="submit" className="btn-primary">
                {editingId !== null ? "✓ Update Application" : "+ Submit Application"}
              </button>
            </div>

          </form>
        </section>

        {/* APPLICATION LIST */}
        <section className="panel applications-panel">

          <div className="section-heading">
            <div>
              <span className="eyebrow">APPLICATION MANAGEMENT</span>
              <h2>My Applications</h2>
              <p>Search, filter, edit and manage your applications.</p>
            </div>
            <span className="heading-icon">📂</span>
          </div>

          <div className="search-filter">

            <div className="search-box">
              <span>🔍</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email or position..."
              />
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option>All</option>
              <option>Applied</option>
              <option>Shortlisted</option>
              <option>Selected</option>
              <option>Rejected</option>
            </select>

          </div>

          {filteredApplications.length === 0 ? (
            <div className="empty-state">
              <div>📭</div>
              <h3>No applications found</h3>
              <p>Add an application or change your search/filter.</p>
            </div>
          ) : (

            <div className="application-list">

              {filteredApplications.map((app) => (

                <article className="application-card" key={app.id}>

                  <div className="application-info">

                    <div className="avatar">
                      {app.fullName.charAt(0).toUpperCase()}
                    </div>

                    <div className="candidate-details">
                      <h3>{app.fullName}</h3>
                      <p>{app.position}</p>
                      <span>{app.email}</span>
                      <span>📱 {app.phone}</span>
                    </div>

                  </div>

                  <div className="application-extra">
                    <label>Interview Status</label>

                    <select
                      className={`status-select ${app.status.toLowerCase()}`}
                      value={app.status}
                      onChange={(e) =>
                        updateStatus(app.id, e.target.value)
                      }
                    >
                      <option>Applied</option>
                      <option>Shortlisted</option>
                      <option>Selected</option>
                      <option>Rejected</option>
                    </select>

                    {app.interviewDate && (
                      <p>📅 {app.interviewDate} at {app.interviewTime}</p>
                    )}

                    {app.meetingLink && (
                      <a
                        href={app.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                      >
                        🔗 Join Interview
                      </a>
                    )}

                    {app.resumeName && (
                      <a
                        href={app.resumeData || "#"}
                        download={app.resumeName}
                      >
                        📄 Download Resume
                      </a>
                    )}

                    <div className="card-actions">
                      <button
                        className="edit-btn"
                        onClick={() => handleEdit(app)}
                      >
                        ✏ Edit
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(app.id)}
                      >
                        🗑 Delete
                      </button>
                    </div>

                  </div>

                </article>

              ))}

            </div>
          )}

        </section>

        {/* FOOTER */}
        <footer className="footer">
          <h3>CareerTrack</h3>
          <p>Manage your interviews. Build your future. ✨</p>
          <span>React Interview Management System</span>
        </footer>

      </main>
    </div>
  );
}

export default App;