import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MessageCircle, 
  User, 
  BookOpen, 
  Download, 
  Phone, 
  Shield, 
  X, 
  ChevronDown, 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  ChevronRight, 
  Menu, 
  ArrowLeft, 
  ArrowRight, 
  ExternalLink,
  Tag,
  Clock,
  Send,
  Eye,
  FileText,
  Key,
  Layers
} from 'lucide-react';
import { FaFacebookF, FaTwitter, FaYoutube, FaInstagram, FaLinkedinIn, FaSkype } from 'react-icons/fa';
import { config } from './config';
import './index.css';
import logoImg from '../Logo.png';
import Papa from 'papaparse';

// Helper for Facebook-like relative time
function getRelativeTime(dateString) {
  if (!dateString) return "Recently";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (isNaN(diffInSeconds)) return "Recently";
  if (diffInSeconds < 60) return "Just now";
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear()) {
      return "Yesterday";
    }
    return `${diffInHours} hrs ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

function App() {
  // --- SITE DATA ---
  const [siteData, setSiteData] = useState(() => {
    try {
      const cached = localStorage.getItem('siteConfigCache');
      if (cached) return JSON.parse(cached);
    } catch(e) {}
    
    return {
      captionText: "",
      mediaUrl: "",
      category: "",
      heading: "",
      authorName: "",
      commentCount: "",
      postedDate: ""
    };
  });
  
  const [relativeDate, setRelativeDate] = useState("");

  // --- DYNAMIC STATE ROUTER ---
  const [currentPage, setCurrentPage] = useState('home'); // 'home', 'about', 'contact', 'documentation', 'download', 'typography', '404', 'category', 'search'
  const [currentPostId, setCurrentPostId] = useState(null); // ID of active post (null = defaultPost)
  const [currentCategory, setCurrentCategory] = useState(null); // For category post feed page
  const [layoutMode, setLayoutMode] = useState('right-sidebar'); // 'right-sidebar', 'left-sidebar', 'full-width'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Header / UI states
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchInputVal, setSearchInputVal] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuHovered, setMegaMenuHovered] = useState(false);
  const [activeMegaCategory, setActiveMegaCategory] = useState('Cyber Security');

  // Contact Form states
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [contactErrors, setContactErrors] = useState({});
  const [contactSubmitted, setContactSubmitted] = useState(false);
  
  // Download simulation state
  const [downloadProgress, setDownloadProgress] = useState(null); // null, 0-100, 'done'
  const [downloadStatusText, setDownloadStatusText] = useState('');

  // Accordion state (for FAQ / Shortcodes)
  const [activeAccordion, setActiveAccordion] = useState(null);

  // Tab states (for Documentation)
  const [activeDocTab, setActiveDocTab] = useState('setup'); // 'setup', 'config', 'shortcodes'

  // --- FETCH GOOGLE SHEET / LOCAL CACHE ---
  useEffect(() => {
    document.title = config.pageTitle;

    const fetchLocalCaption = () => {
      if (config.captionFile) {
        fetch(config.captionFile)
          .then(res => res.ok ? res.text() : "")
          .then(text => {
            if (text) {
              setSiteData(prev => {
                const newData = {...prev, captionText: text};
                localStorage.setItem('siteConfigCache', JSON.stringify(newData));
                return newData;
              });
            }
          }).catch(err => console.error(err));
      }
    };

    if (config.googleSheetCsvUrl && config.mediaType === "image") {
      Papa.parse(config.googleSheetCsvUrl, {
        download: true,
        complete: function(results) {
          try {
             let updates = {};
             results.data.forEach(row => {
               if (row && row.length >= 2) {
                 const key = String(row[0] || "").toLowerCase().trim();
                 const value = String(row[1] || "").trim();
                 
                 if (key === "caption" || key === "text" || key === "content" || key === "body" || key === "captiontext") {
                   updates.captionText = value;
                 }
                 if (key === "imageurl" || key === "image" || key === "img" || key === "pic" || key === "picture" || key === "mediaurl") {
                   updates.mediaUrl = value;
                 }
                 if (key === "category" || key === "tag" || key === "genre") {
                   updates.category = value;
                 }
                 if (key === "heading" || key === "title" || key === "headline") {
                   updates.heading = value;
                 }
                 if (key === "authorname" || key === "author" || key === "publisher") {
                   updates.authorName = value;
                 }
                 if (key === "commentcount" || key === "comments" || key === "replies") {
                   updates.commentCount = value;
                 }
                 if (key === "posteddate" || key === "date" || key === "time") {
                   updates.postedDate = value;
                 }
               }
             });

             setSiteData(prev => {
               const finalData = { ...prev, ...updates };
               localStorage.setItem('siteConfigCache', JSON.stringify(finalData));
               return finalData;
             });
             
             if (!updates.captionText) fetchLocalCaption();
             
          } catch(e) { 
             console.error("Error mapping CSV", e); 
             fetchLocalCaption();
          }
        },
        error: (err) => {
          console.error("Error parsing Google Sheet CSV:", err);
          fetchLocalCaption();
        }
      });
    } else {
      fetchLocalCaption();
    }
  }, []);

  // --- UPDATE RELATIVE TIME ---
  useEffect(() => {
    const activePostDate = getActivePost().postedDate;
    setRelativeDate(getRelativeTime(activePostDate));
    
    const interval = setInterval(() => {
      setRelativeDate(getRelativeTime(activePostDate));
    }, 60000);
    
    return () => clearInterval(interval);
  }, [currentPostId, siteData.postedDate]);

  // --- POSTS RESOLUTION ---
  const defaultPost = {
    id: 'default',
    category: siteData.category || config.category || "Bangla Golpo",
    heading: siteData.heading || config.heading || "Copyright Test",
    authorName: siteData.authorName || config.authorName || "Garuda Cyber Shield",
    postedDate: siteData.postedDate || config.postedDate || "2026-02-01T12:00:00",
    commentCount: siteData.commentCount || config.commentCount || 2,
    mediaType: config.mediaType,
    mediaUrl: siteData.mediaUrl || config.mediaPath,
    content: siteData.captionText || "Right Reserved By GCS\n\ndafsdffsfd"
  };

  const allPosts = [defaultPost, ...(config.demoPosts || [])];

  const getActivePost = () => {
    if (!currentPostId || currentPostId === 'default') {
      return defaultPost;
    }
    return allPosts.find(p => p.id === currentPostId) || defaultPost;
  };

  // --- DYNAMIC COUNTS FOR WIDGETS ---
  const getCategoryCounts = () => {
    const counts = {};
    allPosts.forEach(post => {
      const cat = post.category || 'General';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  };

  const recentPosts = allPosts.slice(0, 4);

  // --- UTILITIES FOR ACTIONS ---
  const handleNavigateToPost = (postId) => {
    setCurrentPostId(postId);
    setCurrentPage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToCategory = (cat) => {
    setCurrentCategory(cat);
    setCurrentPage('category');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInputVal.trim()) {
      setSearchQuery(searchInputVal.trim());
      setCurrentPage('search');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // --- CONTACT FORM SUBMIT ---
  const handleContactSubmit = (e) => {
    e.preventDefault();
    let errors = {};
    if (!contactForm.name) errors.name = "Full Name is required";
    if (!contactForm.email) {
      errors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(contactForm.email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!contactForm.subject) errors.subject = "Subject is required";
    if (!contactForm.message) errors.message = "Message cannot be empty";

    if (Object.keys(errors).length > 0) {
      setContactErrors(errors);
      return;
    }

    setContactErrors({});
    setContactSubmitted(true);
    // Reset form after delay
    setTimeout(() => {
      setContactSubmitted(false);
      setContactForm({ name: '', email: '', subject: '', message: '' });
    }, 4000);
  };

  // --- DOWNLOAD SIMULATION ---
  const triggerDownloadSimulation = () => {
    if (downloadProgress !== null) return;
    setDownloadProgress(0);
    setDownloadStatusText('Connecting to Garuda secure server...');
    
    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 15) + 5;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setDownloadProgress('done');
        setDownloadStatusText('Package encrypted & verified successfully! Download started.');
        
        // Trigger simulated file download of config.js mock
        const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "garuda-cyber-shield-config.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        setTimeout(() => {
          setDownloadProgress(null);
          setDownloadStatusText('');
        }, 5000);
      } else {
        setDownloadProgress(current);
        if (current > 80) setDownloadStatusText('Verifying integrity signatures...');
        else if (current > 50) setDownloadStatusText('Compiling configuration scripts...');
        else if (current > 25) setDownloadStatusText('Decrypting package assets...');
      }
    }, 300);
  };

  // --- ACCORDION TOGGLE ---
  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  // --- NAVIGATION ACCENTS ---
  const isNavActive = (pageName) => {
    return currentPage === pageName ? 'nav-active' : '';
  };

  return (
    <>
      <header className="header">
        {/* Top bar with Navigation Links */}
        <div className="top-bar">
          <div className="container">
            <div className="nav-links">
              <a href="#" className={isNavActive('home')} onClick={(e) => { e.preventDefault(); setCurrentPage('home'); setCurrentPostId(null); }}>Home</a>
              <a href="#" className={isNavActive('about')} onClick={(e) => { e.preventDefault(); setCurrentPage('about'); }}>About Us</a>
              <a href="#" className={isNavActive('contact')} onClick={(e) => { e.preventDefault(); setCurrentPage('contact'); }}>Contact Us</a>
            </div>
            <div className="header-icons">
              <a href={config.socialLinks.facebook} target="_blank" rel="noreferrer"><FaFacebookF className="icon" size={16} /></a>
              <a href={config.socialLinks.twitter} target="_blank" rel="noreferrer"><FaTwitter className="icon" size={16} /></a>
              <a href={config.socialLinks.youtube} target="_blank" rel="noreferrer"><FaYoutube className="icon" size={16} /></a>
            </div>
          </div>
        </div>
        
        {/* Main Logo & Menu Bar */}
        <div className="main-header">
          <div className="container">
            <div className="logo" onClick={() => { setCurrentPage('home'); setCurrentPostId(null); }} style={{ cursor: 'pointer' }}>
              <img src={logoImg} alt="Logo" style={{ maxHeight: '45px' }} />
              {config.logoText}
            </div>
            
            <nav className={`main-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
              <a href="#" className={currentPage === 'home' && !currentPostId ? 'active-menu-link' : ''} onClick={(e) => { e.preventDefault(); setCurrentPage('home'); setCurrentPostId(null); setMobileMenuOpen(false); }}>HOME</a>
              
              {/* Features Menu item with Dropdown */}
              <div className="nav-dropdown-wrapper">
                <a href="#" className="nav-dropdown-trigger">FEATURES <ChevronDown size={14} style={{ marginLeft: '3px', verticalAlign: 'middle' }} /></a>
                <div className="nav-dropdown-menu">
                  <a href="#" onClick={(e) => { e.preventDefault(); setLayoutMode('left-sidebar'); setCurrentPage('home'); setMobileMenuOpen(false); }}>Left Sidebar Layout</a>
                  <a href="#" onClick={(e) => { e.preventDefault(); setLayoutMode('right-sidebar'); setCurrentPage('home'); setMobileMenuOpen(false); }}>Right Sidebar Layout</a>
                  <a href="#" onClick={(e) => { e.preventDefault(); setLayoutMode('full-width'); setCurrentPage('home'); setMobileMenuOpen(false); }}>Full Width Layout</a>
                  <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('typography'); setMobileMenuOpen(false); }}>Typography & Shortcodes</a>
                  <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('404'); setMobileMenuOpen(false); }}>404 Error Page</a>
                </div>
              </div>

              {/* Mega Menu with Dropdown Panel */}
              <div 
                className="nav-dropdown-wrapper mega-menu-wrapper"
                onMouseEnter={() => setMegaMenuHovered(true)}
                onMouseLeave={() => setMegaMenuHovered(false)}
              >
                <a href="#" className="nav-dropdown-trigger">MEGA MENU <ChevronDown size={14} style={{ marginLeft: '3px', verticalAlign: 'middle' }} /></a>
                <div className={`mega-menu-panel ${megaMenuHovered ? 'mega-visible' : ''}`}>
                  <div className="mega-container-grid">
                    <div className="mega-sidebar">
                      <h4 className="mega-title">Categories</h4>
                      <button 
                        className={`mega-side-link ${activeMegaCategory === 'Cyber Security' ? 'active' : ''}`}
                        onMouseEnter={() => setActiveMegaCategory('Cyber Security')}
                        onClick={() => { handleNavigateToCategory('Cyber Security'); setMegaMenuHovered(false); }}
                      >
                        Cyber Security
                      </button>
                      <button 
                        className={`mega-side-link ${activeMegaCategory === 'Malware Analysis' ? 'active' : ''}`}
                        onMouseEnter={() => setActiveMegaCategory('Malware Analysis')}
                        onClick={() => { handleNavigateToCategory('Malware Analysis'); setMegaMenuHovered(false); }}
                      >
                        Malware Analysis
                      </button>
                      <button 
                        className={`mega-side-link ${activeMegaCategory === 'Social Engineering' ? 'active' : ''}`}
                        onMouseEnter={() => setActiveMegaCategory('Social Engineering')}
                        onClick={() => { handleNavigateToCategory('Social Engineering'); setMegaMenuHovered(false); }}
                      >
                        Social Engineering
                      </button>
                      <button 
                        className={`mega-side-link ${activeMegaCategory === 'Bangla Golpo' ? 'active' : ''}`}
                        onMouseEnter={() => setActiveMegaCategory('Bangla Golpo')}
                        onClick={() => { handleNavigateToCategory('Bangla Golpo'); setMegaMenuHovered(false); }}
                      >
                        Bangla Golpo
                      </button>
                    </div>
                    
                    <div className="mega-content">
                      <h4 className="mega-title">Recent Posts in {activeMegaCategory}</h4>
                      <div className="mega-posts-grid">
                        {allPosts
                          .filter(post => post.category === activeMegaCategory)
                          .slice(0, 3)
                          .map(post => (
                            <div key={post.id} className="mega-post-card" onClick={() => { handleNavigateToPost(post.id); setMegaMenuHovered(false); }}>
                              <div className="mega-post-thumb">
                                <img 
                                  src={post.mediaUrl} 
                                  alt={post.heading} 
                                  loading="lazy"
                                  onError={(e) => { e.target.onerror = null; e.target.src = logoImg; }}
                                />
                              </div>
                              <h5 className="mega-post-title">{post.heading}</h5>
                              <span className="mega-post-date">{getRelativeTime(post.postedDate)}</span>
                            </div>
                          ))}
                        {allPosts.filter(post => post.category === activeMegaCategory).length === 0 && (
                          <div className="mega-no-posts">No articles in this category.</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <a href="#" className={currentPage === 'documentation' ? 'active-menu-link' : ''} onClick={(e) => { e.preventDefault(); setCurrentPage('documentation'); setMobileMenuOpen(false); }}>DOCUMENTATION</a>
              <a href="#" className={currentPage === 'download' ? 'active-menu-link' : ''} onClick={(e) => { e.preventDefault(); setCurrentPage('download'); setMobileMenuOpen(false); }}>DOWNLOAD THIS TEMPLATE</a>
            </nav>
            
            {/* Search Input Bar Expansion */}
            <div className="header-search-container">
              <form onSubmit={handleSearchSubmit} className={`header-search-form ${isSearchExpanded ? 'expanded' : ''}`}>
                <input 
                  type="text" 
                  placeholder="Search articles..." 
                  value={searchInputVal}
                  onChange={(e) => setSearchInputVal(e.target.value)}
                  className="search-input"
                />
                {isSearchExpanded && (
                  <button type="button" className="search-close-btn" onClick={() => { setIsSearchExpanded(false); setSearchInputVal(''); }}>
                    <X size={16} />
                  </button>
                )}
              </form>
              <button className="search-trigger-btn" onClick={() => {
                if (isSearchExpanded) {
                  if (searchInputVal.trim()) {
                    setSearchQuery(searchInputVal.trim());
                    setCurrentPage('search');
                  }
                } else {
                  setIsSearchExpanded(true);
                }
              }}>
                <Search className="icon search-icon" size={20} />
              </button>
            </div>

            {/* Mobile Menu Bar Button */}
            <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      <main className={`container-main ${layoutMode === 'left-sidebar' ? 'left-sidebar-layout' : ''} ${layoutMode === 'full-width' || currentPage === '404' || currentPage === 'download' ? 'full-width-layout' : ''}`}>
        
        {/* --- PAGE CONTENT RESOLUTION --- */}
        <section className="article-content">
          
          {/* 1. ARTICLE DETAIL / HOME PAGE */}
          {currentPage === 'home' && (() => {
            const activePost = getActivePost();
            return (
              <>
                <div className="breadcrumb">
                  Home &gt; <span>{activePost.category}</span>
                </div>
                
                <div className="article-header">
                  <h1>{activePost.heading}</h1>
                  
                  <div className="meta">
                    <div className="author-info">
                      <div className="author-avatar"><User size={20}/></div>
                      <div>by <span className="author-name">{activePost.authorName}</span> - <span className="post-date">{relativeDate}</span></div>
                    </div>
                    
                    <div className="comments-count">
                      <MessageCircle size={18} /> {activePost.commentCount} Comments
                    </div>
                  </div>
                </div>
                
                <div className="article-text">
                  {(activePost.content || "").split('\n').map((paragraph, index) => (
                    <p key={index} style={{ marginBottom: paragraph ? '15px' : '0' }}>{paragraph}</p>
                  ))}
                </div>
                
                <div className="media-container">
                  {activePost.mediaType === 'video' ? (
                    <video width="100%" height="auto" controls autoPlay={true} muted src={activePost.mediaUrl}>
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <img 
                      src={activePost.mediaUrl} 
                      alt="Article media" 
                      onError={(e) => { e.target.onerror = null; e.target.src = config.mediaPath; }}
                    />
                  )}
                </div>

                {/* Sub-Article Navigation Details */}
                <div className="related-articles-section">
                  <h3 className="section-title-accent">You Might Also Like</h3>
                  <div className="related-grid">
                    {allPosts
                      .filter(p => p.id !== activePost.id)
                      .slice(0, 2)
                      .map(p => (
                        <div key={p.id} className="related-card" onClick={() => handleNavigateToPost(p.id)}>
                          <div className="related-thumb">
                            <img 
                              src={p.mediaUrl} 
                              alt={p.heading} 
                              loading="lazy"
                              onError={(e) => { e.target.onerror = null; e.target.src = config.mediaPath; }}
                            />
                          </div>
                          <div className="related-info">
                            <span className="related-cat">{p.category}</span>
                            <h4 className="related-heading">{p.heading}</h4>
                            <span className="related-time">{getRelativeTime(p.postedDate)}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </>
            );
          })()}

          {/* 2. ABOUT US PAGE */}
          {currentPage === 'about' && (
            <div className="about-us-page">
              <div className="breadcrumb">
                Home &gt; <span>About Us</span>
              </div>
              
              <div className="custom-page-header">
                <h1>About Garuda Cyber Shield</h1>
                <p className="subtitle">Empowering digital security through intelligent solutions and dynamic design templates.</p>
              </div>

              <div className="about-grid">
                <div className="about-text-panel">
                  <h2>Defending the Digital Frontier</h2>
                  <p>Garuda Cyber Shield (GCS) is a state-of-the-art cyber defense framework and informational publisher. Founded with the mission to catalog, analyze, and mitigate digital vulnerabilities, GCS serves as a trusted ally for secure systems architecture.</p>
                  <p>Our blogging division publishes critical research on emerging threat intelligence, phishing defense strategies, malware parsing, and secure cloud deployments. The "GCS Blogger Template" represents our signature synthesis of maximum aesthetic visual excellence and zero-database dynamic scripting.</p>
                  
                  <div className="values-grid">
                    <div className="value-card">
                      <Shield className="value-icon" size={32} />
                      <h4>Cyber Defense</h4>
                      <p>Rigorous cataloging and auditing of threats to block intrusions before execution.</p>
                    </div>
                    <div className="value-card">
                      <Layers className="value-icon" size={32} />
                      <h4>Modular Integration</h4>
                      <p>Sleek interfaces driven by standard web protocols and dynamic configurations.</p>
                    </div>
                  </div>
                </div>

                <div className="about-stats-panel">
                  <div className="stat-card">
                    <h3 className="stat-num">99.8%</h3>
                    <p className="stat-label">Intrusion Block Rate</p>
                  </div>
                  <div className="stat-card">
                    <h3 className="stat-num">1.2M+</h3>
                    <p className="stat-label">Security Alerts Published</p>
                  </div>
                  <div className="stat-card">
                    <h3 className="stat-num">0 ms</h3>
                    <p className="stat-label">Server Database Latency</p>
                  </div>
                </div>
              </div>

              <div className="team-section">
                <h3 className="section-title-accent">Our Security Command</h3>
                <div className="team-grid">
                  <div className="team-member-card">
                    <div className="member-avatar"><User size={40} /></div>
                    <h4>Anuradha Odhi</h4>
                    <p className="member-role">Lead Malware Researcher</p>
                  </div>
                  <div className="team-member-card">
                    <div className="member-avatar"><User size={40} /></div>
                    <h4>Garuda Admin</h4>
                    <p className="member-role">Principal Systems Architect</p>
                  </div>
                  <div className="team-member-card">
                    <div className="member-avatar"><User size={40} /></div>
                    <h4>SecOps Team</h4>
                    <p className="member-role">24/7 Security Operations</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. CONTACT US PAGE */}
          {currentPage === 'contact' && (
            <div className="contact-us-page">
              <div className="breadcrumb">
                Home &gt; <span>Contact Us</span>
              </div>
              
              <div className="custom-page-header">
                <h1>Secure Contact Terminal</h1>
                <p className="subtitle">Connect directly with our cybersecurity support command or submit feedback logs.</p>
              </div>

              <div className="contact-grid">
                <div className="contact-info-panel">
                  <h3>GCS Command HQ</h3>
                  <p>Have an escalation log to share, or seeking corporate audit license integrations? Reach out to GCS Support Command.</p>
                  
                  <div className="contact-detail-item">
                    <Phone className="contact-icon" size={20} />
                    <div>
                      <h5>Response Support Line</h5>
                      <p>+880 1700-000000 (Secured Port)</p>
                    </div>
                  </div>

                  <div className="contact-detail-item">
                    <BookOpen className="contact-icon" size={20} />
                    <div>
                      <h5>General Enquiries & Audits</h5>
                      <p>command@garudacybershield.org</p>
                    </div>
                  </div>

                  <div className="contact-detail-item">
                    <Clock className="contact-icon" size={20} />
                    <div>
                      <h5>Support Availability</h5>
                      <p>24 Hours / 7 Days a week</p>
                    </div>
                  </div>

                  <div className="secured-badge">
                    <Shield size={18} />
                    <span>Secure end-to-end SMTP routing active</span>
                  </div>
                </div>

                <div className="contact-form-panel">
                  {contactSubmitted ? (
                    <div className="form-success-container">
                      <CheckCircle className="success-icon animate-bounce" size={60} />
                      <h3>Transmission Secured</h3>
                      <p>Your logs have been uploaded to GCS. Incident Ticket #{Math.floor(Math.random() * 90000) + 10000} generated.</p>
                      <div className="progress-bar-small">
                        <div className="progress-fill-small animate-shrink"></div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="contact-form">
                      <div className="form-group">
                        <label>Your Name</label>
                        <input 
                          type="text" 
                          value={contactForm.name} 
                          onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                          placeholder="e.g. Anuradha Odhi" 
                          className={contactErrors.name ? 'input-error' : ''}
                        />
                        {contactErrors.name && <span className="error-text">{contactErrors.name}</span>}
                      </div>

                      <div className="form-group">
                        <label>Your Email Address</label>
                        <input 
                          type="email" 
                          value={contactForm.email} 
                          onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                          placeholder="e.g. security@domain.com" 
                          className={contactErrors.email ? 'input-error' : ''}
                        />
                        {contactErrors.email && <span className="error-text">{contactErrors.email}</span>}
                      </div>

                      <div className="form-group">
                        <label>Message Subject</label>
                        <input 
                          type="text" 
                          value={contactForm.subject} 
                          onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                          placeholder="e.g. Incident Escalation / Feature Request" 
                          className={contactErrors.subject ? 'input-error' : ''}
                        />
                        {contactErrors.subject && <span className="error-text">{contactErrors.subject}</span>}
                      </div>

                      <div className="form-group">
                        <label>Message Content / Log Output</label>
                        <textarea 
                          value={contactForm.message} 
                          onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                          placeholder="Type your security details or logs here..." 
                          rows={6}
                          className={contactErrors.message ? 'input-error' : ''}
                        ></textarea>
                        {contactErrors.message && <span className="error-text">{contactErrors.message}</span>}
                      </div>

                      <button type="submit" className="form-submit-btn">
                        <Send size={16} /> Send Secure Message
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 4. DOCUMENTATION PAGE */}
          {currentPage === 'documentation' && (
            <div className="documentation-page">
              <div className="breadcrumb">
                Home &gt; <span>Documentation</span>
              </div>
              
              <div className="custom-page-header">
                <h1>Garuda Cyber Shield Documentation</h1>
                <p className="subtitle">Learn how to customize, deploy, and manage your dynamic Google Sheets Blogger template.</p>
              </div>

              {/* Dynamic Document Tabs */}
              <div className="doc-tabs-nav">
                <button 
                  className={`doc-tab-btn ${activeDocTab === 'setup' ? 'active' : ''}`}
                  onClick={() => setActiveDocTab('setup')}
                >
                  <Layers size={16} /> 1. Sheet Setup Guide
                </button>
                <button 
                  className={`doc-tab-btn ${activeDocTab === 'config' ? 'active' : ''}`}
                  onClick={() => setActiveDocTab('config')}
                >
                  <Key size={16} /> 2. config.js Fields
                </button>
                <button 
                  className={`doc-tab-btn ${activeDocTab === 'shortcodes' ? 'active' : ''}`}
                  onClick={() => setActiveDocTab('shortcodes')}
                >
                  <FileText size={16} /> 3. Shortcode Alerts
                </button>
              </div>

              <div className="doc-content-pane">
                {activeDocTab === 'setup' && (
                  <div className="doc-pane animate-fade">
                    <h3>Connecting Google Sheets CSV</h3>
                    <p>The Garuda Cyber Shield template leverages dynamic front-end parsing to update page parameters without requiring compilation. To initialize your remote data database, follow these structured instructions:</p>
                    
                    <div className="styled-steps-list">
                      <div className="step-item">
                        <span className="step-number">1</span>
                        <div>
                          <h5>Create Google Sheet</h5>
                          <p>Initialize a Google Sheet. Create two columns named exactly <strong>Key</strong> and <strong>Value</strong> in row 1.</p>
                        </div>
                      </div>

                      <div className="step-item">
                        <span className="step-number">2</span>
                        <div>
                          <h5>Define Config Keys</h5>
                          <p>In rows 2-8, insert the parameter keys you wish to override remotely. Case is automatically standardized. We support:</p>
                          <table className="doc-table-small">
                            <thead>
                              <tr>
                                <th>Sheet Key</th>
                                <th>Description</th>
                                <th>Sample Value</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td><code>heading</code></td>
                                <td>Article Title Heading</td>
                                <td>Advanced Threat Audit 2026</td>
                              </tr>
                              <tr>
                                <td><code>caption</code></td>
                                <td>Full article text content. Use <code>\n</code> for line breaks.</td>
                                <td>Security logs detected...</td>
                              </tr>
                              <tr>
                                <td><code>imageurl</code></td>
                                <td>HTTPS link to primary image banner</td>
                                <td>https://domain.com/banner.jpg</td>
                              </tr>
                              <tr>
                                <td><code>category</code></td>
                                <td>Post classification category breadcrumb</td>
                                <td>Malware Analysis</td>
                              </tr>
                              <tr>
                                <td><code>authorname</code></td>
                                <td>Publisher identity name</td>
                                <td>Anuradha Odhi</td>
                              </tr>
                              <tr>
                                <td><code>commentcount</code></td>
                                <td>Mock visual number of reader comments</td>
                                <td>15</td>
                              </tr>
                              <tr>
                                <td><code>posteddate</code></td>
                                <td>JavaScript parsing friendly Date String</td>
                                <td>2026-05-28T14:30:00</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="step-item">
                        <span className="step-number">3</span>
                        <div>
                          <h5>Publish to Web</h5>
                          <p>In your sheet toolbar, navigate to: <strong>File &gt; Share &gt; Publish to web</strong>. Under options, switch the format from Web Page to <strong>Comma-separated values (.csv)</strong> and click Publish.</p>
                        </div>
                      </div>

                      <div className="step-item">
                        <span className="step-number">4</span>
                        <div>
                          <h5>Paste CSV Link</h5>
                          <p>Copy the generated link. Open [config.js](file:///g:/Shangram/Spamming/Garuda%20Cyber%20Sheild/Copyriht/blogger-page/src/config.js) and paste it into the <code>googleSheetCsvUrl</code> variable. Save the file. The site updates instantly!</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeDocTab === 'config' && (
                  <div className="doc-pane animate-fade">
                    <h3>config.js Configuration Reference</h3>
                    <p>If the Google Sheets URL is empty or fails to compile, the site seamlessly falls back to local static configurations defined inside <code>src/config.js</code>. Below is the full variables list:</p>
                    
                    <div className="ref-grid">
                      <div className="ref-card">
                        <h5><code>pageTitle</code></h5>
                        <span className="ref-type">String</span>
                        <p>Changes the main tab text title in the user's browser.</p>
                      </div>
                      <div className="ref-card">
                        <h5><code>logoText</code></h5>
                        <span className="ref-type">String</span>
                        <p>Changes the plain text logo adjacent to the header shield emblem.</p>
                      </div>
                      <div className="ref-card">
                        <h5><code>mediaPath</code></h5>
                        <span className="ref-type">String</span>
                        <p>Path to local assets stored in your <code>/public</code> directory. Used as offline fallback.</p>
                      </div>
                      <div className="ref-card">
                        <h5><code>mediaType</code></h5>
                        <span className="ref-type">"image" | "video"</span>
                        <p>Switches between an HTML5 Video Player and Standard IMG container in article body.</p>
                      </div>
                      <div className="ref-card">
                        <h5><code>socialLinks</code></h5>
                        <span className="ref-type">Object</span>
                        <p>Target anchors for Facebook, Twitter, Skype, LinkedIn, YouTube buttons.</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeDocTab === 'shortcodes' && (
                  <div className="doc-pane animate-fade">
                    <h3>Pre-Styled Shortcode Blocks</h3>
                    <p>Adhering to standard Blogger designs, GCS includes CSS modules to build beautifully accented warning/information boxes within articles. Simply format your paragraph markup utilizing these class elements:</p>
                    
                    <div className="shortcode-demo-container">
                      <h5>1. Info Highlight Box</h5>
                      <pre><code>{`<div className="alert-box alert-info">
  <Info size={18} />
  <span>Information Log: Systems architecture modified...</span>
</div>`}</code></pre>
                      <div className="alert-box alert-info" style={{ marginTop: '10px' }}>
                        <Info size={18} />
                        <span>Information Log: Systems architecture modified. Sync processes complete.</span>
                      </div>

                      <h5 style={{ marginTop: '20px' }}>2. Threat Warning Box</h5>
                      <pre><code>{`<div className="alert-box alert-danger">
  <AlertCircle size={18} />
  <span>Warning Threat: Unauthorized remote execution blocked.</span>
</div>`}</code></pre>
                      <div className="alert-box alert-danger" style={{ marginTop: '10px' }}>
                        <AlertCircle size={18} />
                        <span>Warning Threat: Unauthorized remote execution blocked. Access token dropped.</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 5. DOWNLOAD THIS TEMPLATE PAGE */}
          {currentPage === 'download' && (
            <div className="download-page">
              <div className="breadcrumb">
                Home &gt; <span>Download Template</span>
              </div>
              
              <div className="download-hero">
                <Shield className="hero-emblem animate-pulse" size={80} />
                <h1>Garuda Cyber Shield Template</h1>
                <p>Get the premium, highly optimized, zero-database dynamic Blogger template now. Complete with preconfigured layout structures, mega-menus, search indexing, and Google Sheet sync controllers.</p>
                
                {downloadProgress !== null ? (
                  <div className="download-progress-container">
                    <span className="progress-status">{downloadStatusText}</span>
                    <div className="progress-bar-large">
                      <div 
                        className={`progress-fill-large ${downloadProgress === 'done' ? 'done' : ''}`} 
                        style={{ width: downloadProgress === 'done' ? '100%' : `${downloadProgress}%` }}
                      ></div>
                    </div>
                    {downloadProgress !== 'done' && <span className="progress-percent">{downloadProgress}% Securing Transfer</span>}
                  </div>
                ) : (
                  <button className="primary-download-btn" onClick={triggerDownloadSimulation}>
                    <Download size={20} /> Download GCS Package (v1.4.2)
                  </button>
                )}
              </div>

              <div className="features-highlight-grid">
                <div className="f-highlight-card">
                  <Clock size={32} className="f-icon" />
                  <h4>99+ PageSpeed Score</h4>
                  <p>Strictly minimized scripting weight and static markup rendering guarantees instant paint times for users.</p>
                </div>
                
                <div className="f-highlight-card">
                  <Layers size={32} className="f-icon" />
                  <h4>3-Way Layout Switch</h4>
                  <p>Toggle Left Sidebar, Right Sidebar, or Full Width body wrappers seamlessly through dynamic class configurations.</p>
                </div>

                <div className="f-highlight-card">
                  <Shield size={32} className="f-icon" />
                  <h4>SEO Schema Included</h4>
                  <p>Native JSON-LD markup and structured breadcrumb architectures enable rich Google snippet rendering.</p>
                </div>
              </div>

              {/* Dynamic Accordion FAQ */}
              <div className="faq-accordion-section">
                <h3 className="section-title-accent">Frequently Asked Questions</h3>
                
                <div className="accordion-group">
                  {[
                    {
                      q: "Does this template require any database setup?",
                      a: "No! The GCS blogger template runs entirely on client-side React and PapaParse routing, letting you fetch article data remotely from any shared public Google Sheet CSV."
                    },
                    {
                      q: "How fast is the standard loading paint latency?",
                      a: "Because there is no SQL query processing, dynamic elements are fetched in parallel with document rendering. Average paint times are below 400ms under standard 4G conditions."
                    },
                    {
                      q: "Can I host this template on static providers?",
                      a: "Absolutely. The compiled package compiles into standard HTML, JS, and CSS files that can be hosted completely free on Vercel, Netlify, GitHub Pages, or any traditional web server."
                    }
                  ].map((faq, i) => (
                    <div key={i} className="accordion-item">
                      <button className="accordion-trigger" onClick={() => toggleAccordion(i)}>
                        <span>{faq.q}</span>
                        <ChevronDown className={`accordion-chevron ${activeAccordion === i ? 'rotated' : ''}`} size={16} />
                      </button>
                      <div className={`accordion-content ${activeAccordion === i ? 'expanded' : ''}`}>
                        <p>{faq.a}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 6. TYPOGRAPHY & ELEMENTS PAGE */}
          {currentPage === 'typography' && (
            <div className="typography-elements-page">
              <div className="breadcrumb">
                Home &gt; <span>Typography & Elements</span>
              </div>

              <div className="custom-page-header">
                <h1>Typography & UI Elements</h1>
                <p className="subtitle">Standardized styling rules and components configured natively within the GCS stylesheet.</p>
              </div>

              <div className="typo-section">
                <h3>1. Structured Headings</h3>
                <h1>H1 Theme Title - 2.5rem</h1>
                <h2>H2 Category Section - 1.8rem</h2>
                <h3>H3 Component Header - 1.4rem</h3>
                <h4>H4 Detail Label - 1.1rem</h4>
              </div>

              <hr className="typo-hr" />

              <div className="typo-section">
                <h3>2. Context Highlights & Alerts</h3>
                <p>Standardized containers styled dynamically for in-line warning logs, threat detections, or informative callouts:</p>
                
                <div className="alert-box alert-success">
                  <CheckCircle size={18} />
                  <span><strong>Success Log:</strong> Authentication validated. Security perimeter fully established.</span>
                </div>

                <div className="alert-box alert-info">
                  <Info size={18} />
                  <span><strong>Information Alert:</strong> Automatic configuration backup scheduled in 14 minutes.</span>
                </div>

                <div className="alert-box alert-warning">
                  <AlertTriangle size={18} />
                  <span><strong>System Warning:</strong> Deprecated encryption standards detected in configuration. Updating recommended.</span>
                </div>

                <div className="alert-box alert-danger">
                  <AlertCircle size={18} />
                  <span><strong>Threat Intercepted:</strong> 14 invalid key attempts detected from remote IP 192.168.1.104. Source blocked.</span>
                </div>
              </div>

              <hr className="typo-hr" />

              <div className="typo-section">
                <h3>3. Action Buttons</h3>
                <div className="buttons-demo-flex">
                  <button className="btn btn-primary">Primary Action</button>
                  <button className="btn btn-secondary">Secondary Action</button>
                  <button className="btn btn-outline">Outline Action</button>
                  <button className="btn btn-danger">Danger Alert</button>
                  <button className="btn btn-success">Success Action</button>
                </div>
              </div>

              <hr className="typo-hr" />

              <div className="typo-section">
                <h3>4. Structured Tables</h3>
                <table className="typo-table">
                  <thead>
                    <tr>
                      <th>Module ID</th>
                      <th>Module Title</th>
                      <th>Status Check</th>
                      <th>Latency</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>MOD_01_AUTH</code></td>
                      <td>Secure Key Decryption</td>
                      <td><span className="badge badge-success">Active</span></td>
                      <td>12 ms</td>
                    </tr>
                    <tr>
                      <td><code>MOD_02_SYNC</code></td>
                      <td>Google Sheet CSV Integration</td>
                      <td><span className="badge badge-success">Active</span></td>
                      <td>142 ms</td>
                    </tr>
                    <tr>
                      <td><code>MOD_03_AUDIT</code></td>
                      <td>Intrusion Log Indexer</td>
                      <td><span className="badge badge-warning">Checking</span></td>
                      <td>0 ms</td>
                    </tr>
                    <tr>
                      <td><code>MOD_04_CRON</code></td>
                      <td>Security Signature Refresh</td>
                      <td><span className="badge badge-danger">Offline</span></td>
                      <td>-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 7. 404 PAGE */}
          {currentPage === '404' && (
            <div className="error-404-page">
              <Shield className="error-icon-shield" size={100} />
              <h1 className="error-title">404</h1>
              <h3 className="error-heading">Intruder / Lost Request Detected</h3>
              <p className="error-text-desc">The secure route you requested does not exist or has been quarantined by our security operations team. Verification failed.</p>
              
              <div className="terminal-box">
                <p className="terminal-line">&gt; SYSTEM LOGS: ACCESS DENIED ON ROUTE '{window.location.hash || "/requested-page"}'</p>
                <p className="terminal-line">&gt; ERROR_CODE: GCS_ERR_ROUTE_NOT_FOUND_404</p>
                <p className="terminal-line">&gt; STATUS: QUARANTINING IP CONNECTION...</p>
              </div>

              <button className="error-home-btn" onClick={() => { setCurrentPage('home'); setCurrentPostId(null); }}>
                <ArrowLeft size={16} style={{ marginRight: '5px' }} /> Return to Secure Perimeter
              </button>
            </div>
          )}

          {/* 8. CATEGORY POSTS GRID PAGE */}
          {currentPage === 'category' && (
            <div className="category-posts-page">
              <div className="breadcrumb">
                Home &gt; Category &gt; <span>{currentCategory}</span>
              </div>

              <div className="custom-page-header">
                <h1>Category: {currentCategory}</h1>
                <p className="subtitle">Displaying all indexed cybersecurity logs under the {currentCategory} section.</p>
              </div>

              <div className="posts-card-grid">
                {allPosts
                  .filter(post => post.category === currentCategory)
                  .map(post => (
                    <div key={post.id} className="post-summary-card" onClick={() => handleNavigateToPost(post.id)}>
                      <div className="post-summary-thumb">
                        <img 
                          src={post.mediaUrl} 
                          alt={post.heading} 
                          loading="lazy"
                          onError={(e) => { e.target.onerror = null; e.target.src = config.mediaPath; }}
                        />
                        <span className="post-summary-cat-badge">{post.category}</span>
                      </div>
                      <div className="post-summary-content">
                        <h3>{post.heading}</h3>
                        <p>{post.content ? post.content.substring(0, 120) + "..." : ""}</p>
                        <div className="post-summary-meta">
                          <span className="post-summary-author"><User size={14} /> {post.authorName}</span>
                          <span className="post-summary-date"><Clock size={14} /> {getRelativeTime(post.postedDate)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                {allPosts.filter(post => post.category === currentCategory).length === 0 && (
                  <div className="no-posts-found">
                    <AlertCircle size={48} />
                    <h3>No Articles Found</h3>
                    <p>We could not find any security reports matching this category.</p>
                    <button className="btn btn-primary" onClick={() => { setCurrentPage('home'); setCurrentPostId(null); }}>Back Home</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 9. SEARCH RESULTS PAGE */}
          {currentPage === 'search' && (() => {
            const matches = allPosts.filter(post => {
              const query = searchQuery.toLowerCase();
              return (post.heading || '').toLowerCase().includes(query) || 
                     (post.content || '').toLowerCase().includes(query) ||
                     (post.category || '').toLowerCase().includes(query);
            });

            return (
              <div className="search-results-page">
                <div className="breadcrumb">
                  Home &gt; Search &gt; <span>{searchQuery}</span>
                </div>

                <div className="custom-page-header">
                  <h1>Search Results for "{searchQuery}"</h1>
                  <p className="subtitle">Found {matches.length} articles matching your security lookup query.</p>
                </div>

                <div className="posts-card-grid">
                  {matches.map(post => (
                    <div key={post.id} className="post-summary-card" onClick={() => handleNavigateToPost(post.id)}>
                      <div className="post-summary-thumb">
                        <img 
                          src={post.mediaUrl} 
                          alt={post.heading} 
                          loading="lazy"
                          onError={(e) => { e.target.onerror = null; e.target.src = config.mediaPath; }}
                        />
                        <span className="post-summary-cat-badge">{post.category}</span>
                      </div>
                      <div className="post-summary-content">
                        <h3>{post.heading}</h3>
                        <p>{post.content ? post.content.substring(0, 120) + "..." : ""}</p>
                        <div className="post-summary-meta">
                          <span className="post-summary-author"><User size={14} /> {post.authorName}</span>
                          <span className="post-summary-date"><Clock size={14} /> {getRelativeTime(post.postedDate)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {matches.length === 0 && (
                    <div className="no-posts-found">
                      <AlertCircle size={48} />
                      <h3>No Search Results</h3>
                      <p>Your search for "{searchQuery}" did not return any matches. Double-check your spelling or keywords.</p>
                      <button className="btn btn-primary" onClick={() => { setCurrentPage('home'); setCurrentPostId(null); setSearchInputVal(''); }}>Reset Search</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </section>

        {/* --- SIDEBAR COMPONENT --- */}
        {layoutMode !== 'full-width' && currentPage !== '404' && currentPage !== 'download' && (
          <aside className="sidebar">
            {/* Follow Us Widget */}
            <div className="sidebar-widget">
              <h3 className="widget-title">Follow Us</h3>
              <div className="social-grid">
                <a href={config.socialLinks.facebook} target="_blank" rel="noreferrer" className="social-btn facebook">
                  <FaFacebookF size={18} /> Facebook
                </a>
                <a href={config.socialLinks.twitter} target="_blank" rel="noreferrer" className="social-btn twitter">
                  <FaTwitter size={18} /> Twitter
                </a>
                <a href={config.socialLinks.youtube} target="_blank" rel="noreferrer" className="social-btn youtube">
                  <FaYoutube size={18} /> YouTube
                </a>
                <a href={config.socialLinks.instagram} target="_blank" rel="noreferrer" className="social-btn instagram">
                  <FaInstagram size={18} /> Instagram
                </a>
                <a href={config.socialLinks.linkedin} target="_blank" rel="noreferrer" className="social-btn linkedin">
                  <FaLinkedinIn size={18} /> LinkedIn
                </a>
                <a href={config.socialLinks.skype} target="_blank" rel="noreferrer" className="social-btn skype">
                  <FaSkype size={18} /> Skype
                </a>
              </div>
            </div>

            {/* Popular/Recent Posts Widget */}
            <div className="sidebar-widget">
              <h3 className="widget-title">Recent Reports</h3>
              <div className="recent-posts-list">
                {recentPosts.map(post => (
                  <div key={post.id} className="recent-post-item" onClick={() => handleNavigateToPost(post.id)}>
                    <div className="recent-post-thumb">
                      <img 
                        src={post.mediaUrl} 
                        alt={post.heading} 
                        loading="lazy"
                        onError={(e) => { e.target.onerror = null; e.target.src = config.mediaPath; }}
                      />
                    </div>
                    <div className="recent-post-meta">
                      <h4 className="recent-post-title">{post.heading}</h4>
                      <span className="recent-post-date"><Clock size={12} /> {getRelativeTime(post.postedDate)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Categories Widget */}
            <div className="sidebar-widget">
              <h3 className="widget-title">Categories</h3>
              <div className="categories-list">
                {Object.entries(getCategoryCounts()).map(([cat, count]) => (
                  <button key={cat} className="category-item-btn" onClick={() => handleNavigateToCategory(cat)}>
                    <ChevronRight size={14} className="cat-chevron" />
                    <span className="cat-name">{cat}</span>
                    <span className="cat-count-badge">{count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Tag Cloud Widget */}
            <div className="sidebar-widget">
              <h3 className="widget-title">Tag Cloud</h3>
              <div className="tag-cloud">
                {['Security', 'Malware', 'Phishing', 'OSINT', 'Zero Trust', 'Blogger', 'CSV', 'GCS Command', 'Cyber Defense'].map(tag => (
                  <button key={tag} className="tag-btn" onClick={() => { setSearchInputVal(tag); setSearchQuery(tag); setCurrentPage('search'); }}>
                    <Tag size={12} style={{ marginRight: '4px' }} /> {tag}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        )}
      </main>

      {/* Modern Premium Footer */}
      <footer className="footer-premium">
        <div className="footer-top">
          <div className="container">
            <div className="footer-brand">
              <div className="logo logo-footer">
                <img src={logoImg} alt="Logo" style={{ maxHeight: '35px' }} />
                <span>{config.logoText}</span>
              </div>
              <p>State-of-the-art secure cyber-shield solutions. Enhancing threat intelligence logging using seamless client integrations.</p>
            </div>
            
            <div className="footer-links-grid">
              <div>
                <h5>Secure Operations</h5>
                <ul className="footer-link-list">
                  <li><a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('home'); setCurrentPostId(null); }}>Secure Home Perimeter</a></li>
                  <li><a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('about'); }}>Operational Command Profile</a></li>
                  <li><a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('contact'); }}>Submit Log Incidents</a></li>
                </ul>
              </div>
              <div>
                <h5>Resources</h5>
                <ul className="footer-link-list">
                  <li><a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('documentation'); }}>Setup & API Documentation</a></li>
                  <li><a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('download'); }}>Get GCS Blogger Template</a></li>
                  <li><a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('typography'); }}>Typography System</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="container">
            <p>© {new Date().getFullYear()} Garuda Cyber Shield Website. All Rights Reserved. Protected by GCS Security Protocol.</p>
            <div className="footer-badge-sec">
              <Shield size={14} style={{ marginRight: '5px' }} /> <span>SSL Enforced Routing Active</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export default App;
