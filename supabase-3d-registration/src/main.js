import { createClient } from '@supabase/supabase-js'
import './style.css'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  document.body.innerHTML = `<main class="config-error"><h1>Supabase configuration missing</h1><p>Create a <code>.env</code> file from <code>.env.example</code>, then restart Vite.</p></main>`
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

document.querySelector('#app').innerHTML = `
  <div class="scene" aria-hidden="true">
    <div class="orb orb-a" data-depth="0.06"></div>
    <div class="orb orb-b" data-depth="0.11"></div>
    <div class="orb orb-c" data-depth="0.17"></div>
    <div class="grid-floor" data-depth="0.03"></div>
    <div class="stars"></div>
  </div>

  <main class="page">
    <section class="hero">
      <div class="eyebrow">NEXUS • REGISTRATION PORTAL</div>
      <h1>Build your <span>next chapter.</span></h1>
      <p>Join the community with a secure Supabase-powered registration experience.</p>
      <div class="hero-pills">
        <span>Secure Auth</span><span>15 MB Upload</span><span>Responsive 3D UI</span>
      </div>
    </section>

    <section class="card-wrap">
      <form id="registrationForm" class="card" novalidate>
        <div class="card-glow"></div>
        <div class="form-head">
          <div>
            <div class="mini-label">STEP 01 / 01</div>
            <h2>Create your registration</h2>
          </div>
          <div class="secure-dot"><i></i> Secure</div>
        </div>

        <div class="fields">
          <label class="field full">
            <span>Full name</span>
            <input id="name" name="name" type="text" autocomplete="name" placeholder="Your full name" maxlength="100" required />
          </label>

          <label class="field">
            <span>Gender</span>
            <select id="gender" name="gender" required>
              <option value="">Select gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Non-binary</option>
              <option>Prefer not to say</option>
            </select>
          </label>

          <label class="field">
            <span>Date of birth</span>
            <input id="dob" name="dob" type="date" required />
          </label>

          <label class="field">
            <span>Email address</span>
            <input id="email" name="email" type="email" autocomplete="email" placeholder="you@example.com" required />
          </label>

          <label class="field">
            <span>Indian phone number</span>
            <input id="phone" name="phone" type="tel" inputmode="numeric" autocomplete="tel" placeholder="9876543210" maxlength="10" required />
            <small>10 digits, starting with 6–9</small>
          </label>

          <label class="field full">
            <span>Which branch do you prefer?</span>
            <div class="branch-grid">
              <label class="branch-option"><input type="radio" name="branch" value="Mechanical Engineering" required /><span>⚙️ Mechanical Engineering</span></label>
              <label class="branch-option"><input type="radio" name="branch" value="Computer Science" /><span>💻 Computer Science</span></label>
            </div>
          </label>

          <label class="field full">
            <span>Password</span>
            <div class="password-box">
              <input id="password" name="password" type="password" autocomplete="new-password" placeholder="At least 8 characters" minlength="8" required />
              <button type="button" id="togglePassword" class="icon-btn" aria-label="Show password">◉</button>
            </div>
            <small>Stored securely by Supabase Auth — never stored as plain text in your table.</small>
          </label>

          <label class="field full upload-field">
            <span>Your picture <b>(max 15 MB)</b></span>
            <input id="photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp,image/gif" required />
            <div class="upload-box" id="uploadBox">
              <div class="upload-icon">↑</div>
              <strong>Choose an image</strong>
              <small>JPG, PNG, WEBP or GIF • up to 15 MB</small>
              <em id="fileName">No file selected</em>
            </div>
          </label>

          <label class="field full">
            <span>Message</span>
            <textarea id="message" name="message" maxlength="1000" rows="5" placeholder="Tell us anything you'd like us to know..."></textarea>
            <small><span id="count">0</span>/1000</small>
          </label>
        </div>

        <div id="status" class="status" role="status" aria-live="polite"></div>
        <button class="submit-btn" type="submit" id="submitBtn">
          <span>Register now</span><b>→</b>
        </button>
        <p class="fine-print">By registering, you agree that the information submitted may be stored for registration purposes.</p>
      </form>
    </section>
  </main>

  <div class="modal" id="successModal" aria-hidden="true">
    <div class="modal-backdrop"></div>
    <div class="modal-card">
      <div class="success-icon">✓</div>
      <div class="mini-label">REGISTRATION COMPLETE</div>
      <h2>Thanks for registering<span id="registeredName"></span>!</h2>
      <p>Your registration has been saved successfully.</p>
      <button id="closeModal" class="submit-btn">Continue <b>→</b></button>
    </div>
  </div>
`

