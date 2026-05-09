document.addEventListener('DOMContentLoaded', () => {
    // Check if there's local data from the admin page
    let data = typeof websiteData !== 'undefined' ? websiteData : {};
    
    // Only load from LocalStorage if we clicked "Preview" in the Admin Panel
    if (window.location.search.includes('preview=true')) {
        const localData = localStorage.getItem('pulseGuardData');
        if (localData) {
            try {
                data = JSON.parse(localData);
            } catch (e) {
                console.error("Error parsing local data", e);
            }
        }
    }

    // Apply Theme if available
    function applyTheme() {
        if (!data.theme) return;
        const root = document.documentElement;
        const isDark = document.body.classList.contains('dark-theme');
        
        let pColor = data.theme.primaryColor;
        if (data.theme.primaryOpacity !== undefined && data.theme.primaryOpacity < 100) {
            let alpha = Math.round((data.theme.primaryOpacity / 100) * 255).toString(16).padStart(2, '0');
            pColor += alpha;
        }
        if (pColor) root.style.setProperty('--primary', pColor);

        if (data.theme.useCustom) {
            let tColor = isDark && data.theme.darkTextColor ? data.theme.darkTextColor : data.theme.textColor;
            let tOp = isDark ? data.theme.darkTextOpacity : data.theme.textOpacity;
            if (tOp !== undefined && tOp < 100) {
                let alpha = Math.round((tOp / 100) * 255).toString(16).padStart(2, '0');
                tColor += alpha;
            }

            let bColor = isDark && data.theme.darkBgColor ? data.theme.darkBgColor : data.theme.bgColor;
            let bOp = isDark ? data.theme.darkBgOpacity : data.theme.bgOpacity;
            if (bOp !== undefined && bOp < 100) {
                let alpha = Math.round((bOp / 100) * 255).toString(16).padStart(2, '0');
                bColor += alpha;
            }

            let bxColor = isDark && data.theme.darkBoxBgColor ? data.theme.darkBoxBgColor : data.theme.boxBgColor;
            let bxOp = isDark ? data.theme.darkBoxOpacity : data.theme.boxOpacity;
            if (bxOp !== undefined && bxOp < 100) {
                let alpha = Math.round((bxOp / 100) * 255).toString(16).padStart(2, '0');
                bxColor += alpha;
            }

            let nColor = isDark && data.theme.darkNavBgColor ? data.theme.darkNavBgColor : data.theme.navBgColor;
            let nOp = isDark ? data.theme.darkNavOpacity : data.theme.navBgOpacity;
            if (nOp !== undefined && nOp < 100) {
                let alpha = Math.round((nOp / 100) * 255).toString(16).padStart(2, '0');
                nColor += alpha;
            }

            let baseBtnBg = isDark && data.theme.darkBtnBgColor ? data.theme.darkBtnBgColor : data.theme.btnBgColor;
            let btnBg = baseBtnBg || pColor; // fallback to primary
            let btnOp = isDark && data.theme.darkBtnOpacity !== undefined ? data.theme.darkBtnOpacity : data.theme.btnOpacity;
            if (btnOp !== undefined && btnOp < 100) {
                let alpha = Math.round((btnOp / 100) * 255).toString(16).padStart(2, '0');
                btnBg += alpha;
            }
            let btnText = (isDark && data.theme.darkBtnTextColor ? data.theme.darkBtnTextColor : data.theme.btnTextColor) || '#ffffff';

            if (btnBg) root.style.setProperty('--btn-bg', btnBg);
            if (btnText) root.style.setProperty('--btn-text', btnText);

            if (tColor) {
                root.style.setProperty('--text-dark', tColor);
                root.style.setProperty('--text-light', isDark ? '#94a3b8' : '#6c7a89');
            }
            if (bColor) root.style.setProperty('--bg-light', bColor);
            
            let pageBg = isDark && data.theme.darkPageBgColor ? data.theme.darkPageBgColor : data.theme.pageBgColor;
            pageBg = pageBg || (isDark ? '#0f172a' : '#fff5f5');
            let pageOp = isDark && data.theme.darkPageBgOpacity !== undefined ? data.theme.darkPageBgOpacity : data.theme.pageBgOpacity;
            if (pageOp !== undefined && pageOp < 100) {
                let alpha = Math.round((pageOp / 100) * 255).toString(16).padStart(2, '0');
                pageBg += alpha;
            }
            document.body.style.backgroundColor = pageBg;
            
            if (nColor) {
                const nav = document.getElementById('navbar');
                if(nav) nav.style.background = nColor;
            }
            if (bxColor) root.style.setProperty('--box-bg', bxColor);
        } else {
            // Revert to CSS defaults for light/dark mode
            root.style.removeProperty('--btn-bg');
            root.style.removeProperty('--btn-text');
            root.style.removeProperty('--text-dark');
            root.style.removeProperty('--text-light');
            root.style.removeProperty('--bg-light');
            root.style.removeProperty('--box-bg');
            document.body.style.backgroundColor = '';
            const nav = document.getElementById('navbar');
            if(nav) nav.style.background = '';
        }

        // Section Overrides
        const sectionsToStyle = ['project', 'development', 'media', 'feedback', 'footer'];
        sectionsToStyle.forEach(sec => {
            if (data[sec] && data[sec].styling) {
                const domId = sec === 'media' ? 'gallery' : sec;
                const el = document.getElementById(domId);
                if (el) {
                    if (data[sec].styling.bgColor) {
                        let secBg = data[sec].styling.bgColor;
                        if (data[sec].styling.bgOpacity !== undefined && data[sec].styling.bgOpacity < 100) {
                            let a = Math.round((data[sec].styling.bgOpacity / 100) * 255).toString(16).padStart(2, '0');
                            secBg += a;
                        }
                        el.style.setProperty('--bg-light', secBg);
                        el.style.backgroundColor = secBg;
                    } else {
                        el.style.removeProperty('--bg-light');
                        el.style.backgroundColor = '';
                    }

                    if (data[sec].styling.boxColor) {
                        let secBox = data[sec].styling.boxColor;
                        if (data[sec].styling.boxOpacity !== undefined && data[sec].styling.boxOpacity < 100) {
                            let a = Math.round((data[sec].styling.boxOpacity / 100) * 255).toString(16).padStart(2, '0');
                            secBox += a;
                        }
                        el.style.setProperty('--box-bg', secBox);
                    } else {
                        el.style.removeProperty('--box-bg');
                    }
                }
            }
        });
        
        const toggleIcon = document.getElementById('theme-toggle-icon');
        if(toggleIcon) {
            toggleIcon.className = isDark ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill';
            if (data.theme.useCustom) {
                let tColor = isDark && data.theme.darkTextColor ? data.theme.darkTextColor : data.theme.textColor;
                toggleIcon.style.color = tColor;
            } else {
                toggleIcon.style.color = '';
            }
        }
    }
    
    if (localStorage.getItem('website-dark-mode') === 'true') {
        document.body.classList.add('dark-theme');
    }
    applyTheme();
    
    window.toggleWebsiteTheme = function() {
        document.body.classList.toggle('dark-theme');
        localStorage.setItem('website-dark-mode', document.body.classList.contains('dark-theme'));
        applyTheme();
    };

    // Apply Layout Reordering & Custom Sections
    if (data.layout && data.layout.length > 0) {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            data.layout = data.layout.filter(id => id != null);
            data.layout.forEach((sectionId, index) => {
                let section = document.getElementById(sectionId);
                
                // Check visibility
                let visKey = sectionId;
                if (sectionId === 'home') visKey = 'hero';
                if (data.visibility && data.visibility[visKey] === false) {
                    if (section) section.style.display = 'none';
                    return; // skip further processing
                }
                
                // Create custom section container if it is missing
                if (!section && sectionId.startsWith('page_')) {
                    section = document.createElement('section');
                    section.id = sectionId;
                    section.className = 'container';
                    section.style.padding = '4rem 2rem';
                    mainContent.appendChild(section);
                }

                if (section) {
                    section.style.display = ''; // ensure visible
                    section.style.order = index;
                    if(sectionId.startsWith('page_')) {
                        const pData = (data.customPages || []).find(p => p.id === sectionId);
                        if (pData) {
                            let customStyles = '';
                            if (pData.bgColor && pData.bgColor !== '#ffffff') {
                                let hex = pData.bgColor;
                                if (pData.bgOpacity !== undefined && pData.bgOpacity < 100) {
                                    hex += Math.round((pData.bgOpacity / 100) * 255).toString(16).padStart(2, '0');
                                }
                                customStyles += `background-color: ${hex}; `;
                            }
                            section.innerHTML = `
                                <h2 class="section-title text-center">${pData.title}</h2>
                                <div class="custom-content" style="${customStyles}">${pData.content}</div>
                            `;
                        }
                    } else {
                        mainContent.appendChild(section);
                    }
                }
            });
            mainContent.style.display = 'flex';
            mainContent.style.flexDirection = 'column';
            
            setTimeout(applyUX, 100);
        }
    }

    // Header & Navigation
    if (data.header) {
        if (data.header.siteTitle) document.title = data.header.siteTitle;
        if (data.header.favicon) {
            let link = document.querySelector("link[rel~='icon']");
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.head.appendChild(link);
            }
            link.href = data.header.favicon;
        }
        if (document.getElementById('logo') && data.header.logoText) {
            document.getElementById('logo').textContent = data.header.logoText;
        }
    }

    const navUl = document.getElementById('nav-links');
    if (navUl && data.header) {
        navUl.innerHTML = '';
        (data.header.navLinks || []).forEach(link => {
            if (link.text && link.text.trim() !== '') {
                const li = document.createElement('li');
                let href = link.href;
                if (href.startsWith('page.html?id=')) {
                    href = href.replace('page.html?id=', '#page-');
                }
                li.innerHTML = `<a href="${href}">${link.text}</a>`;
                navUl.appendChild(li);
            }
        });
    }

    // Hero
    const heroSection = document.getElementById('home');
    if (heroSection && data.hero) {
        if(data.hero.backgroundImage) heroSection.style.backgroundImage = `url('${data.hero.backgroundImage}')`;
        const titleEl = document.getElementById('hero-title');
        if(titleEl) titleEl.textContent = data.hero.title || "";
        const subEl = document.getElementById('hero-subtitle');
        if(subEl) subEl.innerHTML = data.hero.subtitle || "";
        const btnEl = document.getElementById('hero-btn');
        if (btnEl) btnEl.textContent = data.hero.buttonText || "Discover";
    }

    // Team
    if (document.getElementById('team-title') && data.team) {
        document.getElementById('team-title').textContent = data.team.sectionTitle || "";
        const teamGrid = document.getElementById('team-members');
        if(teamGrid) {
            teamGrid.innerHTML = '';
            (data.team.members || []).forEach(member => {
                const card = document.createElement('div');
                card.className = 'team-card';
                card.innerHTML = `
                    <img src="${member.image || ''}" alt="${member.name || ''}" class="team-img">
                    <h3>${member.name || ''}</h3>
                    <p class="team-role">${member.role || ''}</p>
                    <p>${member.bio || ''}</p>
                `;
                teamGrid.appendChild(card);
            });
        }
    }

    // Project
    if (document.getElementById('project-title') && data.project) {
        document.getElementById('project-title').textContent = data.project.sectionTitle || "";
        const descEl = document.getElementById('project-desc');
        if(descEl) descEl.innerHTML = data.project.description || "";
        
        const featureGrid = document.getElementById('project-features');
        if(featureGrid) {
            featureGrid.innerHTML = '';
            (data.project.features || []).forEach(feature => {
                const card = document.createElement('div');
                card.className = 'feature-card';
                let iconClass = feature.icon || 'bi bi-star';
                const match = iconClass.match(/class=["'](.*?)["']/);
                if (match) {
                    iconClass = match[1];
                } else {
                    iconClass = iconClass.replace(/<\/?[^>]+(>|$)/g, "").trim();
                }
                if (iconClass.startsWith('bi-')) iconClass = 'bi ' + iconClass;
                let customStyles = '';
                if (feature.useCustomStyle) {
                    if (feature.bgColor) {
                        let hex = feature.bgColor;
                        if (feature.bgOpacity !== undefined && feature.bgOpacity < 100) {
                            hex += Math.round((feature.bgOpacity / 100) * 255).toString(16).padStart(2, '0');
                        }
                        customStyles += `background-color: ${hex}; `;
                    }
                    if (feature.textColor) {
                        customStyles += `color: ${feature.textColor}; `;
                    }
                }
                
                card.innerHTML = `
                    <div class="feature-card-inner" style="${customStyles} padding: 30px; border-radius: 12px; height: 100%; transition: var(--transition); box-shadow: var(--shadow); background-color: ${customStyles.includes('background-color') ? '' : 'var(--box-bg)'};">
                        <i class="${iconClass} feature-icon"></i>
                        <h3 style="${feature.useCustomStyle && feature.textColor ? 'color: inherit;' : ''}">${feature.title || ''}</h3>
                        <p>${feature.text || ''}</p>
                    </div>
                `;
                // Remove padding from card to allow inner div to handle it if custom styles are applied
                card.style.padding = '0';
                card.style.background = 'transparent';
                card.style.boxShadow = 'none';

                featureGrid.appendChild(card);
            });
        }
    }

    // Development
    if (document.getElementById('dev-title') && data.development) {
        document.getElementById('dev-title').textContent = data.development.sectionTitle || "";
        const timeline = document.getElementById('timeline');
        if(timeline) {
            timeline.innerHTML = '';
            (data.development.steps || []).forEach((step, index) => {
                const item = document.createElement('div');
                item.className = `timeline-item ${index % 2 === 0 ? 'left' : 'right'}`;

                let devIconClass = step.icon || 'bi bi-check-circle';
                const match = devIconClass.match(/class=["'](.*?)["']/);
                if (match) {
                    devIconClass = match[1];
                } else {
                    devIconClass = devIconClass.replace(/<\/?[^>]+(>|$)/g, "").trim();
                }
                if (devIconClass.startsWith('bi-')) devIconClass = 'bi ' + devIconClass;

                let customStyles = '';
                if (step.useCustomStyle) {
                    if (step.bgColor) {
                        let hex = step.bgColor;
                        if (step.bgOpacity !== undefined && step.bgOpacity < 100) {
                            hex += Math.round((step.bgOpacity / 100) * 255).toString(16).padStart(2, '0');
                        }
                        customStyles += `background-color: ${hex}; `;
                    }
                    if (step.textColor) {
                        customStyles += `color: ${step.textColor}; `;
                    }
                }

                const innerContent = `
                    <div class="timeline-content ${step.href ? 'interactive-timeline-box' : ''}" style="${customStyles}">
                        <h3 style="${step.useCustomStyle && step.textColor ? 'color: inherit;' : ''}"><i class="${devIconClass}" style="color: var(--primary); margin-right: 10px;"></i>${step.phase || ''}</h3>
                        <p>${step.details || ''}</p>
                    </div>
                `;
                if(step.href) {
                    item.innerHTML = `<a href="${step.href}" style="text-decoration:none; display:block; color:inherit;">${innerContent}</a>`;
                } else {
                    item.innerHTML = innerContent;
                }
                timeline.appendChild(item);
            });
        }
    }

    // Media
    if (document.getElementById('media-title') && data.media) {
        document.getElementById('media-title').textContent = data.media.sectionTitle || "Media & Links";
        const vidEl = document.getElementById('project-video');
        if(vidEl && data.media.videoUrl) vidEl.src = data.media.videoUrl;

        const photoGallery = document.getElementById('photo-gallery');
        if(photoGallery) {
            photoGallery.innerHTML = '';
            (data.media.photos || []).forEach(photo => {
                const src = typeof photo === 'string' ? photo : photo.url;
                const alt = typeof photo === 'string' ? 'Project Photo' : (photo.title || 'Project Photo');
                const img = document.createElement('img');
                img.src = src;
                img.className = 'gallery-img';
                img.alt = alt;
                img.style.cursor = 'pointer';
                img.style.transition = 'var(--transition)';
                img.onclick = () => window.openLightbox && window.openLightbox(src);
                photoGallery.appendChild(img);
            });
        }

        const codeEl = document.getElementById('code-link');
        if (codeEl && data.media.codeLink) codeEl.href = data.media.codeLink;
    }

    // Populate Footer
    if (data.footer) {
        const aboutTitle = document.getElementById('footer-about-title');
        if (aboutTitle) aboutTitle.textContent = data.footer.aboutTitle || "";
        
        const aboutText = document.getElementById('footer-about-text');
        if (aboutText) aboutText.innerHTML = (data.footer.aboutText || "").replace(/\n/g, '<br>');
        
        const contactTitle = document.getElementById('footer-contact-title');
        if (contactTitle) contactTitle.textContent = data.footer.contactTitle || "";
        
        const email = document.getElementById('footer-email');
        if (email) email.textContent = data.footer.email || "";
        
        const phone = document.getElementById('footer-phone');
        if (phone) phone.textContent = data.footer.phone || "";
        
        const copyright = document.getElementById('footer-copyright');
        if (copyright) copyright.textContent = data.footer.copyright || data.footer.text || "";
    }

    // Populate Feedback
    if (!data.feedback) data.feedback = { title: "Leave Your Feedback", description: "We would love to hear from you!" };
    if (!data.feedback.fields) {
        data.feedback.fields = {
            name: { show: true, req: true },
            age: { show: true, req: true },
            cat: { show: true, req: true },
            phone: { show: true, req: true },
            email: { show: true, req: false },
            msg: { show: true, req: true }
        };
    }

    const feedbackTitle = document.getElementById('feedback-title');
    const feedbackDesc = document.getElementById('feedback-desc');
    if (feedbackTitle && data.feedback) feedbackTitle.textContent = data.feedback.title;
    if (feedbackDesc && data.feedback) feedbackDesc.innerHTML = data.feedback.description;

    const fbContainer = document.getElementById('dynamic-feedback-form-container');
    if (fbContainer && data.feedback.fields) {
        const f = data.feedback.fields;
        let formHTML = '<form id="dynamic-feedback-form" action="https://formspree.io/f/mwvyrpnd" method="POST">';
        formHTML += `<input type="hidden" name="Rating" id="fb-rating-input">`;
        
        formHTML += `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">`;
        formHTML += `<div id="fb-wrap-name"><label style="font-size:0.9rem; color:var(--text-dark); font-weight:600; margin-bottom:5px; display:block;">Full Name <span class="fb-req-star" style="color:#d32f2f;">*</span></label><input type="text" id="fb-name" name="Name" class="feedback-input"></div>`;
        formHTML += `<div id="fb-wrap-age"><label style="font-size:0.9rem; color:var(--text-dark); font-weight:600; margin-bottom:5px; display:block;">Age <span class="fb-req-star" style="color:#d32f2f;">*</span></label><input type="number" id="fb-age" name="Age" class="feedback-input"></div>`;
        formHTML += `</div>`;

        formHTML += `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">`;
        let catOptionsHTML = '<option value="">Select Category...</option>';
        if (f.cat && f.cat.label1) catOptionsHTML += `<option value="child">${f.cat.label1}</option>`;
        else catOptionsHTML += `<option value="child">Child (Under 18)</option>`;
        
        if (f.cat && f.cat.label2) catOptionsHTML += `<option value="adult">${f.cat.label2}</option>`;
        else catOptionsHTML += `<option value="adult">Adult (18+)</option>`;
        
        if (f.cat && f.cat.label3) catOptionsHTML += `<option value="senior">${f.cat.label3}</option>`;
        else catOptionsHTML += `<option value="senior">Senior (65+)</option>`;
        
        if (f.cat && f.cat.customOptions) {
            const opts = f.cat.customOptions.split(',').map(s=>s.trim()).filter(s=>s);
            opts.forEach(o => catOptionsHTML += `<option value="${o}">${o}</option>`);
        }
        
        formHTML += `<div id="fb-wrap-cat"><label style="font-size:0.9rem; color:var(--text-dark); font-weight:600; margin-bottom:5px; display:block;">Category <span class="fb-req-star" style="color:#d32f2f;">*</span></label><select id="fb-cat" name="Category" class="feedback-input" style="cursor:pointer;">${catOptionsHTML}</select></div>`;
        formHTML += `<div id="fb-wrap-email"><label style="font-size:0.9rem; color:var(--text-dark); font-weight:600; margin-bottom:5px; display:block;">Email Address <span class="fb-req-star" style="color:#d32f2f;">*</span></label><input type="email" id="fb-email" name="Email" class="feedback-input"></div>`;
        formHTML += `</div>`;

        formHTML += `<div id="fb-wrap-phone"><label style="font-size:0.9rem; color:var(--text-dark); font-weight:600; margin-bottom:5px; display:block;">Contact Number <span class="fb-req-star" style="color:#d32f2f;">*</span></label><input type="tel" id="fb-phone" name="Phone" class="feedback-input"></div>`;
        
        formHTML += `<div id="fb-wrap-msg"><label style="font-size:0.9rem; color:var(--text-dark); font-weight:600; margin-bottom:5px; display:block;">Message <span class="fb-req-star" style="color:#d32f2f;">*</span></label><textarea id="fb-msg" name="Message" rows="4" class="feedback-input" style="font-family:inherit; resize:vertical;" placeholder="Please describe any issues..."></textarea></div>`;
        formHTML += `<div style="text-align:center; margin-top:20px;"><button type="submit" id="btn-submit-feedback" class="btn btn-primary" style="width: 100%; font-size: 1.1rem; padding: 15px; border-radius: 8px; border:none; color:white; background: #4f46e5; cursor:pointer; transition: 0.3s; font-weight:bold; box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3);"><i class="bi bi-send-fill"></i> Submit Feedback</button></div>`;
        formHTML += '</form>';
        fbContainer.innerHTML = formHTML;

        window.updateFeedbackVisibility = function() {
            const val = document.getElementById('fb-category')?.value || 'none';
            const isChild = val === 'child';
            const isAdult = val === 'adult';
            const isNone = val === 'none' || val === '';
            
            const applyVis = (key) => {
                const el = document.getElementById(`fb-wrap-${key}`);
                const input = document.getElementById(`fb-${key === 'msg' ? 'text' : key}`);
                const star = el?.querySelector('.fb-req-star');
                if(el && input) {
                    let show = false;
                    if(isChild && f[key].showChild) show = true;
                    if(isAdult && f[key].showAdult) show = true;
                    if(isNone && f[key].showNone) show = true;
                    
                    el.style.display = show ? 'block' : 'none';
                    if(show && f[key].req) {
                        input.setAttribute('required', 'true');
                        if(star) star.style.display = 'inline';
                    } else {
                        input.removeAttribute('required');
                        if(star) star.style.display = 'none';
                    }
                }
            };
            ['name', 'age', 'phone', 'email', 'msg'].forEach(applyVis);

            // Handle category visibility
            const catWrap = document.getElementById('fb-wrap-cat');
            const catStar = catWrap?.querySelector('.fb-req-star');
            if(catWrap) {
                catWrap.style.display = f.cat.show ? 'block' : 'none';
                if(catStar) catStar.style.display = f.cat.req ? 'inline' : 'none';
            }
            
            const phoneLabel = document.getElementById('fb-phone-label');
            if(phoneLabel) {
                if(isChild) phoneLabel.innerHTML = "Parent/Guardian's Contact Number" + (f.phone.req ? " <span class='fb-req-star' style='color:#d32f2f;'>*</span>" : "");
                else if(isAdult) phoneLabel.innerHTML = "Your Contact Number" + (f.phone.req ? " <span class='fb-req-star' style='color:#d32f2f;'>*</span>" : "");
                else phoneLabel.innerHTML = "Contact Number" + (f.phone.req ? " <span class='fb-req-star' style='color:#d32f2f;'>*</span>" : "");
            }
        };
        updateFeedbackVisibility();
    }

    // Mobile Menu Toggle
    const hamburger = document.getElementById('hamburger');
    if (hamburger && navUl) {
        hamburger.addEventListener('click', () => {
            navUl.classList.toggle('active');
        });
    }

    // Navbar Scroll Effect
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.style.boxShadow = '0 5px 20px rgba(0,0,0,0.1)';
            } else {
                navbar.style.boxShadow = '0 2px 15px rgba(0,0,0,0.05)';
            }
        });
    }

    // Add dynamic CSS for Flowchart, Grid, Carousel blocks into head
    const style = document.createElement('style');
    style.textContent = `
        .custom-flowchart {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: center;
            gap: 15px;
            margin: 30px 0;
        }
        .flow-step {
            background: var(--primary);
            color: var(--white);
            padding: 15px 25px;
            border-radius: 50px;
            font-weight: 600;
            box-shadow: var(--shadow);
            text-align: center;
        }
        .flow-arrow {
            color: var(--primary);
            font-size: 1.5rem;
            font-weight: bold;
        }
        
        /* Grid Block */
        .custom-grid {
            display: grid;
            gap: 15px;
            margin: 30px 0;
        }
        @media(max-width: 768px) {
            .custom-grid { grid-template-columns: 1fr !important; }
        }
        
        /* Carousel Block */
        .custom-carousel {
            display: flex;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            gap: 20px;
            padding-bottom: 15px;
            margin: 30px 0;
        }
        .custom-carousel img {
            scroll-snap-align: center;
            flex: 0 0 80%;
            max-width: 80%;
            border-radius: 12px;
            box-shadow: var(--shadow);
            object-fit: cover;
            max-height: 400px;
        }
        .custom-carousel::-webkit-scrollbar {
            height: 8px;
        }
        .custom-carousel::-webkit-scrollbar-thumb {
            background: var(--primary);
            border-radius: 4px;
        }
        
        /* Embed Block */
        .custom-embed-block iframe {
            max-width: 100%;
            border: none;
            border-radius: 12px;
        }
        /* Enhanced UX Animations */
        .ux-animate {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.7s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.7s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .ux-animate.ux-visible {
            opacity: 1;
            transform: translateY(0);
        }
        .custom-grid img, .custom-carousel img {
            transition: transform 0.4s ease, box-shadow 0.4s ease !important;
        }
        .custom-grid img:hover, .custom-carousel img:hover {
            transform: scale(1.03) translateY(-5px);
            box-shadow: 0 15px 35px rgba(0,0,0,0.15) !important;
            z-index: 10;
        }
        
        /* Premium Mermaid Diagram UX Improvements */
        .mermaid .node rect, .mermaid .node circle, .mermaid .node polygon, .mermaid .node path, .mermaid .node .label-container {
            filter: drop-shadow(0 6px 16px rgba(42, 117, 211, 0.12)) !important;
            stroke-width: 0px !important;
        }
        .mermaid .edgePath .path {
            stroke-width: 3px !important;
            stroke-linecap: round !important;
            stroke-linejoin: round !important;
            opacity: 0.85;
        }
    `;
    document.head.appendChild(style);

    const mermaidScript = document.createElement('script');
    mermaidScript.src = 'https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js';
    mermaidScript.onload = () => {
        const isDark = document.body.classList.contains('dark-theme');
        let bxColor = isDark && data.theme?.darkBoxBgColor ? data.theme.darkBoxBgColor : (data.theme?.boxBgColor || '#ffffff');
        let tColor = isDark && data.theme?.darkTextColor ? data.theme.darkTextColor : (data.theme?.textColor || '#2c3e50');

        const themeVars = {
            primaryColor: bxColor !== '#ffffff' ? bxColor : (isDark ? '#1e293b' : '#ffffff'),
            primaryTextColor: tColor,
            primaryBorderColor: 'transparent',
            lineColor: data.theme?.primaryColor || '#2a75d3',
            textColor: tColor,
            fontFamily: "'Inter', sans-serif",
            edgeLabelBackground: isDark ? bxColor : '#ffffff'
        };
        mermaid.initialize({ 
            startOnLoad: false, 
            securityLevel: 'loose', 
            theme: 'base', 
            flowchart: { curve: 'basis', htmlLabels: true },
            themeVariables: themeVars 
        });
        setTimeout(() => { 
            try { 
                document.body.classList.add('mermaid-init-mode');
                void document.body.offsetHeight;
                mermaid.init(undefined, document.querySelectorAll('.mermaid')); 
                document.body.classList.remove('mermaid-init-mode');
            } catch(e){
                document.body.classList.remove('mermaid-init-mode');
            } 
        }, 500);
    };
    document.head.appendChild(mermaidScript);

    // UX Animation Observer
    const uxObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('ux-visible');
            }
        });
    }, { threshold: 0.1 });

    function applyUX() {
        document.querySelectorAll('.custom-content > div, .custom-content > h2, .custom-content > p, .custom-grid img').forEach((el, idx) => {
            if(!el.classList.contains('ux-animate')) {
                el.classList.add('ux-animate');
                el.style.transitionDelay = `${(idx % 10) * 0.05}s`;
                uxObserver.observe(el);
            }
        });
        if(window.mermaid) {
            try { 
                document.body.classList.add('mermaid-init-mode');
                void document.body.offsetHeight;
                mermaid.init(undefined, document.querySelectorAll('.mermaid')); 
                document.body.classList.remove('mermaid-init-mode');
            } catch(e){
                document.body.classList.remove('mermaid-init-mode');
            }
        }
    }

    // --- Global Animation System ---
    const animConfig = data.animations || { style: "none", duration: "normal" };
    const animObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('anim-visible');
            } else {
                // Remove to allow repeating animations on scroll/tab switch
                entry.target.classList.remove('anim-visible');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    function applyAnimations() {
        // Always strip legacy animations from hero elements in index.html to avoid conflicts
        document.querySelectorAll('.fade-in-up').forEach(el => {
            el.classList.remove('fade-in-up');
        });

        const styleClass = animConfig.style !== "none" ? `anim-style-${animConfig.style}` : "";
        const durClass = animConfig.style !== "none" ? `anim-dur-${animConfig.duration}` : "";

        // Strip ux-animate from elements so they don't conflict
        document.querySelectorAll('.ux-animate').forEach(el => {
            el.classList.remove('ux-animate', 'ux-visible');
        });

        // Elements to dynamically animate
        const targetSelectors = [
            '#hero-title', '#hero-subtitle', '#hero-btn',
            '.team-card', '.feature-card', '.timeline-item', '.gallery-img',
            '#project-desc', '#feedback-title', '#feedback-desc', '.feedback-container',
            '.section-title', '.custom-content > div', '.custom-content > h2', '.custom-content > p',
            '.custom-grid img', '.footer h3', '.footer p', '.footer li'
        ];

        document.querySelectorAll(targetSelectors.join(', ')).forEach((el, index) => {
            if (!el.classList.contains('anim-target') && animConfig.style !== "none") {
                el.classList.add('anim-target', styleClass, durClass);
            }
            if (el.classList.contains('anim-target')) {
                animObserver.observe(el);
            }
        });
        
        // Ensure hero elements are also observed if not already
        document.querySelectorAll('.anim-target').forEach(el => animObserver.observe(el));
    }
    
    // Initial call to set up animations
    setTimeout(applyAnimations, 300);

    // Lightbox System
    const lightboxModal = document.createElement('div');
    lightboxModal.id = 'lightbox-modal';
    lightboxModal.style.cssText = 'display:none; position:fixed; z-index:9999; left:0; top:0; width:100%; height:100%; background:rgba(0,0,0,0.9); align-items:center; justify-content:center; flex-direction:column;';
    lightboxModal.innerHTML = `
        <span onclick="closeLightbox()" style="position:absolute; top:20px; right:30px; color:white; font-size:40px; font-weight:bold; cursor:pointer;">&times;</span>
        <img id="lightbox-img" style="max-width:90%; max-height:90%; object-fit:contain; border-radius:8px;">
    `;
    document.body.appendChild(lightboxModal);

    window.openLightbox = function(src) {
        document.getElementById('lightbox-img').src = src;
        document.getElementById('lightbox-modal').style.display = 'flex';
    }
    window.closeLightbox = function() {
        document.getElementById('lightbox-modal').style.display = 'none';
    }

    // Feedback System Logic
    const stars = document.querySelectorAll('.star');
    let selectedRating = 0;

    stars.forEach(star => {
        star.addEventListener('mouseover', function() {
            if(document.getElementById('feedback-stars').style.pointerEvents === 'none') return;
            const val = this.getAttribute('data-val');
            stars.forEach(s => {
                s.style.color = s.getAttribute('data-val') <= val ? '#f1c40f' : '#ddd';
                s.style.transform = s.getAttribute('data-val') <= val ? 'scale(1.1)' : 'scale(1)';
            });
        });
        
        star.addEventListener('mouseout', function() {
            if(document.getElementById('feedback-stars').style.pointerEvents === 'none') return;
            stars.forEach(s => {
                s.style.color = s.getAttribute('data-val') <= selectedRating ? '#f1c40f' : '#ddd';
                s.style.transform = 'scale(1)';
            });
        });

        star.addEventListener('click', function() {
            if(document.getElementById('feedback-stars').style.pointerEvents === 'none') return;
            selectedRating = this.getAttribute('data-val');
            stars.forEach(s => {
                s.style.color = s.getAttribute('data-val') <= selectedRating ? '#f1c40f' : '#ddd';
                s.classList.add('pop-anim');
                setTimeout(() => s.classList.remove('pop-anim'), 300);
            });
        });
    });

    // Dynamic Feedback Form Logic
    const fbCategory = document.getElementById('fb-cat');
    if (fbCategory && data.feedback && data.feedback.fields) {
        fbCategory.addEventListener('change', window.updateFeedbackVisibility);
    }

    const btnSubmitFeedback = document.getElementById('btn-submit-feedback');
    if(btnSubmitFeedback && data.feedback && data.feedback.fields) {
        btnSubmitFeedback.addEventListener('click', (e) => {
            e.preventDefault();
            if(selectedRating === 0) {
                alert("Please select a star rating first!");
                return;
            }
            
            // Validation Engine
            const f = data.feedback.fields;
            const check = (key, msg) => {
                const wrap = document.getElementById(`fb-wrap-${key}`);
                const input = document.getElementById(`fb-${key}`);
                if(wrap && wrap.style.display !== 'none' && f[key].req && !input.value) {
                    alert(msg);
                    return false;
                }
                return true;
            };

            if(!check('name', 'Please enter your name.')) return;
            if(!check('age', 'Please enter your age.')) return;
            if(f.cat.show && f.cat.req && !document.getElementById('fb-cat').value) { alert("Please select a category."); return; }
            if(!check('phone', 'Please enter a contact number.')) return;
            if(!check('email', 'Please enter an email address.')) return;
            if(!check('msg', 'Please enter your message.')) return;
            
            btnSubmitFeedback.innerHTML = '<i class="bi bi-hourglass-split"></i> Sending...';
            btnSubmitFeedback.style.opacity = '0.7';
            btnSubmitFeedback.style.pointerEvents = 'none';
            
            // Collect form data and submit via Fetch to Formspree
            const formElement = document.getElementById('dynamic-feedback-form');
            document.getElementById('fb-rating-input').value = selectedRating;
            const formData = new FormData(formElement);
            
            fetch("https://formspree.io/f/mwvyrpnd", {
                method: "POST",
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            }).then(response => {
                if (response.ok) {
                    formElement.style.display = 'none';
                    btnSubmitFeedback.style.display = 'none';
                    document.getElementById('feedback-stars').style.pointerEvents = 'none';
                    
                    const successMsg = document.getElementById('feedback-success');
                    if(successMsg) {
                        successMsg.style.display = 'block';
                        successMsg.classList.add('ux-animate', 'ux-visible');
                    }
                } else {
                    response.json().then(data => {
                        if (Object.hasOwn(data, 'errors')) {
                            alert(data["errors"].map(error => error["message"]).join(", "));
                        } else {
                            alert("Oops! There was a problem submitting your form. Please try again.");
                        }
                    });
                    btnSubmitFeedback.innerHTML = '<i class="bi bi-send-fill"></i> Submit Feedback';
                    btnSubmitFeedback.style.opacity = '1';
                    btnSubmitFeedback.style.pointerEvents = 'auto';
                }
            }).catch(error => {
                alert("Oops! There was a problem submitting your form. Please check your internet and try again.");
                btnSubmitFeedback.innerHTML = '<i class="bi bi-send-fill"></i> Submit Feedback';
                btnSubmitFeedback.style.opacity = '1';
                btnSubmitFeedback.style.pointerEvents = 'auto';
            });
        });
    }

    // Smooth Scrolling & Page Routing Engine
    function handleRoute() {
        const hash = window.location.hash;
        const mainContent = document.getElementById('main-content');
        
        // Custom Page Container setup
        let customContainer = document.getElementById('custom-page-container');
        if(!customContainer) {
            customContainer = document.createElement('div');
            customContainer.id = 'custom-page-container';
            customContainer.className = 'container section';
            customContainer.style.marginTop = '80px'; // clear navbar
            customContainer.style.minHeight = '70vh';
            document.body.insertBefore(customContainer, document.querySelector('footer'));
        }

        if (hash.startsWith('#page-')) {
            const pageId = hash.replace('#page-', '');
            const pageData = (data.customPages || []).find(p => p.id === pageId);
            
            if (pageData && pageData.displayMode && pageData.displayMode.startsWith('parent_')) {
                const parentId = pageData.displayMode.replace('parent_', '');
                window.location.hash = `#page-${parentId}`;
                setTimeout(() => {
                    const target = document.getElementById(pageId);
                    if (target) {
                        const headerOffset = 80;
                        const elementPosition = target.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                    }
                }, 100);
                return;
            }

            // If it's a separate page, use router to isolate it
            if(pageData && pageData.displayMode !== 'section') {
                if(mainContent) mainContent.style.display = 'none'; // Hide main SPA
                customContainer.style.display = 'block'; // Show custom page
                
                let pageHTML = '';

                const renderPage = (pData) => {
                    let customStyles = 'background: var(--box-bg); padding: 2rem; border-radius: 12px; box-shadow: var(--shadow);';
                    if (pData.bgColor && pData.bgColor !== '#ffffff') {
                        let hex = pData.bgColor;
                        if (pData.bgOpacity !== undefined && pData.bgOpacity < 100) {
                            hex += Math.round((pData.bgOpacity / 100) * 255).toString(16).padStart(2, '0');
                        }
                        customStyles = `background: ${hex}; padding: 2rem; border-radius: 12px; box-shadow: var(--shadow);`;
                    }
                    return `
                        <div id="${pData.id}" style="margin-top: 40px; scroll-margin-top: 80px;">
                            <h1 class="section-title text-center">${pData.title}</h1>
                            <div class="custom-content" style="${customStyles}">
                                ${pData.content}
                            </div>
                        </div>
                    `;
                };

                pageHTML += renderPage(pageData);

                // Append child sections
                const childPages = (data.customPages || []).filter(p => p.displayMode === 'parent_' + pageData.id);
                childPages.forEach(child => {
                    pageHTML += renderPage(child);
                });

                customContainer.innerHTML = pageHTML;
                window.scrollTo(0,0);
                setTimeout(applyUX, 50);
                return; // stop execution here
            }
        }
        
        // Default: Show Main SPA
        if(mainContent) mainContent.style.display = 'flex';
        customContainer.style.display = 'none';
        customContainer.innerHTML = '';
        
        if(hash.startsWith('#page-')) {
            // It was a section mode page, let browser or JS handle scroll below
            const pageId = hash.replace('#page-', '');
            setTimeout(() => {
                const target = document.getElementById(pageId);
                if (target) target.scrollIntoView({ behavior: 'smooth' });
            }, 50);
        } else if(hash && hash !== '#') {
            const target = document.querySelector(hash);
            if (target) {
                // Small delay to allow display:flex to render before scrolling
                setTimeout(() => {
                    target.scrollIntoView({ behavior: 'smooth' });
                }, 50);
            }
        } else {
            window.scrollTo(0,0);
        }
        
        if (navUl) navUl.classList.remove('active'); // Close mobile menu
    }

    // Listen for hash changes
    window.addEventListener('hashchange', handleRoute);
    
    // Also attach to anchor clicks so it triggers instantly
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            // We let the native hash change handle it via the event listener above!
            // Just close mobile menu
            if (navUl) navUl.classList.remove('active');
        });
    });

    // Initial render route
    handleRoute();

    // Active Link Highlighting Logic
    function updateActiveNavLink() {
        const hash = window.location.hash || '#home';
        const navLinks = document.querySelectorAll('.nav-links a');
        const sections = document.querySelectorAll('section.section-block, div[id^="page_"]');
        
        let currentSection = '';
        
        // 1. Check if we are on a custom page route
        if (hash.startsWith('#page-')) {
            currentSection = hash;
        } else {
            // 2. Otherwise check scroll position for main page sections
            let scrollPos = window.pageYOffset + 100;
            sections.forEach(section => {
                if (section.id && scrollPos >= section.offsetTop) {
                    currentSection = '#' + section.id;
                }
            });
        }

        navLinks.forEach(link => {
            link.classList.remove('active');
            let href = link.getAttribute('href');
            if (href.startsWith('page.html?id=')) {
                href = href.replace('page.html?id=', '#page-');
            }
            if (href === currentSection) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', updateActiveNavLink);
    window.addEventListener('hashchange', updateActiveNavLink);
    setTimeout(updateActiveNavLink, 500);
});
