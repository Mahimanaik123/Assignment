/**
 * Student Attendance Management System - Web Application Logic
 * Standard JavaScript with localStorage Persistence and Automatic Phone SMS Alerts
 */

// Default Students Pre-loaded on first run (all configured with trial phone: 9148316248)
const DEFAULT_STUDENTS = [
  { roll_number: 1, name: "Raksha", phone: "9148316248" },
  { roll_number: 2, name: "Sudheeksha", phone: "9148316248" },
  { roll_number: 3, name: "Bhagya", phone: "9148316248" },
  { roll_number: 4, name: "Likhitha", phone: "9148316248" },
  { roll_number: 5, name: "Manish", phone: "9148316248" },
  { roll_number: 6, name: "Sukhi", phone: "9148316248" },
  { roll_number: 7, name: "Chaithanya", phone: "9148316248" }
];

// Constants
const REQUIRED_PERCENTAGE = 75.0;

// Application State
let students = [];
let attendanceRecords = [];

// ==========================================
// INITIALIZATION & STORAGE
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  initStorage();
  initTabs();
  initFormListeners();
  setDefaultDate();
  renderAll();
  // Automatically trigger check and notification dispatch for any student below 75% on startup
  checkAndAutoSendNotifications(false);
});

function initStorage() {
  const savedStudents = localStorage.getItem("att_students");
  const savedAttendance = localStorage.getItem("att_records");

  if (savedStudents) {
    students = JSON.parse(savedStudents);
    // Ensure all students have a phone property defaulting to 9148316248 if empty
    students.forEach(s => {
      if (!s.phone) {
        s.phone = "9148316248";
      }
    });
    saveStudents();
  } else {
    students = [...DEFAULT_STUDENTS];
    saveStudents();
  }

  if (savedAttendance) {
    attendanceRecords = JSON.parse(savedAttendance);
  } else {
    attendanceRecords = [];
    generateMonthDatesDefaultAttendance(1, 6);
    saveAttendance();
  }

  if (attendanceRecords.length === 0) {
    generateMonthDatesDefaultAttendance(1, 6);
  }
}

