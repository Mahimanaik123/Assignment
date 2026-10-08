# 🎓 Student Attendance Management System

A full-featured Python CLI and Web application built with **Smart Predictors**, **Leaderboard**, **Badges**, and **Automatic Phone SMS Notifications**.

---

## 🌟 Features

1. **Add a Student with Phone Number**: Register students with unique roll numbers, full names, and phone numbers.
2. **Automatic Phone SMS Notifications (< 75%)**: When a student's attendance drops below 75%, an automated warning notification is dispatched directly to their given phone number (e.g. Sudeeksha trial number: `9148316248`).
3. **WhatsApp & Device Direct Actions**: Generate instant WhatsApp Web warning links (`https://wa.me/919148316248?text=...`), Direct SMS (`sms:+919148316248`), and Dial buttons.
4. **Mark Today's Attendance**: Easily mark Present/Absent (`P`/`A`) for all registered students with auto-SMS warnings triggered for defaulters.
5. **View Today's & Log Attendance**: Quick view of attendance logs with summary statistics.
6. **Check Individual Attendance**: View total classes, present count, percentage, phone number, and assigned badge for any student.
7. **Smart Bunk Calculator**: Calculates how many future classes a student can safely skip while staying at or above **75%**.
8. **Attendance Recovery Planner**: Calculates the exact number of consecutive classes a student with <75% attendance must attend to reach **75%**.
9. **Leaderboard & Medals**: Rank all students by attendance percentage with top 3 medals (🥇 Gold, 🥈 Silver, 🥉 Bronze).
10. **Automated Badges**:
   - **95% and above**: 🌟 Platinum Star
   - **90% to 94.99%**: 🏆 Gold Achiever
   - **80% to 89.99%**: 🥈 Silver Performer
   - **75% to 79.99%**: 🥉 Bronze Learner
   - **Below 75%**: ⚠️ Needs Improvement
11. **Defaulters List**: Displays all students currently below 75% attendance, target phone numbers, and required recovery plans.
12. **Load Demo Attendance**: Populates past days of sample attendance data for immediate testing.

---

## 📐 Formulas Used

Let:
- $p$ = Number of classes present
- $t$ = Total classes conducted

### 1. Attendance Percentage
$$\text{Attendance (\%)} = \left(\frac{p}{t}\right) \times 100$$

### 2. Smart Bunk Calculator (for Attendance $\ge 75\%$)
$$\text{Safe Classes to Skip} = \lfloor \frac{4p - 3t}{3} \rfloor$$

### 3. Attendance Recovery Planner (for Attendance $< 75\%$)
$$\text{Classes Needed to Reach 75\%} = 3t - 4p$$

---

## 💾 Data Storage

All records are stored automatically in human-readable CSV files in the project root:
- `students.csv`: `roll_number, name, phone`
- `attendance.csv`: `date, roll_number, name, status`

---

## 📱 Trial Phone Number Configuration

- **Sudeeksha / Sudheeksha**: Phone Number `9148316248` (configured as trial default)

---

## 🚀 How to Run

### Python CLI Application
Run the command in your terminal:
```bash
python main.py
```

### Web Application
Open `index.html` in any browser or serve via local server.
