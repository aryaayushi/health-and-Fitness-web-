document.querySelectorAll('a[href^="#"]').forEach(a=>{
      a.addEventListener('click', e=>{
        const href = a.getAttribute('href');
        if (href.length > 1){
          e.preventDefault();
          document.querySelector(href).scrollIntoView({behavior:'smooth'});
          const nav = document.getElementById('site-nav');
          nav.classList.remove('open');
        }
      })
    })
 // Show Signup Modal
    document.getElementById("openSignup").addEventListener("click", () => {
      document.getElementById("signupModal").showModal();
    });

    // Show Login Modal
    document.getElementById("openLogin").addEventListener("click", () => {
      document.getElementById("loginModal").showModal();
    });
    // script1.js
document.getElementById("signupForm").addEventListener("submit", async function(e) {
      e.preventDefault();

      const name = document.getElementById("signupName").value;
      const email = document.getElementById("signupEmail").value;
      const password = document.getElementById("signupPassword").value;

      try {
        const res = await fetch("http://localhost:5000/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();
        if (res.ok) {
          alert("✅ Signup successful!");
          document.getElementById("signupModel").reset();
        } else {
          alert("⚠️ Signup failed: " + data.message);
        }
      } catch (err) {
        alert("❌ Error connecting to server");
      }
    });

    // ===== Login =====
    document.getElementById("loginForm").addEventListener("submit", async function(e) {
      e.preventDefault();

      const email = document.getElementById("loginEmail").value;
      const password = document.getElementById("loginPassword").value;

      try {
        const res = await fetch("http://localhost:5000/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (res.ok) {
          alert("✅ Login successful!");
          localStorage.setItem("token", data.token); // Save JWT token
          document.getElementById("loginModel").reset();
        } else {
          alert("⚠️ Login failed: " + data.message);
        }
      } catch (err) {
        alert("❌ Error connecting to server");
      }
    });
    // Mobile menu toggle
    document.getElementById('menuBtn').addEventListener('click', ()=>{
      document.getElementById('site-nav').classList.toggle('open');
    })

    // Year
    document.getElementById('year').textContent = new Date().getFullYear();

    // Simple store (localStorage)
    const store = {
      get: (k, d)=>{ try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } },
      set: (k, v)=> localStorage.setItem(k, JSON.stringify(v))
    }

    // KPIs
    const KPIS = {
      workouts: document.getElementById('kpiWorkouts'),
      minutes: document.getElementById('kpiMinutes'),
      water: document.getElementById('kpiWater'),
      refresh(){
        const s = store.get('stats', {workouts:0, minutes:0, water:0});
        this.workouts.textContent = s.workouts;
        this.minutes.textContent = s.minutes;
        this.water.textContent = s.water;
      },
      add(key, amt){
        const s = store.get('stats', {workouts:0, minutes:0, water:0});
        s[key] = (s[key]||0) + amt;
        store.set('stats', s);
        this.refresh();
      }
    }
    KPIS.refresh();

    // Workout plan buttons
    document.querySelectorAll('[data-plan]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const plan = btn.dataset.plan;
        const minutes = plan==='beginner'?25:plan==='intermediate'?32:38;
        KPIS.add('workouts', 1);
        KPIS.add('minutes', minutes);
        toast(`Added ${plan} workout (+${minutes} min)`);
      })
    })

    // Hydration
    document.getElementById('logWater').addEventListener('click', ()=>{
      KPIS.add('water', 1);
      toast('Logged 1 glass of water');
    })

    // Appointment modal
    const appointmentModal = document.getElementById('appointmentModal');
    document.getElementById('openAppointment').addEventListener('click', ()=> appointmentModal.showModal());
    document.getElementById('saveAppointment').addEventListener('click', ()=>{
      const date = document.getElementById('apptDate').value;
      const notes = document.getElementById('apptNotes').value.trim();
      if(!date){ toast('Please pick a date', 'error'); return }
      const appts = store.get('appointments', []);
      appts.push({date, notes});
      store.set('appointments', appts);
      toast('Appointment saved');
    })

    // Diet modal
    const dietModal = document.getElementById('dietModal');
    document.getElementById('openDiet').addEventListener('click', ()=> dietModal.showModal());
    document.getElementById('saveDiet').addEventListener('click', ()=> dietModal.showModal());
    document.getElementById('saveDietModal').addEventListener('click', ()=>{
      const plan = {
        breakfast: document.getElementById('meal1').value.trim(),
        lunch: document.getElementById('meal2').value.trim(),
        dinner: document.getElementById('meal3').value.trim(),
        snack: document.getElementById('snack').value.trim(),
        at: new Date().toISOString()
      }
      const diets = store.get('diets', []);
      diets.push(plan); store.set('diets', diets);
      toast('Diet plan saved');
    })

    // Contact form
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');
    contactForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const name = document.getElementById('name');
      const email = document.getElementById('email');
      const message = document.getElementById('message');
      if(!name.value.trim()) return setStatus('Please enter your name', true);
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) return setStatus('Please enter a valid email', true);
      if(message.value.trim().length < 10) return setStatus('Message should be at least 10 characters', true);
      const payload = {name: name.value.trim(), email: email.value.trim(), message: message.value.trim(), at: new Date().toISOString()};
      const inbox = store.get('inbox', []); inbox.push(payload); store.set('inbox', inbox);
      contactForm.reset(); setStatus('Thanks! We will get back to you soon.');
      toast('Message sent');
    })
    function setStatus(msg, isError=false){
      formStatus.textContent = msg; formStatus.style.color = isError? 'var(--danger)': 'var(--ok)';
    }

    // Tiny toast
    function toast(msg, type='ok'){
      const el = document.createElement('div');
      el.textContent = msg;
      el.style.position='fixed'; el.style.bottom='20px'; el.style.right='20px';
      el.style.padding='10px 14px'; el.style.borderRadius='12px'; el.style.boxShadow='var(--shadow)';
      el.style.border='1px solid rgba(148,163,184,.25)'; el.style.zIndex='9999'; el.style.backdropFilter='blur(8px)';
      el.style.background= type==='error' ? 'rgba(239,68,68,.95)' : 'rgba(17,24,39,.9)';
      el.style.color= type==='error' ? '#fff' : 'var(--text)';
      document.body.appendChild(el);
      setTimeout(()=>{ el.style.transition='all .4s'; el.style.opacity='0'; el.style.transform='translateY(8px)'; }, 1800);
      setTimeout(()=> el.remove(), 2400);
    }
// document.getElementById("signupForm")?.addEventListener("submit", signup);
// document.getElementById("loginForm")?.addEventListener("submit", login);
   