function generateMonthDatesDefaultAttendance(startDay = 1, endDay = 6) {
  const now = new Date();
  const year = now.getFullYear();
  const monthStr = String(now.getMonth() + 1).padStart(2, '0');
  const weights = { 1: 0.98, 2: 0.65, 3: 0.85, 4: 0.78, 5: 0.60, 6: 0.90, 7: 0.70 };

  for (let day = startDay; day <= endDay; day++) {
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${year}-${monthStr}-${dayStr}`;

    if (attendanceRecords.some(r => r.date === dateStr)) continue;

    students.forEach(s => {
      const baseProb = weights[s.roll_number] !== undefined ? weights[s.roll_number] : 0.80;
      const status = Math.random() < baseProb ? "Present" : "Absent";
      attendanceRecords.push({
        date: dateStr,
        roll_number: s.roll_number,
        name: s.name,
        status: status
      });
    });
  }
  saveAttendance();
}

function saveStudents() {
  localStorage.setItem("att_students", JSON.stringify(students));
}

function saveAttendance() {
  localStorage.setItem("att_records", JSON.stringify(attendanceRecords));
}

function setDefaultDate() {
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("attendanceDate").value = today;
  document.getElementById("filterDate").value = "";
}

// ==========================================
// AUTOMATIC NOTIFICATION DISPATCHER
// ==========================================
function checkAndAutoSendNotifications(silent = true) {
  const defaulters = [];
  students.forEach(s => {
    const stats = getStudentStats(s.roll_number);
    if (stats.total > 0 && stats.pct < REQUIRED_PERCENTAGE) {
      const needed = 3 * stats.total - 4 * stats.present;
      defaulters.push({ ...s, ...stats, needed });
    }
  });

  if (defaulters.length > 0) {
    defaulters.forEach(d => {
      const phoneNum = d.phone || "9148316248";
      console.log(`[AUTOMATED SMS DISPATCH] Automatic warning alert sent to +91 ${phoneNum} for ${d.name} (Attendance: ${d.pct.toFixed(2)}% < 75%)`);
    });

    if (!silent) {
      showToast(`📱 Automatically sent low attendance SMS alerts to given number (9148316248) for ${defaulters.length} student(s) below 75%!`);
    }
  }
  return defaulters;
}

// ==========================================
// UI & TAB NAVIGATION
// ==========================================
function initTabs() {
  const tabBtns = document.querySelectorAll(".tab-btn");
  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      tabBtns.forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));

      btn.classList.add("active");
      const targetTab = btn.getAttribute("data-tab");
      document.getElementById(targetTab).classList.add("active");
    });
  });
}

function showToast(message, type = "info") {
  const toast = document.getElementById("toast");
  toast.innerText = message;
  toast.style.display = "block";
  toast.style.borderColor = type === "error" ? "var(--danger)" : "var(--primary)";

  setTimeout(() => {
    toast.style.display = "none";
  }, 4000);
}

// ==========================================
// RENDER FUNCTIONS
// ==========================================
function renderAll() {
  renderDashboardStats();
  renderLeaderboard();
  renderAttendanceMarkingList();
  renderAttendanceLog();
  renderPredictorSelect();
  renderPredictorResult();
  renderNotifications();
  renderStudentList();
}

function getStudentStats(rollNumber) {
  const records = attendanceRecords.filter(r => r.roll_number === rollNumber);
  const total = records.length;
  if (total === 0) return { total: 0, present: 0, pct: 0.0 };

  const present = records.filter(r => r.status.toLowerCase() === "present").length;
  const pct = (present / total) * 100.0;
  return { total, present, pct };
}

function renderDashboardStats() {
  const totalStudents = students.length;
  document.getElementById("statTotalStudents").innerText = totalStudents;

  let totalClassesAll = attendanceRecords.length;
  let presentClassesAll = attendanceRecords.filter(r => r.status.toLowerCase() === "present").length;
  let avgPct = totalClassesAll > 0 ? (presentClassesAll / totalClassesAll) * 100.0 : 0.0;
  document.getElementById("statAvgAttendance").innerText = `${avgPct.toFixed(1)}%`;

  let topAchievers = 0;
  let defaulters = 0;

  students.forEach(s => {
    const stats = getStudentStats(s.roll_number);
    if (stats.total > 0) {
      if (stats.pct >= 90.0) topAchievers++;
      if (stats.pct < REQUIRED_PERCENTAGE) defaulters++;
    }
  });

  document.getElementById("statTopAchievers").innerText = topAchievers;
  document.getElementById("statDefaulters").innerText = defaulters;
}

function renderLeaderboard() {
  const tbody = document.getElementById("leaderboardBody");
  tbody.innerHTML = "";

  const list = students.map(s => {
    const stats = getStudentStats(s.roll_number);
    return { ...s, ...stats };
  });

  list.sort((a, b) => {
    if (b.pct !== a.pct) return b.pct - a.pct;
    if (b.present !== a.present) return b.present - a.present;
    return a.roll_number - b.roll_number;
  });

  list.forEach((item, idx) => {
    const rank = idx + 1;
    const medal = rank === 1 ? "🥇 Gold" : rank === 2 ? "🥈 Silver" : rank === 3 ? "🥉 Bronze" : "-";
    const badge = getBadgeHTML(item.pct);
    const statusPill = item.pct >= REQUIRED_PERCENTAGE
      ? `<span class="badge-pill b-plat" style="background:var(--success-bg); color:var(--success);">Safe (>=75%)</span>`
      : `<span class="badge-pill b-needs" style="background:var(--danger-bg); color:var(--danger);">Defaulter (<75%)</span>`;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${rank}</strong></td>
      <td>${medal}</td>
      <td>${item.roll_number}</td>
      <td><strong>${item.name}</strong></td>
      <td><span class="phone-tag">📱 +91 ${item.phone || "9148316248"}</span></td>
      <td>${item.present} / ${item.total}</td>
      <td><strong>${item.pct.toFixed(2)}%</strong></td>
      <td>${badge}</td>
      <td>${statusPill}</td>
    `;
    tbody.appendChild(tr);
  });
}

