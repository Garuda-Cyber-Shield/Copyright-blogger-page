import React, { useState, useEffect } from 'react';
import { Search, MessageCircle, User } from 'lucide-react';
import { FaFacebookF, FaTwitter, FaYoutube, FaInstagram, FaLinkedinIn, FaSkype } from 'react-icons/fa';
import { config } from './config';
import './index.css';
import logoImg from '../Logo.png';
import Papa from 'papaparse';

// Helper for Facebook-like relative time
function getRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return "Just now";
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    // Check if it was yesterday
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
  
  // Format as proper date e.g. "December 31, 2024"
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

function App() {
  const [siteData, setSiteData] = useState(() => {
    try {
      const cached = localStorage.getItem('siteConfigCache');
      // Use precisely the cache if it exists, don't mix in config defaults
      if (cached) return JSON.parse(cached);
    } catch(e) {}
    
    // Start completely empty to absolutely avoid any "glimpse" of dummy data
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
                 const value = String(row[1] || "");
                 
                 if (key === "caption") updates.captionText = value;
                 if (key === "imageurl") updates.mediaUrl = value;
                 if (key === "category") updates.category = value;
                 if (key === "heading") updates.heading = value;
                 if (key === "authorname") updates.authorName = value;
                 if (key === "commentcount") updates.commentCount = value;
                 if (key === "posteddate") updates.postedDate = value;
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

    // Always update relative date
    setRelativeDate(getRelativeTime(siteData.postedDate));
    const interval = setInterval(() => {
      setRelativeDate(getRelativeTime(siteData.postedDate));
    }, 60000);
    return () => clearInterval(interval);
  }, [siteData.postedDate]);

  return (
    <>
      <header className="header">
        <div className="top-bar">
          <div className="container">
            <div className="nav-links">
              <a href="#">Home</a>
              <a href="#">About Us</a>
              <a href="#">Contact Us</a>
            </div>
            <div className="header-icons">
              <FaFacebookF className="icon" size={16} />
              <FaTwitter className="icon" size={16} />
              <FaYoutube className="icon" size={16} />
            </div>
          </div>
        </div>
        
        <div className="main-header">
          <div className="container">
            <div className="logo">
              <img src={logoImg} alt="Logo" style={{maxHeight: '45px'}} />
              {config.logoText}
            </div>
            
            <nav className="main-nav">
              <a href="#">HOME</a>
              <a href="#">FEATURES ˅</a>
              <a href="#">MEGA MENU ˅</a>
              <a href="#">DOCUMENTATION ˅</a>
              <a href="#">DOWNLOAD THIS TEMPLATE</a>
            </nav>
            
            <Search className="icon" size={20} />
          </div>
        </div>
      </header>

      <main className="container-main">
        <article className="article-content">
          <div className="breadcrumb">
            Home &gt; <span>{siteData.category}</span>
          </div>
          
          <div className="article-header">
            <h1>{siteData.heading}</h1>
            
            <div className="meta">
              <div className="author-info">
                <div className="author-avatar"><User size={20}/></div>
                <div>by <span className="author-name">{siteData.authorName}</span> - <span className="post-date">{relativeDate}</span></div>
              </div>
              
              <div className="comments-count">
                <MessageCircle size={18} /> {siteData.commentCount}
              </div>
            </div>
          </div>
          
          <div className="article-text">
            {(siteData.captionText || "").split('\n').map((paragraph, index) => (
               <p key={index} style={{marginBottom: paragraph ? '15px' : '0'}}>{paragraph}</p>
            ))}
          </div>
          
          <div className="media-container">
            {config.mediaType === 'video' ? (
              <video width="100%" height="auto" controls autoPlay={true} muted src={config.mediaPath}>
                Your browser does not support the video tag.
              </video>
            ) : (
              <img src={siteData.mediaUrl} alt="Article media" />
            )}
          </div>
        </article>

        <aside className="sidebar">
          {/* Follow Us Widget */}
          <div className="sidebar-widget">
            <h3 className="widget-title">Follow Us</h3>
            <div className="social-grid">
              <a href={config.socialLinks.facebook} className="social-btn facebook">
                <FaFacebookF size={18} /> Facebook
              </a>
              <a href={config.socialLinks.twitter} className="social-btn twitter">
                <FaTwitter size={18} /> Twitter
              </a>
              <a href={config.socialLinks.youtube} className="social-btn youtube">
                <FaYoutube size={18} /> YouTube
              </a>
              <a href={config.socialLinks.instagram} className="social-btn instagram">
                <FaInstagram size={18} /> Instagram
              </a>
              <a href={config.socialLinks.linkedin} className="social-btn linkedin">
                <FaLinkedinIn size={18} /> LinkedIn
              </a>
              <a href={config.socialLinks.skype} className="social-btn skype">
                <FaSkype size={18} /> Skype
              </a>
            </div>
          </div>
        </aside>
      </main>
    </>
  );
}

export default App;
