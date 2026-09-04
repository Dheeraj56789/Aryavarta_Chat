import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_DB_URI || "mongodb://127.0.0.1:27017/chat_app";

// Usernames of test accounts to purge
const TEST_USERNAMES = [
  "dheeraj_test",
  "dhee123",
  "harsh_gupta",
  "testrealphon777"
];

async function cleanupTestData() {
  try {
    console.log("Connecting to MongoDB at:", MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully.\n");

    const usersCollection = mongoose.connection.db.collection("users");
    const convsCollection = mongoose.connection.db.collection("conversations");
    const msgsCollection = mongoose.connection.db.collection("messages");
    const callsCollection = mongoose.connection.db.collection("calllogs");

    // 1. Find all test user accounts
    const testUsers = await usersCollection.find({
      $or: [
        { username: { $in: TEST_USERNAMES } },
        { email: { $in: ["dheeraj_test@example.com", "dheeraj123@gmail.com", "harsh.gupta@example.com"] } },
        { fullname: { $in: ["Dheeraj Sharma", "Harsh Gupta", "Test Real Phone User"] } }
      ]
    }).toArray();

    console.log(`Found ${testUsers.length} test user account(s) to remove:`);
    testUsers.forEach(u => console.log(` - ID: ${u._id}, Username: @${u.username}, Name: ${u.fullname}`));

    if (testUsers.length === 0) {
      console.log("No test users found. Database is already clean of test seed accounts.");
      process.exit(0);
    }

    const testUserIds = testUsers.map(u => u._id);

    // 2. Remove conversations and messages involving these test accounts
    const delMsgs = await msgsCollection.deleteMany({
      $or: [
        { senderId: { $in: testUserIds } },
        { receiverId: { $in: testUserIds } }
      ]
    });
    console.log(`\nDeleted ${delMsgs.deletedCount} related message(s).`);

    const delConvs = await convsCollection.deleteMany({
      participants: { $in: testUserIds }
    });
    console.log(`Deleted ${delConvs.deletedCount} related conversation(s).`);

    // 3. Delete call logs if any
    const delCalls = await callsCollection.deleteMany({
      $or: [
        { caller: { $in: testUserIds } },
        { receiver: { $in: testUserIds } }
      ]
    });
    console.log(`Deleted ${delCalls.deletedCount} related call log(s).`);

    // 4. Delete the test users themselves
    const delUsers = await usersCollection.deleteMany({
      _id: { $in: testUserIds }
    });
    console.log(`Deleted ${delUsers.deletedCount} test user account(s).`);

    // 5. Display remaining accounts
    const remainingUsers = await usersCollection.find({}, { projection: { username: 1, fullname: 1, email: 1, phone: 1 } }).toArray();
    console.log("\nRemaining real users in MongoDB:", remainingUsers);

    console.log("\nCleanup completed successfully! 🎉");
    process.exit(0);
  } catch (error) {
    console.error("Cleanup error:", error);
    process.exit(1);
  }
}

cleanupTestData();