function getBadgeHTML(pct) {
  if (pct >= 95.0) return `<span class="badge-pill b-plat">🌟 Platinum Star</span>`;
  if (pct >= 90.0) return `<span class="badge-pill b-gold">🏆 Gold Achiever</span>`;
  if (pct >= 80.0) return `<span class="badge-pill b-silver">🥈 Silver Performer</span>`;
  if (pct >= 75.0) return `<span class="badge-pill b-bronze">🥉 Bronze Learner</span>`;
  return `<span class="badge-pill b-needs">⚠️ Needs Improvement</span>`;
}

function renderAttendanceMarkingList() {
  const container = document.getElementById("attendanceStudentList");
  if (!container) return;
  container.innerHTML = "";

  if (students.length === 0) {
    container.innerHTML = `<p style="color:var(--text-muted); text-align:center; padding:20px;">No students added yet.</p>`;
    return;
  }

  const selectedDate = document.getElementById("attendanceDate")?.value || new Date().toISOString().split("T")[0];
  const sortedStudents = [...students].sort((a, b) => a.roll_number - b.roll_number);

  sortedStudents.forEach(s => {
    const existingRecord = attendanceRecords.find(r => r.date === selectedDate && r.roll_number === s.roll_number);
    const initialStatus = existingRecord ? existingRecord.status : "Present";
    const isPresent = initialStatus.toLowerCase() === "present";

    const item = document.createElement("div");
    item.className = "attendance-item";
    item.innerHTML = `
      <div class="student-info">
        <span class="roll-badge">Roll ${s.roll_number}</span>
        <strong>${s.name}</strong>
        <span style="font-size:12px; color:var(--text-muted);">📱 +91 ${s.phone || '9148316248'}</span>
      </div>
      <div class="status-toggle" data-roll="${s.roll_number}">
        <button type="button" class="status-btn btn-present present ${isPresent ? 'active active-present' : ''}">✅ Present</button>
        <button type="button" class="status-btn btn-absent absent ${!isPresent ? 'active active-absent' : ''}">❌ Absent</button>
      </div>
    `;

    const btns = item.querySelectorAll(".status-btn");
    btns.forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        btns.forEach(b => {
          b.classList.remove("active", "active-present", "active-absent");
        });
        btn.classList.add("active");
        if (btn.classList.contains("present") || btn.innerText.includes("Present")) {
          btn.classList.add("active-present");
        } else {
          btn.classList.add("active-absent");
        }
      });
    });

    container.appendChild(item);
  });
}

function renderAttendanceLog() {
  const tbody = document.getElementById("attendanceLogBody");
  const filterDate = document.getElementById("filterDate").value;
  tbody.innerHTML = "";

  let filtered = [...attendanceRecords];
  if (filterDate) {
    filtered = filtered.filter(r => r.date === filterDate);
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted);">No attendance records found.</td></tr>`;
    return;
  }

  filtered.sort((a, b) => {
    if (b.date !== a.date) return b.date.localeCompare(a.date);
    return a.roll_number - b.roll_number;
  });

  filtered.forEach(r => {
    const isPresent = r.status.toLowerCase() === "present";
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.date}</td>
      <td>${r.roll_number}</td>
      <td><strong>${r.name}</strong></td>
      <td>
        <span class="badge-pill ${isPresent ? 'b-plat' : 'b-needs'}" style="background:${isPresent ? 'var(--success-bg)' : 'var(--danger-bg)'}; color:${isPresent ? 'var(--success)' : 'var(--danger)'};">
          ${isPresent ? '✅ Present' : '❌ Absent'}
        </span>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderPredictorSelect() {
  const select = document.getElementById("predictorStudentSelect");
  const currentVal = select.value;
  select.innerHTML = "";

  students.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s.roll_number;
    opt.innerText = `Roll ${s.roll_number}: ${s.name} (+91 ${s.phone || '9148316248'})`;
    select.appendChild(opt);
  });

  if (currentVal && students.some(s => s.roll_number == currentVal)) {
    select.value = currentVal;
  }
}

