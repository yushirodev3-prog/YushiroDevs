document.addEventListener("DOMContentLoaded", () => {
    const navbar = document.getElementById("mainNav");
    const year = document.getElementById("currentYear");
    const contactForm = document.getElementById("contactForm");
    const formMessage = document.getElementById("formMessage");

    if (year) year.textContent = new Date().getFullYear();
    function updateNavbar() { if (navbar) navbar.classList.toggle("scrolled", window.scrollY > 30); }
    updateNavbar(); window.addEventListener("scroll", updateNavbar);

    document.querySelectorAll(".navbar .nav-link").forEach(link => link.addEventListener("click", () => {
        const menu = document.querySelector(".navbar-collapse");
        if (menu && menu.classList.contains("show")) bootstrap.Collapse.getOrCreateInstance(menu).hide();
    }));

    const sections = document.querySelectorAll("section[id], header[id]");
    const navLinks = document.querySelectorAll(".navbar .nav-link");
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) {
            navLinks.forEach(link => link.classList.remove("active"));
            const link = document.querySelector(`.navbar .nav-link[href="#${entry.target.id}"]`);
            if (link) link.classList.add("active");
        }
    }), {rootMargin:"-35% 0px -55% 0px"});
    sections.forEach(s => observer.observe(s));

    if (contactForm) {
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton ? submitButton.innerHTML : "";
        const emailInput = contactForm.querySelector('#email');

        // Email validation function - checks format and basic validity
        const isValidEmail = (email) => {
            // RFC 5322 simplified regex for email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email.trim());
        };

        // Add real-time email validation
        if (emailInput) {
            emailInput.addEventListener('blur', () => {
                if (emailInput.value.trim() && !isValidEmail(emailInput.value)) {
                    emailInput.classList.add('is-invalid');
                } else if (emailInput.value.trim()) {
                    emailInput.classList.remove('is-invalid');
                }
            });
        }

        contactForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            if (!contactForm.checkValidity()) {
                contactForm.classList.add("was-validated");
                if (formMessage) {
                    formMessage.textContent = "Please complete all required fields.";
                    formMessage.style.color = "#ff8f8f";
                }
                return;
            }

            // Additional email validation
            const emailValue = emailInput.value.trim();
            if (emailValue && !isValidEmail(emailValue)) {
                if (formMessage) {
                    formMessage.textContent = "Please enter a valid email address (e.g., you@example.com).";
                    formMessage.style.color = "#ff8f8f";
                }
                emailInput.classList.add('is-invalid');
                return;
            }

            if (!submitButton) return;

            submitButton.disabled = true;
            submitButton.innerHTML = "Sending...";
            contactForm.classList.remove("was-validated");

            if (formMessage) {
                formMessage.textContent = "";
                formMessage.style.color = "#80e6a7";
            }

            try {
                const response = await fetch(contactForm.action, {
                    method: "POST",
                    headers: {
                        "Accept": "application/json"
                    },
                    body: new FormData(contactForm)
                });

                if (!response.ok) {
                    throw new Error("Formspree submission failed");
                }

                if (formMessage) {
                    formMessage.textContent = "Thanks for reaching out! Your message has been sent successfully. I'll get back to you as soon as possible.";
                    formMessage.style.color = "#80e6a7";
                }

                contactForm.reset();
            } catch (error) {
                if (formMessage) {
                    formMessage.textContent = "Sorry, something went wrong while sending your message. Please try again or contact me directly by email.";
                    formMessage.style.color = "#ff8f8f";
                }
            } finally {
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
            }
        });
    }

    const modalEl=document.getElementById("projectLightbox");
    if (!modalEl) return;
    const stage=document.getElementById("lightboxStage"), title=document.getElementById("lightboxTitle"), counter=document.getElementById("lightboxCounter");
    const prev=document.getElementById("lightboxPrev"), next=document.getElementById("lightboxNext");
    const modal=new bootstrap.Modal(modalEl,{keyboard:false});
    let items=[], index=0;

    function collect(carousel){
        const result=[];
        carousel.querySelectorAll(".carousel-item").forEach(slide=>{
            const button=slide.querySelector(".media-open"), video=slide.querySelector("video");
            if(button) result.push({type:"image",src:button.dataset.mediaSrc,title:button.dataset.mediaTitle||"Project Screenshot"});
            else if(video && video.querySelector("source")){
                // Prefer an explicit title set on the slide or video wrapper, otherwise fall back to "<Project> - Demo"
                const explicitTitle = slide.dataset.mediaTitle || slide.querySelector('.video-wrapper')?.dataset?.mediaTitle || '';
                const fallback = (carousel.closest(".project-card")?.querySelector("h3")?.textContent||"Project") + " - Demo";
                result.push({type:"video",src:video.querySelector("source").getAttribute("src"),title: explicitTitle || fallback});
            }
        });
        return result;
    }
    function render(){
        const item=items[index]; stage.innerHTML=""; title.textContent=item.title; counter.textContent=`${index+1} / ${items.length}`;
        if(item.type==="image"){ const img=document.createElement("img"); img.src=item.src; img.alt=item.title; stage.appendChild(img); }
        else { const video=document.createElement("video"); video.controls=true; video.playsInline=true; video.preload="metadata"; const source=document.createElement("source"); source.src=item.src; source.type="video/mp4"; video.appendChild(source); stage.appendChild(video); }
    }
    function move(direction){ if(items.length<2)return; index=(index+direction+items.length)%items.length; render(); }

    document.querySelectorAll(".media-open").forEach(button=>button.addEventListener("click",()=>{
        const carousel=button.closest(".project-media"), slides=[...carousel.querySelectorAll(".carousel-item")];
        items=collect(carousel); index=Math.max(0,slides.indexOf(button.closest(".carousel-item"))); render(); modal.show();
    }));
    prev.addEventListener("click",()=>move(-1)); next.addEventListener("click",()=>move(1));
    document.addEventListener("keydown",e=>{
        if(!modalEl.classList.contains("show")) return;
        if(e.key==="ArrowLeft"){e.preventDefault();move(-1)}
        if(e.key==="ArrowRight"){e.preventDefault();move(1)}
        if(e.key==="Escape") modal.hide();
    });
    modalEl.addEventListener("hidden.bs.modal",()=>{stage.innerHTML="";items=[];});
});
