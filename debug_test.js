// Quick debug script to understand the gamification behavior
const { GamificationService } = require('./dist/lib/GamificationService.js');

// Clear any existing data
localStorage.clear();
GamificationService.resetInstance();

const service = GamificationService.getInstance();

console.log("=== Initial State ===");
const initialProfile = service.getProfile();
console.log(`Experience: ${initialProfile.experience}`);
console.log(`Points: ${initialProfile.totalPoints}`);
console.log(`Experience to next level: ${initialProfile.experienceToNextLevel}`);
console.log(`Lists created: ${initialProfile.statistics.listsCreated}`);

console.log("\n=== After first list_created ===");
service.trackActivity("list_created");
const afterFirst = service.getProfile();
console.log(`Experience: ${afterFirst.experience}`);
console.log(`Points: ${afterFirst.totalPoints}`);
console.log(`Experience to next level: ${afterFirst.experienceToNextLevel}`);
console.log(`Lists created: ${afterFirst.statistics.listsCreated}`);
console.log(`Achievements: ${afterFirst.achievements.length}`);
afterFirst.achievements.forEach(a => {
  console.log(`  - ${a.id}: progress ${a.progress}, earned: ${!!a.dateEarned}`);
});

console.log("\n=== After 5 more list_created ===");
for (let i = 0; i < 4; i++) {
  service.trackActivity("list_created");
}
const afterFive = service.getProfile();
console.log(`Lists created: ${afterFive.statistics.listsCreated}`);
console.log(`Achievements:`);
afterFive.achievements.forEach(a => {
  console.log(`  - ${a.id}: progress ${a.progress}, earned: ${!!a.dateEarned}`);
});