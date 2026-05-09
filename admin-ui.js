(function () {
    try {
        let currentData = typeof websiteData !== 'undefined' ? JSON.parse(JSON.stringify(websiteData)) : {};
        let undoStack = [];
        let redoStack = [];
        let isUndoRedo = false;

        // Deep merge function to replace shallow merge and prevent data structure issues
        function deepMerge(target, source) {
            if (!source) return target;
            for (const key of Object.keys(source)) {
                if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    if (!target[key]) target[key] = {};
                    deepMerge(target[key], source[key]);
                } else {
                    target[key] = source[key];
                }
            }
            return target;
        }

        // Try to load from localStorage to preview recent changes
        let localData = null;
        try {
            localData = localStorage.getItem('pulseGuardData');
        } catch (e) {
            console.warn("localStorage not accessible");
        }
        
        if (localData) {
            try {
                const parsed = JSON.parse(localData);
                currentData = deepMerge(currentData, parsed);
            } catch (e) { }
        }

        // Initialize missing data AFTER merge to prevent crashes from missing nested properties
        if (!currentData.header) currentData.header = { logoText: "PulseGuard", navLinks: [] };
        if (!currentData.theme) currentData.theme = { primaryColor: "#2a75d3", bgColor: "#f8fbff", textColor: "#2c3e50", baseFontSize: "16", navBgColor: "#ffffff", boxBgColor: "#ffffff", boxOpacity: 100, darkBgColor: "#1a1a1a", darkTextColor: "#ffffff", darkBoxBgColor: "#333333", darkBoxOpacity: 100, darkNavBgColor: "#000000" };
        if (!currentData.theme.navBgColor) currentData.theme.navBgColor = "#ffffff";
        if (!currentData.theme.boxBgColor) currentData.theme.boxBgColor = "#ffffff";
        if (currentData.theme.boxOpacity === undefined) currentData.theme.boxOpacity = 100;
        if (currentData.theme.darkBoxOpacity === undefined) currentData.theme.darkBoxOpacity = 100;
        
        if (!currentData.layout || !Array.isArray(currentData.layout) || currentData.layout.length === 0) currentData.layout = ["home", "team", "project", "development", "gallery"];
        if (!currentData.hero) currentData.hero = { title: "", subtitle: "", backgroundImage: "" };
        if (!currentData.team) currentData.team = { members: [{ name: "", role: "", bio: "", image: "" }] };
        if (!currentData.team.members || !Array.isArray(currentData.team.members) || currentData.team.members.length === 0) currentData.team.members = [{ name: "", role: "", bio: "", image: "" }];
        if (!currentData.project) currentData.project = { description: "", features: [] };
        if (!currentData.development) currentData.development = { steps: [] };
        if (!currentData.media) currentData.media = { photos: [], videoUrl: "", codeLink: "" };
        if (!currentData.media.photos) currentData.media.photos = [];
        if (!currentData.customPages) currentData.customPages = [];
        if (!currentData.feedback) currentData.feedback = { title: "Leave Your Feedback", description: "We would love to hear from you!" };
        if (!currentData.feedback.fields) {
            currentData.feedback.fields = {
                name: { show: true, req: true },
                age: { show: true, req: true },
                cat: { show: true, req: true, label1: "", label2: "", label3: "", customOptions: "" },
                phone: { show: true, req: true },
                email: { show: true, req: false },
                msg: { show: true, req: true }
            };
        }
        if (!currentData.animations) {
            currentData.animations = { style: "none", duration: "normal" };
        }
        if (!currentData.visibility) {
            currentData.visibility = { hero: true, team: true, project: true, development: true, gallery: true, feedback: true };
        }
        if (!currentData.layout.includes("feedback")) currentData.layout.push("feedback");

        // Section naming mapping
        const sectionNames = {
            "home": "Hero Section",
            "team": "Team Section",
            "project": "Project Details",
            "development": "Development Process",
            "gallery": "Gallery & Media",
            "feedback": "Feedback System"
        };


        // 2. DOM Elements
        const els = {
            headerLogo: document.getElementById('header-logo'),
            themeNavBg: document.getElementById('theme-nav-bg'),
            themeNavBgOpacity: document.getElementById('theme-nav-bg-opacity'),
            themeNavBgOpacityVal: document.getElementById('theme-nav-bg-opacity-val'),
            themePrimary: document.getElementById('theme-primary'),
            themePrimaryOpacity: document.getElementById('theme-primary-opacity'),
            themePrimaryOpacityVal: document.getElementById('theme-primary-opacity-val'),
            themePageBg: document.getElementById('theme-page-bg'),
            themePageBgOpacity: document.getElementById('theme-page-bg-opacity'),
            themePageBgOpacityVal: document.getElementById('theme-page-bg-opacity-val'),
            themeBg: document.getElementById('theme-bg'),
            themeBgOpacity: document.getElementById('theme-bg-opacity'),
            themeBgOpacityVal: document.getElementById('theme-bg-opacity-val'),
            themeBtnBg: document.getElementById('theme-btn-bg'),
            themeBtnOpacity: document.getElementById('theme-btn-opacity'),
            themeBtnOpacityVal: document.getElementById('theme-btn-opacity-val'),
            themeBtnText: document.getElementById('theme-btn-text'),
            themeUseCustom: document.getElementById('theme-use-custom'),
            themeDefaultDark: document.getElementById('theme-default-dark'),
            themeText: document.getElementById('theme-text'),
            themeTextOpacity: document.getElementById('theme-text-opacity'),
            themeTextOpacityVal: document.getElementById('theme-text-opacity-val'),
            themeBoxBg: document.getElementById('theme-box-bg'),
            themeBoxOpacity: document.getElementById('theme-box-opacity'),
            themeBoxOpacityVal: document.getElementById('theme-box-opacity-val'),
            themeFontsize: document.getElementById('theme-fontsize'),
            themeDarkPageBg: document.getElementById('theme-dark-page-bg'),
            themeDarkPageBgOpacity: document.getElementById('theme-dark-page-bg-opacity'),
            themeDarkPageBgOpacityVal: document.getElementById('theme-dark-page-bg-opacity-val'),
            themeDarkBg: document.getElementById('theme-dark-bg'),
            themeDarkText: document.getElementById('theme-dark-text'),
            themeDarkBox: document.getElementById('theme-dark-box'),
            themeDarkBoxOpacity: document.getElementById('theme-dark-box-opacity'),
            themeDarkBoxOpacityVal: document.getElementById('theme-dark-box-opacity-val'),
            themeDarkNav: document.getElementById('theme-dark-nav'),
            themeDarkNavOpacity: document.getElementById('theme-dark-nav-opacity'),
            themeDarkNavOpacityVal: document.getElementById('theme-dark-nav-opacity-val'),
            themeDarkBtnBg: document.getElementById('theme-dark-btn-bg'),
            themeDarkBtnOpacity: document.getElementById('theme-dark-btn-opacity'),
            themeDarkBtnOpacityVal: document.getElementById('theme-dark-btn-opacity-val'),
            themeDarkBtnText: document.getElementById('theme-dark-btn-text'),
            fontSizeVal: document.getElementById('font-size-val'),

            btnUndo: document.getElementById('btn-undo'),
            btnRedo: document.getElementById('btn-redo'),

            visHero: document.getElementById('vis-hero'),
            visTeam: document.getElementById('vis-team'),
            visProject: document.getElementById('vis-project'),
            visDevelopment: document.getElementById('vis-development'),
            visGallery: document.getElementById('vis-gallery'),
            visFeedback: document.getElementById('vis-feedback'),

            navVisHero: document.getElementById('nav-vis-hero'),
            navVisTeam: document.getElementById('nav-vis-team'),
            navVisProject: document.getElementById('nav-vis-project'),
            navVisDevelopment: document.getElementById('nav-vis-development'),
            navVisGallery: document.getElementById('nav-vis-gallery'),
            navVisFeedback: document.getElementById('nav-vis-feedback'),

            heroTitle: document.getElementById('hero-title'),
            heroSubtitle: document.getElementById('hero-subtitle'),
            heroBtnText: document.getElementById('hero-btn-text'),
            heroBgUpload: document.getElementById('hero-bg-upload'),
            heroBgPreview: document.getElementById('hero-bg-preview'),

            teamName: document.getElementById('team-name'),
            teamRole: document.getElementById('team-role'),
            teamBio: document.getElementById('team-bio'),
            teamSectionTitle: document.getElementById('team-section-title'),
            teamImgUpload: document.getElementById('team-img-upload'),
            teamImgPreview: document.getElementById('team-img-preview'),

            projectDesc: document.getElementById('project-desc'),
            projectSectionTitle: document.getElementById('project-section-title'),

            devSectionTitle: document.getElementById('dev-section-title'),
            btnAddDevStep: document.getElementById('btn-add-dev-step'),
            devStepsList: document.getElementById('dev-steps-list'),

            projectFeaturesList: document.getElementById('project-features-list'),
            btnAddFeature: document.getElementById('btn-add-feature'),

            mediaVideo: document.getElementById('media-video'),
            mediaCode: document.getElementById('media-code'),
            mediaSectionTitle: document.getElementById('media-section-title'),
            galleryUpload1: document.getElementById('gallery-upload-1'),
            galleryPreview1: document.getElementById('gallery-preview-1'),
            galleryUpload2: document.getElementById('gallery-upload-2'),
            galleryPreview2: document.getElementById('gallery-preview-2'),

            feedbackTitle: document.getElementById('feedback-title-input'),
            feedbackDesc: document.getElementById('feedback-desc-input'),

            siteTitle: document.getElementById('site-title-input'),
            siteFavicon: document.getElementById('site-favicon-input'),

            fbOptCatShow: document.getElementById('fb-opt-cat-show'),
            fbOptCatReq: document.getElementById('fb-opt-cat-req'),
            fbCatLabel1: document.getElementById('fb-cat-label1'),
            fbCatLabel2: document.getElementById('fb-cat-label2'),
            fbCatLabel3: document.getElementById('fb-cat-label3'),
            fbCatCustom: document.getElementById('fb-cat-custom'),

            // Footer
            footerAboutTitle: document.getElementById('footer-about-title'),
            footerAboutText: document.getElementById('footer-about-text'),
            footerContactTitle: document.getElementById('footer-contact-title'),
            footerEmail: document.getElementById('footer-email'),
            footerPhone: document.getElementById('footer-phone'),
            footerCopyright: document.getElementById('footer-copyright'),

            animStyle: document.getElementById('anim-style'),
            animDuration: document.getElementById('anim-duration'),

            btnUndo: document.getElementById('btn-undo'),
            btnRedo: document.getElementById('btn-redo'),

            draggableList: document.getElementById('draggable-list')
        };

        // Initialize Quill Rich Text Editors
        const quillOptions = {
            theme: 'snow',
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'color': [] }, { 'background': [] }],
                    ['clean']
                ]
            }
        };
        const quillHero = new Quill('#hero-subtitle', quillOptions);
        const quillTeam = new Quill('#team-bio', quillOptions);
        const quillProject = new Quill('#project-desc', quillOptions);

        // Update saving logic to use Quill on input
        quillHero.on('text-change', saveToLocal);
        quillTeam.on('text-change', saveToLocal);
        quillProject.on('text-change', saveToLocal);


        // Helper: set preview
        function setPreview(container, src) {
            if (!container) return;
            if (src) container.innerHTML = `<img src="${src}" alt="Preview">`;
            else container.innerHTML = `<span style="color:var(--text-muted);">No Image</span>`;
        }

        // --- Image Compression Helper ---
        // Resizes large images to max 800px width and compresses to JPEG to avoid localStorage Quota limits
        function resizeAndCompressImage(file, callback) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const img = new Image();
                img.onload = function () {
                    const MAX_WIDTH = 800;
                    let width = img.width;
                    let height = img.height;

                    if (width > MAX_WIDTH) {
                        height = Math.round((height * MAX_WIDTH) / width);
                        width = MAX_WIDTH;
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Compress to 70% quality JPEG
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    callback(dataUrl);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }

        // --- Dynamic Gallery Logic ---
        const elsMedia = {
            list: document.getElementById('gallery-dynamic-list'),
            addInput: document.getElementById('gallery-add-input')
        };

        function renderGalleryList() {
            if (!elsMedia.list) return;
            elsMedia.list.innerHTML = '';
            currentData.media.photos.forEach((photo, index) => {
                const li = document.createElement('li');
                li.className = 'draggable-item';
                li.innerHTML = `
                <img src="${photo}" style="height: 40px; width: 60px; object-fit: cover; border-radius: 4px;">
                <span style="flex-grow:1;">Photo ${index + 1}</span>
                <button class="btn btn-secondary btn-sm" onclick="removeGalleryPhoto(${index})" style="color:red; border:none; padding: 2px 6px;"><i class="bi bi-trash"></i></button>
            `;
                elsMedia.list.appendChild(li);
            });
        }

        window.removeGalleryPhoto = function (index) {
            currentData.media.photos.splice(index, 1);
            renderGalleryList();
            saveToLocal();
        }

        if (elsMedia.addInput) {
            elsMedia.addInput.addEventListener('change', (e) => {
                const files = e.target.files;
                if (!files || files.length === 0) return;
                let processed = 0;
                Array.from(files).forEach(file => {
                    resizeAndCompressImage(file, (base64Str) => {
                        currentData.media.photos.push(base64Str);
                        processed++;
                        if (processed === files.length) {
                            renderGalleryList();
                            saveToLocal();
                        }
                    });
                });
                e.target.value = ''; // Clear so same file can be uploaded again if needed
            });
        }

        // 2.5 Generate Section Styling Override UI
        const sectionsToStyle = ['project', 'development', 'media', 'feedback', 'footer'];
        sectionsToStyle.forEach(sec => {
            const tab = document.getElementById(`tab-${sec}`);
            if (tab) {
                const styleDiv = document.createElement('div');
                styleDiv.innerHTML = `
                    <div style="background: var(--white); padding: 15px; border-radius: 8px; border: 1px solid var(--border); margin-bottom: 20px; margin-top: 20px;">
                        <h3 style="margin-top: 0; font-size: 1.1rem; color: var(--primary);">Section Styling Override</h3>
                        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 15px; margin-top:-5px;">Customize the background and box colors specifically for this section. Leave empty to use global theme colors.</p>
                        
                        <div class="form-row">
                            <div class="form-group color-group">
                                <label>Background Color</label>
                                <div style="display:flex; align-items:center; gap:5px;">
                                    <input type="color" id="${sec}-bg-color" value="#ffffff" oninput="this.dataset.cleared='false'; saveToLocal()">
                                    <button class="btn btn-sm btn-outline-secondary" style="padding:2px 4px; font-size:0.7rem;" onclick="window.clearSectionStyle('${sec}', 'bg')">Reset</button>
                                </div>
                                <label style="font-size: 0.75rem; margin-top: 5px; display: block;">Transparency (%)</label>
                                <div style="display:flex; align-items:center; gap:10px;">
                                    <input type="range" id="${sec}-bg-opacity" min="0" max="100" value="100" class="slider" style="height: 4px; flex:1;" oninput="document.getElementById('${sec}-bg-color').dataset.cleared='false'; saveToLocal()">
                                    <input type="number" id="${sec}-bg-opacity-val" min="0" max="100" value="100" style="width: 55px; padding: 3px; border:1px solid #ccc; border-radius:4px; font-size: 0.85rem;" oninput="document.getElementById('${sec}-bg-color').dataset.cleared='false'; saveToLocal()">
                                </div>
                            </div>
                            
                            <div class="form-group color-group">
                                <label>Box Background Color</label>
                                <div style="display:flex; align-items:center; gap:5px;">
                                    <input type="color" id="${sec}-box-color" value="#ffffff" oninput="this.dataset.cleared='false'; saveToLocal()">
                                    <button class="btn btn-sm btn-outline-secondary" style="padding:2px 4px; font-size:0.7rem;" onclick="window.clearSectionStyle('${sec}', 'box')">Reset</button>
                                </div>
                                <label style="font-size: 0.75rem; margin-top: 5px; display: block;">Transparency (%)</label>
                                <div style="display:flex; align-items:center; gap:10px;">
                                    <input type="range" id="${sec}-box-opacity" min="0" max="100" value="100" class="slider" style="height: 4px; flex:1;" oninput="document.getElementById('${sec}-box-color').dataset.cleared='false'; saveToLocal()">
                                    <input type="number" id="${sec}-box-opacity-val" min="0" max="100" value="100" style="width: 55px; padding: 3px; border:1px solid #ccc; border-radius:4px; font-size: 0.85rem;" oninput="document.getElementById('${sec}-box-color').dataset.cleared='false'; saveToLocal()">
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                const h2 = tab.querySelector('h2');
                if (h2) {
                    h2.insertAdjacentElement('afterend', styleDiv);
                }
            }
        });

        window.clearSectionStyle = function(sec, type) {
            const colorInput = document.getElementById(`${sec}-${type}-color`);
            colorInput.dataset.cleared = "true";
            colorInput.value = "#ffffff";
            document.getElementById(`${sec}-${type}-opacity`).value = 100;
            document.getElementById(`${sec}-${type}-opacity-val`).value = 100;
            saveToLocal();
        };

        // Map section style inputs
        const elsSectionStyles = {};
        sectionsToStyle.forEach(sec => {
            elsSectionStyles[sec] = {
                bgColor: document.getElementById(`${sec}-bg-color`),
                bgOpacity: document.getElementById(`${sec}-bg-opacity`),
                bgOpacityVal: document.getElementById(`${sec}-bg-opacity-val`),
                boxColor: document.getElementById(`${sec}-box-color`),
                boxOpacity: document.getElementById(`${sec}-box-opacity`),
                boxOpacityVal: document.getElementById(`${sec}-box-opacity-val`)
            };
            
            // Setup sync for opacities
            if (elsSectionStyles[sec].bgOpacity && elsSectionStyles[sec].bgOpacityVal) {
                elsSectionStyles[sec].bgOpacity.addEventListener('input', () => { elsSectionStyles[sec].bgOpacityVal.value = elsSectionStyles[sec].bgOpacity.value; saveToLocal(); });
                elsSectionStyles[sec].bgOpacityVal.addEventListener('input', () => { elsSectionStyles[sec].bgOpacity.value = elsSectionStyles[sec].bgOpacityVal.value; saveToLocal(); });
                elsSectionStyles[sec].bgColor.addEventListener('input', saveToLocal);
            }
            if (elsSectionStyles[sec].boxOpacity && elsSectionStyles[sec].boxOpacityVal) {
                elsSectionStyles[sec].boxOpacity.addEventListener('input', () => { elsSectionStyles[sec].boxOpacityVal.value = elsSectionStyles[sec].boxOpacity.value; saveToLocal(); });
                elsSectionStyles[sec].boxOpacityVal.addEventListener('input', () => { elsSectionStyles[sec].boxOpacity.value = elsSectionStyles[sec].boxOpacityVal.value; saveToLocal(); });
                elsSectionStyles[sec].boxColor.addEventListener('input', saveToLocal);
            }
        });

        // 3. Populate Forms
        window.populateData = function() {
        if (els.visHero) els.visHero.checked = currentData.visibility.hero;
        if (els.visTeam) els.visTeam.checked = currentData.visibility.team;
        if (els.visProject) els.visProject.checked = currentData.visibility.project;
        if (els.visDevelopment) els.visDevelopment.checked = currentData.visibility.development;
        if (els.visGallery) els.visGallery.checked = currentData.visibility.gallery;
        if (els.visFeedback) els.visFeedback.checked = currentData.visibility.feedback;

        if (els.navVisHero) els.navVisHero.checked = currentData.header.navLinks.some(l => l.href === '#home');
        if (els.navVisTeam) els.navVisTeam.checked = currentData.header.navLinks.some(l => l.href === '#team');
        if (els.navVisProject) els.navVisProject.checked = currentData.header.navLinks.some(l => l.href === '#project');
        if (els.navVisDevelopment) els.navVisDevelopment.checked = currentData.header.navLinks.some(l => l.href === '#development');
        if (els.navVisGallery) els.navVisGallery.checked = currentData.header.navLinks.some(l => l.href === '#gallery');
        if (els.navVisFeedback) els.navVisFeedback.checked = currentData.header.navLinks.some(l => l.href === '#feedback');

        sectionsToStyle.forEach(sec => {
            if (currentData[sec] && currentData[sec].styling) {
                const styles = elsSectionStyles[sec];
                if (styles) {
                    if (currentData[sec].styling.bgColor) styles.bgColor.value = currentData[sec].styling.bgColor;
                    if (currentData[sec].styling.bgOpacity !== undefined) {
                        styles.bgOpacity.value = currentData[sec].styling.bgOpacity;
                        styles.bgOpacityVal.value = currentData[sec].styling.bgOpacity;
                    }
                    if (currentData[sec].styling.boxColor) styles.boxColor.value = currentData[sec].styling.boxColor;
                    if (currentData[sec].styling.boxOpacity !== undefined) {
                        styles.boxOpacity.value = currentData[sec].styling.boxOpacity;
                        styles.boxOpacityVal.value = currentData[sec].styling.boxOpacity;
                    }
                }
            }
        });
        // Header
        if (els.siteTitle) els.siteTitle.value = currentData.header.siteTitle || "";
        if (els.siteFavicon) els.siteFavicon.value = currentData.header.favicon || "";
        if (els.headerLogo) els.headerLogo.value = currentData.header.logoText || "PulseGuard";
        if (els.themeUseCustom) els.themeUseCustom.checked = currentData.theme.useCustom || false;
        if (els.themeDefaultDark) els.themeDefaultDark.checked = currentData.theme.defaultDark || false;
        if (els.themeNavBg) els.themeNavBg.value = currentData.theme.navBgColor || "#ffffff";
        if (els.themeNavBgOpacity) {
            els.themeNavBgOpacity.value = currentData.theme.navBgOpacity !== undefined ? currentData.theme.navBgOpacity : 100;
            if (els.themeNavBgOpacityVal) els.themeNavBgOpacityVal.value = els.themeNavBgOpacity.value;
        }

        if (els.themePrimary) els.themePrimary.value = currentData.theme.primaryColor || "#2a75d3";
        if (els.themePrimaryOpacity) {
            els.themePrimaryOpacity.value = currentData.theme.primaryOpacity !== undefined ? currentData.theme.primaryOpacity : 100;
            if (els.themePrimaryOpacityVal) els.themePrimaryOpacityVal.value = els.themePrimaryOpacity.value;
        }

        if (els.themePageBg) els.themePageBg.value = currentData.theme.pageBgColor || "#fff5f5";
        if (els.themePageBgOpacity) {
            els.themePageBgOpacity.value = currentData.theme.pageBgOpacity !== undefined ? currentData.theme.pageBgOpacity : 100;
            if (els.themePageBgOpacityVal) els.themePageBgOpacityVal.value = els.themePageBgOpacity.value;
        }

        if (els.themeBg) els.themeBg.value = currentData.theme.bgColor || "#f8fbff";
        if (els.themeBgOpacity) {
            els.themeBgOpacity.value = currentData.theme.bgOpacity !== undefined ? currentData.theme.bgOpacity : 100;
            if (els.themeBgOpacityVal) els.themeBgOpacityVal.value = els.themeBgOpacity.value;
        }

        if (els.themeBtnBg) els.themeBtnBg.value = currentData.theme.btnBgColor || "#2a75d3";
        if (els.themeBtnOpacity) {
            els.themeBtnOpacity.value = currentData.theme.btnOpacity !== undefined ? currentData.theme.btnOpacity : 100;
            if (els.themeBtnOpacityVal) els.themeBtnOpacityVal.value = els.themeBtnOpacity.value;
        }
        if (els.themeBtnText) els.themeBtnText.value = currentData.theme.btnTextColor || "#ffffff";

        if (els.themeText) els.themeText.value = currentData.theme.textColor || "#2c3e50";
        if (els.themeTextOpacity) {
            els.themeTextOpacity.value = currentData.theme.textOpacity !== undefined ? currentData.theme.textOpacity : 100;
            if (els.themeTextOpacityVal) els.themeTextOpacityVal.value = els.themeTextOpacity.value;
        }
        if (els.themeBoxBg) els.themeBoxBg.value = currentData.theme.boxBgColor || "#ffffff";
        if (els.themeBoxOpacity) {
            els.themeBoxOpacity.value = currentData.theme.boxOpacity !== undefined ? currentData.theme.boxOpacity : 100;
            if (els.themeBoxOpacityVal) els.themeBoxOpacityVal.value = els.themeBoxOpacity.value;
        }
        if (els.themeFontsize) {
            els.themeFontsize.value = currentData.theme.baseFontSize || "16";
            if (els.fontSizeVal) els.fontSizeVal.textContent = els.themeFontsize.value + "px";
        }
        
        if (els.themeDarkPageBg) els.themeDarkPageBg.value = currentData.theme.darkPageBgColor || "#0f172a";
        if (els.themeDarkPageBgOpacity) {
            els.themeDarkPageBgOpacity.value = currentData.theme.darkPageBgOpacity !== undefined ? currentData.theme.darkPageBgOpacity : 100;
            if (els.themeDarkPageBgOpacityVal) els.themeDarkPageBgOpacityVal.value = els.themeDarkPageBgOpacity.value;
        }
        
        if (els.themeDarkBg) els.themeDarkBg.value = currentData.theme.darkBgColor || "#1a1a1a";
        if (els.themeDarkBgOpacity) {
            els.themeDarkBgOpacity.value = currentData.theme.darkBgOpacity !== undefined ? currentData.theme.darkBgOpacity : 100;
            if (els.themeDarkBgOpacityVal) els.themeDarkBgOpacityVal.value = els.themeDarkBgOpacity.value;
        }

        if (els.themeDarkText) els.themeDarkText.value = currentData.theme.darkTextColor || "#f8fafc";
        if (els.themeDarkTextOpacity) {
            els.themeDarkTextOpacity.value = currentData.theme.darkTextOpacity !== undefined ? currentData.theme.darkTextOpacity : 100;
            if (els.themeDarkTextOpacityVal) els.themeDarkTextOpacityVal.value = els.themeDarkTextOpacity.value;
        }

        if (els.themeDarkBox) els.themeDarkBox.value = currentData.theme.darkBoxBgColor || "#1e293b";
        if (els.themeDarkBoxOpacity) {
            els.themeDarkBoxOpacity.value = currentData.theme.darkBoxOpacity !== undefined ? currentData.theme.darkBoxOpacity : 100;
            if (els.themeDarkBoxOpacityVal) els.themeDarkBoxOpacityVal.value = els.themeDarkBoxOpacity.value;
        }

        if (els.themeDarkNav) els.themeDarkNav.value = currentData.theme.darkNavBgColor || "#0b0f14";
        if (els.themeDarkNavOpacity) {
            els.themeDarkNavOpacity.value = currentData.theme.darkNavOpacity !== undefined ? currentData.theme.darkNavOpacity : 100;
            if (els.themeDarkNavOpacityVal) els.themeDarkNavOpacityVal.value = els.themeDarkNavOpacity.value;
        }

        if (els.themeDarkBtnBg) els.themeDarkBtnBg.value = currentData.theme.darkBtnBgColor || "#2a75d3";
        if (els.themeDarkBtnOpacity) {
            els.themeDarkBtnOpacity.value = currentData.theme.darkBtnOpacity !== undefined ? currentData.theme.darkBtnOpacity : 100;
            if (els.themeDarkBtnOpacityVal) els.themeDarkBtnOpacityVal.value = els.themeDarkBtnOpacity.value;
        }
        if (els.themeDarkBtnText) els.themeDarkBtnText.value = currentData.theme.darkBtnTextColor || "#ffffff";

        // Animations
        if (els.animStyle) els.animStyle.value = currentData.animations.style || "none";
        if (els.animDuration) els.animDuration.value = currentData.animations.duration || "normal";

        // Hero
        els.heroTitle.value = currentData.hero.title || "";
        quillHero.root.innerHTML = currentData.hero.subtitle || "";
        if (els.heroBtnText) els.heroBtnText.value = currentData.hero.buttonText || "";
        setPreview(els.heroBgPreview, currentData.hero.backgroundImage);
        
        if (els.mediaCode) els.mediaCode.value = currentData.media.codeLink || "";
        setPreview(els.galleryPreview1, currentData.media.photos[0]);
        setPreview(els.galleryPreview2, currentData.media.photos[1]);

        // Feedback
        if (els.feedbackTitle) els.feedbackTitle.value = currentData.feedback.title || "Leave Your Feedback";
        if (els.feedbackDesc) els.feedbackDesc.value = currentData.feedback.description || "We would love to hear from you!";

        if (currentData.feedback.fields) {
            const f = currentData.feedback.fields;

            // Upgrade legacy field show schema if missing showChild
            ['name', 'age', 'phone', 'email', 'msg'].forEach(k => {
                if (f[k] && f[k].showChild === undefined) {
                    f[k].showChild = f[k].show !== false;
                    f[k].showAdult = f[k].show !== false;
                    f[k].showNone = f[k].show !== false;
                }
            });

            ['name', 'age', 'phone', 'email', 'msg'].forEach(k => {
                const elC = document.getElementById(`fb-opt-${k}-child`);
                const elA = document.getElementById(`fb-opt-${k}-adult`);
                const elN = document.getElementById(`fb-opt-${k}-none`);
                const elR = document.getElementById(`fb-opt-${k}-req`);
                if (elC) elC.checked = f[k].showChild;
                if (elA) elA.checked = f[k].showAdult;
                if (elN) elN.checked = f[k].showNone;
                if (elR) elR.checked = f[k].req;
            });

            if (!f.cat) f.cat = { show: true, req: true, label1: "", label2: "", label3: "", customOptions: "" };

            if (els.fbOptCatShow) {
                els.fbOptCatShow.checked = f.cat.show;
                els.fbOptCatReq.checked = f.cat.req;
                if (els.fbCatLabel1) els.fbCatLabel1.value = f.cat.label1 || "";
                if (els.fbCatLabel2) els.fbCatLabel2.value = f.cat.label2 || "";
                if (els.fbCatLabel3) els.fbCatLabel3.value = f.cat.label3 || "";
                if (els.fbCatCustom) els.fbCatCustom.value = f.cat.customOptions || "";
            }
        }

        // Team
        if (els.teamSectionTitle) els.teamSectionTitle.value = currentData.team.sectionTitle || "";
        els.teamName.value = currentData.team.members[0].name || "";
        els.teamRole.value = currentData.team.members[0].role || "";
        quillTeam.root.innerHTML = currentData.team.members[0].bio || "";
        setPreview(els.teamImgPreview, currentData.team.members[0].image);

        // Project
        if (els.projectSectionTitle) els.projectSectionTitle.value = currentData.project.sectionTitle || "";
        quillProject.root.innerHTML = currentData.project.description || "";

        // Development
        if (els.devSectionTitle) els.devSectionTitle.value = currentData.development.sectionTitle || "Development Process";
        }
        window.populateData();

        function renderDevStepsList() {
            if (!els.devStepsList) return;
            els.devStepsList.innerHTML = '';
            (currentData.development.steps || []).forEach((step, index) => {
                const li = document.createElement('li');
                li.className = 'draggable-item';
                li.style.display = 'flex';
                li.style.flexDirection = 'column';
                li.style.alignItems = 'stretch';
                li.style.gap = '10px';
                li.style.marginBottom = '10px';
                li.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-weight:bold;">Step ${index + 1}</span>
                        <button class="btn btn-sm" onclick="removeDevStep(${index})" style="color:white; background:#e74c3c; border:none; padding:2px 6px;"><i class="bi bi-trash"></i></button>
                    </div>
                    <div style="display:flex; gap:10px;">
                        <input type="text" value='${(step.phase || "").replace(/'/g, "&apos;")}' placeholder="Phase/Title" onchange="updateDevStep(${index}, 'phase', this.value)" style="flex:1; padding:8px; border:1px solid var(--border); border-radius:4px;">
                        <input type="text" value='${(step.icon || "bi bi-check-circle").replace(/'/g, "&apos;")}' placeholder="Icon (e.g. bi-gear)" onchange="updateDevStep(${index}, 'icon', this.value)" style="width:220px; padding:8px; border:1px solid var(--border); border-radius:4px;">
                    </div>
                    <textarea placeholder="Details" onchange="updateDevStep(${index}, 'details', this.value)" rows="3" style="padding:8px; border:1px solid var(--border); border-radius:4px; font-family:inherit; margin-bottom: 5px;">${step.details}</textarea>
                    
                    <div style="display: flex; gap: 15px; align-items: center; background: #f9f9f9; padding: 10px; border-radius: 6px; border: 1px solid #eee;">
                        <span style="font-size: 0.8rem; font-weight: bold; color: #666;"><i class="bi bi-palette"></i> Styling:</span>
                        <div style="display: flex; align-items: center; gap: 5px;">
                            <input type="checkbox" id="dev-style-override-${index}" ${step.useCustomStyle ? 'checked' : ''} onchange="updateDevStep(${index}, 'useCustomStyle', this.checked)">
                            <label for="dev-style-override-${index}" style="font-size:0.75rem; color:#666; margin:0;">Override Theme</label>
                        </div>
                        <div style="display: flex; align-items: center; gap: 5px; opacity: ${step.useCustomStyle ? '1' : '0.5'}; pointer-events: ${step.useCustomStyle ? 'auto' : 'none'};">
                            <label style="font-size:0.75rem; color:#666;">Bg</label>
                            <input type="color" value="${step.bgColor || '#ffffff'}" onchange="updateDevStep(${index}, 'bgColor', this.value)" style="cursor:pointer; height:24px; border:1px solid #ccc; border-radius:4px; padding:0;">
                        </div>
                        <div style="display: flex; align-items: center; gap: 5px; opacity: ${step.useCustomStyle ? '1' : '0.5'}; pointer-events: ${step.useCustomStyle ? 'auto' : 'none'};">
                            <label style="font-size:0.75rem; color:#666;">Opacity</label>
                            <input type="number" value="${step.bgOpacity !== undefined ? step.bgOpacity : 100}" min="0" max="100" onchange="updateDevStep(${index}, 'bgOpacity', parseInt(this.value))" style="width:50px; padding:2px; font-size:0.8rem; border-radius:4px; border:1px solid #ccc;">
                        </div>
                        <div style="display: flex; align-items: center; gap: 5px; opacity: ${step.useCustomStyle ? '1' : '0.5'}; pointer-events: ${step.useCustomStyle ? 'auto' : 'none'};">
                            <label style="font-size:0.75rem; color:#666;">Text</label>
                            <input type="color" value="${step.textColor || '#000000'}" onchange="updateDevStep(${index}, 'textColor', this.value)" style="cursor:pointer; height:24px; border:1px solid #ccc; border-radius:4px; padding:0;">
                        </div>
                    </div>
                `;
                els.devStepsList.appendChild(li);
            });
        }
        
        window.removeDevStep = function(index) {
            currentData.development.steps.splice(index, 1);
            renderDevStepsList();
            saveToLocal();
        };
        
        window.updateDevStep = function(index, field, value) {
            currentData.development.steps[index][field] = value;
            if (field === 'useCustomStyle') renderDevStepsList();
            saveToLocal();
        };

        if (els.btnAddDevStep) {
            els.btnAddDevStep.addEventListener('click', () => {
                if (!currentData.development.steps) currentData.development.steps = [];
                currentData.development.steps.push({ phase: 'New Phase', details: 'Phase details here...' });
                renderDevStepsList();
                saveToLocal();
            });
        }
        renderDevStepsList();

        // Project Features
        function renderProjectFeatures() {
            if (!els.projectFeaturesList) return;
            els.projectFeaturesList.innerHTML = '';
            (currentData.project.features || []).forEach((feature, index) => {
                const li = document.createElement('li');
                li.style.background = '#fff';
                li.style.padding = '15px';
                li.style.marginBottom = '10px';
                li.style.borderRadius = '8px';
                li.style.border = '1px solid #ddd';

                li.innerHTML = `
                    <div style="display:flex; justify-content:space-between; margin-bottom: 10px;">
                        <input type="text" value='${(feature.title || "").replace(/'/g, "&apos;")}' placeholder="Feature Title" 
                               onchange="updateProjectFeature(${index}, 'title', this.value)" style="flex:1; margin-right: 10px; font-weight:bold;">
                        <input type="text" value='${(feature.icon || "bi bi-star").replace(/'/g, "&apos;")}' placeholder="Icon (e.g. bi bi-cpu)" 
                               onchange="updateProjectFeature(${index}, 'icon', this.value)" style="width: 150px; margin-right: 10px;">
                        <button class="btn btn-sm" onclick="removeProjectFeature(${index})" style="background:#e74c3c; color:white; border:none;">Remove</button>
                    </div>
                    <textarea placeholder="Feature Description" style="width:100%; margin-bottom: 10px;" rows="2" 
                              onchange="updateProjectFeature(${index}, 'text', this.value)">${feature.text || ''}</textarea>
                    
                    <div style="display: flex; gap: 15px; align-items: center; background: #f9f9f9; padding: 10px; border-radius: 6px; border: 1px solid #eee;">
                        <span style="font-size: 0.8rem; font-weight: bold; color: #666;"><i class="bi bi-palette"></i> Styling:</span>
                        <div style="display: flex; align-items: center; gap: 5px;">
                            <input type="checkbox" id="feature-style-override-${index}" ${feature.useCustomStyle ? 'checked' : ''} onchange="updateProjectFeature(${index}, 'useCustomStyle', this.checked)">
                            <label for="feature-style-override-${index}" style="font-size:0.75rem; color:#666; margin:0;">Override Theme</label>
                        </div>
                        <div style="display: flex; align-items: center; gap: 5px; opacity: ${feature.useCustomStyle ? '1' : '0.5'}; pointer-events: ${feature.useCustomStyle ? 'auto' : 'none'};">
                            <label style="font-size:0.75rem; color:#666;">Bg</label>
                            <input type="color" value="${feature.bgColor || '#ffffff'}" onchange="updateProjectFeature(${index}, 'bgColor', this.value)" style="cursor:pointer; height:24px; border:1px solid #ccc; border-radius:4px; padding:0;">
                        </div>
                        <div style="display: flex; align-items: center; gap: 5px; opacity: ${feature.useCustomStyle ? '1' : '0.5'}; pointer-events: ${feature.useCustomStyle ? 'auto' : 'none'};">
                            <label style="font-size:0.75rem; color:#666;">Opacity</label>
                            <input type="number" value="${feature.bgOpacity !== undefined ? feature.bgOpacity : 100}" min="0" max="100" onchange="updateProjectFeature(${index}, 'bgOpacity', parseInt(this.value))" style="width:50px; padding:2px; font-size:0.8rem; border-radius:4px; border:1px solid #ccc;">
                        </div>
                        <div style="display: flex; align-items: center; gap: 5px; opacity: ${feature.useCustomStyle ? '1' : '0.5'}; pointer-events: ${feature.useCustomStyle ? 'auto' : 'none'};">
                            <label style="font-size:0.75rem; color:#666;">Text</label>
                            <input type="color" value="${feature.textColor || '#000000'}" onchange="updateProjectFeature(${index}, 'textColor', this.value)" style="cursor:pointer; height:24px; border:1px solid #ccc; border-radius:4px; padding:0;">
                        </div>
                    </div>
                `;
                els.projectFeaturesList.appendChild(li);
            });
        }

        window.removeProjectFeature = function(index) {
            currentData.project.features.splice(index, 1);
            renderProjectFeatures();
            saveToLocal();
        };

        window.updateProjectFeature = function(index, field, value) {
            currentData.project.features[index][field] = value;
            if (field === 'useCustomStyle') renderProjectFeatures();
            saveToLocal();
        };

        if (els.btnAddFeature) {
            els.btnAddFeature.addEventListener('click', () => {
                if (!currentData.project.features) currentData.project.features = [];
                currentData.project.features.push({ title: 'New Feature', text: 'Feature description', icon: 'bi bi-star' });
                renderProjectFeatures();
                saveToLocal();
            });
        }
        renderProjectFeatures();

        // Media
        if (els.mediaSectionTitle) els.mediaSectionTitle.value = currentData.media.sectionTitle || "";
        els.mediaVideo.value = currentData.media.videoUrl || "";
        els.mediaCode.value = currentData.media.codeLink || "";
        renderGalleryList(); // Replaces the old static previews
        if (els.themeUseCustom) els.themeUseCustom.addEventListener('change', saveToLocal);

        // Footer
        if (!currentData.footer) currentData.footer = {};
        if (els.footerAboutTitle) els.footerAboutTitle.value = currentData.footer.aboutTitle || "Who We Are";
        if (els.footerAboutText) els.footerAboutText.value = currentData.footer.aboutText || "";
        if (els.footerContactTitle) els.footerContactTitle.value = currentData.footer.contactTitle || "Contact Us";
        if (els.footerEmail) els.footerEmail.value = currentData.footer.email || "";
        if (els.footerPhone) els.footerPhone.value = currentData.footer.phone || "";
        if (els.footerCopyright) els.footerCopyright.value = currentData.footer.copyright || (currentData.footer.text || "");

        // 4. Render Drag and Drop List
        function renderDraggableList() {
            if (!els.draggableList) return;
            els.draggableList.innerHTML = '';
            const dList = els.draggableList;
            if (!dList) return;
            dList.innerHTML = '';
            currentData.layout = currentData.layout.filter(id => id != null);
            currentData.layout.forEach((id, index) => {
                const li = document.createElement('li');
                li.setAttribute('data-id', id);
                li.setAttribute('data-index', index);

                let name = sectionNames[id] || id;
                if (id === 'team') name = currentData.team.sectionTitle || 'Team Section';
                if (id === 'project') name = currentData.project.sectionTitle || 'Project Details';
                if (id === 'development') name = currentData.development.sectionTitle || 'Development Process';
                if (id === 'media' || id === 'gallery') name = currentData.media.sectionTitle || 'Gallery & Media';
                if (id === 'feedback') name = currentData.feedback.title || 'Feedback System';

                if (id.startsWith('page_')) {
                    const p = (currentData.customPages || []).find(p => p.id === id);
                    if (p) name = `[Custom Page] ${p.title}`;
                }

                li.innerHTML = `
                <i class="bi bi-grip-vertical text-muted" style="cursor: grab;"></i>
                <span style="flex:1; margin-left: 10px; font-weight:600; color: var(--text-dark);">${name}</span>
                <span style="font-size: 0.75rem; background: var(--border); padding: 2px 6px; border-radius: 4px; color: var(--text-dark);">Drag to move</span>
            `;
                li.style.display = 'flex';
                li.style.alignItems = 'center';
                li.style.padding = '10px';
                li.style.background = 'var(--white)';
                li.style.border = '1px solid var(--border)';
                li.style.marginBottom = '5px';
                li.style.borderRadius = '6px';
                li.style.color = 'var(--text-dark)';

                dList.appendChild(li);

                // Drag Events
                li.draggable = true;
                li.addEventListener('dragstart', handleDragStart);
                li.addEventListener('dragover', handleDragOver);
                li.addEventListener('drop', handleDrop);
                li.addEventListener('dragenter', (e) => e.preventDefault());
            });
        }
        renderDraggableList();

        let dragStartIndex;
        function handleDragStart(e) {
            dragStartIndex = +e.target.closest('li').dataset.index;
        }
        function handleDragOver(e) {
            e.preventDefault();
        }
        function handleDrop(e) {
            e.preventDefault();
            const dropTarget = e.target.closest('li');
            if (!dropTarget) return;

            const dragEndIndex = +dropTarget.dataset.index;

            // Swap logic for array
            const itemOne = currentData.layout[dragStartIndex];
            currentData.layout.splice(dragStartIndex, 1);
            currentData.layout.splice(dragEndIndex, 0, itemOne);

            renderDraggableList();
            saveToLocal();
        }

        // Allow dropping on the ul itself (at the end)
        if (els.draggableList) {
            els.draggableList.addEventListener('dragover', handleDragOver);
            els.draggableList.addEventListener('drop', (e) => {
                if (!e.target.closest('li')) {
                    const itemOne = currentData.layout[dragStartIndex];
                    currentData.layout.splice(dragStartIndex, 1);
                    currentData.layout.push(itemOne);
                    renderDraggableList();
                    saveToLocal();
                }
            });
        }

        // 4.5 Render Drag and Drop Nav Links
        function renderNavDraggableList() {
            const navList = document.getElementById('nav-draggable-list');
            if (!navList) return;
            navList.innerHTML = '';
            
            if (!currentData.header) currentData.header = {};
            if (!currentData.header.navLinks) currentData.header.navLinks = [];
            
            currentData.header.navLinks.forEach((link, index) => {
                const li = document.createElement('li');
                li.setAttribute('data-index', index);

                li.innerHTML = `
                <i class="bi bi-grip-vertical text-muted" style="cursor: grab;"></i>
                <input type="text" value="${link.text}" style="flex:1; margin-left: 10px; font-weight:600; color: var(--text-dark); background: transparent; border: 1px solid transparent; border-bottom: 1px dashed var(--border); outline: none; padding: 4px 8px; border-radius: 4px; transition: 0.2s;" onfocus="this.style.background='var(--bg)'" onblur="this.style.background='transparent'" onchange="window.updateNavLinkText(${index}, this.value)">
                <span style="font-size: 0.75rem; background: var(--border); padding: 2px 6px; border-radius: 4px; color: var(--text-dark); margin-left: 10px;">Drag to move</span>
            `;
                li.style.display = 'flex';
                li.style.alignItems = 'center';
                li.style.padding = '10px';
                li.style.background = 'var(--white)';
                li.style.border = '1px solid var(--border)';
                li.style.marginBottom = '5px';
                li.style.borderRadius = '6px';
                li.style.color = 'var(--text-dark)';

                navList.appendChild(li);

                li.draggable = true;
                li.addEventListener('dragstart', handleNavDragStart);
                li.addEventListener('dragover', handleDragOver);
                li.addEventListener('drop', handleNavDrop);
                li.addEventListener('dragenter', (e) => e.preventDefault());
            });
        }
        renderNavDraggableList();

        let navDragStartIndex;
        function handleNavDragStart(e) {
            navDragStartIndex = +e.target.closest('li').dataset.index;
        }
        function handleNavDrop(e) {
            e.preventDefault();
            const dropTarget = e.target.closest('li');
            if (!dropTarget) return;

            const dragEndIndex = +dropTarget.dataset.index;
            const itemOne = currentData.header.navLinks[navDragStartIndex];
            currentData.header.navLinks.splice(navDragStartIndex, 1);
            currentData.header.navLinks.splice(dragEndIndex, 0, itemOne);

            renderNavDraggableList();
            saveToLocal();
        }

        window.updateNavLinkText = function(index, newText) {
            if (!currentData.header.navLinks[index]) return;
            currentData.header.navLinks[index].text = newText;
            
            // Check if it's a custom page, and sync its title as well
            let href = currentData.header.navLinks[index].href;
            if (href.startsWith('#page-')) {
                let pageId = href.replace('#page-', '');
                let page = currentData.customPages.find(p => p.id === pageId);
                if (page) {
                    page.title = newText;
                    if (typeof renderPagesList === 'function') renderPagesList();
                }
            }
            saveToLocal();
        };

        const navListEl = document.getElementById('nav-draggable-list');
        if (navListEl) {
            navListEl.addEventListener('dragover', handleDragOver);
            navListEl.addEventListener('drop', (e) => {
                if (!e.target.closest('li')) {
                    const itemOne = currentData.header.navLinks[navDragStartIndex];
                    currentData.header.navLinks.splice(navDragStartIndex, 1);
                    currentData.header.navLinks.push(itemOne);
                    renderNavDraggableList();
                    saveToLocal();
                }
            });
        }

        // 5. Tabs Logic
        const sidebarItems = document.querySelectorAll('.sidebar-menu li');
        const tabPanes = document.querySelectorAll('.tab-pane');

        sidebarItems.forEach(item => {
            item.addEventListener('click', () => {
                sidebarItems.forEach(i => i.classList.remove('active'));
                tabPanes.forEach(t => t.classList.remove('active'));

                item.classList.add('active');
                const targetTab = document.getElementById(item.dataset.tab);
                if (targetTab) targetTab.classList.add('active');
            });
        });

        els.themeFontsize.addEventListener('input', (e) => {
            els.fontSizeVal.textContent = e.target.value + "px";
            saveToLocal();
        });

        if (els.visHero) els.visHero.addEventListener('change', (e) => { currentData.visibility.hero = e.target.checked; saveToLocal(); });
        if (els.visTeam) els.visTeam.addEventListener('change', (e) => { currentData.visibility.team = e.target.checked; saveToLocal(); });
        if (els.visProject) els.visProject.addEventListener('change', (e) => { currentData.visibility.project = e.target.checked; saveToLocal(); });
        if (els.visDevelopment) els.visDevelopment.addEventListener('change', (e) => { currentData.visibility.development = e.target.checked; saveToLocal(); });
        if (els.visGallery) els.visGallery.addEventListener('change', (e) => { currentData.visibility.gallery = e.target.checked; saveToLocal(); });
        if (els.visFeedback) els.visFeedback.addEventListener('change', (e) => { currentData.visibility.feedback = e.target.checked; saveToLocal(); });

        function handleNavVisibilityChange(e, sectionId, defaultText) {
            const isChecked = e.target.checked;
            let existingIndex = currentData.header.navLinks.findIndex(link => link.href === `#${sectionId}`);
            if (isChecked) {
                if (existingIndex === -1) {
                    currentData.header.navLinks.push({ text: defaultText, href: `#${sectionId}` });
                }
            } else {
                if (existingIndex !== -1) {
                    currentData.header.navLinks.splice(existingIndex, 1);
                }
            }
            if (typeof renderNavDraggableList === 'function') renderNavDraggableList();
            saveToLocal();
        }

        if (els.navVisHero) els.navVisHero.addEventListener('change', (e) => handleNavVisibilityChange(e, 'home', 'Home'));
        if (els.navVisTeam) els.navVisTeam.addEventListener('change', (e) => handleNavVisibilityChange(e, 'team', 'Team'));
        if (els.navVisProject) els.navVisProject.addEventListener('change', (e) => handleNavVisibilityChange(e, 'project', 'Project'));
        if (els.navVisDevelopment) els.navVisDevelopment.addEventListener('change', (e) => handleNavVisibilityChange(e, 'development', 'Development'));
        if (els.navVisGallery) els.navVisGallery.addEventListener('change', (e) => handleNavVisibilityChange(e, 'gallery', 'Gallery'));
        if (els.navVisFeedback) els.navVisFeedback.addEventListener('change', (e) => handleNavVisibilityChange(e, 'feedback', 'Feedback'));

        // 6. Handle File Uploads
        function handleUpload(fileInput, previewContainer, callback) {
            if (!fileInput) return;
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;
                resizeAndCompressImage(file, (base64Str) => {
                    setPreview(previewContainer, base64Str);
                    callback(base64Str);
                    saveToLocal();
                });
                e.target.value = '';
            });
        }

        handleUpload(els.heroBgUpload, els.heroBgPreview, (b64) => { currentData.hero.backgroundImage = b64; });
        handleUpload(els.teamImgUpload, els.teamImgPreview, (b64) => { currentData.team.members[0].image = b64; });

        // Helper to auto-convert youtube links
        function getEmbedUrl(url) {
            if (!url) return "";
            let videoId = "";
            if (url.includes("youtube.com/watch?v=")) videoId = url.split("v=")[1].split("&")[0];
            else if (url.includes("youtu.be/")) videoId = url.split("youtu.be/")[1].split("?")[0];
            if (videoId) return `https://www.youtube.com/embed/${videoId}`;
            return url;
        }

        // --- Theme Restore ---
        const btnRestoreTheme = document.getElementById('btn-restore-theme');
        if (btnRestoreTheme) {
            btnRestoreTheme.addEventListener('click', () => {
                if (confirm("Are you sure you want to restore the default theme colors?")) {
                    currentData.theme = { 
                        primaryColor: "#2a75d3", primaryOpacity: 100,
                        bgColor: "#f8fbff", bgOpacity: 100,
                        pageBgColor: "#fff5f5", pageBgOpacity: 100,
                        btnBgColor: "#2a75d3", btnOpacity: 100,
                        btnTextColor: "#ffffff",
                        textColor: "#2c3e50", textOpacity: 100,
                        baseFontSize: "16", 
                        navBgColor: "#ffffff", navBgOpacity: 100,
                        boxBgColor: "#ffffff", boxOpacity: 100,
                        darkBgColor: "#1a1a1a", darkBgOpacity: 100,
                        darkPageBgColor: "#0f172a", darkPageBgOpacity: 100,
                        darkBtnBgColor: "#2a75d3", darkBtnOpacity: 100,
                        darkBtnTextColor: "#ffffff",
                        darkTextColor: "#f8fafc", darkTextOpacity: 100,
                        darkBoxBgColor: "#333333", darkBoxOpacity: 100,
                        darkNavBgColor: "#0b0f14", darkNavOpacity: 100
                    };
                    populateData();

                    saveToLocal();
                }
            });
        }

        // --- Page Manager Logic ---
        if (!currentData.customPages) currentData.customPages = [];
        let editingPageId = null;
        let editingBlocks = []; // array of block objects

        const elsPage = {
            list: document.getElementById('custom-pages-list'),
            editor: document.getElementById('page-editor'),
            titleInput: document.getElementById('page-edit-title'),
            navInput: document.getElementById('page-edit-nav'),
            modeInput: document.getElementById('page-edit-mode'),
            bgColorInput: document.getElementById('page-edit-bgcolor'),
            bgOpacityInput: document.getElementById('page-edit-bgopacity'),
            blockList: document.getElementById('page-blocks-list'),
            btnAdd: document.getElementById('btn-add-page'),
            btnSave: document.getElementById('btn-save-page'),
            btnDelete: document.getElementById('btn-delete-page'),
            btnResetColor: document.getElementById('btn-page-reset-color'),
            editorTitle: document.getElementById('page-editor-title'),

            // Toolbar
            btnAddHeader: document.getElementById('btn-add-header'),
            btnAddText: document.getElementById('btn-add-text'),
            btnAddImage: document.getElementById('btn-add-image'),
            btnAddFeatureCard: document.getElementById('btn-add-feature-card'),
            btnAddInfocards: document.getElementById('btn-add-infocards'),
            btnAddGrid: document.getElementById('btn-add-grid'),
            btnAddCarousel: document.getElementById('btn-add-carousel'),
            btnAddFlow: document.getElementById('btn-add-flow'),
            btnAddLink: document.getElementById('btn-add-link'),
            btnAddDivider: document.getElementById('btn-add-divider'),
            btnAddEmbed: document.getElementById('btn-add-embed'),
            btnAddHtml: document.getElementById('btn-add-html')
        };

        window.insertBlockAt = function(index, type) {
            let block;
            if (type === 'paste') {
                if (window.copiedBlock) {
                    block = JSON.parse(JSON.stringify(window.copiedBlock));
                } else {
                    return;
                }
            } else {
                block = { type: type };
                if (type === 'header') block.text = '';
                else if (type === 'text') block.text = '';
                else if (type === 'image') { block.src = ''; block.shape = 'normal'; }
                else if (type === 'feature') { block.title = ''; block.text = ''; block.images = []; block.layout = '1col'; block.align = 'left'; }
                else if (type === 'infocards') { block.cards = [{badge: '1', title: 'New Info Card', text: 'Card description...'}]; block.columns = '3'; block.color = '#df68ab'; }
                else if (type === 'grid') { block.images = []; block.columns = '3'; block.shape = 'normal'; }
                else if (type === 'carousel') { block.images = []; block.shape = 'normal'; }
                else if (type === 'flowchart') { block.text = ''; block.direction = 'row'; block.style = 'solid'; }
                else if (type === 'tree') { block.text = 'graph TD\nA-->B'; }
                else if (type === 'link') { block.text = 'Click Here'; block.url = '#'; block.style = 'primary'; block.align = 'center'; }
                else if (type === 'divider') { block.height = '30'; block.style = 'blank'; block.color = '#e0e0e0'; }
                else if (type === 'embed') { block.text = ''; }
                else if (type === 'html') { block.text = ''; }
            }
            
            if (index === -1) {
                editingBlocks.push(block);
            } else {
                editingBlocks.splice(index, 0, block);
            }
            renderBlocksList();
        };

        function addBlock(type) {
            window.insertBlockAt(-1, type);
        }

        window.copyBlock = function(index) {
            window.copiedBlock = JSON.parse(JSON.stringify(editingBlocks[index]));
            renderBlocksList(); // Re-render to show paste option
        };

        if (elsPage.btnAddHeader) elsPage.btnAddHeader.addEventListener('click', () => addBlock('header'));
        if (elsPage.btnAddText) elsPage.btnAddText.addEventListener('click', () => addBlock('text'));
        if (elsPage.btnAddImage) elsPage.btnAddImage.addEventListener('click', () => addBlock('image'));
        if (elsPage.btnAddFeatureCard) elsPage.btnAddFeatureCard.addEventListener('click', () => addBlock('feature'));
        if (elsPage.btnAddInfocards) elsPage.btnAddInfocards.addEventListener('click', () => addBlock('infocards'));
        if (elsPage.btnAddGrid) elsPage.btnAddGrid.addEventListener('click', () => addBlock('grid'));
        if (elsPage.btnAddCarousel) elsPage.btnAddCarousel.addEventListener('click', () => addBlock('carousel'));
        if (elsPage.btnAddFlow) elsPage.btnAddFlow.addEventListener('click', () => addBlock('flowchart'));
        if (document.getElementById('btn-add-tree')) document.getElementById('btn-add-tree').addEventListener('click', () => addBlock('tree'));
        if (elsPage.btnAddLink) elsPage.btnAddLink.addEventListener('click', () => addBlock('link'));
        if (elsPage.btnAddDivider) elsPage.btnAddDivider.addEventListener('click', () => addBlock('divider'));
        if (elsPage.btnAddEmbed) elsPage.btnAddEmbed.addEventListener('click', () => addBlock('embed'));
        if (elsPage.btnAddHtml) elsPage.btnAddHtml.addEventListener('click', () => addBlock('html'));

        window.movePageUp = function(index) {
            if (index <= 0) return;
            const item = currentData.customPages[index];
            currentData.customPages.splice(index, 1);
            currentData.customPages.splice(index - 1, 0, item);
            saveToLocal();
            renderPagesList();
        };

        window.movePageDown = function(index) {
            if (index >= currentData.customPages.length - 1) return;
            const item = currentData.customPages[index];
            currentData.customPages.splice(index, 1);
            currentData.customPages.splice(index + 1, 0, item);
            saveToLocal();
            renderPagesList();
        };

        function renderPagesList() {
            if (!elsPage.list) return;
            elsPage.list.innerHTML = '';
            currentData.customPages.forEach((page, index) => {
                const li = document.createElement('li');
                li.className = 'draggable-item';
                li.style.cursor = 'pointer';
                li.style.display = 'flex';
                li.style.alignItems = 'center';
                li.style.gap = '10px';
                
                const modeLabel = page.displayMode === 'section' ? '<span style="color:var(--primary); font-size:0.75rem;">[Home Section]</span>' : '<span style="color:var(--text-muted); font-size:0.75rem;">[Separate Page]</span>';
                const navLabel = page.showInNav ? '(In Nav)' : '';

                li.innerHTML = `
                <div style="display:flex; flex-direction:column; align-items:center;">
                    <button class="btn btn-sm btn-outline-secondary" onclick="event.stopPropagation(); movePageUp(${index})" style="padding: 0 4px; font-size:0.7rem; border: none;" title="Move Up"><i class="bi bi-chevron-up"></i></button>
                    <button class="btn btn-sm btn-outline-secondary" onclick="event.stopPropagation(); movePageDown(${index})" style="padding: 0 4px; font-size:0.7rem; border: none;" title="Move Down"><i class="bi bi-chevron-down"></i></button>
                </div>
                <i class="bi bi-file-earmark-text"></i>
                <span style="flex-grow:1;">${page.title} ${navLabel} ${modeLabel}</span>
                <button class="btn btn-secondary" style="padding: 5px 10px; font-size: 0.8rem;">Edit</button>
            `;
                li.addEventListener('click', () => openPageEditor(page.id));
                elsPage.list.appendChild(li);
            });
        }

        // Block Builder UI renderer
        function renderBlocksList() {
            if (!elsPage.blockList) return;
            elsPage.blockList.innerHTML = '';
            editingBlocks.forEach((block, index) => {

                let blockContent = '';
                let blockTitle = '';

                // Common Selectors for Image-based blocks
                const shapeSelector = `
                <select onchange="updateBlockData(${index}, 'shape', this.value)" style="padding:3px; margin-right:10px;">
                    <option value="normal" ${block.shape === 'normal' ? 'selected' : ''}>Normal (Square edges)</option>
                    <option value="rounded" ${block.shape === 'rounded' ? 'selected' : ''}>Rounded Corners</option>
                    <option value="circle" ${block.shape === 'circle' ? 'selected' : ''}>Circular</option>
                </select>
            `;
                const sizeSelector = `
                <select onchange="updateBlockData(${index}, 'size', this.value)" style="padding:3px; margin-right:10px;">
                    <option value="100%" ${block.size === '100%' || !block.size ? 'selected' : ''}>Full Width (100%)</option>
                    <option value="75%" ${block.size === '75%' ? 'selected' : ''}>Large (75%)</option>
                    <option value="50%" ${block.size === '50%' ? 'selected' : ''}>Medium (50%)</option>
                    <option value="25%" ${block.size === '25%' ? 'selected' : ''}>Small (25%)</option>
                </select>
            `;
                const lightboxToggle = `
                <label style="display:inline-flex; align-items:center; gap:5px; font-size:0.8rem; margin-right:10px;">
                    <input type="checkbox" onchange="updateBlockData(${index}, 'lightbox', this.checked)" ${block.lightbox ? 'checked' : ''}>
                    Click to Enlarge
                </label>
            `;

                if (block.type === 'header') {
                    blockTitle = 'Heading Block';
                    blockContent = `<input type="text" value="${block.text || ''}" placeholder="Enter heading..." onchange="updateBlockData(${index}, 'text', this.value)">`;
                } else if (block.type === 'text') {
                    blockTitle = 'Paragraph Block';
                    blockContent = `
                    <div style="margin-bottom: 5px; display: flex; gap: 5px; align-items: center;">
                        <button class="btn btn-sm btn-outline-secondary" style="padding: 2px 8px;" onclick="formatBlockText(${index}, '<b>', '</b>')" title="Bold selected text"><b>B</b></button>
                        <button class="btn btn-sm btn-outline-secondary" style="padding: 2px 8px;" onclick="formatBlockText(${index}, '<i>', '</i>')" title="Italicize selected text"><i>I</i></button>
                        <div style="display:flex; align-items:center; border:1px solid var(--border); border-radius:4px; padding:0 4px; background:var(--white);" title="Select text then choose a color">
                            <label style="font-size:0.7rem; margin-right:5px; margin-bottom:0; color:var(--text-muted);">Color:</label>
                            <input type="color" value="#ff0000" style="padding:0; border:none; width:22px; height:22px; cursor:pointer;" onchange="formatBlockText(${index}, null, null, true, this.value); this.value='#000000';">
                        </div>
                    </div>
                    <textarea id="block-textarea-${index}" rows="3" onmouseup="saveSelection(this)" onkeyup="saveSelection(this)" onmouseleave="saveSelection(this)" placeholder="Enter text... select text and use buttons above to format" oninput="updateBlockData(${index}, 'text', this.value)" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:4px; font-family:Inter;">${block.text || ''}</textarea>`;
                } else if (block.type === 'image') {
                    blockTitle = 'Single Image Block';
                    blockContent = `
                    <div style="margin-bottom: 5px;"><label style="font-size:0.8rem;">Image Shape:</label> ${shapeSelector} <label style="font-size:0.8rem;">Size:</label> ${sizeSelector} ${lightboxToggle}</div>
                    <div style="display:flex; gap:10px; align-items:center;">
                        <input type="file" accept="image/*" onchange="handleBlockImageUpload(event, ${index})">
                        ${block.src ? `<img src="${block.src}" style="height:50px; border-radius:4px;">` : '<span>No Image</span>'}
                    </div>
                `;
                } else if (block.type === 'feature') {
                    blockTitle = 'Feature Card Block';
                    blockContent = `
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        <div style="display: flex; gap: 10px;">
                            <div style="flex:1;">
                                <label style="font-size:0.8rem; font-weight:bold;">Title</label>
                                <input type="text" value="${(block.title || '').replace(/"/g, '&quot;')}" placeholder="Feature Title" onchange="updateBlockData(${index}, 'title', this.value)" style="width:100%; padding:5px; border:1px solid var(--border); border-radius:4px;">
                            </div>
                            <div style="flex:1;">
                                <label style="font-size:0.8rem; font-weight:bold;">Layout</label>
                                <select onchange="updateBlockData(${index}, 'layout', this.value)" style="width:100%; padding:5px; border:1px solid var(--border); border-radius:4px;">
                                    <option value="1col" ${block.layout === '1col' ? 'selected' : ''}>1 Column (Stacked)</option>
                                    <option value="img-left" ${block.layout === 'img-left' ? 'selected' : ''}>2 Columns (Image Left)</option>
                                    <option value="img-right" ${block.layout === 'img-right' ? 'selected' : ''}>2 Columns (Image Right)</option>
                                </select>
                            </div>
                            <div style="flex:1;">
                                <label style="font-size:0.8rem; font-weight:bold;">Title Alignment</label>
                                <select onchange="updateBlockData(${index}, 'align', this.value)" style="width:100%; padding:5px; border:1px solid var(--border); border-radius:4px;">
                                    <option value="left" ${block.align === 'left' ? 'selected' : ''}>Left</option>
                                    <option value="center" ${block.align === 'center' ? 'selected' : ''}>Center</option>
                                    <option value="right" ${block.align === 'right' ? 'selected' : ''}>Right</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label style="font-size:0.8rem; font-weight:bold;">Subtext / Description</label>
                            <textarea rows="3" onchange="updateBlockData(${index}, 'text', this.value)" style="width:100%; padding:5px; border:1px solid var(--border); border-radius:4px;">${block.text || ''}</textarea>
                        </div>
                        <div style="display:flex; flex-direction:column; gap:5px;">
                            <label style="font-size:0.8rem; font-weight:bold;">Images (Optional - Select Multiple)</label>
                            <div style="margin-bottom: 5px;">${lightboxToggle}</div>
                            <input type="file" accept="image/*" multiple onchange="handleBlockMultipleImageUpload(event, ${index})">
                            <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:5px;">
                                ${(block.images || []).map((imgStr, imgIdx) => `
                                    <div style="position:relative; display:inline-block;">
                                        <img src="${imgStr}" style="height:60px; border-radius:4px; border:1px solid var(--border);">
                                        <button class="btn btn-sm btn-danger" style="position:absolute; top:-5px; right:-5px; padding:2px 5px; border-radius:50%; font-size:0.6rem;" onclick="removeBlockImage(${index}, ${imgIdx})"><i class="bi bi-x"></i></button>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                `;
                } else if (block.type === 'infocards') {
                    blockTitle = 'Info Cards Grid';
                    blockContent = `
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        <div style="display: flex; gap: 10px; align-items:center;">
                            <div>
                                <label style="font-size:0.8rem; font-weight:bold;">Columns</label>
                                <select onchange="updateBlockData(${index}, 'columns', this.value)" style="padding:5px; border:1px solid var(--border); border-radius:4px;">
                                    <option value="1" ${block.columns === '1' ? 'selected' : ''}>1 Column</option>
                                    <option value="2" ${block.columns === '2' ? 'selected' : ''}>2 Columns</option>
                                    <option value="3" ${block.columns === '3' ? 'selected' : ''}>3 Columns</option>
                                    <option value="4" ${block.columns === '4' ? 'selected' : ''}>4 Columns</option>
                                </select>
                            </div>
                            <div>
                                <label style="font-size:0.8rem; font-weight:bold;">Theme Color</label>
                                <input type="color" value="${block.color || '#df68ab'}" onchange="updateBlockData(${index}, 'color', this.value)" style="height:30px; border:1px solid #ccc; border-radius:4px; cursor:pointer;">
                            </div>
                            <div>
                                <label style="font-size:0.8rem; font-weight:bold;">Box Bg Color</label>
                                <input type="color" value="${block.cardBg || '#ffffff'}" onchange="updateBlockData(${index}, 'cardBg', this.value)" style="height:30px; border:1px solid #ccc; border-radius:4px; cursor:pointer;">
                            </div>
                            <div>
                                <label style="font-size:0.8rem; font-weight:bold;">Card Style</label>
                                <select onchange="updateBlockData(${index}, 'cardStyle', this.value)" style="padding:5px; border:1px solid var(--border); border-radius:4px;">
                                    <option value="top-badge" ${block.cardStyle === 'top-badge' || !block.cardStyle ? 'selected' : ''}>Top Badge (Bordered)</option>
                                    <option value="side-badge" ${block.cardStyle === 'side-badge' ? 'selected' : ''}>Side Badge</option>
                                    <option value="minimal" ${block.cardStyle === 'minimal' ? 'selected' : ''}>Minimalist</option>
                                    <option value="glass" ${block.cardStyle === 'glass' ? 'selected' : ''}>Glassmorphism</option>
                                </select>
                            </div>
                        </div>
                        <div style="border: 1px solid var(--border); padding: 10px; border-radius: 8px; background: #fdfdfd;">
                            <label style="font-size:0.85rem; font-weight:bold; color:var(--primary); margin-bottom:10px; display:block;">Cards</label>
                            ${(block.cards || []).map((card, cIdx) => `
                                <div style="display: flex; gap: 10px; align-items:flex-start; margin-bottom: 10px; background: #fff; padding: 10px; border: 1px dashed #ccc; border-radius: 6px;">
                                    <div style="width: 50px;">
                                        <label style="font-size:0.7rem;">Badge</label>
                                        <input type="text" value="${(card.badge || '').replace(/"/g, '&quot;')}" onchange="updateInfoCard(${index}, ${cIdx}, 'badge', this.value)" style="width:100%; padding:4px; font-size:0.8rem;" placeholder="1">
                                    </div>
                                    <div style="flex:1;">
                                        <label style="font-size:0.7rem;">Title</label>
                                        <input type="text" value="${(card.title || '').replace(/"/g, '&quot;')}" onchange="updateInfoCard(${index}, ${cIdx}, 'title', this.value)" style="width:100%; padding:4px; font-size:0.8rem; margin-bottom:5px;" placeholder="Card Title">
                                        <label style="font-size:0.7rem;">Description</label>
                                        <textarea rows="2" onchange="updateInfoCard(${index}, ${cIdx}, 'text', this.value)" style="width:100%; padding:4px; font-size:0.8rem;" placeholder="Text or HTML...">${card.text || ''}</textarea>
                                    </div>
                                    <button class="btn btn-sm btn-outline-danger" onclick="removeInfoCard(${index}, ${cIdx})" style="padding: 2px 6px;" title="Remove Card"><i class="bi bi-trash"></i></button>
                                </div>
                            `).join('')}
                            <button class="btn btn-sm btn-outline-primary" onclick="addInfoCard(${index})">+ Add Card</button>
                        </div>
                    </div>
                `;
                } else if (block.type === 'flowchart') {
                    blockTitle = 'Flowchart Block';
                    blockContent = `
                    <div style="display: flex; gap: 10px; margin-bottom: 5px;">
                        <select onchange="updateBlockData(${index}, 'direction', this.value)" style="padding: 5px;">
                            <option value="row" ${block.direction === 'row' ? 'selected' : ''}>Horizontal (Left to Right)</option>
                            <option value="column" ${block.direction === 'column' ? 'selected' : ''}>Vertical (Top to Down)</option>
                        </select>
                        <select onchange="updateBlockData(${index}, 'style', this.value)" style="padding: 5px;">
                            <option value="solid" ${block.style === 'solid' ? 'selected' : ''}>Solid Colors</option>
                            <option value="outline" ${block.style === 'outline' ? 'selected' : ''}>Outline</option>
                            <option value="minimal" ${block.style === 'minimal' ? 'selected' : ''}>Minimal Text</option>
                        </select>
                    </div>
                    <input type="text" value="${block.text || ''}" placeholder="Comma separated steps (e.g. Idea, Prototype)" onchange="updateBlockData(${index}, 'text', this.value)">
                `;
                } else if (block.type === 'tree') {
                    if (!block.nodes) block.nodes = [{ id: '1', text: 'Root Box', parents: [] }];

                    blockTitle = 'Tree / Flow Diagram (Visual)';
                    let nodesHtml = block.nodes.map((n, nIdx) => `
                    <div style="display:flex; gap:10px; margin-bottom:10px; align-items:center; background:var(--white); padding:10px; border:1px solid var(--border); border-radius:6px; flex-wrap:wrap;">
                        <div style="flex:1; min-width:200px; display:flex; flex-direction:column; gap:5px;">
                            <label style="font-size:0.75rem; color:var(--text-muted); margin-bottom:-3px;">Main Title:</label>
                            <div style="display: flex; gap: 5px; align-items: center; background:var(--bg); padding:3px; border-radius:4px;">
                                <button class="btn btn-sm btn-outline-secondary" style="padding: 2px 6px;" onclick="formatTreeTitle(${index}, ${nIdx}, '<b>', '</b>')" title="Bold"><b>B</b></button>
                                <button class="btn btn-sm btn-outline-secondary" style="padding: 2px 6px;" onclick="formatTreeTitle(${index}, ${nIdx}, '<i>', '</i>')" title="Italic"><i>I</i></button>
                                <div style="display:flex; align-items:center; border:1px solid var(--border); border-radius:4px; padding:0 4px; background:var(--white);" title="Text Color">
                                    <input type="color" value="#000000" style="padding:0; border:none; width:20px; height:20px; cursor:pointer;" onchange="formatTreeTitle(${index}, ${nIdx}, null, null, true, this.value); this.value='#000000';">
                                </div>
                            </div>
                            <textarea id="tree-title-${index}-${nIdx}" onmouseup="saveSelection(this)" onkeyup="saveSelection(this)" onmouseleave="saveSelection(this)" oninput="updateTreeNode(${index}, ${nIdx}, 'text', this.value)" rows="1" style="padding:6px; border:1px solid var(--border); border-radius:4px; font-weight:bold; font-family:inherit; resize:vertical;" placeholder="Box Title">${n.text || ''}</textarea>
                            
                            <label style="font-size:0.75rem; color:var(--text-muted); margin-top:5px; margin-bottom:-3px;">Subtext:</label>
                            <div style="display: flex; gap: 5px; align-items: center; background:var(--bg); padding:3px; border-radius:4px;">
                                <button class="btn btn-sm btn-outline-secondary" style="padding: 2px 6px;" onclick="formatTreeText(${index}, ${nIdx}, '<b>', '</b>')" title="Bold"><b>B</b></button>
                                <button class="btn btn-sm btn-outline-secondary" style="padding: 2px 6px;" onclick="formatTreeText(${index}, ${nIdx}, '<i>', '</i>')" title="Italic"><i>I</i></button>
                                <div style="display:flex; align-items:center; border:1px solid var(--border); border-radius:4px; padding:0 4px; background:var(--white);" title="Text Color">
                                    <input type="color" value="#ff0000" style="padding:0; border:none; width:20px; height:20px; cursor:pointer;" onchange="formatTreeText(${index}, ${nIdx}, null, null, true, this.value); this.value='#000000';">
                                </div>
                                <select onchange="updateTreeNode(${index}, ${nIdx}, 'align', this.value)" style="padding:2px 4px; border:1px solid var(--border); border-radius:4px; font-size:0.75rem;" title="Text Alignment">
                                    <option value="center" ${!n.align || n.align === 'center' ? 'selected' : ''}>Center</option>
                                    <option value="left" ${n.align === 'left' ? 'selected' : ''}>Left</option>
                                    <option value="right" ${n.align === 'right' ? 'selected' : ''}>Right</option>
                                </select>
                            </div>
                            
                            <textarea id="tree-subtext-${index}-${nIdx}" onmouseup="saveSelection(this)" onkeyup="saveSelection(this)" onmouseleave="saveSelection(this)" oninput="updateTreeNode(${index}, ${nIdx}, 'subtext', this.value)" rows="3" style="padding:6px; border:1px solid var(--border); border-radius:4px; font-family:inherit; font-size:0.85rem;" placeholder="Subtext (optional)">${n.subtext || ''}</textarea>
                        </div>
                        
                        <select onchange="updateTreeNode(${index}, ${nIdx}, 'shape', this.value)" style="padding:6px; border:1px solid var(--border); border-radius:4px; font-size:0.8rem; background:var(--bg);">
                            <option value="rect" ${!n.shape || n.shape === 'rect' ? 'selected' : ''}>Rectangle [ ]</option>
                            <option value="round" ${n.shape === 'round' ? 'selected' : ''}>Rounded ( )</option>
                            <option value="stadium" ${n.shape === 'stadium' ? 'selected' : ''}>Stadium ([ ])</option>
                            <option value="cyl" ${n.shape === 'cyl' ? 'selected' : ''}>Database [( )]</option>
                            <option value="circle" ${n.shape === 'circle' ? 'selected' : ''}>Circle (( ))</option>
                            <option value="rhombus" ${n.shape === 'rhombus' ? 'selected' : ''}>Diamond { }</option>
                        </select>
                        
                        <div style="max-width: 250px; display:flex; flex-direction:column; background: var(--white); border: 1px solid var(--border); border-radius: 4px; padding: 5px; font-size: 0.8rem; max-height: 80px; overflow-y: auto;">
                            <span style="color:var(--text-muted); font-size:0.75rem;">Connects to (Hold Ctrl):</span>
                            <select multiple size="3" onchange="updateTreeNodeMultiple(${index}, ${nIdx}, 'parents', this)" style="border:none; outline:none; font-size:0.8rem; width:100%;">
                                <option value="" ${!(n.parents && n.parents.length) && !n.parent ? 'selected' : ''}>(No Arrow)</option>
                                ${block.nodes.map((opt, optIdx) => optIdx !== nIdx ? `<option value="${opt.id}" ${((n.parents || []).includes(opt.id) || n.parent === opt.id) ? 'selected' : ''}>${opt.text || opt.id}</option>` : '').join('')}
                            </select>
                        </div>
                        
                        <div style="display:flex; flex-direction:column; background: var(--white); border: 1px solid var(--border); border-radius: 4px; padding: 5px; font-size: 0.8rem;">
                            <span style="color:var(--text-muted); font-size:0.75rem;">Color & Transparency:</span>
                            <div style="display:flex; align-items:center; gap:5px; margin-top:3px;">
                                <input type="color" value="${n.color || '#ffffff'}" onchange="updateTreeNode(${index}, ${nIdx}, 'color', this.value)" style="padding:0; border:1px solid var(--border); border-radius:4px; width:25px; height:25px; cursor:pointer;" title="Node Background Color">
                                <button class="btn btn-sm btn-outline-secondary" style="padding:2px 4px; font-size:0.7rem; border-color:var(--border);" onclick="updateTreeNode(${index}, ${nIdx}, 'color', '')" title="Use Theme Default Color">Default Theme Color</button>
                                <input type="range" min="0" max="100" value="${n.opacity !== undefined ? n.opacity : 100}" onchange="updateTreeNode(${index}, ${nIdx}, 'opacity', parseInt(this.value))" style="width: 50px;" title="Transparency">
                                <input type="number" min="0" max="100" value="${n.opacity !== undefined ? n.opacity : 100}" onchange="updateTreeNode(${index}, ${nIdx}, 'opacity', parseInt(this.value))" style="width: 40px; padding: 2px; border:1px solid var(--border); border-radius:4px; font-size:0.75rem;" title="Transparency %">
                            </div>
                        </div>

                        <div style="display:flex; flex-direction:column; background: var(--white); border: 1px solid var(--border); border-radius: 4px; padding: 5px; font-size: 0.8rem;">
                            <span style="color:var(--text-muted); font-size:0.75rem;">Text & Box Size:</span>
                            <div style="display:flex; align-items:center; gap:5px; margin-top:3px;">
                                <label style="font-size:0.7rem;" title="Text Size">Text:</label>
                                <input type="number" value="${n.fontSize || 14}" onchange="updateTreeNode(${index}, ${nIdx}, 'fontSize', parseInt(this.value))" style="width: 45px; padding: 3px; border:1px solid var(--border); border-radius:4px;" title="Text Size (px)">
                                <label style="font-size:0.7rem;" title="Box Size/Padding">Box:</label>
                                <input type="number" value="${n.boxPadding !== undefined ? n.boxPadding : 12}" onchange="updateTreeNode(${index}, ${nIdx}, 'boxPadding', parseInt(this.value))" style="width: 45px; padding: 3px; border:1px solid var(--border); border-radius:4px;" title="Box Padding (px)">
                            </div>
                        </div>

                        <div style="display:flex; flex-direction:column; background: var(--white); border: 1px solid var(--border); border-radius: 4px; padding: 5px; font-size: 0.8rem;">
                            <span style="color:var(--text-muted); font-size:0.75rem;">Arrow Style & Color:</span>
                            <div style="display:flex; align-items:center; gap:5px; margin-top:3px;">
                                <select onchange="updateTreeNode(${index}, ${nIdx}, 'arrowStyle', this.value)" style="padding:4px; border:1px solid var(--border); border-radius:4px; font-size:0.8rem; background:var(--bg); max-width:110px;">
                                    <option value="solid" ${!n.arrowStyle || n.arrowStyle === 'solid' ? 'selected' : ''}>Solid ──▶</option>
                                    <option value="dotted" ${n.arrowStyle === 'dotted' ? 'selected' : ''}>Dotted - -▶</option>
                                    <option value="thick" ${n.arrowStyle === 'thick' ? 'selected' : ''}>Thick ══▶</option>
                                    <option value="none" ${n.arrowStyle === 'none' ? 'selected' : ''}>No Arrow ──</option>
                                </select>
                                <input type="color" value="${n.arrowColor || '#2a75d3'}" onchange="updateTreeNode(${index}, ${nIdx}, 'arrowColor', this.value)" style="padding:0; border:1px solid var(--border); border-radius:4px; width:25px; height:25px; cursor:pointer;" title="Arrow Color">
                            </div>
                        </div>

                        <button class="btn btn-sm" style="color:white; background:#e74c3c; border:none;" onclick="removeTreeNode(${index}, ${nIdx})"><i class="bi bi-trash"></i></button>
                    </div>
                `).join('');

                    let layoutSelect = `
                    <div style="margin-bottom:10px; display:flex; align-items:center; gap:10px;">
                        <label style="font-size:0.9rem; font-weight:600;">Layout Direction: </label>
                        <select onchange="updateBlockData(${index}, 'direction', this.value)" style="padding:5px; border-radius:4px; border:1px solid var(--border); flex:1;">
                            <option value="TD" ${block.direction !== 'LR' ? 'selected' : ''}>Top to Bottom (Vertical)</option>
                            <option value="LR" ${block.direction === 'LR' ? 'selected' : ''}>Left to Right (Horizontal / Same Line)</option>
                        </select>
                    </div>
                `;

                    blockContent = `
                    <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom: 10px;">Add boxes and choose which boxes they connect to. The system will draw the arrows automatically!</p>
                    <div style="background: var(--bg); padding: 10px; border-radius: 4px; border: 1px solid var(--border);">
                        ${layoutSelect}
                        ${nodesHtml}
                        <button class="btn btn-secondary btn-sm" style="margin-top:10px;" onclick="addTreeNode(${index})">+ Add New Box</button>
                    </div>
                `;
                } else if (block.type === 'embed') {
                    blockTitle = 'Embed Code (YouTube, Maps, Spotify)';
                    blockContent = `<textarea rows="2" style="font-family: monospace; background: #fafafa;" placeholder='Paste <iframe> embed code here...' onchange="updateBlockData(${index}, 'text', this.value)">${block.text || ''}</textarea>`;
                } else if (block.type === 'html') {
                    blockTitle = 'Custom HTML Code';
                    blockContent = `<textarea rows="3" style="font-family: monospace; background: #2d2d2d; color: #00ff00;" placeholder="<div>Custom HTML</div>" onchange="updateBlockData(${index}, 'text', this.value)">${block.text || ''}</textarea>`;
                } else if (block.type === 'link') {
                    blockTitle = 'Link / Button';
                    let linkOptions = `<option value="">-- Custom URL Below --</option>`;
                    linkOptions += `<optgroup label="Main Page Sections">`;
                    ['home', 'team', 'project', 'development', 'gallery', 'feedback'].forEach(sec => {
                        linkOptions += `<option value="#${sec}" ${block.url === '#' + sec ? 'selected' : ''}>${sec.charAt(0).toUpperCase() + sec.slice(1)} Section</option>`;
                    });
                    linkOptions += `</optgroup>`;
                    
                    if (currentData.customPages && currentData.customPages.length > 0) {
                        linkOptions += `<optgroup label="Custom Pages">`;
                        currentData.customPages.forEach(p => {
                            let pUrl = `#page-${p.id}`;
                            linkOptions += `<option value="${pUrl}" ${block.url === pUrl ? 'selected' : ''}>${p.title}</option>`;
                        });
                        linkOptions += `</optgroup>`;
                    }

                    blockContent = `
                    <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
                        <div style="flex:1; min-width:150px;">
                            <label style="font-size:0.8rem; font-weight:bold;">Button Text</label>
                            <input type="text" value="${(block.text || '').replace(/"/g, '&quot;')}" placeholder="Click Here" onchange="updateBlockData(${index}, 'text', this.value)" style="width:100%; padding:5px; border-radius:4px; border:1px solid var(--border);">
                        </div>
                        <div style="flex:1; min-width:200px;">
                            <label style="font-size:0.8rem; font-weight:bold;">Link To (Select Internal or Type URL)</label>
                            <div style="display:flex; flex-direction:column; gap:5px;">
                                <select onchange="if(this.value) { document.getElementById('link-url-${index}').value = this.value; updateBlockData(${index}, 'url', this.value); }" style="width:100%; padding:5px; border-radius:4px; border:1px solid var(--border);">
                                    ${linkOptions}
                                </select>
                                <input type="text" id="link-url-${index}" value="${(block.url || '').replace(/"/g, '&quot;')}" placeholder="https://example.com or custom link" onchange="updateBlockData(${index}, 'url', this.value)" style="width:100%; padding:5px; border-radius:4px; border:1px solid var(--border);">
                            </div>
                        </div>
                        <div>
                            <label style="font-size:0.8rem; font-weight:bold;">Style</label>
                            <select onchange="updateBlockData(${index}, 'style', this.value)" style="width:100%; padding:5px; border-radius:4px; border:1px solid var(--border);">
                                <option value="primary" ${block.style === 'primary' ? 'selected' : ''}>Solid Button</option>
                                <option value="outline" ${block.style === 'outline' ? 'selected' : ''}>Outline Button</option>
                                <option value="text" ${block.style === 'text' ? 'selected' : ''}>Simple Text Link</option>
                            </select>
                        </div>
                        <div>
                            <label style="font-size:0.8rem; font-weight:bold;">Align</label>
                            <select onchange="updateBlockData(${index}, 'align', this.value)" style="width:100%; padding:5px; border-radius:4px; border:1px solid var(--border);">
                                <option value="left" ${block.align === 'left' ? 'selected' : ''}>Left</option>
                                <option value="center" ${block.align === 'center' ? 'selected' : ''}>Center</option>
                                <option value="right" ${block.align === 'right' ? 'selected' : ''}>Right</option>
                            </select>
                        </div>
                    </div>
                    `;
                } else if (block.type === 'divider') {
                    blockTitle = 'Divider / Spacing / Box Break';
                    blockContent = `
                    <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
                        <div style="flex:1; min-width: 120px;">
                            <label style="font-size:0.8rem; font-weight:bold;">Height px</label>
                            <input type="number" value="${block.height || 30}" onchange="updateBlockData(${index}, 'height', this.value)" style="width:100%; padding:5px; border-radius:4px; border:1px solid var(--border);">
                        </div>
                        <div style="flex:1; min-width: 180px;">
                            <label style="font-size:0.8rem; font-weight:bold;">Style</label>
                            <select onchange="updateBlockData(${index}, 'style', this.value)" style="width:100%; padding:5px; border-radius:4px; border:1px solid var(--border);">
                                <option value="blank" ${block.style === 'blank' ? 'selected' : ''}>Invisible (Just Spacing)</option>
                                <option value="solid" ${block.style === 'solid' ? 'selected' : ''}>Solid Line</option>
                                <option value="dashed" ${block.style === 'dashed' ? 'selected' : ''}>Dashed Line</option>
                                <option value="filled" ${block.style === 'filled' ? 'selected' : ''}>Filled Box Break (Background)</option>
                            </select>
                        </div>
                        <div style="flex:1; min-width: 150px;">
                            <label style="font-size:0.8rem; font-weight:bold;">Line/Box Color</label>
                            <div style="display:flex; gap:5px; align-items:center;">
                                <input type="color" value="${block.color || '#e0e0e0'}" onchange="updateBlockData(${index}, 'color', this.value)" style="flex:1; height:30px; border-radius:4px; border:1px solid var(--border); padding:0;">
                                <button class="btn btn-sm btn-secondary" onclick="updateBlockData(${index}, 'color', null)" style="padding:4px 8px;" title="Reset Color"><i class="bi bi-arrow-counterclockwise"></i></button>
                            </div>
                        </div>
                    </div>
                    `;
                } else if (block.type === 'grid' || block.type === 'carousel') {
                    blockTitle = block.type === 'grid' ? 'Image Grid' : 'Image Carousel';
                    let imgList = (block.images || []).map((img, i) => `
                    <div style="display:inline-block; position:relative; margin-right:10px; margin-bottom:10px;">
                        <img src="${img}" style="height:50px; width:50px; object-fit:cover; border-radius:4px;">
                        <button onclick="removeBlockImage(${index}, ${i})" style="position:absolute; top:-5px; right:-5px; background:red; color:white; border:none; border-radius:50%; width:20px; height:20px; font-size:10px; cursor:pointer;">X</button>
                    </div>
                `).join('');

                    let extras = `<label style="font-size:0.8rem;">Image Shape:</label> ${shapeSelector} <label style="font-size:0.8rem;">Size:</label> ${sizeSelector} ${lightboxToggle}`;
                    if (block.type === 'grid') {
                        extras += `
                        <label style="font-size:0.8rem; margin-left: 10px;">Columns:</label>
                        <select onchange="updateBlockData(${index}, 'columns', this.value)" style="padding:3px; margin-bottom:5px;">
                            <option value="2" ${block.columns === '2' ? 'selected' : ''}>2</option>
                            <option value="3" ${block.columns === '3' ? 'selected' : ''}>3</option>
                            <option value="4" ${block.columns === '4' ? 'selected' : ''}>4</option>
                        </select>
                    `;
                    }

                    blockContent = `
                    <div style="margin-bottom:5px;">${extras}</div>
                    <div style="display:flex; align-items:center; flex-wrap:wrap;">
                        ${imgList}
                        <div style="display:inline-block; margin-bottom:10px;">
                            <button class="btn btn-secondary btn-sm" onclick="document.getElementById('block-img-${index}').click()">+ Add Photos</button>
                            <input type="file" id="block-img-${index}" accept="image/*" multiple style="display:none;" onchange="handleBlockMultipleImageUpload(event, ${index})">
                        </div>
                    </div>
                `;
                }

                let styleUI = `
                <div style="margin-top: 15px; padding: 12px; background: var(--bg); border-radius: 6px; border: 1px solid var(--border); box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">
                    <div style="font-size: 0.75rem; font-weight: 700; margin-bottom: 8px; color: var(--text-dark);"><i class="bi bi-palette-fill" style="color:var(--primary);"></i> Advanced Box & Text Styling</div>
                    <div style="display: flex; gap: 15px; flex-wrap: wrap; align-items: center;">
                        <div>
                            <label style="font-size:0.7rem; display:block; color:var(--text-muted);">Bg Color</label>
                            <div style="display:flex; gap:2px; align-items:center;">
                                <input type="color" value="${block.bgColor || '#ffffff'}" onchange="updateBlockData(${index}, 'bgColor', this.value)" style="cursor:pointer; height:26px; border:1px solid var(--border); border-radius:4px; padding:0;">
                                <button class="btn btn-sm btn-outline-secondary" onclick="updateBlockData(${index}, 'bgColor', null)" style="padding:2px 6px;" title="Reset Bg Color"><i class="bi bi-arrow-counterclockwise"></i></button>
                            </div>
                        </div>
                        <div>
                            <label style="font-size:0.7rem; display:block; color:var(--text-muted);">Opacity %</label>
                            <input type="number" value="${block.bgOpacity !== undefined ? block.bgOpacity : 100}" min="0" max="100" onchange="updateBlockData(${index}, 'bgOpacity', parseInt(this.value))" style="width:50px; padding:2px; font-size:0.8rem; border-radius:4px; border:1px solid var(--border);">
                        </div>
                        <div>
                            <label style="font-size:0.7rem; display:block; color:var(--text-muted);">Text Color</label>
                            <div style="display:flex; gap:2px; align-items:center;">
                                <input type="color" value="${block.textColor || '#000000'}" onchange="updateBlockData(${index}, 'textColor', this.value)" style="cursor:pointer; height:26px; border:1px solid var(--border); border-radius:4px; padding:0;">
                                <button class="btn btn-sm btn-outline-secondary" onclick="updateBlockData(${index}, 'textColor', null)" style="padding:2px 6px;" title="Reset Text Color"><i class="bi bi-arrow-counterclockwise"></i></button>
                            </div>
                        </div>
                        <div>
                            <label style="font-size:0.7rem; display:block; color:var(--text-muted);">Size (px)</label>
                            <input type="number" value="${block.fontSize || ''}" placeholder="Default" onchange="updateBlockData(${index}, 'fontSize', this.value)" style="width: 70px; padding: 3px 5px; font-size:0.8rem; border:1px solid var(--border); border-radius:4px;">
                        </div>
                        <div>
                            <label style="font-size:0.7rem; display:block; color:var(--text-muted);">Alignment</label>
                            <select onchange="updateBlockData(${index}, 'align', this.value)" style="padding: 3px 5px; font-size:0.8rem; border:1px solid var(--border); border-radius:4px; background:var(--white);">
                                <option value="" ${!block.align ? 'selected' : ''}>Default</option>
                                <option value="left" ${block.align === 'left' ? 'selected' : ''}>Left</option>
                                <option value="center" ${block.align === 'center' ? 'selected' : ''}>Center</option>
                                <option value="right" ${block.align === 'right' ? 'selected' : ''}>Right</option>
                            </select>
                        </div>
                        <div style="display:flex; flex-direction:column; align-items:center;">
                            <label style="font-size:0.7rem; display:block; color:var(--text-muted);">Style</label>
                            <div style="display:flex; gap:8px; margin-top:2px;">
                                <label style="font-size:0.9rem; font-weight:900; cursor:pointer; background:var(--secondary); padding:2px 6px; border-radius:4px;"><input type="checkbox" ${block.bold ? 'checked' : ''} onchange="updateBlockData(${index}, 'bold', this.checked)"> B</label>
                                <label style="font-size:0.9rem; font-style:italic; font-weight:bold; cursor:pointer; background:var(--secondary); padding:2px 6px; border-radius:4px;"><input type="checkbox" ${block.italic ? 'checked' : ''} onchange="updateBlockData(${index}, 'italic', this.checked)"> I</label>
                            </div>
                        </div>
                    </div>
                </div>
            `;

                const li = document.createElement('div');
                li.className = 'draggable-item';
                li.draggable = true;
                li.dataset.index = index;
                li.style.display = 'flex';
                li.style.alignItems = 'flex-start';
                li.style.marginBottom = '15px';
                li.innerHTML = `
                <div style="display:flex; flex-direction:column; align-items:center; margin-right:10px; gap: 5px; padding-top: 10px;">
                    <button class="btn btn-sm btn-outline-secondary" onclick="moveBlockUp(${index})" style="padding: 2px 5px; border: none;" title="Move Up"><i class="bi bi-chevron-up"></i></button>
                    <i class="bi bi-grip-vertical drag-handle" style="cursor:grab; color:var(--text-muted); font-size:1.5rem;"></i>
                    <button class="btn btn-sm btn-outline-secondary" onclick="moveBlockDown(${index})" style="padding: 2px 5px; border: none;" title="Move Down"><i class="bi bi-chevron-down"></i></button>
                </div>
                <div class="block-item-content" style="width:100%; background:var(--white); border:1px solid var(--border); border-radius:8px; padding:15px; box-shadow:0 2px 4px rgba(0,0,0,0.02);">
                    <div class="block-item-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; padding-bottom:10px; border-bottom:1px solid var(--border); flex-wrap: wrap; gap: 10px;">
                        <span style="font-weight:600; color:var(--primary);"><i class="bi bi-layers"></i> ${blockTitle}</span>
                        
                        <div style="display: flex; gap: 10px; align-items: center; justify-content: center; flex: 1; padding: 0 15px; border-left: 1px solid var(--border); border-right: 1px solid var(--border);">
                            <label style="font-size:0.75rem; color:var(--text-muted); margin:0; font-weight:600;"><i class="bi bi-magic"></i> Animation:</label>
                            <select onchange="updateBlockData(${index}, 'animStyle', this.value)" style="padding: 4px 8px; font-size:0.8rem; border:1px solid var(--border); border-radius:4px; background:var(--white); cursor:pointer;">
                                <option value="" ${!block.animStyle ? 'selected' : ''}>Global Default</option>
                                <option value="none" ${block.animStyle === 'none' ? 'selected' : ''}>No Animation</option>
                                <option value="fade-in" ${block.animStyle === 'fade-in' ? 'selected' : ''}>Fade In</option>
                                <option value="fade-up" ${block.animStyle === 'fade-up' ? 'selected' : ''}>Fade Up</option>
                                <option value="slide-up" ${block.animStyle === 'slide-up' ? 'selected' : ''}>Slide Up</option>
                                <option value="zoom-in" ${block.animStyle === 'zoom-in' ? 'selected' : ''}>Zoom In</option>
                                <option value="zoom-out" ${block.animStyle === 'zoom-out' ? 'selected' : ''}>Zoom Out</option>
                                <option value="slide-left" ${block.animStyle === 'slide-left' ? 'selected' : ''}>Slide In Left</option>
                                <option value="slide-right" ${block.animStyle === 'slide-right' ? 'selected' : ''}>Slide In Right</option>
                                <option value="flip-up" ${block.animStyle === 'flip-up' ? 'selected' : ''}>Flip Up</option>
                                <option value="flip-down" ${block.animStyle === 'flip-down' ? 'selected' : ''}>Flip Down</option>
                                <option value="rotate-in" ${block.animStyle === 'rotate-in' ? 'selected' : ''}>Rotate In</option>
                            </select>
                            
                            <select onchange="updateBlockData(${index}, 'animDur', this.value)" style="padding: 4px 8px; font-size:0.8rem; border:1px solid var(--border); border-radius:4px; background:var(--white); cursor:pointer;">
                                <option value="" ${!block.animDur ? 'selected' : ''}>Global Speed</option>
                                <option value="very-fast" ${block.animDur === 'very-fast' ? 'selected' : ''}>Very Fast</option>
                                <option value="fast" ${block.animDur === 'fast' ? 'selected' : ''}>Fast</option>
                                <option value="normal" ${block.animDur === 'normal' ? 'selected' : ''}>Normal</option>
                                <option value="slow" ${block.animDur === 'slow' ? 'selected' : ''}>Slow</option>
                                <option value="very-slow" ${block.animDur === 'very-slow' ? 'selected' : ''}>Very Slow</option>
                            </select>
                        </div>

                        <div>
                            <button class="btn btn-sm btn-outline-secondary" onclick="copyBlock(${index})" title="Copy Block"><i class="bi bi-copy"></i></button>
                            <button class="btn btn-sm btn-outline-secondary" onclick="moveBlock(${index}, -1)"><i class="bi bi-arrow-up"></i></button>
                            <button class="btn btn-sm btn-outline-secondary" onclick="moveBlock(${index}, 1)"><i class="bi bi-arrow-down"></i></button>
                            <button class="btn btn-sm btn-danger" style="margin-left:5px;" onclick="removeBlock(${index})"><i class="bi bi-trash"></i></button>
                        </div>
                    </div>
                    ${blockContent}
                    ${styleUI}
                </div>
            `;

                li.addEventListener('dragstart', handleBlockDragStart);
                li.addEventListener('dragover', (e) => e.preventDefault());
                li.addEventListener('drop', handleBlockDrop);

                elsPage.blockList.appendChild(li);

                const insertWrap = document.createElement('div');
                insertWrap.style.textAlign = 'center';
                insertWrap.style.marginTop = '-15px';
                insertWrap.style.marginBottom = '5px';
                insertWrap.style.position = 'relative';
                insertWrap.style.zIndex = '10';
                
                insertWrap.innerHTML = `
                    <div style="position:relative; display:inline-block; width:28px; height:28px;">
                        <select onchange="if(this.value){ insertBlockAt(${index + 1}, this.value); this.value=''; }" 
                            style="opacity:0; position:absolute; top:0; left:0; width:100%; height:100%; cursor:pointer; z-index:2;">
                            <option value="" style="display:none;">+</option>
                            <option value="header">Title</option>
                            <option value="text">Paragraph</option>
                            <option value="image">Image</option>
                            <option value="feature">Feature Card</option>
                            <option value="infocards">Info Cards</option>
                            <option value="grid">Grid</option>
                            <option value="carousel">Carousel</option>
                            <option value="flowchart">List Flow</option>
                            <option value="tree">Tree/Diagram</option>
                            <option value="link">Link/Button</option>
                            <option value="divider">Divider/Space</option>
                            <option value="embed">Embed</option>
                            <option value="html">HTML</option>
                            ${window.copiedBlock ? `<option value="paste" style="font-weight:bold; color:var(--primary);">Paste Copied Block</option>` : ''}
                        </select>
                        <div style="position:absolute; top:0; left:0; width:100%; height:100%; border-radius:50%; background:var(--white); border:1.5px solid var(--primary); display:flex; align-items:center; justify-content:center; color:var(--primary); box-shadow:0 2px 4px rgba(0,0,0,0.1); z-index:1;">
                            <i class="bi bi-plus-lg" style="font-size:0.9rem; font-weight:bold;"></i>
                        </div>
                    </div>
                `;
                elsPage.blockList.appendChild(insertWrap);
            });
        }

        window.savedSelections = {};
        window.saveSelection = function(el) {
            if (el) {
                window.savedSelections[el.id] = { start: el.selectionStart, end: el.selectionEnd };
            }
        };

        window.smartFormat = function(textarea, prefix, suffix, isColor = false, colorVal = null) {
            if (!textarea) return null;
            let text = textarea.value;
            let start = textarea.selectionStart;
            let end = textarea.selectionEnd;
            
            // If lost focus to a color picker, use the saved selection
            if (start === end && window.savedSelections[textarea.id]) {
                start = window.savedSelections[textarea.id].start;
                end = window.savedSelections[textarea.id].end;
            }

            if (start === end) {
                // If still no selection, we can't format
                alert("Please select the text you want to format first!");
                return null;
            }

            let selInner = text.substring(start, end);
            
            if (isColor) {
                prefix = `<span style='color:${colorVal};'>`;
                suffix = '</span>';
            }

            let outStart = start - prefix.length;
            let outEnd = end + suffix.length;
            let hasTagsOutside = (!isColor && outStart >= 0 && outEnd <= text.length && text.substring(outStart, start) === prefix && text.substring(end, outEnd) === suffix);
            
            let isSurroundedByColor = false;
            let colorSpanMatchLength = 0;
            if (isColor) {
                let beforeStr = text.substring(0, start);
                let colorPrefixRegex = /<span style=['"]color:[^>]+>$/i;
                let match = beforeStr.match(colorPrefixRegex);
                if (match && text.substring(end, end + 7) === '</span>') {
                    isSurroundedByColor = true;
                    colorSpanMatchLength = match[0].length;
                }
            }
            
            textarea.focus();
            
            if (hasTagsOutside) {
                textarea.setSelectionRange(outStart, outEnd);
                document.execCommand("insertText", false, selInner);
                return { start: outStart, end: outStart + selInner.length };
            } else if (isSurroundedByColor) {
                textarea.setSelectionRange(start - colorSpanMatchLength, end + 7);
                document.execCommand("insertText", false, prefix + selInner + suffix);
                return { start: start - colorSpanMatchLength + prefix.length, end: start - colorSpanMatchLength + prefix.length + selInner.length };
            } else {
                if (isColor) {
                    selInner = selInner.replace(/<span style=['"]color:[^>]+>([\s\S]*?)<\/span>/gi, "$1");
                } else {
                    let pEsc = prefix.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
                    let sEsc = suffix.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
                    selInner = selInner.replace(new RegExp(pEsc + '([\\s\\S]*?)' + sEsc, 'gi'), "$1");
                }
                textarea.setSelectionRange(start, end);
                document.execCommand("insertText", false, prefix + selInner + suffix);
                return { start: start + prefix.length, end: start + prefix.length + selInner.length };
            }
        };

        window.formatBlockText = function(index, prefix, suffix, isColor = false, colorVal = null) {
            const textarea = document.getElementById('block-textarea-' + index);
            let bounds = smartFormat(textarea, prefix, suffix, isColor, colorVal);
            if (bounds) {
                updateBlockData(index, 'text', textarea.value);
                textarea.setSelectionRange(bounds.start, bounds.end);
                saveSelection(textarea);
            }
        };

        window.formatTreeTitle = function(index, nIdx, prefix, suffix, isColor = false, colorVal = null) {
            const textarea = document.getElementById(`tree-title-${index}-${nIdx}`);
            let bounds = smartFormat(textarea, prefix, suffix, isColor, colorVal);
            if (bounds) {
                updateTreeNode(index, nIdx, 'text', textarea.value);
                textarea.setSelectionRange(bounds.start, bounds.end);
                saveSelection(textarea);
            }
        };

        window.formatTreeText = function(index, nIdx, prefix, suffix, isColor = false, colorVal = null) {
            const textarea = document.getElementById(`tree-subtext-${index}-${nIdx}`);
            let bounds = smartFormat(textarea, prefix, suffix, isColor, colorVal);
            if (bounds) {
                updateTreeNode(index, nIdx, 'subtext', textarea.value);
                textarea.setSelectionRange(bounds.start, bounds.end);
                saveSelection(textarea);
            }
        };

        window.updateTreeNode = function (bIdx, nIdx, field, val) {
            editingBlocks[bIdx].nodes[nIdx][field] = val;
            if (field === 'color' && val === '') {
                renderBlocksList();
            }
        };
        window.updateTreeNodeMultiple = function (bIdx, nIdx, field, selectEl) {
            const selected = Array.from(selectEl.selectedOptions).map(opt => opt.value).filter(val => val !== "");
            editingBlocks[bIdx].nodes[nIdx][field] = selected;
            renderBlocksList();
        };
        window.addTreeNode = function (bIdx) {
            if (!editingBlocks[bIdx].nodes) editingBlocks[bIdx].nodes = [];
            editingBlocks[bIdx].nodes.push({ id: Date.now().toString(), text: 'New Box', parents: [] });
            renderBlocksList();
        };
        window.removeTreeNode = function (bIdx, nIdx) {
            editingBlocks[bIdx].nodes.splice(nIdx, 1);
            renderBlocksList();
        };

        window.updateBlockData = function (index, field, value) {
            if (value === null) {
                delete editingBlocks[index][field];
                renderBlocksList();
            } else {
                editingBlocks[index][field] = value;
            }
        }
        window.removeBlock = function (index) {
            editingBlocks.splice(index, 1);
            renderBlocksList();
        }
        window.removeBlockImage = function (blockIndex, imgIndex) {
            editingBlocks[blockIndex].images.splice(imgIndex, 1);
            renderBlocksList();
        }
        window.handleBlockImageUpload = function (event, index) {
            const file = event.target.files[0];
            if (!file) return;
            resizeAndCompressImage(file, (base64Str) => {
                editingBlocks[index].src = base64Str;
                renderBlocksList();
            });
            event.target.value = '';
        }
        window.handleBlockMultipleImageUpload = function (event, index) {
            const files = event.target.files;
            if (!files || files.length === 0) return;
            let processed = 0;
            if (!editingBlocks[index].images) editingBlocks[index].images = [];

            Array.from(files).forEach(file => {
                resizeAndCompressImage(file, (base64Str) => {
                    editingBlocks[index].images.push(base64Str);
                    processed++;
                    if (processed === files.length) {
                        renderBlocksList();
                    }
                });
            });
            event.target.value = '';
        }

        // Drag and drop for blocks
        let dragBlockStartIndex;
        function handleBlockDragStart(e) { 
            const target = e.target.closest('.draggable-item');
            if (target) dragBlockStartIndex = +target.dataset.index; 
        }
        function handleBlockDrop(e) {
            e.preventDefault();
            const dropTarget = e.target.closest('.draggable-item');
            if (!dropTarget || dragBlockStartIndex === undefined) return;
            const dragEndIndex = +dropTarget.dataset.index;
            if (dragBlockStartIndex === dragEndIndex) return;
            const itemOne = editingBlocks[dragBlockStartIndex];
            editingBlocks.splice(dragBlockStartIndex, 1);
            editingBlocks.splice(dragEndIndex, 0, itemOne);
            renderBlocksList();
        }

        window.moveBlockUp = function(index) {
            if (index <= 0) return;
            const item = editingBlocks[index];
            editingBlocks.splice(index, 1);
            editingBlocks.splice(index - 1, 0, item);
            renderBlocksList();
        };

        window.moveBlockDown = function(index) {
            if (index >= editingBlocks.length - 1) return;
            const item = editingBlocks[index];
            editingBlocks.splice(index, 1);
            editingBlocks.splice(index + 1, 0, item);
            renderBlocksList();
        };

        window.updateInfoCard = function(bIndex, cIndex, field, value) {
            editingBlocks[bIndex].cards[cIndex][field] = value;
        };
        window.addInfoCard = function(bIndex) {
            if (!editingBlocks[bIndex].cards) editingBlocks[bIndex].cards = [];
            editingBlocks[bIndex].cards.push({badge: (editingBlocks[bIndex].cards.length + 1).toString(), title: 'New Card', text: ''});
            renderBlocksList();
        };
        window.removeInfoCard = function(bIndex, cIndex) {
            editingBlocks[bIndex].cards.splice(cIndex, 1);
            renderBlocksList();
        };

        // HTML Compiler
        function compileBlocksToHTML() {
            let html = '';
            editingBlocks.forEach((b, i) => {
                let blockStyles = `margin-bottom: 20px; `;
                let applyBg = b.bgColor && (b.bgColor !== '#ffffff' && b.bgColor !== '#000000' || (b.bgOpacity !== undefined && b.bgOpacity < 100));
                if (applyBg) {
                    let hex = b.bgColor || '#ffffff';
                    if (b.bgOpacity !== undefined && b.bgOpacity < 100) {
                        let a = Math.round((b.bgOpacity / 100) * 255).toString(16).padStart(2, '0');
                        hex += a;
                    }
                    blockStyles += `background-color: ${hex}; padding: 25px; border-radius: 12px; box-shadow: var(--shadow); `;
                }
                if (b.textColor && b.textColor !== '#000000') blockStyles += `color: ${b.textColor}; `;
                if (b.fontSize) blockStyles += `font-size: ${b.fontSize}px; `;
                if (b.align) blockStyles += `text-align: ${b.align}; `;
                if (b.bold) blockStyles += `font-weight: bold; `;
                if (b.italic) blockStyles += `font-style: italic; `;

                let animClasses = '';
                if (b.animStyle && b.animStyle !== '') {
                    animClasses += `anim-target anim-style-${b.animStyle} `;
                    if (b.animDur && b.animDur !== '') {
                        animClasses += `anim-dur-${b.animDur} `;
                    } else {
                        animClasses += `anim-dur-normal `;
                    }
                }

                html += `<div class="custom-block-wrapper ${animClasses}" style="${blockStyles}">\n`;

                // Setup Shape CSS
                let br = '4px';
                let extraImgCss = '';
                if (b.shape === 'rounded') br = '20px';
                if (b.shape === 'circle') { br = '50%'; extraImgCss = 'aspect-ratio: 1/1;'; }
                let clickAttr = b.lightbox ? `onclick="window.openLightbox && window.openLightbox(this.src)"` : '';
                let cursorStyle = b.lightbox ? 'cursor:pointer;' : '';
                let widthCss = b.size ? `width:${b.size};` : `width:100%;`;

                if (b.type === 'header' && b.text) {
                    html += `<h2 style="color:var(--text-dark); margin:0; margin-bottom:10px;">${b.text}</h2>\n`;
                } else if (b.type === 'text' && b.text) {
                    html += `<p style="font-size:inherit; color:var(--text-light); margin:0;">${b.text.replace(/\n/g, '<br>')}</p>\n`;
                } else if (b.type === 'image' && b.src) {
                    html += `<div style="text-align:center;"><img src="${b.src}" ${clickAttr} style="${cursorStyle} ${widthCss} max-width:100%; border-radius:${br}; ${extraImgCss} margin:20px 0; box-shadow:0 5px 15px rgba(0,0,0,0.1);"></div>\n`;
                } else if (b.type === 'feature') {
                    let layoutDir = b.layout === '1col' ? 'column' : (b.layout === 'img-right' ? 'row-reverse' : 'row');
                    let align = b.align || 'left';
                    let hasImg = b.images && b.images.length > 0;
                    html += `<div class="feature-block" style="display:flex; flex-direction:${layoutDir}; gap:30px; align-items:center; flex-wrap:wrap;">`;
                    if (hasImg) {
                        html += `<div style="flex:1; min-width:300px; display:flex; flex-wrap:wrap; gap:15px; justify-content:center;">`;
                        b.images.forEach(img => {
                            html += `<img src="${img}" ${clickAttr} style="${cursorStyle} max-width:100%; max-height:400px; flex:1; object-fit:cover; min-width:200px; border-radius:12px; box-shadow:0 10px 30px rgba(0,0,0,0.1);">`;
                        });
                        html += `</div>`;
                    }
                    html += `<div style="flex:1; min-width:300px; text-align:${align};">`;
                    if (b.title) html += `<h2 style="color:inherit; margin-bottom:15px; font-size:2rem;">${b.title}</h2>`;
                    if (b.text) html += `<p style="color:inherit; opacity:0.9; font-size:1.1rem; line-height:1.6; margin:0;">${b.text.replace(/\n/g, '<br>')}</p>`;
                    html += `</div></div>\n`;
                } else if (b.type === 'infocards') {
                    let cols = b.columns || '3';
                    let colWidth = '100%';
                    if (cols === '2') colWidth = 'calc(50% - 15px)';
                    if (cols === '3') colWidth = 'calc(33.33% - 20px)';
                    if (cols === '4') colWidth = 'calc(25% - 22.5px)';
                    let themeColor = b.color || '#df68ab';
                    let boxBg = b.cardBg && b.cardBg !== '#ffffff' ? b.cardBg : 'var(--box-bg)';
                    let cStyle = b.cardStyle || 'top-badge';
                    
                    html += `<div style="display:flex; flex-wrap:wrap; gap:30px; justify-content:center;">\n`;
                    (b.cards || []).forEach(card => {
                        if (cStyle === 'top-badge') {
                            html += `
                            <div style="width:${colWidth}; min-width:250px; background:${boxBg}; border-radius:8px; box-shadow:var(--shadow); position:relative; margin-top:20px; padding:30px 20px 20px; border-top:6px solid ${themeColor};">
                                <div style="position:absolute; top:0; left:50%; transform:translate(-50%, -50%); min-width:40px; height:40px; padding:0 12px; box-sizing:border-box; white-space:nowrap; background:${themeColor}; color:#fff; border-radius:20px; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:1.2rem; box-shadow:0 4px 8px rgba(0,0,0,0.2);">
                                    ${card.badge || ''}
                                </div>
                                <h3 style="color:var(--text-dark); margin-bottom:15px; text-align:center; font-size:1.4rem;">${card.title || ''}</h3>
                                <div style="color:var(--text-light); font-size:0.95rem; line-height:1.6;">${(card.text || '').replace(/\n/g, '<br>')}</div>
                            </div>\n`;
                        } else if (cStyle === 'side-badge') {
                            html += `
                            <div style="width:${colWidth}; min-width:250px; background:${boxBg}; border-radius:8px; box-shadow:var(--shadow); display:flex; gap:15px; padding:20px; align-items:flex-start; border-left:4px solid ${themeColor};">
                                <div style="flex-shrink:0; min-width:45px; height:45px; padding:0 12px; box-sizing:border-box; white-space:nowrap; background:${themeColor}20; color:${themeColor}; border-radius:10px; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:1.4rem;">
                                    ${card.badge || ''}
                                </div>
                                <div>
                                    <h3 style="color:var(--text-dark); margin-bottom:10px; margin-top:0; font-size:1.3rem;">${card.title || ''}</h3>
                                    <div style="color:var(--text-light); font-size:0.95rem; line-height:1.6;">${(card.text || '').replace(/\n/g, '<br>')}</div>
                                </div>
                            </div>\n`;
                        } else if (cStyle === 'minimal') {
                            html += `
                            <div style="width:${colWidth}; min-width:250px; padding:15px; display:flex; flex-direction:column; gap:10px; background:${boxBg === 'var(--box-bg)' ? 'transparent' : boxBg}; border-radius:8px;">
                                <div style="color:${themeColor}; font-weight:900; font-size:2.5rem; opacity:0.8; line-height:1;">${card.badge || ''}</div>
                                <h3 style="color:var(--text-dark); margin:0; font-size:1.4rem; border-bottom:2px solid ${themeColor}40; padding-bottom:10px;">${card.title || ''}</h3>
                                <div style="color:var(--text-light); font-size:0.95rem; line-height:1.6;">${(card.text || '').replace(/\n/g, '<br>')}</div>
                            </div>\n`;
                        } else if (cStyle === 'glass') {
                            let glassBg = boxBg === 'var(--box-bg)' ? 'rgba(255, 255, 255, 0.1)' : boxBg;
                            html += `
                            <div style="width:${colWidth}; min-width:250px; background:${glassBg}; backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,0.2); border-radius:16px; box-shadow:0 8px 32px rgba(0,0,0,0.1); padding:25px; position:relative; overflow:hidden;">
                                <div style="position:absolute; top:-20px; right:-20px; width:100px; height:100px; background:${themeColor}; opacity:0.15; border-radius:50%; filter:blur(20px);"></div>
                                <div style="display:inline-block; padding:5px 12px; background:${themeColor}30; color:${themeColor}; border-radius:20px; font-weight:bold; font-size:0.9rem; margin-bottom:15px;">
                                    ${card.badge || ''}
                                </div>
                                <h3 style="color:var(--text-dark); margin-bottom:15px; margin-top:0; font-size:1.4rem; position:relative; z-index:2;">${card.title || ''}</h3>
                                <div style="color:var(--text-light); font-size:0.95rem; line-height:1.6; position:relative; z-index:2;">${(card.text || '').replace(/\n/g, '<br>')}</div>
                            </div>\n`;
                        }
                    });
                    html += `</div>\n`;
                } else if (b.type === 'flowchart' && b.text) {
                    const steps = b.text.split(',').map(s => s.trim()).filter(s => s);
                    const dir = b.direction === 'column' ? 'column' : 'row';
                    const arrow = dir === 'column' ? 'bi-arrow-down' : 'bi-arrow-right';
                    html += `<div class="custom-flowchart" style="flex-direction: ${dir};">\n`;
                    steps.forEach((step, i) => {
                        html += `<div class="flow-step">${step}</div>\n`;
                        if (i < steps.length - 1) html += `<div class="flow-arrow"><i class="bi ${arrow}"></i></div>\n`;
                    });
                    html += `</div>\n`;
                } else if (b.type === 'tree') {
                    if (b.nodes && b.nodes.length > 0) {
                        let dir = b.direction || 'TD';
                        let mSyntax = `graph ${dir}\n`;
                        let linkIndex = 0;
                        let linkStyles = [];
                        
                        b.nodes.forEach(n => {
                            let safeText = (n.text || 'Box').replace(/"/g, "'").replace(/[\[\]\(\)\{\}]/g, '');
                            let safeSub = (n.subtext || '').replace(/"/g, "'").replace(/[\[\]\(\)\{\}]/g, '').replace(/\n/g, '<br>');
                            
                            let htmlContent = `<div style="font-weight:700;">${safeText}</div>`;
                            if (safeSub) {
                                htmlContent += `<div style="font-weight:normal; font-size:0.85em; margin-top:5px; opacity:0.9;">${safeSub}</div>`;
                            }

                            // Wrap text in a div with generous padding to force a larger bounding box and prevent shape clipping
                            let align = n.align || 'center';
                            let pad = n.boxPadding !== undefined ? n.boxPadding : 12;
                            safeText = `<div style="padding: ${pad}px; text-align: ${align};">${htmlContent}</div>`;

                            let leftEdge = '[', rightEdge = ']';
                            if (n.shape === 'round') { leftEdge = '('; rightEdge = ')'; }
                            if (n.shape === 'stadium') { leftEdge = '(['; rightEdge = '])'; }
                            if (n.shape === 'cyl') { leftEdge = '[('; rightEdge = ')]'; }
                            if (n.shape === 'circle') { leftEdge = '(('; rightEdge = '))'; }
                            if (n.shape === 'rhombus') { leftEdge = '{'; rightEdge = '}'; }

                            mSyntax += `  N${n.id}${leftEdge}"${safeText}"${rightEdge}\n`;

                            let styleProps = [];
                            if (n.color) {
                                let hex = n.color;
                                let op = n.opacity !== undefined ? n.opacity : 100;
                                let alphaHex = Math.round((op / 100) * 255).toString(16).padStart(2, '0');
                                styleProps.push(`fill:${hex}${alphaHex}`);
                            }
                            if (n.fontSize && n.fontSize != 14) {
                                styleProps.push(`font-size:${n.fontSize}px`);
                            }
                            
                            styleProps.push(`font-family:Inter,sans-serif`);
                            styleProps.push(`font-weight:bold`);

                            if (styleProps.length > 0) {
                                let cName = `cls_N${n.id}`;
                                mSyntax += `  classDef ${cName} ${styleProps.join(',')}\n`;
                                mSyntax += `  class N${n.id} ${cName}\n`;
                            }

                            let parents = n.parents || [];
                            if (n.parent && !parents.includes(n.parent)) parents.push(n.parent);
                            parents.forEach(p => {
                                if (p) {
                                    let arrow = '-->';
                                    if (n.arrowStyle === 'dotted') arrow = '-.->';
                                    if (n.arrowStyle === 'thick') arrow = '==>';
                                    if (n.arrowStyle === 'none') arrow = '---';
                                    mSyntax += `  N${p} ${arrow} N${n.id}\n`;

                                    let baseStroke = 3;
                                    if (n.fontSize && n.fontSize > 14) {
                                        baseStroke = Math.round((3 + ((n.fontSize - 14) * 0.15)) * 10) / 10;
                                    }

                                    if (n.arrowColor || baseStroke !== 3) {
                                        let c = n.arrowColor || '#2a75d3';
                                        linkStyles.push(`linkStyle ${linkIndex} stroke:${c},color:${c},stroke-width:${baseStroke}px;`);
                                    }
                                    linkIndex++;
                                }
                            });
                        });
                        
                        if (linkStyles.length > 0) {
                            mSyntax += `  ${linkStyles.join('\n  ')}\n`;
                        }
                        
                        html += `<div style="display:flex; justify-content:center; margin:30px 0; width:100%; overflow-x: auto;"><div class="mermaid">\n${mSyntax}\n</div></div>\n`;
                    }
                } else if (b.type === 'embed' && b.text) {
                    html += `<div class="custom-embed-block" style="margin:30px 0; display:flex; justify-content:center; overflow:hidden; border-radius:12px; box-shadow:var(--shadow);">\n${b.text}\n</div>\n`;
                } else if (b.type === 'html') {
                    html += `<div class="custom-html-block">\n${b.text}\n</div>\n`;
                } else if (b.type === 'link') {
                    let linkHref = b.url || '#';
                    let linkText = b.text || 'Click Here';
                    let linkStyle = b.style || 'primary';
                    let linkAlign = b.align || 'center';
                    let btnCss = '';
                    if (linkStyle === 'primary') {
                        btnCss = 'display:inline-block; padding:12px 24px; background:var(--primary); color:white; border-radius:8px; text-decoration:none; font-weight:bold; box-shadow:0 4px 6px rgba(0,0,0,0.1); transition:0.3s;';
                    } else if (linkStyle === 'outline') {
                        btnCss = 'display:inline-block; padding:12px 24px; background:transparent; color:var(--primary); border:2px solid var(--primary); border-radius:8px; text-decoration:none; font-weight:bold; transition:0.3s;';
                    } else {
                        btnCss = 'color:var(--primary); text-decoration:underline; font-weight:bold;';
                    }
                    html += `<div style="text-align:${linkAlign}; margin:20px 0;"><a href="${linkHref}" style="${btnCss}">${linkText}</a></div>\n`;
                } else if (b.type === 'divider') {
                    let h = b.height || 30;
                    let style = b.style || 'blank';
                    let color = b.color || '#e0e0e0';
                    let divCss = `margin: ${h}px 0; width: 100%;`;
                    if (style === 'solid') {
                        divCss += `border-top: 1px solid ${color};`;
                    } else if (style === 'dashed') {
                        divCss += `border-top: 1px dashed ${color};`;
                    } else if (style === 'filled') {
                        divCss = `margin: ${h/2}px 0; width: 100%; background-color: ${color}; height: ${h}px; border-radius: 8px;`;
                    }
                    html += `<div style="${divCss}"></div>\n`;
                } else if (b.type === 'grid' && b.images && b.images.length > 0) {
                    const cols = b.columns || '3';
                    html += `<div style="display:flex; justify-content:center;"><div class="custom-grid" style="grid-template-columns: repeat(${cols}, 1fr); ${widthCss} max-width:100%;">\n`;
                    b.images.forEach(img => {
                        html += `<img src="${img}" ${clickAttr} style="width:100%; border-radius:${br}; ${extraImgCss} object-fit:cover; aspect-ratio: 1/1; box-shadow: var(--shadow);">\n`;
                    });
                    html += `</div></div>\n`;
                } else if (b.type === 'carousel' && b.images && b.images.length > 0) {
                    html += `<div style="display:flex; justify-content:center;"><div class="custom-carousel" style="${widthCss} max-width:100%;">\n`;
                    b.images.forEach(img => {
                        html += `<img src="${img}" ${clickAttr} style="border-radius:${br}; ${extraImgCss}">\n`;
                    });
                    html += `</div></div>\n`;
                }
                html += `</div>\n`; // Close custom-block-wrapper
            });
            return html;
        }

        function updatePageDisplayModeOptions(currentEditingId) {
            if (!elsPage.modeInput) return;
            let optionsHtml = `
                <option value="separate">Separate Page (Opens cleanly by itself)</option>
                <option value="section">Home Page Section (Scrollable on Main Page)</option>
            `;
            
            if (currentData.customPages) {
                currentData.customPages.forEach(p => {
                    // Include any separate page as a valid "parent" main page (except itself)
                    if (p.id !== currentEditingId && p.displayMode === 'separate') {
                        optionsHtml += `<option value="parent_${p.id}">Section of Page: ${p.title}</option>`;
                    }
                });
            }
            elsPage.modeInput.innerHTML = optionsHtml;
        }

        function openPageEditor(id) {
            const page = currentData.customPages.find(p => p.id === id);
            if (!page) return;
            editingPageId = id;
            elsPage.titleInput.value = page.title;
            elsPage.navInput.checked = page.showInNav;
            updatePageDisplayModeOptions(id);
            if (elsPage.modeInput) elsPage.modeInput.value = page.displayMode || 'separate';
            if (elsPage.bgColorInput) elsPage.bgColorInput.value = page.bgColor || '#ffffff';
            if (elsPage.bgOpacityInput) elsPage.bgOpacityInput.value = page.bgOpacity !== undefined ? page.bgOpacity : 100;

            // Load blocks if they exist, else try to initialize empty
            editingBlocks = page.blocks ? JSON.parse(JSON.stringify(page.blocks)) : [];

            elsPage.editorTitle.textContent = `Edit Page: ${page.title}`;
            elsPage.editor.style.display = 'block';
            renderBlocksList();
        }

        if (elsPage.btnAdd) {
            elsPage.btnAdd.addEventListener('click', () => {
                editingPageId = 'page_' + Date.now();
                elsPage.titleInput.value = "New Custom Page";
                elsPage.navInput.checked = true;
                updatePageDisplayModeOptions(editingPageId);
                if (elsPage.modeInput) elsPage.modeInput.value = 'separate';
                editingBlocks = [];
                elsPage.editorTitle.textContent = `Create New Page`;
                elsPage.editor.style.display = 'block';
                renderBlocksList();
            });

            elsPage.btnSave.addEventListener('click', () => {
                let page = currentData.customPages.find(p => p.id === editingPageId);
                if (!page) {
                    page = { id: editingPageId };
                    currentData.customPages.push(page);
                }
                page.title = elsPage.titleInput.value;
                page.showInNav = elsPage.navInput.checked;
                page.displayMode = elsPage.modeInput ? elsPage.modeInput.value : 'separate';
                if (elsPage.bgColorInput) {
                    if (elsPage.bgColorInput.dataset.cleared === 'true') {
                        delete page.bgColor;
                        delete page.bgOpacity;
                    } else {
                        page.bgColor = elsPage.bgColorInput.value;
                        if (elsPage.bgOpacityInput) page.bgOpacity = parseInt(elsPage.bgOpacityInput.value);
                    }
                }
                page.blocks = JSON.parse(JSON.stringify(editingBlocks)); // Save structured blocks
                page.content = compileBlocksToHTML(); // Save rendered HTML for app.js

                // Adjust Layout array for "Home Page Section" mode
                if (page.displayMode === 'section') {
                    if (!currentData.layout.includes(page.id)) {
                        currentData.layout.push(page.id);
                    }
                } else {
                    currentData.layout = currentData.layout.filter(id => id !== page.id);
                }

                // Sync with navLinks
                let navUrl = page.displayMode === 'section' ? '#' + page.id : '#page-' + page.id;
                let existingNavLinkIndex = currentData.header.navLinks.findIndex(link => link.href.includes(page.id));
                
                if (page.showInNav) {
                    if (existingNavLinkIndex === -1) {
                        currentData.header.navLinks.push({ text: page.title, href: navUrl });
                    } else {
                        currentData.header.navLinks[existingNavLinkIndex].text = page.title;
                        currentData.header.navLinks[existingNavLinkIndex].href = navUrl;
                    }
                } else {
                    if (existingNavLinkIndex !== -1) {
                        currentData.header.navLinks.splice(existingNavLinkIndex, 1);
                    }
                }

                elsPage.editor.style.display = 'none';
                renderPagesList();
                renderDraggableList(); // Refresh Layout tab just in case
                if (typeof renderNavDraggableList === 'function') renderNavDraggableList(); // Refresh Navigation Manager
                saveToLocal();
            });

            elsPage.btnDelete.addEventListener('click', () => {
                if (confirm("Are you sure you want to delete this page/section?")) {
                    currentData.customPages = currentData.customPages.filter(p => p.id !== editingPageId);
                    currentData.layout = currentData.layout.filter(id => id !== editingPageId);
                    
                    let existingNavLinkIndex = currentData.header.navLinks.findIndex(link => link.href.includes(editingPageId));
                    if (existingNavLinkIndex !== -1) {
                        currentData.header.navLinks.splice(existingNavLinkIndex, 1);
                    }
                    
                    elsPage.editor.style.display = 'none';
                    renderPagesList();
                    renderDraggableList();
                    if (typeof renderNavDraggableList === 'function') renderNavDraggableList();
                    saveToLocal();
                }
            });

            if (elsPage.btnResetColor) {
                elsPage.btnResetColor.addEventListener('click', () => {
                    if (elsPage.bgColorInput) {
                        elsPage.bgColorInput.dataset.cleared = 'true';
                        elsPage.bgColorInput.value = "#ffffff";
                    }
                    if (elsPage.bgOpacityInput) elsPage.bgOpacityInput.value = "100";
                });
            }

            renderPagesList();
        }
        // --------------------------
        // Video Embed Helper
        // --------------------------
        function getEmbedUrl(url) {
            if (!url) return "";
            try {
                if (url.includes("youtube.com/embed/")) return url;
                if (url.includes("youtu.be/")) {
                    const parts = url.split("youtu.be/");
                    const id = parts[1] ? parts[1].split("?")[0] : null;
                    if (id) return "https://www.youtube.com/embed/" + id;
                }
                if (url.includes("youtube.com/watch")) {
                    const urlObj = new URL(url);
                    const id = urlObj.searchParams.get("v");
                    if (id) return "https://www.youtube.com/embed/" + id;
                }
                return url;
            } catch (e) {
                return url;
            }
        }

        if (els.btnUndo) els.btnUndo.addEventListener('click', window.undo);
        if (els.btnRedo) els.btnRedo.addEventListener('click', window.redo);

        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'z') { e.preventDefault(); window.undo(); }
            if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'Z')) { e.preventDefault(); window.redo(); }
        });

        // Undo / Redo Logic
        let undoTimeout = null;
        let lastStateStr = JSON.stringify(currentData);

        function saveStateToUndo() {
            if (isUndoRedo) return;
            clearTimeout(undoTimeout);
            undoTimeout = setTimeout(() => {
                const newStateStr = JSON.stringify(currentData);
                if (newStateStr !== lastStateStr) {
                    undoStack.push(lastStateStr);
                    lastStateStr = newStateStr;
                    if (undoStack.length > 50) undoStack.shift();
                    redoStack = [];
                }
            }, 500);
        }

        window.undo = function() {
            if (undoStack.length > 0) {
                isUndoRedo = true;
                redoStack.push(lastStateStr);
                const previousState = undoStack.pop();
                currentData = JSON.parse(previousState);
                lastStateStr = previousState;
                
                window.populateData();
                renderGalleryList();
                renderProjectFeatures();
                renderDevStepsList();
                renderDraggableList();
                if (typeof window.renderPagesList === 'function') window.renderPagesList();
                if (typeof window.renderBlocksList === 'function') window.renderBlocksList();
                saveToLocal();
                isUndoRedo = false;
            }
        };

        window.redo = function() {
            if (redoStack.length > 0) {
                isUndoRedo = true;
                undoStack.push(lastStateStr);
                const nextState = redoStack.pop();
                currentData = JSON.parse(nextState);
                lastStateStr = nextState;
                
                window.populateData();
                renderGalleryList();
                renderProjectFeatures();
                renderDevStepsList();
                renderDraggableList();
                if (typeof window.renderPagesList === 'function') window.renderPagesList();
                if (typeof window.renderBlocksList === 'function') window.renderBlocksList();
                saveToLocal();
                isUndoRedo = false;
            }
        };

        // 7. Save changes to local memory
        function saveToLocal() {
            saveStateToUndo();
            if (els.siteTitle) currentData.header.siteTitle = els.siteTitle.value;
            if (els.siteFavicon) currentData.header.favicon = els.siteFavicon.value;
            if (els.headerLogo) currentData.header.logoText = els.headerLogo.value;
            if (els.themeUseCustom) currentData.theme.useCustom = els.themeUseCustom.checked;
            if (els.themeNavBg) currentData.theme.navBgColor = els.themeNavBg.value;
            if (els.themeNavBgOpacity) currentData.theme.navBgOpacity = parseInt(els.themeNavBgOpacity.value);
            
            if (els.themePrimary) currentData.theme.primaryColor = els.themePrimary.value;
            if (els.themePrimaryOpacity) currentData.theme.primaryOpacity = parseInt(els.themePrimaryOpacity.value);
            
            if (els.themePageBg) currentData.theme.pageBgColor = els.themePageBg.value;
            if (els.themePageBgOpacity) currentData.theme.pageBgOpacity = parseInt(els.themePageBgOpacity.value);
            
            if (els.themeBg) currentData.theme.bgColor = els.themeBg.value;
            if (els.themeBgOpacity) currentData.theme.bgOpacity = parseInt(els.themeBgOpacity.value);
            
            if (els.themeBtnBg) currentData.theme.btnBgColor = els.themeBtnBg.value;
            if (els.themeBtnOpacity) currentData.theme.btnOpacity = parseInt(els.themeBtnOpacity.value);
            if (els.themeBtnText) currentData.theme.btnTextColor = els.themeBtnText.value;
            
            if (els.themeText) currentData.theme.textColor = els.themeText.value;
            if (els.themeTextOpacity) currentData.theme.textOpacity = parseInt(els.themeTextOpacity.value);
            
            if (els.themeBoxBg) currentData.theme.boxBgColor = els.themeBoxBg.value;
            if (els.themeBoxOpacity) currentData.theme.boxOpacity = parseInt(els.themeBoxOpacity.value);
            if (els.themeFontsize) currentData.theme.baseFontSize = els.themeFontsize.value;
            
            if (els.themeDarkPageBg) currentData.theme.darkPageBgColor = els.themeDarkPageBg.value;
            if (els.themeDarkPageBgOpacity) currentData.theme.darkPageBgOpacity = parseInt(els.themeDarkPageBgOpacity.value);
            
            if (els.themeDarkBg) currentData.theme.darkBgColor = els.themeDarkBg.value;
            if (els.themeDarkBgOpacity) currentData.theme.darkBgOpacity = parseInt(els.themeDarkBgOpacity.value);
            
            if (els.themeDarkText) currentData.theme.darkTextColor = els.themeDarkText.value;
            if (els.themeDarkTextOpacity) currentData.theme.darkTextOpacity = parseInt(els.themeDarkTextOpacity.value);
            
            if (els.themeDarkBox) currentData.theme.darkBoxBgColor = els.themeDarkBox.value;
            if (els.themeDarkBoxOpacity) currentData.theme.darkBoxOpacity = parseInt(els.themeDarkBoxOpacity.value);
            
            if (els.themeDarkNav) currentData.theme.darkNavBgColor = els.themeDarkNav.value;
            if (els.themeDarkNavOpacity) currentData.theme.darkNavOpacity = parseInt(els.themeDarkNavOpacity.value);

            if (els.themeDarkBtnBg) currentData.theme.darkBtnBgColor = els.themeDarkBtnBg.value;
            if (els.themeDarkBtnOpacity) currentData.theme.darkBtnOpacity = parseInt(els.themeDarkBtnOpacity.value);
            if (els.themeDarkBtnText) currentData.theme.darkBtnTextColor = els.themeDarkBtnText.value;

            // Animations
            if (els.animStyle) currentData.animations.style = els.animStyle.value;
            if (els.animDuration) currentData.animations.duration = els.animDuration.value;

            sectionsToStyle.forEach(sec => {
                if (!currentData[sec]) currentData[sec] = {};
                if (!currentData[sec].styling) currentData[sec].styling = {};
                const styles = elsSectionStyles[sec];
                if (styles) {
                    if (styles.bgColor) {
                        if (styles.bgColor.dataset.cleared === 'true') {
                            delete currentData[sec].styling.bgColor;
                            delete currentData[sec].styling.bgOpacity;
                        } else {
                            currentData[sec].styling.bgColor = styles.bgColor.value;
                            if (styles.bgOpacity) currentData[sec].styling.bgOpacity = parseInt(styles.bgOpacity.value);
                        }
                    }
                    if (styles.boxColor) {
                        if (styles.boxColor.dataset.cleared === 'true') {
                            delete currentData[sec].styling.boxColor;
                            delete currentData[sec].styling.boxOpacity;
                        } else {
                            currentData[sec].styling.boxColor = styles.boxColor.value;
                            if (styles.boxOpacity) currentData[sec].styling.boxOpacity = parseInt(styles.boxOpacity.value);
                        }
                    }
                }
            });

            // Content
            currentData.hero.title = els.heroTitle.value;
            currentData.hero.subtitle = quillHero.root.innerHTML;
            if (els.heroBtnText) currentData.hero.buttonText = els.heroBtnText.value;
            
            if (els.teamSectionTitle) currentData.team.sectionTitle = els.teamSectionTitle.value;
            currentData.team.members[0].name = els.teamName.value;
            currentData.team.members[0].role = els.teamRole.value;
            currentData.team.members[0].bio = quillTeam.root.innerHTML;
            
            if (els.projectSectionTitle) currentData.project.sectionTitle = els.projectSectionTitle.value;
            currentData.project.description = quillProject.root.innerHTML;
            
            if (els.devSectionTitle) currentData.development.sectionTitle = els.devSectionTitle.value;

            if (els.feedbackTitle) currentData.feedback.title = els.feedbackTitle.value;
            if (els.feedbackDesc) currentData.feedback.description = els.feedbackDesc.value;

            ['name', 'age', 'phone', 'email', 'msg'].forEach(k => {
                const elC = document.getElementById(`fb-opt-${k}-child`);
                const elA = document.getElementById(`fb-opt-${k}-adult`);
                const elN = document.getElementById(`fb-opt-${k}-none`);
                const elR = document.getElementById(`fb-opt-${k}-req`);
                if (elC) {
                    currentData.feedback.fields[k] = {
                        showChild: elC.checked,
                        showAdult: elA.checked,
                        showNone: elN.checked,
                        req: elR.checked
                    };
                }
            });
            if (els.fbOptCatShow) {
                currentData.feedback.fields.cat = {
                    show: els.fbOptCatShow.checked,
                    req: els.fbOptCatReq.checked,
                    label1: els.fbCatLabel1 ? els.fbCatLabel1.value : "",
                    label2: els.fbCatLabel2 ? els.fbCatLabel2.value : "",
                    label3: els.fbCatLabel3 ? els.fbCatLabel3.value : "",
                    customOptions: els.fbCatCustom ? els.fbCatCustom.value : ""
                };
            }

            if (els.mediaSectionTitle) currentData.media.sectionTitle = els.mediaSectionTitle.value;
            const originalUrl = els.mediaVideo.value;
            const embedUrl = getEmbedUrl(originalUrl);
            currentData.media.videoUrl = embedUrl;
            if (originalUrl !== embedUrl) els.mediaVideo.value = embedUrl;

            currentData.media.codeLink = els.mediaCode.value;

            // Footer
            if (!currentData.footer) currentData.footer = {};
            if (els.footerAboutTitle) currentData.footer.aboutTitle = els.footerAboutTitle.value;
            if (els.footerAboutText) currentData.footer.aboutText = els.footerAboutText.value;
            if (els.footerContactTitle) currentData.footer.contactTitle = els.footerContactTitle.value;
            if (els.footerEmail) currentData.footer.email = els.footerEmail.value;
            if (els.footerPhone) currentData.footer.phone = els.footerPhone.value;
            if (els.footerCopyright) currentData.footer.copyright = els.footerCopyright.value;

            try {
                localStorage.setItem('pulseGuardData', JSON.stringify(currentData));
            } catch (e) {
                console.error("Save Error:", e);
                alert("Storage Limit Exceeded: You have added too many pictures or elements to the local preview storage. Please delete some pictures to free up space, or Save & Download the current file.");
            }
        }

        // Add listeners to ALL inputs
        const inputs = [
            els.siteTitle, els.siteFavicon, els.headerLogo, 
            els.themeNavBg, els.themeNavBgOpacity, els.themeNavBgOpacityVal,
            els.themePrimary, els.themePrimaryOpacity, els.themePrimaryOpacityVal,
            els.themePageBg, els.themePageBgOpacity, els.themePageBgOpacityVal,
            els.themeBg, els.themeBgOpacity, els.themeBgOpacityVal,
            els.themeBtnBg, els.themeBtnOpacity, els.themeBtnOpacityVal,
            els.themeBtnText,
            els.themeText, els.themeTextOpacity, els.themeTextOpacityVal,
            els.themeBoxBg, els.themeBoxOpacity, els.themeBoxOpacityVal, els.themeFontsize,
            els.themeDarkPageBg, els.themeDarkPageBgOpacity, els.themeDarkPageBgOpacityVal,
            els.themeDarkBg, els.themeDarkBgOpacity, els.themeDarkBgOpacityVal,
            els.themeDarkBtnBg, els.themeDarkBtnOpacity, els.themeDarkBtnOpacityVal,
            els.themeDarkBtnText,
            els.themeDarkText, els.themeDarkTextOpacity, els.themeDarkTextOpacityVal,
            els.themeDarkBox, els.themeDarkBoxOpacity, els.themeDarkBoxOpacityVal,
            els.themeDarkNav, els.themeDarkNavOpacity, els.themeDarkNavOpacityVal,
            els.animStyle, els.animDuration,
            els.heroTitle, els.heroBtnText, els.teamName, els.teamRole,
            els.teamSectionTitle, els.projectSectionTitle, els.mediaSectionTitle,
            els.devSectionTitle,
            els.mediaVideo, els.mediaCode,
            els.feedbackTitle, els.feedbackDesc,
            els.fbOptCatShow, els.fbOptCatReq,
            els.fbCatLabel1, els.fbCatLabel2, els.fbCatLabel3, els.fbCatCustom,
            els.footerAboutTitle, els.footerAboutText, els.footerContactTitle,
            els.footerEmail, els.footerPhone, els.footerCopyright
        ];
        
        // Sync sliders with number inputs
        const opacityPairs = [
            [els.themeNavBgOpacity, els.themeNavBgOpacityVal],
            [els.themePrimaryOpacity, els.themePrimaryOpacityVal],
            [els.themePageBgOpacity, els.themePageBgOpacityVal],
            [els.themeBgOpacity, els.themeBgOpacityVal],
            [els.themeBtnOpacity, els.themeBtnOpacityVal],
            [els.themeTextOpacity, els.themeTextOpacityVal],
            [els.themeBoxOpacity, els.themeBoxOpacityVal],
            [els.themeDarkPageBgOpacity, els.themeDarkPageBgOpacityVal],
            [els.themeDarkBgOpacity, els.themeDarkBgOpacityVal],
            [els.themeDarkBtnOpacity, els.themeDarkBtnOpacityVal],
            [els.themeDarkTextOpacity, els.themeDarkTextOpacityVal],
            [els.themeDarkBoxOpacity, els.themeDarkBoxOpacityVal],
            [els.themeDarkNavOpacity, els.themeDarkNavOpacityVal]
        ];
        opacityPairs.forEach(pair => {
            if (pair[0] && pair[1]) {
                pair[0].addEventListener('input', () => { pair[1].value = pair[0].value; });
                pair[1].addEventListener('input', () => { pair[0].value = pair[1].value; });
            }
        });
        ['name', 'age', 'phone', 'email', 'msg'].forEach(k => {
            inputs.push(document.getElementById(`fb-opt-${k}-child`));
            inputs.push(document.getElementById(`fb-opt-${k}-adult`));
            inputs.push(document.getElementById(`fb-opt-${k}-none`));
            inputs.push(document.getElementById(`fb-opt-${k}-req`));
        });
        inputs.forEach(input => {
            if (input) input.addEventListener('input', saveToLocal);
        });

        // 8. Buttons
        document.getElementById('btn-preview').addEventListener('click', () => {
            saveToLocal();
            window.open('index.html?preview=true', '_blank');
        });

        document.getElementById('btn-save').addEventListener('click', () => {
            saveToLocal();
            const fileContent = `const websiteData = ${JSON.stringify(currentData, null, 4)};`;
            const blob = new Blob([fileContent], { type: 'text/javascript' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'admin.js';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            alert("Your data has been saved!\n\nA file named 'admin.js' is downloading.\nTo permanently save changes, replace the existing 'admin.js' in your folder with this new downloaded file.");
        });

        // Undo & Redo Bindings
        if (els.btnUndo) els.btnUndo.addEventListener('click', window.undo);
        if (els.btnRedo) els.btnRedo.addEventListener('click', window.redo);

        // Admin Backup System
        document.getElementById('btn-export-backup').addEventListener('click', () => {
            saveToLocal();
            const fileContent = JSON.stringify(currentData, null, 4);
            const blob = new Blob([fileContent], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'admin-backup.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });

        const importFileInput = document.getElementById('import-backup-file');
        
        document.getElementById('btn-import-backup').addEventListener('click', () => {
            importFileInput.click();
        });

        importFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const newData = JSON.parse(event.target.result);
                    if (newData && typeof newData === 'object') {
                        currentData = newData;
                        try {
                            localStorage.setItem('pulseGuardData', JSON.stringify(currentData));
                            alert('Backup loaded successfully! The page will now reload to apply the changes.');
                            window.location.reload();
                        } catch (e) {
                            alert("Storage Limit Exceeded when trying to save loaded backup data.");
                        }
                    }
                } catch (err) {
                    alert('Invalid JSON format. Please ensure you selected a valid admin-backup.json file.\\n\\nError: ' + err.message);
                }
            };
            reader.readAsText(file);
            e.target.value = ''; // Reset input
        });
    } catch (err) {
        console.error(err);
        alert('CRITICAL ERROR in admin-ui.js: ' + err.message + '\n' + err.stack);
    }
})();
