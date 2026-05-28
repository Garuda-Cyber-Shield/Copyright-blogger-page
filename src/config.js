export const config = {
  // Page Settings
  pageTitle: "Garuda Cyber Shield Website",

  // Header Settings
  logoText: "Garuda Cyber Shield",

  // Post Details
  category: "Blogger Page",
  heading: "Copyright Test",
  authorName: "Garuda Cyber Shield",

  // Set the precise date and time here to enable Facebook-like relative time.
  // Format should be recognizable by JavaScript Date, e.g., "2024-04-09T14:30:00"
  postedDate: "2026-02-01T12:00:00",
  commentCount: 2,

  // --- DYNAMIC CONTENT (NO DEPLOYMENT REQUIRED) ---
  // To update image and caption instantly:
  // 1. Create a Google Sheet with 2 columns: 'Key' and 'Value'
  // 2. Row 2: Key = ImageURL, Value = your image link
  // 3. Row 3: Key = Caption, Value = your text
  // 4. Go to File > Share > Publish to web > choose 'CSV' > Publish.
  // 5. Paste that link right here:
  googleSheetCsvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQz9deRVsmk5rEMRlMtIzLpW_TKXZ9wj6DSuJKnTZ_QotWVys8BeVql2NIpXPSTBGe3b_0X-fTqxDIR/pub?gid=0&single=true&output=csv",

  // --- STATIC SETTINGS ---
  // If 'googleSheetCsvUrl' is empty OR if 'mediaType' is video, it will fall back to these local files:
  captionFile: "/caption.txt",

  // 'mediaPath' is the path to the picture or video inside the public folder.
  // Use a folder named 'picture' in public to keep everything organized.
  mediaPath: "/picture/1738935581676.jpg",

  // 'mediaType' can be "image" or "video"
  mediaType: "image",

  // Social Links
  socialLinks: {
    facebook: "#",
    twitter: "#",
    youtube: "#",
    instagram: "#",
    linkedin: "#",
    skype: "#",
  },

  // --- DEMO POSTS FOR MULTI-PAGE NAVIGATION & SEARCH ---
  demoPosts: [
    {
      id: "phishing-2026",
      category: "Cyber Security",
      heading: "Advanced Phishing Detection Techniques in 2026",
      authorName: "Garuda Cyber Shield",
      postedDate: "2026-05-20T10:30:00",
      commentCount: 14,
      mediaType: "image",
      mediaUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=60",
      content: `In 2026, phishing attacks have evolved far beyond standard copy-paste emails. Modern adversaries leverage sophisticated AI tools to clone employee writing styles, customize targeted campaigns (spear phishing), and build highly realistic login portals dynamically on the fly.\n\n### The AI Phishing Threats\nThreat actors use Large Language Models (LLMs) to write flawless, context-aware phishing emails without standard grammatical errors or spelling giveaways. Additionally, deepfake audio and video are being used to impersonate high-level executives in WhatsApp and Zoom meetings, leading to unauthorized business email compromise (BEC).\n\n### Next-Gen Defensive Tactics\nTo safeguard organization infrastructures, security teams must move beyond simple keyword filtering and embrace AI-driven behavior analysis:\n\n1. **Natural Language Processing (NLP) Scanning:** Deploy mail gateways that inspect the sentiment, urgency, and syntactic patterns of incoming communications to flag potential social engineering.\n2. **Passkey Adoption:** Eliminate static passwords altogether. Since passkeys rely on device-specific public-key cryptography, a user cannot accidentally share them on a phishing website.\n3. **Continuous Cyber Simulation:** Standard quarterly training is outdated. Implement continuous micro-trainings that deliver real-time simulations based on active global campaigns.\n\nGaruda Cyber Shield continues to monitor emerging attack vectors to keep our clients one step ahead of the adversaries.`
    },
    {
      id: "ransomware-raas",
      category: "Malware Analysis",
      heading: "Demystifying Ransomware-as-a-Service (RaaS) Ecosystem",
      authorName: "Anuradha Odhi",
      postedDate: "2026-04-12T15:45:00",
      commentCount: 8,
      mediaType: "image",
      mediaUrl: "https://images.unsplash.com/photo-1601597111158-2fceff270190?w=800&auto=format&fit=crop&q=60",
      content: `Ransomware-as-a-Service (RaaS) has commoditized cybercrime, allowing entry-level threat actors (affiliates) to launch catastrophic cyber extortion campaigns using advanced tools provided by professional development syndicates.\n\n### The RaaS Business Model\nRaaS functions similarly to legitimate SaaS (Software-as-a-Service). The 'operators' write highly sophisticated ransomware code, design bulletproof decryption portals, and set up robust leak websites. 'Affiliates' then lease this malware infrastructure, taking responsibility for initial access and network compromise. \n\nUpon successful payment, the ransom is automatically split—typically 70% to 80% to the affiliate, and 20% to 30% to the operator.\n\n### Mitigating Ransomware Risks\nTo defend against this highly coordinated ecosystem, organizations must adopt standard cyber hygiene practices:\n\n- **Immutable Backups:** Store backups in offsite, write-once-read-many (WORM) storage. Ransomware actors actively target and delete online backups first.\n- **Endpoint Detection & Response (EDR):** Deploy tools that detect unauthorized volume shadow copy deletions or mass file renaming operations in real-time.\n- **Segmented Networks:** Implement structural boundaries across directories to prevent lateral movement from compromised endpoints to critical servers.\n\nUnderstanding the business of cyber extortion is key to disabling their incentive structures.`
    },
    {
      id: "zero-trust",
      category: "Cyber Security",
      heading: "Building a Zero Trust Architecture for Modern Enterprises",
      authorName: "Garuda Cyber Shield",
      postedDate: "2026-03-08T09:00:00",
      commentCount: 21,
      mediaType: "image",
      mediaUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=60",
      content: `The traditional corporate security perimeter is dead. With hybrid workforces and multi-cloud environments, modern security relies on a core principle: 'Never Trust, Always Verify'. This is the foundation of Zero Trust Architecture (ZTA).\n\n### Core Pillars of Zero Trust\nZero Trust is not a single product; it is an overarching architectural design spanning multiple layers:\n\n1. **Verify Explicitly:** Always authenticate and authorize access requests based on all available data points—including user identity, location, device health, service context, and data classification.\n2. **Use Least Privilege Access:** Limit user access with Just-In-Time (JIT) and Just-Enough-Access (JEA) policies, protecting highly sensitive admin panels from exposure.\n3. **Assume Breach:** Constantly minimize the blast radius by segmenting access. Encrypt all sessions end-to-end, and use analytics to gain visibility and drive threat detection.\n\n### Roadmap to ZTA Integration\nTransitioning to Zero Trust is an iterative process. Organizations should start by auditing their critical digital assets, enforcing Multi-Factor Authentication (MFA) across all web portals, and implementing Micro-Segmentation on corporate local area networks. By verifying every asset state dynamically, threat vectors are minimized.`
    },
    {
      id: "osint-beginners",
      category: "Social Engineering",
      heading: "A Beginner's Guide to OSINT (Open Source Intelligence)",
      authorName: "Admin",
      postedDate: "2026-02-15T14:20:00",
      commentCount: 5,
      mediaType: "image",
      mediaUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=60",
      content: `Open Source Intelligence (OSINT) refers to the collection, analysis, and synthesis of data gathered from publicly available sources to address specific intelligence requirements.\n\n### Why OSINT Matters\nOSINT is heavily used by both security professionals (to discover data exposures, map attack surfaces, and conduct threat investigations) and threat actors (to gather detailed reconnaissance on targets prior to spear-phishing campaigns).\n\n### Essential OSINT Techniques\n- **Advanced Search Operators:** Utilize specific Google search tags (e.g. \`site:target.com filetype:pdf\` or \`intitle:\"index of\"\`) to uncover hidden folders, configuration keys, or documentation files.\n- **Metadata Analysis:** Download public files and run tools like ExifTool to extract GPS coordinates, software versions, and usernames stored in photo or document properties.\n- **Social Media Mapping:** Pivot off publicly shared usernames, email addresses, and profile pictures to build extensive cross-platform behavioral graphs.\n\nUnderstanding what information you publicly expose is the first step in shrinking your personal digital footprint.`
    }
  ]
};

