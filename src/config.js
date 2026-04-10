export const config = {
  // Page Settings
  pageTitle: "Garuda Cyber Shield Website",

  // Header Settings
  logoText: "Garuda Cyber Shield",

  // Post Details
  category: "bangla golpo",
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
  mediaPath: "/picture/sdgd.mp4",

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
  }
};