const $ = (id) => document.getElementById(id)
const form = $('registrationForm')
const status = $('status')
const submitBtn = $('submitBtn')
const photo = $('photo')
const uploadBox = $('uploadBox')

const maxFileSize = 15 * 1024 * 1024
const phoneRegex = /^[6-9]\d{9}$/

$('message').addEventListener('input', () => $('count').textContent = $('message').value.length)

$('togglePassword').addEventListener('click', () => {
  const input = $('password')
  input.type = input.type === 'password' ? 'text' : 'password'
  $('togglePassword').setAttribute('aria-label', input.type === 'password' ? 'Show password' : 'Hide password')
})

photo.addEventListener('change', () => {
  const file = photo.files?.[0]
  if (!file) return
  $('fileName').textContent = `${file.name} • ${(file.size / 1024 / 1024).toFixed(2)} MB`
  uploadBox.classList.toggle('invalid', file.size > maxFileSize)
})

function setStatus(message, type = '') {
  status.textContent = message
  status.className = `status ${type}`
}

function validate() {
  const file = photo.files?.[0]
  if (!$('name').value.trim()) return 'Please enter your full name.'
  if (!$('gender').value) return 'Please select your gender.'
  if (!$('dob').value) return 'Please select your date of birth.'
  if (!phoneRegex.test($('phone').value.trim())) return 'Enter a valid 10-digit Indian mobile number starting with 6–9.'
  if ($('password').value.length < 8) return 'Password must contain at least 8 characters.'
  if (!file) return 'Please choose your picture.'
  if (!file.type.startsWith('image/')) return 'Only image files are allowed.'
  if (file.size > maxFileSize) return 'Picture must be 15 MB or smaller.'
  if (!$('registrationForm').checkValidity()) return 'Please complete all required fields.'
  return ''
}

form.addEventListener('submit', async (e) => {
  e.preventDefault()
  setStatus('')
  const problem = validate()
  if (problem) return setStatus(problem, 'error')

  submitBtn.disabled = true
  submitBtn.querySelector('span').textContent = 'Registering…'

  const name = $('name').value.trim()
  const email = $('email').value.trim().toLowerCase()
  const password = $('password').value
  const phone = $('phone').value.trim()
  const gender = $('gender').value
  const dob = $('dob').value
  const branch = form.querySelector('input[name="branch"]:checked')?.value
  const message = $('message').value.trim()
  const file = photo.files[0]

  try {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          gender,
          phone,
          date_of_birth: dob,
          preferred_branch: branch
        }
      }
    })
    if (signUpError) throw signUpError

    const user = signUpData.user
    if (!user) throw new Error('Registration could not create a user account.')

    if (!signUpData.session) {
      throw new Error('Email confirmation is enabled. For this single-page registration flow, disable Email Confirmations in Supabase Auth settings, then register again.')
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `${user.id}/${crypto.randomUUID()}-${safeName}`

    const { error: uploadError } = await supabase.storage
      .from('registration-photos')
      .upload(path, file, { contentType: file.type, upsert: false })
    if (uploadError) throw uploadError

    const { error: profileError } = await supabase
      .from('registrations')
      .update({ photo_path: path, message })
      .eq('id', user.id)
    if (profileError) throw profileError

    $('registeredName').textContent = `, ${name}`
    $('successModal').classList.add('show')
    $('successModal').setAttribute('aria-hidden', 'false')
    form.reset()
    $('fileName').textContent = 'No file selected'
    $('count').textContent = '0'
    setStatus('')
  } catch (err) {
    console.error(err)
    setStatus(err.message || 'Registration failed. Please try again.', 'error')
  } finally {
    submitBtn.disabled = false
    submitBtn.querySelector('span').textContent = 'Register now'
  }
})

function closeModal() {
  $('successModal').classList.remove('show')
  $('successModal').setAttribute('aria-hidden', 'true')
}
$('closeModal').addEventListener('click', closeModal)
document.querySelector('.modal-backdrop').addEventListener('click', closeModal)

document.addEventListener('pointermove', (e) => {
  const x = (e.clientX / innerWidth - 0.5) * 2
  const y = (e.clientY / innerHeight - 0.5) * 2
  document.querySelectorAll('[data-depth]').forEach((el) => {
    const d = Number(el.dataset.depth)
    el.style.transform = `translate3d(${x * 30 * d}px, ${y * 30 * d}px, 0)`
  })
  document.querySelector('.card').style.transform = `perspective(1400px) rotateX(${-y * 1.2}deg) rotateY(${x * 1.2}deg)`
})

document.querySelector('.card').addEventListener('mouseleave', () => {
  document.querySelector('.card').style.transform = ''
})