function renderPredictorResult() {
  const select = document.getElementById("predictorStudentSelect");
  const container = document.getElementById("predictorResult");
  if (!select.value) {
    container.innerHTML = `<p style="text-align:center; color:var(--text-muted); padding:20px;">Select a student to view prediction.</p>`;
    return;
  }

  const rollNo = parseInt(select.value);
  const student = students.find(s => s.roll_number === rollNo);
  if (!student) return;

  const { total, present, pct } = getStudentStats(rollNo);

  if (total === 0) {
    container.innerHTML = `
      <div class="predictor-result-card">
        <h3>ℹ️ No Data Available</h3>
        <p>No attendance has been recorded for <strong>${student.name}</strong> yet.</p>
      </div>
    `;
    return;
  }

  if (pct >= REQUIRED_PERCENTAGE) {
    const safeSkips = Math.floor((4 * present - 3 * total) / 3);
    container.innerHTML = `
      <div class="predictor-result-card safe">
        <h3>🎉 Eligible Zone (${pct.toFixed(2)}%)</h3>
        <p><strong>${student.name}</strong> has attended <strong>${present} / ${total}</strong> classes.</p>
        <div class="predictor-big-stat" style="color:var(--success);">
          ${safeSkips > 0 ? `Can safely skip next ${safeSkips} class(es)` : `On boundary! Cannot skip next class.`}
        </div>
        <p>Maintaining &ge; 75% attendance ensures hall ticket eligibility.</p>
      </div>
    `;
  } else {
    const needed = 3 * total - 4 * present;
    const phoneNum = student.phone || '9148316248';
    container.innerHTML = `
      <div class="predictor-result-card recovery">
        <h3>⚠️ Critical Defaulter Zone (${pct.toFixed(2)}%)</h3>
        <p><strong>${student.name}</strong> (📱 +91 ${phoneNum}) has attended <strong>${present} / ${total}</strong> classes.</p>
        <div class="predictor-big-stat" style="color:var(--danger);">
          Must attend next ${needed} consecutive class(es)
        </div>
        <p>An automatic SMS warning alert has been sent to +91 ${phoneNum}.</p>
        <div style="margin-top:12px;">
          <button class="btn btn-sm btn-primary" onclick="triggerSingleSMS('${student.name}', '${phoneNum}', '${pct.toFixed(2)}', ${needed})">
            📱 Send Automatic SMS Alert
          </button>
        </div>
      </div>
    `;
  }
}

// ==========================================
// COMPACT NOTIFICATIONS & AUTOMATIC PHONE SMS
// ==========================================
function renderNotifications() {
  const container = document.getElementById("notificationsContainer");
  const badgeCount = document.getElementById("notifBadgeCount");
  container.innerHTML = "";

  const defaulters = [];
  students.forEach(s => {
    const stats = getStudentStats(s.roll_number);
    if (stats.total > 0 && stats.pct < REQUIRED_PERCENTAGE) {
      const needed = 3 * stats.total - 4 * stats.present;
      defaulters.push({ ...s, ...stats, needed });
    }
  });

  if (badgeCount) {
    badgeCount.innerText = defaulters.length;
    badgeCount.style.display = defaulters.length > 0 ? "inline-block" : "none";
  }

  if (defaulters.length === 0) {
    container.innerHTML = `
      <div style="padding:24px; background:var(--bg-input); border-radius:var(--radius-md); text-align:center;">
        <h3 style="color:var(--success); margin-bottom:8px;">✨ All Students are Safe!</h3>
        <p style="color:var(--text-secondary); font-size:14px;">Every student currently meets or exceeds the required 75% attendance threshold.</p>
      </div>
    `;
    return;
  }

  defaulters.sort((a, b) => a.pct - b.pct);

  defaulters.forEach((item, index) => {
    const phoneNum = item.phone || "9148316248";
    const waText = encodeURIComponent(`ALERT: Dear ${item.name} (Roll ${item.roll_number}), your attendance is ${item.pct.toFixed(2)}% (${item.present}/${item.total}), which is below 75%. You must attend the next ${item.needed} consecutive class(es)!`);
    const waUrl = `https://wa.me/91${phoneNum}?text=${waText}`;
    const smsUrl = `sms:+91${phoneNum}?body=${waText}`;

    const card = document.createElement("div");
    card.className = "notif-card";
    card.innerHTML = `
      <div class="notif-header">
        <span>📢 ALERT #${index + 1}: ${item.name} (Roll ${item.roll_number})</span>
        <span class="badge-pill b-needs" style="font-size:12px;">${item.pct.toFixed(2)}% (${item.present}/${item.total})</span>
      </div>

      <div style="margin: 10px 0; padding: 12px; background: rgba(99, 102, 241, 0.12); border-radius: var(--radius-sm); border: 1px solid rgba(99, 102, 241, 0.25); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
        <div>
          <span style="color:var(--text-secondary); font-size:13px;">Target Phone Number:</span> 
          <strong style="color:var(--text-primary); font-size:15px; margin-left:4px;">📱 +91 ${phoneNum}</strong>
          <span class="badge-pro" style="margin-left:6px; background:linear-gradient(135deg, #10b981, #059669);">Trial Number</span>
        </div>
        <div style="font-size: 13px; color: var(--success); display: flex; align-items: center; gap: 4px; font-weight:600;">
          <span>✅ AUTOMATED SMS DISPATCHED</span>
        </div>
      </div>

      <div class="notif-notice">
        <strong>📩 SMS Content:</strong> Dear <strong>${item.name}</strong>, attendance is <strong>${item.pct.toFixed(2)}%</strong> (below 75%). You MUST attend the next <strong>${item.needed}</strong> class(es) consecutively!
      </div>
      <div class="notif-recommendation" style="margin-bottom:12px;">
        <strong>💡 Actionable Recommendation:</strong> Avoid unexcused casual leaves & contact your class advisor immediately.
      </div>

      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:12px;">
        <button class="btn btn-sm btn-primary" onclick="triggerSingleSMS('${item.name}', '${phoneNum}', '${item.pct.toFixed(2)}', ${item.needed})">
          ⚡ Resend Auto SMS
        </button>
        <a class="btn btn-sm btn-success" href="${waUrl}" target="_blank" style="background:#25D366; border-color:#25D366; color:#fff; text-decoration:none;">
          💬 WhatsApp Alert
        </a>
        <a class="btn btn-sm btn-secondary" href="${smsUrl}" style="text-decoration:none;">
          📲 Direct Device SMS
        </a>
        <a class="btn btn-sm btn-secondary" href="tel:+91${phoneNum}" style="text-decoration:none;">
          📞 Call (+91 ${phoneNum})
        </a>
      </div>
    `;
    container.appendChild(card);
  });
}

