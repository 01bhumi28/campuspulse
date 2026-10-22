/**
 * Automated Test Suite for CampusPulse Smart Student Radar
 */
const fs = require('fs');
const assert = require('assert');

// Mock localStorage and window
const storage = {};
global.localStorage = {
    getItem: (k) => storage[k] || null,
    setItem: (k, v) => { storage[k] = String(v); },
    removeItem: (k) => { delete storage[k]; }
};
global.window = {
    lucide: { createIcons: () => {} },
    CampusPulseAPI: { isOnline: false }
};
global.showToast = () => {};
global.renderCurrentView = () => {};
global.navigateTo = () => {};

// Load data.js and radar.js cleanly
const dataCode = fs.readFileSync('js/data.js', 'utf8');
const radarCode = fs.readFileSync('js/radar.js', 'utf8');

const loader = new Function('global', 'window', 'localStorage', 'showToast', 'renderCurrentView', 'navigateTo', `
    ${dataCode}
    global.AppState = { data: JSON.parse(JSON.stringify(initialData)) };
    ${radarCode}
    return RadarEngine;
`);

const RadarEngine = loader(global, global.window, global.localStorage, global.showToast, global.renderCurrentView, global.navigateTo);

console.log('--- RUNNING RADAR UNIT TESTS ---');

// Test 1: Priority Assignment Computation
console.log('Test 1: Assignment Prioritization...');
const priorities = RadarEngine.computePriorities();
assert(Array.isArray(priorities), 'Priorities should be an array');
assert(priorities.length === AppState.data.assignments.length, 'All assignments must be accounted for');
assert(priorities[0].score >= priorities[1].score, 'Assignments must be sorted descending by urgency score');
assert(priorities.some(p => p.urgency === 'urgent' || p.urgency === 'critical'), 'Must detect urgent/critical tasks');
priorities.forEach(p => {
    assert(typeof p.reason === 'string' && p.reason.length > 0, `Priority reason must be provided for ${p.id}`);
});
console.log('✓ Test 1 Passed: Priority planner correctly ranks tasks and provides transparent reasons.');

// Test 2: Task Completion & Undo
console.log('Test 2: Task Completion Toggle & Undo...');
const testTaskId = 'ASG-101';
assert(!RadarEngine.getCompletedTasks().has(testTaskId), 'Initial task should not be completed');
RadarEngine.toggleTask(testTaskId);
assert(RadarEngine.getCompletedTasks().has(testTaskId), 'Task should be in completed set after toggle');
assert(RadarEngine.lastAction !== null, 'Last action must be saved for undo');
RadarEngine.undoLastAction();
assert(!RadarEngine.getCompletedTasks().has(testTaskId), 'Task should be reverted after undo');
console.log('✓ Test 2 Passed: Completion and Undo state changes persist and revert cleanly.');

// Test 3: Attendance Calculations (Mathematical Rigor)
console.log('Test 3: Attendance Safe-Skip & Recovery Formulas...');
const attendance75 = RadarEngine.analyzeAttendance(75);
assert(attendance75.length === AppState.data.courses.length, 'All enrolled courses analyzed');

// Test course with 18 / 22 = 81.8% (MAT 312)
const mat312 = attendance75.find(c => c.id === 'MAT312');
assert(mat312, 'MAT312 must be present');
// Formula: floor((18 - 0.75 * 22) / 0.75) = floor((18 - 16.5) / 0.75) = floor(1.5 / 0.75) = 2
assert.strictEqual(mat312.safeConsecutiveSkips, 2, 'MAT 312 must allow exactly 2 safe skips');
assert.strictEqual(mat312.status, 'warning', 'MAT 312 with <= 2 skips must be flagged as warning');

// Test recovery formula on hypothetical deficit course
AppState.data.courses.push({
    id: "DEF101",
    code: "DEF 101",
    title: "Deficit Course Test",
    instructor: "Test Faculty",
    attendance: { attended: 14, total: 20, percent: 70.0 }
});
const attendanceWithDeficit = RadarEngine.analyzeAttendance(75);
const def101 = attendanceWithDeficit.find(c => c.id === 'DEF101');
// Formula: ceil((0.75 * 20 - 14) / 0.25) = ceil((15 - 14) / 0.25) = 4
assert.strictEqual(def101.status, 'critical', 'Deficit course must be critical');
assert.strictEqual(def101.neededToRecover, 4, 'Must need 4 classes to recover to 75%');
AppState.data.courses.pop(); // cleanup
console.log('✓ Test 3 Passed: Attendance equations verified (MAT312 safe skips = 2, Deficit recovery = 4).');

// Test 4: Conflict-Free Daily Plan Generation
console.log('Test 4: Conflict-Free Daily Plan Generation...');
const mondayPlan = RadarEngine.generateDailyPlan('Monday');
assert(mondayPlan.length > 0, 'Daily plan must contain items');
assert(mondayPlan.some(i => i.isClass), 'Must include scheduled lectures from timetable');
assert(mondayPlan.some(i => i.category === 'Priority Assignment'), 'Must include study blocks for urgent tasks');
// Verify chronological order
for (let i = 1; i < mondayPlan.length; i++) {
    assert(mondayPlan[i].sortKey >= mondayPlan[i-1].sortKey, 'Daily plan must be chronologically ordered');
}
console.log('✓ Test 4 Passed: Daily plan combines timetable, priority study blocks, and events in chronological order.');

// Test 5: Empty Data & Edge Cases
console.log('Test 5: Empty Data & Edge Case Handling...');
AppState.data.assignments = [];
const emptyPriorities = RadarEngine.computePriorities();
assert(Array.isArray(emptyPriorities) && emptyPriorities.length === 0, 'Handles empty assignments');

AppState.data.courses = [{ id: 'NOCLASS', code: 'NC 101', title: 'Zero Lectures', attendance: { attended: 0, total: 0 } }];
const zeroAttn = RadarEngine.analyzeAttendance(75);
assert.strictEqual(zeroAttn[0].status, 'nodata', 'Handles 0 total classes gracefully');

AppState.data.schedule = [];
const emptySchedulePlan = RadarEngine.generateDailyPlan('Monday');
assert(Array.isArray(emptySchedulePlan), 'Handles empty schedule gracefully');

console.log('✓ Test 5 Passed: Graceful fallback and empty-state resilience verified.');

console.log('\nALL 5 AUTOMATED RADAR TESTS PASSED SUCCESSFULLY! 🎯');
