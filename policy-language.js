(function () {
  const TEXT = {
    "Back to Khabri Junction": "खबरी जंक्शन पर वापस जाएं",
    "About Us": "हमारे बारे में",
    "Contact Us": "संपर्क करें",
    "Privacy Policy": "प्राइवेसी पॉलिसी",
    "Cookie Policy": "कुकी नीति",
    "Terms & Conditions": "नियम और शर्तें",
    "Disclaimer": "डिस्क्लेमर",
    "Editorial Policy": "संपादकीय नीति",
    "Fact Check Policy": "फैक्ट चेक नीति",
    "Correction Policy": "सुधार नीति",
    "Advertise With Us": "विज्ञापन दें",
    "Advertise": "विज्ञापन",
    "Admin Panel": "एडमिन पैनल",
    "Important Pages": "जरूरी पेज",
    "Quick Links": "क्विक लिंक",
    "Breaking News": "ब्रेकिंग न्यूज़",
    "Durg": "दुर्ग",
    "Bhilai": "भिलाई",
    "Raipur": "रायपुर",
    "Kawardha": "कवर्धा",
    "Khairagarh": "खैरागढ़",
    "Rajnandgaon": "राजनांदगांव",
    "Bilaspur": "बिलासपुर",
    "Politics": "राजनीति",
    "Crime": "क्राइम",
    "Sports": "खेल जगत",
    "Entertainment": "मनोरंजन",
    "Health": "हेल्थ",
    "Jobs": "जॉब्स",
    "Astrology": "राशिफल",
    "Contact": "संपर्क",
    "About": "हमारे बारे में",
    "Terms": "नियम",
    "Correction Policy": "सुधार नीति",
    "Fact Check Policy": "फैक्ट चेक नीति",
    "Editorial Policy": "संपादकीय नीति",
    "छत्तीसगढ़ और भारत की भरोसेमंद डिजिटल न्यूज़ सेवा": "Trusted digital news service for Chhattisgarh and India",
    "ब्रेकिंग न्यूज़": "Breaking News",
    "दुर्ग": "Durg",
    "भिलाई": "Bhilai",
    "रायपुर": "Raipur",
    "कवर्धा": "Kawardha",
    "खैरागढ़": "Khairagarh",
    "राजनांदगांव": "Rajnandgaon",
    "बिलासपुर": "Bilaspur",
    "राजनीति": "Politics",
    "क्राइम": "Crime",
    "खेल जगत": "Sports",
    "मनोरंजन": "Entertainment",
    "हेल्थ": "Health",
    "जॉब्स": "Jobs",
    "राशिफल": "Astrology",
    "क्विक लिंक": "Quick Links",
    "जरूरी पेज": "Important Pages",
    "हमारे बारे में": "About Us",
    "संपर्क करें": "Contact Us",
    "प्राइवेसी पॉलिसी": "Privacy Policy",
    "कुकी नीति": "Cookie Policy",
    "नियम और शर्तें": "Terms & Conditions",
    "डिस्क्लेमर": "Disclaimer",
    "संपादकीय नीति": "Editorial Policy",
    "फैक्ट चेक नीति": "Fact Check Policy",
    "सुधार नीति": "Correction Policy",
    "विज्ञापन": "Advertise",
    "एडमिन पैनल": "Admin Panel",
    "संपर्क": "Contact",
    "दुर्ग, छत्तीसगढ़": "Durg, Chhattisgarh",
    "Khabri Junction is a digital news platform focused on Durg, Bhilai, Raipur, Bilaspur, Kawardha, Khairagarh, Rajnandgaon and wider Chhattisgarh updates. We publish local news, public-interest information, politics, crime, health, jobs, sports, weather and market updates for everyday readers.": "खबरी जंक्शन दुर्ग, भिलाई, रायपुर, बिलासपुर, कवर्धा, खैरागढ़, राजनांदगांव और पूरे छत्तीसगढ़ की खबरों पर केंद्रित डिजिटल न्यूज़ प्लेटफॉर्म है। हम लोकल खबरें, जनहित सूचना, राजनीति, क्राइम, हेल्थ, जॉब्स, खेल, मौसम और बाजार अपडेट प्रकाशित करते हैं।",
    "Our aim is to make local information easy to find, simple to read and useful for people who want quick updates from Chhattisgarh and India.": "हमारा उद्देश्य स्थानीय जानकारी को आसान, स्पष्ट और उपयोगी बनाना है ताकि पाठकों को छत्तीसगढ़ और भारत की तेज अपडेट मिल सके।",
    "What We Cover": "हम क्या कवर करते हैं",
    "Local civic updates, public notices and city-level developments.": "स्थानीय नागरिक अपडेट, सार्वजनिक सूचना और शहर-स्तरीय गतिविधियां।",
    "Crime, politics, jobs, education, health, sports and entertainment news.": "क्राइम, राजनीति, जॉब्स, शिक्षा, हेल्थ, खेल और मनोरंजन की खबरें।",
    "District-focused coverage for important Chhattisgarh locations.": "छत्तीसगढ़ के प्रमुख जिलों पर केंद्रित कवरेज।",
    "Our Editorial Promise": "हमारा संपादकीय वादा",
    "We try to keep headlines clear, avoid misleading claims and update stories when new verified information is available. Readers can report issues through our correction process.": "हम हेडलाइन को स्पष्ट रखने, भ्रामक दावों से बचने और नई सत्यापित जानकारी मिलने पर खबर अपडेट करने की कोशिश करते हैं। पाठक सुधार प्रक्रिया के जरिए समस्या बता सकते हैं।",
    "For news tips, corrections, advertising, public-interest updates or general queries, contact Khabri Junction using the details below.": "न्यूज़ टिप्स, सुधार, विज्ञापन, जनहित अपडेट या सामान्य सवालों के लिए नीचे दिए गए विवरण से खबरी जंक्शन से संपर्क करें।",
    "Location: Durg, Chhattisgarh, India": "स्थान: दुर्ग, छत्तीसगढ़, भारत",
    "News Tips And Corrections": "न्यूज़ टिप्स और सुधार",
    "Please include the article link, headline, issue details and supporting source when requesting a correction or sending a news update.": "सुधार या न्यूज़ अपडेट भेजते समय लेख लिंक, हेडलाइन, समस्या का विवरण और सहायक स्रोत जरूर भेजें।",
    "Advertising": "विज्ञापन",
    "Local businesses and organizations can contact us for sponsored placements, display ads or campaign enquiries.": "स्थानीय व्यवसाय और संस्थाएं स्पॉन्सर्ड प्लेसमेंट, डिस्प्ले विज्ञापन या कैंपेन पूछताछ के लिए संपर्क कर सकती हैं।",
    "Khabri Junction respects user privacy. This policy explains what information may be collected when you visit our website and how it may be used for website operation, analytics, advertising and reader communication.": "खबरी जंक्शन उपयोगकर्ता की गोपनीयता का सम्मान करता है। यह नीति बताती है कि वेबसाइट विजिट के दौरान कौनसी जानकारी ली जा सकती है और उसका उपयोग वेबसाइट संचालन, एनालिटिक्स, विज्ञापन और पाठक संवाद के लिए कैसे हो सकता है।",
    "Information We May Collect": "हम कौनसी जानकारी ले सकते हैं",
    "Basic technical data such as browser type, device type, pages visited and approximate location.": "ब्राउज़र प्रकार, डिवाइस प्रकार, देखे गए पेज और अनुमानित लोकेशन जैसी बेसिक तकनीकी जानकारी।",
    "Information you send voluntarily, such as emails for news tips, corrections, advertising or support.": "आपके द्वारा स्वेच्छा से भेजी गई जानकारी, जैसे न्यूज़ टिप्स, सुधार, विज्ञापन या सपोर्ट ईमेल।",
    "Cookie and analytics data used to improve performance and understand reader behavior.": "परफॉर्मेंस सुधारने और पाठक व्यवहार समझने के लिए कुकी और एनालिटिक्स डेटा।",
    "Cookies, Ads And Analytics": "कुकी, विज्ञापन और एनालिटिक्स",
    "Third-party services, including Google AdSense when enabled, may use cookies or similar technologies to serve ads, measure ad performance and prevent abuse. Users can manage cookies through browser settings and Google ad personalization controls.": "Google AdSense सहित थर्ड-पार्टी सेवाएं, सक्षम होने पर, विज्ञापन दिखाने, प्रदर्शन मापने और दुरुपयोग रोकने के लिए कुकी या समान तकनीक का उपयोग कर सकती हैं। उपयोगकर्ता ब्राउज़र सेटिंग और Google ad controls से कुकी मैनेज कर सकते हैं।",
    "Data Sharing": "डेटा साझा करना",
    "We do not sell personal contact information. Limited data may be processed by hosting, analytics, advertising, security or email providers needed to operate the website.": "हम व्यक्तिगत संपर्क जानकारी नहीं बेचते। वेबसाइट चलाने के लिए जरूरी सीमित डेटा होस्टिंग, एनालिटिक्स, विज्ञापन, सुरक्षा या ईमेल प्रदाताओं द्वारा प्रोसेस हो सकता है।",
    "For privacy questions, email": "गोपनीयता से जुड़े सवालों के लिए ईमेल करें",
    "Khabri Junction may use cookies and similar technologies to keep the website working, understand traffic and support advertising when ad services are enabled.": "खबरी जंक्शन वेबसाइट चलाने, ट्रैफिक समझने और विज्ञापन सेवा सक्षम होने पर विज्ञापन सपोर्ट के लिए कुकी और समान तकनीक का उपयोग कर सकता है।",
    "Types Of Cookies": "कुकी के प्रकार",
    "Essential cookies that support site security, sessions and basic functionality.": "साइट सुरक्षा, सेशन और बेसिक फंक्शन के लिए जरूरी कुकी।",
    "Analytics cookies that help us understand page visits and improve content quality.": "पेज विजिट समझने और कंटेंट क्वालिटी सुधारने में मदद करने वाली एनालिटिक्स कुकी।",
    "Advertising cookies that may be used by ad partners to measure or personalize ads.": "विज्ञापन पार्टनर द्वारा विज्ञापन मापने या पर्सनलाइज करने के लिए उपयोग होने वाली कुकी।",
    "Your Choices": "आपके विकल्प",
    "You can block or delete cookies through browser settings. Some website features may work differently if cookies are disabled.": "आप ब्राउज़र सेटिंग से कुकी ब्लॉक या डिलीट कर सकते हैं। कुकी बंद होने पर कुछ फीचर अलग तरह काम कर सकते हैं।",
    "For cookie-related questions, contact": "कुकी से जुड़े सवालों के लिए संपर्क करें",
    "These terms describe general conditions for using Khabri Junction. By using the website, readers agree to access content responsibly and follow applicable laws.": "ये नियम खबरी जंक्शन उपयोग करने की सामान्य शर्तें बताते हैं। वेबसाइट उपयोग करके पाठक जिम्मेदारी से कंटेंट पढ़ने और लागू कानूनों का पालन करने से सहमत होते हैं।",
    "Use Of Content": "कंटेंट का उपयोग",
    "Content is provided for information and news reading purposes. Do not copy, republish or misuse content without permission.": "कंटेंट जानकारी और समाचार पढ़ने के लिए दिया गया है। अनुमति के बिना कॉपी, दोबारा प्रकाशित या दुरुपयोग न करें।",
    "User Conduct": "उपयोगकर्ता व्यवहार",
    "Users should not attempt to disrupt the website, misuse forms, submit harmful content or violate legal rights.": "उपयोगकर्ताओं को वेबसाइट बाधित करने, फॉर्म का दुरुपयोग करने, हानिकारक कंटेंट भेजने या कानूनी अधिकारों का उल्लंघन करने की कोशिश नहीं करनी चाहिए।",
    "Changes": "बदलाव",
    "We may update these terms when required. Continued use of the website means acceptance of updated terms.": "जरूरत पड़ने पर हम इन नियमों को अपडेट कर सकते हैं। वेबसाइट का लगातार उपयोग अपडेटेड नियमों की स्वीकृति माना जाएगा।",
    "Khabri Junction publishes news and information in good faith. We aim for accuracy, but developing stories may change as new facts become available.": "खबरी जंक्शन सद्भावना से समाचार और जानकारी प्रकाशित करता है। हम सटीकता का प्रयास करते हैं, लेकिन नई जानकारी आने पर विकसित होती खबरें बदल सकती हैं।",
    "No Professional Advice": "पेशेवर सलाह नहीं",
    "Website content should not be treated as legal, medical, financial or professional advice. Readers should verify critical information from official sources.": "वेबसाइट कंटेंट को कानूनी, चिकित्सा, वित्तीय या पेशेवर सलाह न मानें। महत्वपूर्ण जानकारी आधिकारिक स्रोत से सत्यापित करें।",
    "External Links": "बाहरी लिंक",
    "Some pages may link to third-party websites. We are not responsible for the content, privacy practices or availability of external websites.": "कुछ पेज थर्ड-पार्टी वेबसाइट से लिंक हो सकते हैं। हम बाहरी वेबसाइट के कंटेंट, प्राइवेसी प्रैक्टिस या उपलब्धता के लिए जिम्मेदार नहीं हैं।",
    "Corrections": "सुधार",
    "Readers can request corrections using our contact details. We review correction requests and update content where needed.": "पाठक हमारे संपर्क विवरण से सुधार का अनुरोध कर सकते हैं। हम सुधार अनुरोध की समीक्षा कर जरूरत पड़ने पर कंटेंट अपडेट करते हैं।",
    "Khabri Junction focuses on public-interest reporting from Chhattisgarh with priority coverage for Durg, Bhilai, Raipur and nearby districts.": "खबरी जंक्शन छत्तीसगढ़ की जनहित रिपोर्टिंग पर केंद्रित है, जिसमें दुर्ग, भिलाई, रायपुर और आसपास के जिलों को प्राथमिकता दी जाती है।",
    "Our Standards": "हमारे मानक",
    "Headlines, summaries and visuals should match the actual story.": "हेडलाइन, सार और विजुअल वास्तविक खबर से मेल खाने चाहिए।",
    "Reports should avoid exaggerated claims, hate speech and misleading context.": "रिपोर्ट में बढ़ा-चढ़ाकर दावे, हेट स्पीच और भ्रामक संदर्भ से बचना चाहिए।",
    "Developing news should be labelled carefully and updated when facts change.": "विकसित होती खबरों को सावधानी से लेबल किया जाना चाहिए और तथ्य बदलने पर अपडेट करना चाहिए।",
    "Sourcing": "स्रोत",
    "We use field inputs, public records, official statements, verified digital sources, agency material and reader tips. Sensitive claims require additional care before publication.": "हम फील्ड इनपुट, सार्वजनिक रिकॉर्ड, आधिकारिक बयान, सत्यापित डिजिटल स्रोत, एजेंसी सामग्री और पाठक टिप्स का उपयोग करते हैं। संवेदनशील दावों पर प्रकाशन से पहले अतिरिक्त सावधानी रखी जाती है।",
    "Editorial Independence": "संपादकीय स्वतंत्रता",
    "Advertising, sponsorship and business relationships do not decide editorial conclusions. Promotional content is separated from news content where applicable.": "विज्ञापन, स्पॉन्सरशिप और व्यवसायिक रिश्ते संपादकीय निष्कर्ष तय नहीं करते। जहां लागू हो, प्रमोशनल कंटेंट को न्यूज़ कंटेंट से अलग रखा जाता है।",
    "Updates": "अपडेट",
    "Stories may be updated when new verified details become available. Important changes are reflected in the article update time or correction process.": "नई सत्यापित जानकारी मिलने पर खबरें अपडेट हो सकती हैं। महत्वपूर्ण बदलाव लेख के अपडेट समय या सुधार प्रक्रिया में दिखाए जाते हैं।",
    "Khabri Junction checks important claims before publication where possible and reviews correction requests when readers report possible errors.": "खबरी जंक्शन संभव होने पर प्रकाशन से पहले महत्वपूर्ण दावों की जांच करता है और पाठकों द्वारा गलती बताने पर सुधार अनुरोध की समीक्षा करता है।",
    "How We Check": "हम कैसे जांचते हैं",
    "We compare claims with official statements, public documents, credible news sources and direct confirmations where possible.": "हम दावों की तुलना आधिकारिक बयान, सार्वजनिक दस्तावेज, विश्वसनीय समाचार स्रोत और संभव होने पर सीधे पुष्टि से करते हैं।",
    "Corrections And Updates": "सुधार और अपडेट",
    "If a published claim is found to be wrong, we correct or update the story with clear context.": "अगर प्रकाशित दावा गलत पाया जाता है, तो हम स्पष्ट संदर्भ के साथ खबर को सुधार या अपडेट करते हैं।",
    "Limitations": "सीमाएं",
    "Fast-moving local stories may evolve. We update reports when reliable new information becomes available.": "तेजी से बदलती स्थानीय खबरें विकसित हो सकती हैं। भरोसेमंद नई जानकारी मिलने पर हम रिपोर्ट अपडेट करते हैं।",
    "Khabri Junction welcomes correction requests from readers. If you find a factual error, please contact us with the article link and supporting information.": "खबरी जंक्शन पाठकों से सुधार अनुरोध स्वीकार करता है। यदि आपको तथ्यात्मक गलती मिले, तो कृपया लेख लिंक और सहायक जानकारी के साथ संपर्क करें।",
    "How To Request A Correction": "सुधार कैसे मांगें",
    "Email us with the article URL, headline, correction details and source documents or official references where possible.": "लेख URL, हेडलाइन, सुधार विवरण और संभव हो तो स्रोत दस्तावेज या आधिकारिक संदर्भ के साथ हमें ईमेल करें।",
    "Review Process": "समीक्षा प्रक्रिया",
    "We review correction requests, compare available sources and update the story when a correction is required.": "हम सुधार अनुरोध की समीक्षा करते हैं, उपलब्ध स्रोतों से तुलना करते हैं और सुधार जरूरी होने पर खबर अपडेट करते हैं।",
    "Transparency": "पारदर्शिता",
    "Major corrections may be reflected through updated timestamps, editor notes or revised article text.": "महत्वपूर्ण सुधार अपडेटेड टाइमस्टैम्प, एडिटर नोट या संशोधित लेख टेक्स्ट के जरिए दिखाए जा सकते हैं।",
    "Promote your business, event, service or local campaign with Khabri Junction's Chhattisgarh-focused digital audience.": "अपने व्यवसाय, इवेंट, सेवा या स्थानीय कैंपेन को खबरी जंक्शन के छत्तीसगढ़-केंद्रित डिजिटल पाठकों तक पहुंचाएं।",
    "Advertising Options": "विज्ञापन विकल्प",
    "Display banner placements on homepage, article pages or category pages.": "होमपेज, लेख पेज या कैटेगरी पेज पर डिस्प्ले बैनर प्लेसमेंट।",
    "Sponsored posts or local campaign features with clear promotional labels.": "स्पष्ट प्रमोशनल लेबल के साथ स्पॉन्सर्ड पोस्ट या लोकल कैंपेन फीचर।",
    "District-focused promotion for Durg, Bhilai, Raipur and other Chhattisgarh locations.": "दुर्ग, भिलाई, रायपुर और अन्य छत्तीसगढ़ स्थानों के लिए जिला-केंद्रित प्रमोशन।",
    "Booking Contact": "बुकिंग संपर्क",
    "Email": "ईमेल",
    "Phone": "फोन",
    "Please share campaign dates, target city, creative size and budget range when enquiring.": "पूछताछ करते समय कैंपेन तारीख, लक्षित शहर, क्रिएटिव साइज और बजट रेंज साझा करें।"
  };

  function hasHindi(value) {
    return /[\u0900-\u097F]/.test(String(value || ""));
  }

  const EN_TO_HI = {};
  const HI_TO_EN = {};

  Object.entries(TEXT).forEach(([key, value]) => {
    if (hasHindi(key) && !hasHindi(value)) {
      HI_TO_EN[key] = value;
      EN_TO_HI[value] = key;
      return;
    }
    EN_TO_HI[key] = value;
    HI_TO_EN[value] = key;
  });

  function normalizeText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function getLanguage() {
    const stored = localStorage.getItem("kjLanguage");
    return stored === "en" || stored === "hi" ? stored : "hi";
  }

  function setText(node, language) {
    const original = node.dataset.langEn || normalizeText(node.textContent);
    const english = HI_TO_EN[original] || original;
    const hindi = EN_TO_HI[english] || EN_TO_HI[original] || original;
    node.dataset.langEn = english;
    node.dataset.langHi = hindi;
    node.textContent = language === "hi" ? hindi : english;
  }

  function applyLanguage(language) {
    document.documentElement.lang = language;
    document.querySelectorAll("[data-static-lang-text]").forEach((node) => setText(node, language));
    document.querySelectorAll(".policy-language-switch button").forEach((button) => {
      const isActive = button.dataset.lang === language;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
    localStorage.setItem("kjLanguage", language);
  }

  function markTranslatableText() {
    const selector = [
      ".policy-header a",
      ".policy-wrap h1",
      ".policy-wrap h2",
      ".policy-wrap p",
      ".policy-wrap li",
      ".policy-links strong",
      ".policy-links a",
      ".footer h3",
      ".footer p",
      ".footer li",
      ".footer a"
    ].join(",");

    document.querySelectorAll(selector).forEach((node) => {
      if (node.closest("script") || node.querySelector("input, textarea, select, button")) return;
      const text = normalizeText(node.textContent);
      if (!text || text.includes("@") || text.startsWith("+91")) return;
      node.dataset.staticLangText = "true";
    });
  }

  function injectSwitch() {
    if (document.querySelector(".policy-language-switch")) return;
    const switcher = document.createElement("div");
    switcher.className = "language-switch policy-language-switch";
    switcher.setAttribute("aria-label", "Language switch");
    switcher.innerHTML = '<button type="button" data-lang="hi">हिंदी</button><button type="button" data-lang="en">English</button>';
    const header = document.querySelector(".policy-header");
    if (header) {
      header.insertAdjacentElement("afterend", switcher);
    } else {
      document.body.insertBefore(switcher, document.body.firstChild);
    }
    switcher.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-lang]");
      if (!button) return;
      applyLanguage(button.dataset.lang);
    });
  }

  function bindActiveFooterLinks() {
    const normalizePath = (value) => {
      try {
        const url = new URL(value, window.location.origin);
        return url.pathname.replace(/\/index\.html$/i, "/").replace(/\.html$/i, "").replace(/\/+$/u, "") || "/";
      } catch (error) {
        return String(value || "").replace(/\.html$/i, "").replace(/\/+$/u, "") || "/";
      }
    };
    const currentPath = normalizePath(window.location.pathname);
    document.querySelectorAll(".footer a").forEach((link) => {
      const linkPath = normalizePath(link.getAttribute("href") || "");
      if (linkPath === currentPath) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (!document.body.classList.contains("policy-page")) return;
    injectSwitch();
    markTranslatableText();
    bindActiveFooterLinks();
    applyLanguage(getLanguage());
  });
})();