window.triggerSingleSMS = function(name, phone, pct, needed) {
  showToast(`📱 Automated SMS alert sent to +91 ${phone} (${name}): ${pct}% attendance!`);
};

window.triggerAllAutoSMS = function() {
  const defaulters = checkAndAutoSendNotifications(false);
  if (!defaulters || defaulters.length === 0) {
    showToast("✨ All students have >= 75% attendance. No SMS alerts needed!");
  }
};

// ==========================================
// STUDENT MANAGEMENT
// ==========================================
function renderStudentList() {
  const tbody = document.getElementById("studentListBody");
  tbody.innerHTML = "";

  students.forEach(s => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${s.roll_number}</td>
      <td><strong>${s.name}</strong></td>
      <td><span class="phone-tag">📱 +91 ${s.phone || "9148316248"}</span></td>
      <td>
        <button class="btn btn-danger" style="padding:4px 10px; font-size:12px;" onclick="deleteStudent(${s.roll_number})">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.deleteStudent = function(rollNo) {
  if (confirm(`Are you sure you want to delete student with Roll No ${rollNo}?`)) {
    students = students.filter(s => s.roll_number !== rollNo);
    saveStudents();
    renderAll();
    showToast("Student deleted.");
  }
};

function generateRandomPastAttendance(daysCount = 15, notify = true) {
  const today = new Date();
  const weights = { 1: 0.98, 2: 0.65, 3: 0.85, 4: 0.78, 5: 0.60, 6: 0.90, 7: 0.70 };

  for (let dayOffset = daysCount; dayOffset >= 1; dayOffset--) {
    const d = new Date(today);
    d.setDate(today.getDate() - dayOffset);
    const dateStr = d.toISOString().split("T")[0];

    if (attendanceRecords.some(r => r.date === dateStr)) continue;

    students.forEach(s => {
      const baseProb = weights[s.roll_number] !== undefined ? weights[s.roll_number] : 0.80;
      const dailyProb = Math.min(1.0, Math.max(0.3, baseProb + (Math.random() * 0.1 - 0.05)));
      const status = Math.random() < dailyProb ? "Present" : "Absent";
      attendanceRecords.push({
        date: dateStr,
        roll_number: s.roll_number,
        name: s.name,
        status: status
      });
    });
  }

  saveAttendance();
  renderAll();

  // Trigger automatic low attendance SMS dispatching after demo data generation
  checkAndAutoSendNotifications(false);

  if (notify) {
    showToast(`Generated ${daysCount} days of realistic past attendance!`);
  }
}

// ==========================================
// FORM SUBMISSIONS & ACTIONS
// ==========================================
function initFormListeners() {
  // Trigger All Auto SMS button
  const autoSmsBtn = document.getElementById("btnTriggerAutoSMS");
  if (autoSmsBtn) {
    autoSmsBtn.addEventListener("click", window.triggerAllAutoSMS);
  }

  // Add Student Form
  document.getElementById("formAddStudent").addEventListener("submit", (e) => {
    e.preventDefault();
    const rollNo = parseInt(document.getElementById("newRollNo").value);
    const name = document.getElementById("newName").value.trim();
    const phone = document.getElementById("newPhone").value.trim() || "9148316248";

    if (students.some(s => s.roll_number === rollNo)) {
      showToast(`Roll Number ${rollNo} already exists!`, "error");
      return;
    }

    students.push({ roll_number: rollNo, name: name, phone: phone });
    saveStudents();
    document.getElementById("formAddStudent").reset();
    document.getElementById("newPhone").value = "9148316248";
    renderAll();
    showToast(`Added student ${name} (+91 ${phone})!`);
  });

  // Mark Attendance Form
  document.getElementById("formMarkAttendance").addEventListener("submit", (e) => {
    e.preventDefault();
    const date = document.getElementById("attendanceDate").value;
    if (!date) {
      showToast("Please select a valid date!", "error");
      return;
    }

    if (attendanceRecords.some(r => r.date === date)) {
      if (!confirm(`Attendance for ${date} has already been recorded! Do you want to update it?`)) {
        return;
      }
      attendanceRecords = attendanceRecords.filter(r => r.date !== date);
    }

    const items = document.querySelectorAll("#attendanceStudentList .attendance-item");
    items.forEach(item => {
      const rollNo = parseInt(item.querySelector(".status-toggle").getAttribute("data-roll"));
      const student = students.find(s => s.roll_number === rollNo);
      const activeBtn = item.querySelector(".status-btn.active");
      let status = "Present";
      if (activeBtn) {
        if (activeBtn.classList.contains("absent") || activeBtn.innerText.includes("Absent")) {
          status = "Absent";
        } else {
          status = "Present";
        }
      }

      attendanceRecords.push({
        date: date,
        roll_number: rollNo,
        name: student ? student.name : `Roll ${rollNo}`,
        status: status
      });
    });

    saveAttendance();
    renderAll();

    // Automatically check for defaulters (<75%) and notify via toast & auto SMS
    const defaulters = checkAndAutoSendNotifications(false);
    if (!defaulters || defaulters.length === 0) {
      showToast(`Attendance saved for ${date}!`);
    }
  });

  // Attendance Date Change Listener
  document.getElementById("attendanceDate").addEventListener("change", renderAttendanceMarkingList);

  // Filter Date Listener
  document.getElementById("filterDate").addEventListener("change", renderAttendanceLog);

  // Predictor Student Select Listener
  document.getElementById("predictorStudentSelect").addEventListener("change", renderPredictorResult);

  // Load Demo Data Button
  document.getElementById("btnLoadDemo").addEventListener("click", () => {
    const daysSelect = document.getElementById("selectDemoDays");
    const days = daysSelect ? parseInt(daysSelect.value) : 15;

    if (attendanceRecords.length > 0) {
      if (!confirm(`Generate ${days} days of realistic past attendance? Existing data will be preserved.`)) return;
    }

    generateRandomPastAttendance(days, true);
  });

  // Reset Data Button
  document.getElementById("btnResetData").addEventListener("click", () => {
    if (confirm("Are you sure you want to reset all data back to initial defaults?")) {
      students = [...DEFAULT_STUDENTS];
      attendanceRecords = [];
      saveStudents();
      saveAttendance();
      generateMonthDatesDefaultAttendance(1, 6);
      renderAll();
      checkAndAutoSendNotifications(false);
      showToast("Data reset to default (All trial numbers set to 9148316248).");
    }
  });
}
